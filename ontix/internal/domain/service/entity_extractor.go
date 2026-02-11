package service

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
)

// EntityExtractor 串接 LLM Entity 抽取 → Entity Resolution → 存 DB
type EntityExtractor struct {
	llm        EntityExtractionService
	embedSvc   EmbeddingService // for topic deduplication
	objectRepo repository.ObjectRepository
	schemaRepo repository.OntologySchemaRepository
	relRepo    repository.ObjectRelationRepository

	// caches (loaded once per batch)
	classCache    map[string]int // slug → class_id
	relTypeCache  map[string]int // relation slug → relation_type_id
}

// NewEntityExtractor 建立 EntityExtractor
func NewEntityExtractor(
	llm EntityExtractionService,
	embedSvc EmbeddingService,
	objectRepo repository.ObjectRepository,
	schemaRepo repository.OntologySchemaRepository,
	relRepo repository.ObjectRelationRepository,
) *EntityExtractor {
	return &EntityExtractor{
		llm:        llm,
		embedSvc:   embedSvc,
		objectRepo: objectRepo,
		schemaRepo: schemaRepo,
		relRepo:    relRepo,
	}
}

// EntityExtractionSummary 單篇貼文的抽取摘要（方便呼叫端知道結果）
type EntityExtractionSummary struct {
	PostID          string
	EntitiesFound   int
	EntitiesCreated int
	AspectsFound    int
	LinksFound      int
}

// ProcessPost 處理一篇貼文：撈已知 Entity → LLM 抽取+消歧 → 存入 DB
func (e *EntityExtractor) ProcessPost(ctx context.Context, postID string, content string) (*EntityExtractionSummary, error) {
	knownEntities, err := e.BuildKnownEntities(ctx)
	if err != nil {
		log.Printf("[EntityExtractor] failed to load known entities (continuing without): %v", err)
		knownEntities = nil
	}

	return e.processPostInternal(ctx, postID, content, knownEntities)
}

// ProcessPostWithKnown 處理一篇貼文，使用預載的 known entities（適合 batch 場景）
func (e *EntityExtractor) ProcessPostWithKnown(ctx context.Context, postID string, content string, knownEntities []KnownEntity) (*EntityExtractionSummary, error) {
	return e.processPostInternal(ctx, postID, content, knownEntities)
}

// processPostInternal 共用的貼文處理邏輯
func (e *EntityExtractor) processPostInternal(ctx context.Context, postID string, content string, knownEntities []KnownEntity) (*EntityExtractionSummary, error) {
	// 確保 cache 已載入
	if err := e.ensureCaches(ctx); err != nil {
		log.Printf("[EntityExtractor] failed to load ontology caches (continuing without): %v", err)
	}

	result, err := e.llm.ExtractEntities(ctx, content, knownEntities)
	if err != nil {
		return nil, fmt.Errorf("failed to extract entities: %w", err)
	}

	summary := &EntityExtractionSummary{
		PostID: postID,
	}

	// name → object ID 映射（供 relationship 解析用）
	nameToID := make(map[string]string)

	// 處理每個 Entity
	for _, extracted := range result.Entities {
		obj, created, err := e.resolveOrCreate(ctx, &extracted)
		if err != nil {
			log.Printf("[EntityExtractor] failed to resolve entity %q: %v", extracted.Name, err)
			continue
		}

		nameToID[extracted.Name] = obj.ID

		if created {
			summary.EntitiesCreated++
		}
		summary.EntitiesFound++

		// 設定 class_id（如果有 ontology class 且 entity 尚未設定）
		e.setClassIfNeeded(ctx, obj, &extracted)

		// 存 post_entity_mentions
		mention := &entity.PostEntityMention{
			PostID:         postID,
			ObjectID:       obj.ID,
			Sentiment:      extracted.Sentiment,
			SentimentScore: extracted.SentimentScore,
			MentionText:    extracted.MentionText,
			Source:         "llm",
		}
		if err := e.objectRepo.SaveMention(ctx, mention); err != nil {
			log.Printf("[EntityExtractor] failed to save mention for %q: %v", extracted.Name, err)
			continue
		}

		// 存 entity_aspects
		for _, aspectLLM := range extracted.Aspects {
			aspect := &entity.EntityAspect{
				PostID:         postID,
				ObjectID:       obj.ID,
				Aspect:         aspectLLM.Aspect,
				Sentiment:      aspectLLM.Sentiment,
				SentimentScore: aspectLLM.SentimentScore,
				MentionText:    aspectLLM.Mention,
			}
			if err := e.objectRepo.SaveEntityAspect(ctx, aspect); err != nil {
				log.Printf("[EntityExtractor] failed to save aspect %q for %q: %v", aspectLLM.Aspect, extracted.Name, err)
				continue
			}
			summary.AspectsFound++
		}
	}

	// 自動建立 topic 相關 relations（discusses + relevant_to）
	e.createTopicRelations(ctx, result.Entities, nameToID)

	// 存 relationships
	for _, rel := range result.Relationships {
		sourceID, sourceOK := nameToID[rel.Source]
		targetID, targetOK := nameToID[rel.Target]
		if !sourceOK || !targetOK {
			log.Printf("[EntityExtractor] relationship %q -> %q: source or target not resolved, skip", rel.Source, rel.Target)
			continue
		}

		// 決定 relation slug（優先用 Relation 字段，fallback 到 LinkType）
		relSlug := e.resolveRelationSlug(rel)

		// 雙寫：typed relation（新）+ legacy link（舊）
		if e.saveTypedRelation(ctx, sourceID, targetID, relSlug) {
			log.Printf("[EntityExtractor] relation: %s -[%s]-> %s (typed)", rel.Source, relSlug, rel.Target)
		}

		// 舊表 object_links（向後兼容）
		linkType := rel.LinkType
		if linkType == "" {
			linkType = relSlug
		}
		link := &entity.ObjectLink{
			SourceID: sourceID,
			TargetID: targetID,
			LinkType: linkType,
		}
		if err := e.objectRepo.SaveLink(ctx, link); err != nil {
			log.Printf("[EntityExtractor] failed to save link %q -[%s]-> %q: %v", rel.Source, linkType, rel.Target, err)
			continue
		}
		summary.LinksFound++
	}

	return summary, nil
}

// ensureCaches 載入 class 和 relation type cache（lazy init）
func (e *EntityExtractor) ensureCaches(ctx context.Context) error {
	if e.classCache != nil && e.relTypeCache != nil {
		return nil
	}

	classes, err := e.schemaRepo.ListClasses(ctx)
	if err != nil {
		return fmt.Errorf("failed to load classes: %w", err)
	}
	e.classCache = make(map[string]int, len(classes))
	for _, c := range classes {
		e.classCache[c.Slug] = c.ID
	}

	relTypes, err := e.schemaRepo.ListRelationTypes(ctx)
	if err != nil {
		return fmt.Errorf("failed to load relation types: %w", err)
	}
	e.relTypeCache = make(map[string]int, len(relTypes))
	for _, rt := range relTypes {
		e.relTypeCache[rt.Slug] = rt.ID
	}

	return nil
}

// setClassIfNeeded 根據 LLM 回傳的 class 或 type+sub_type 推斷 class，設定 class_id
func (e *EntityExtractor) setClassIfNeeded(ctx context.Context, obj *entity.Object, extracted *ExtractedEntity) {
	if e.classCache == nil {
		return
	}

	classSlug := e.inferClassSlug(extracted)
	if classSlug == "" {
		return
	}

	classID, ok := e.classCache[classSlug]
	if !ok {
		return
	}

	// 已有相同 class_id 就不用更新
	if obj.ClassID != nil && *obj.ClassID == classID {
		return
	}

	if err := e.objectRepo.SetClassID(ctx, obj.ID, classID); err != nil {
		log.Printf("[EntityExtractor] failed to set class_id for %q: %v", extracted.Name, err)
		return
	}
	obj.ClassID = &classID
	log.Printf("[EntityExtractor] set class: %s → %s (id=%d)", extracted.Name, classSlug, classID)
}

// inferClassSlug 推斷 ontology class slug
// 優先用 LLM 回傳的 class 字段，fallback 到 type+sub_type 映射
func (e *EntityExtractor) inferClassSlug(extracted *ExtractedEntity) string {
	// 優先：LLM 直接回傳 class
	if extracted.Class != "" {
		if _, ok := e.classCache[extracted.Class]; ok {
			return extracted.Class
		}
	}

	// Fallback：從 type + sub_type 推斷
	subType := strings.ToLower(extracted.SubType)

	switch extracted.Type {
	case "place":
		switch subType {
		case "salon", "restaurant", "cafe", "hotel", "clinic", "gym", "attraction":
			return "venue"
		case "city", "district", "region":
			return "region"
		default:
			return "place"
		}
	case "person":
		switch subType {
		case "kol", "creator":
			return "creator"
		case "celebrity", "athlete", "politician":
			return "public_figure"
		default:
			return "person"
		}
	case "work":
		switch subType {
		case "movie", "drama", "game", "song", "book", "app", "podcast":
			return "content"
		default:
			return "creative_work"
		}
	case "brand":
		switch subType {
		case "agency":
			return "agency"
		default:
			return "brand"
		}
	case "organization":
		return "institution"
	case "product":
		switch subType {
		case "electronics", "cosmetics", "food", "clothing":
			return "physical_product"
		case "software", "subscription", "saas":
			return "service"
		default:
			return "product"
		}
	case "event":
		switch subType {
		case "concert", "festival", "sale", "launch", "exhibition":
			return "campaign"
		default:
			return "event"
		}
	case "content_topic":
		return "topic"
	default:
		return extracted.Type
	}
}

// linkTypeToRelationSlug 舊 link_type → ontology relation slug 映射
var linkTypeToRelationSlug = map[string]string{
	"has_product":   "has_product",
	"sub_brand":     "sub_brand_of",
	"produced_by":   "produced_by",
	"located_in":    "located_in",
	"works_at":      "works_at",
	"endorses":      "endorses",
	"competes_with": "competes_with",
	"reviews":       "reviews",
	"reviewed_by":   "reviewed_by",
}

// resolveRelationSlug 決定 relation slug
func (e *EntityExtractor) resolveRelationSlug(rel ExtractedRelationship) string {
	// 優先用 ontology relation slug
	if rel.Relation != "" {
		if _, ok := e.relTypeCache[rel.Relation]; ok {
			return rel.Relation
		}
	}

	// Fallback：用舊 link_type 映射
	if rel.LinkType != "" {
		if slug, ok := linkTypeToRelationSlug[rel.LinkType]; ok {
			return slug
		}
		// 原值本身可能就是有效的 relation slug
		if _, ok := e.relTypeCache[rel.LinkType]; ok {
			return rel.LinkType
		}
	}

	return rel.LinkType
}

// saveTypedRelation 儲存 typed relation 到 object_relations
func (e *EntityExtractor) saveTypedRelation(ctx context.Context, sourceID, targetID, relSlug string) bool {
	if e.relTypeCache == nil || relSlug == "" {
		return false
	}

	relTypeID, ok := e.relTypeCache[relSlug]
	if !ok {
		return false
	}

	rel := &entity.ObjectRelation{
		SourceID:       sourceID,
		TargetID:       targetID,
		RelationTypeID: relTypeID,
		Confidence:     0.8,
		Source:         "llm",
	}

	if err := e.relRepo.SaveRelation(ctx, rel); err != nil {
		log.Printf("[EntityExtractor] failed to save typed relation: %v", err)
		return false
	}
	return true
}

// resolveOrCreate 嘗試解析 Entity，找不到就建立新的
func (e *EntityExtractor) resolveOrCreate(ctx context.Context, extracted *ExtractedEntity) (*entity.Object, bool, error) {
	obj, err := e.objectRepo.ResolveEntity(ctx, extracted.Name)
	if err != nil {
		return nil, false, fmt.Errorf("failed to resolve: %w", err)
	}

	if obj != nil {
		return obj, false, nil
	}

	// Topic deduplication via embedding similarity
	if extracted.Type == "content_topic" {
		if deduped, err := e.deduplicateTopic(ctx, extracted.Name); err == nil && deduped != nil {
			return deduped, false, nil
		}
	}

	objectType := entity.ObjectType(extracted.Type)

	props := map[string]any{}
	if extracted.SubType != "" {
		props["sub_type"] = extracted.SubType
	}
	if extracted.Type == "content_topic" {
		if extracted.Category != "" {
			props["category"] = extracted.Category
		}
		props["topic_status"] = string(entity.TopicStatusEmerging)
	}

	newObj := &entity.Object{
		Type:          objectType,
		CanonicalName: extracted.Name,
		Properties:    props,
	}

	if err := e.objectRepo.SaveObject(ctx, newObj); err != nil {
		return nil, false, fmt.Errorf("failed to create object: %w", err)
	}

	log.Printf("[EntityExtractor] created new entity: %s (%s) id=%s", extracted.Name, extracted.Type, newObj.ID)
	return newObj, true, nil
}

// BuildKnownEntities 從 DB 撈已知 Entity，轉成 Prompt 注入格式
// Worker 可在 batch 層級呼叫一次，避免每篇貼文都查 DB
func (e *EntityExtractor) BuildKnownEntities(ctx context.Context) ([]KnownEntity, error) {
	objects, err := e.objectRepo.ListActiveObjects(ctx)
	if err != nil {
		return nil, err
	}

	// 建立 class_id → slug 反查表
	classIDToSlug := make(map[int]string)
	if e.classCache == nil {
		_ = e.ensureCaches(ctx)
	}
	if e.classCache != nil {
		for slug, id := range e.classCache {
			classIDToSlug[id] = slug
		}
	}

	known := make([]KnownEntity, len(objects))
	for i, obj := range objects {
		className := ""
		if obj.ClassID != nil {
			className = classIDToSlug[*obj.ClassID]
		}
		category := ""
		if obj.Type == entity.ObjectTypeContentTopic && obj.Properties != nil {
			if cat, ok := obj.Properties["category"].(string); ok {
				category = cat
			}
		}
		known[i] = KnownEntity{
			CanonicalName: obj.CanonicalName,
			Type:          string(obj.Type),
			ClassName:     className,
			Category:      category,
		}
	}
	return known, nil
}

// createTopicRelations 自動建立 topic 相關 relations
// - person 和 content_topic 同時出現 → discusses（person → topic）
// - brand 和 content_topic 同時出現 → relevant_to（topic → brand）
func (e *EntityExtractor) createTopicRelations(ctx context.Context, entities []ExtractedEntity, nameToID map[string]string) {
	var topicIDs []string
	var personIDs []string
	var brandIDs []string

	for _, ent := range entities {
		id, ok := nameToID[ent.Name]
		if !ok {
			continue
		}
		switch ent.Type {
		case "content_topic":
			topicIDs = append(topicIDs, id)
		case "person":
			personIDs = append(personIDs, id)
		case "brand":
			brandIDs = append(brandIDs, id)
		}
	}

	if len(topicIDs) == 0 {
		return
	}

	for _, topicID := range topicIDs {
		// person → discusses → topic
		for _, personID := range personIDs {
			if e.saveTypedRelation(ctx, personID, topicID, "discusses") {
				log.Printf("[EntityExtractor] auto-relation: person -[discusses]-> topic")
			}
		}
		// topic → relevant_to → brand
		for _, brandID := range brandIDs {
			if e.saveTypedRelation(ctx, topicID, brandID, "relevant_to") {
				log.Printf("[EntityExtractor] auto-relation: topic -[relevant_to]-> brand")
			}
		}
	}
}

// deduplicateTopic 用 embedding cosine similarity 去重 topic
// 若新 topic 名稱與既有 active topic 相似度 > 0.85，歸為同一 topic 的 alias
func (e *EntityExtractor) deduplicateTopic(ctx context.Context, newName string) (*entity.Object, error) {
	if e.embedSvc == nil {
		return nil, nil
	}

	// 取得新 topic 的 embedding
	newEmbed, err := e.embedSvc.Embed(ctx, newName)
	if err != nil {
		log.Printf("[EntityExtractor] topic dedup: embed error for %q: %v", newName, err)
		return nil, err
	}

	// 撈所有 active topic entities
	objects, err := e.objectRepo.ListActiveObjects(ctx)
	if err != nil {
		return nil, err
	}

	var topicNames []string
	var topicObjs []*entity.Object
	for _, obj := range objects {
		if obj.Type == entity.ObjectTypeContentTopic {
			topicNames = append(topicNames, obj.CanonicalName)
			topicObjs = append(topicObjs, obj)
		}
	}

	if len(topicNames) == 0 {
		return nil, nil
	}

	// 批次取得既有 topic 的 embeddings
	existingEmbeds, err := e.embedSvc.BatchEmbed(ctx, topicNames)
	if err != nil {
		log.Printf("[EntityExtractor] topic dedup: batch embed error: %v", err)
		return nil, err
	}

	newVec := entity.Vector(newEmbed)
	bestSim := 0.0
	var bestObj *entity.Object

	for i, emb := range existingEmbeds {
		sim := newVec.CosineSimilarity(entity.Vector(emb))
		if sim > bestSim {
			bestSim = sim
			bestObj = topicObjs[i]
		}
	}

	if bestSim > 0.85 && bestObj != nil {
		// 自動歸為同一 topic 的 alias
		alias := &entity.ObjectAlias{
			ObjectID:   bestObj.ID,
			Alias:      newName,
			Source:     entity.AliasSourceLLMDiscovered,
			Confidence: bestSim,
		}
		if err := e.objectRepo.SaveAlias(ctx, alias); err != nil {
			log.Printf("[EntityExtractor] topic dedup: save alias error: %v", err)
		} else {
			log.Printf("[EntityExtractor] topic dedup: %q → %q (sim=%.3f)", newName, bestObj.CanonicalName, bestSim)
		}
		return bestObj, nil
	}

	return nil, nil
}
