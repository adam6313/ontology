package service

import (
	"context"
	"fmt"
	"log"
	"math"
	"strings"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
)

// OntologyEngine 推理引擎
// 核心流程：載入 schema → 聚合觀測 → 計算 delta → 評估規則 → 產生事實
type OntologyEngine struct {
	schemaRepo repository.OntologySchemaRepository
	obsRepo    repository.ObservationRepository
	factRepo   repository.DerivedFactRepository
	relRepo    repository.ObjectRelationRepository
	objectRepo repository.ObjectRepository

	// 可選依賴：敘事生成器
	narrativeSvc NarrativeService

	// Schema cache（啟動時載入）
	classes     map[int]*entity.Class
	classBySlug map[string]*entity.Class
	rules       []*entity.Rule
	relTypes    map[int]*entity.RelationTypeDef

	schemaLoaded bool
}

// EvaluationResult 一次推理評估的結果
type EvaluationResult struct {
	PeriodStart    time.Time
	PeriodType     string
	Observations   int
	Deltas         int
	RulesChecked   int
	FactsCreated   int
	Facts          []*entity.DerivedFact
	NarrativeFacts []*entity.DerivedFact // LLM 生成的敘事洞察
}

// NewOntologyEngine 建立推理引擎
func NewOntologyEngine(
	schemaRepo repository.OntologySchemaRepository,
	obsRepo repository.ObservationRepository,
	factRepo repository.DerivedFactRepository,
	relRepo repository.ObjectRelationRepository,
	objectRepo repository.ObjectRepository,
) *OntologyEngine {
	return &OntologyEngine{
		schemaRepo: schemaRepo,
		obsRepo:    obsRepo,
		factRepo:   factRepo,
		relRepo:    relRepo,
		objectRepo: objectRepo,
	}
}

// LoadSchema 載入並快取 ontology schema
func (e *OntologyEngine) LoadSchema(ctx context.Context) error {
	// Classes
	classes, err := e.schemaRepo.ListClasses(ctx)
	if err != nil {
		return fmt.Errorf("load classes: %w", err)
	}
	e.classes = make(map[int]*entity.Class, len(classes))
	e.classBySlug = make(map[string]*entity.Class, len(classes))
	for _, c := range classes {
		e.classes[c.ID] = c
		e.classBySlug[c.Slug] = c
	}

	// Relation types
	relTypes, err := e.schemaRepo.ListRelationTypes(ctx)
	if err != nil {
		return fmt.Errorf("load relation types: %w", err)
	}
	e.relTypes = make(map[int]*entity.RelationTypeDef, len(relTypes))
	for _, rt := range relTypes {
		e.relTypes[rt.ID] = rt
		rt.SourceClass = e.classes[rt.SourceClassID]
		rt.TargetClass = e.classes[rt.TargetClassID]
	}
	for _, rt := range relTypes {
		if rt.InverseID != nil {
			rt.Inverse = e.relTypes[*rt.InverseID]
		}
	}

	// Rules
	rules, err := e.schemaRepo.ListActiveRules(ctx)
	if err != nil {
		return fmt.Errorf("load rules: %w", err)
	}
	e.rules = rules
	e.schemaLoaded = true

	log.Printf("[ontology] schema cached: %d classes, %d relation types, %d rules",
		len(classes), len(relTypes), len(rules))
	return nil
}

// MaterializeAndEvaluate 先聚合觀測再評估規則（主入口）
func (e *OntologyEngine) MaterializeAndEvaluate(ctx context.Context, periodStart time.Time, periodType string) (*EvaluationResult, error) {
	count, err := e.obsRepo.MaterializeObservations(ctx, periodStart, periodType)
	if err != nil {
		return nil, fmt.Errorf("materialize: %w", err)
	}
	log.Printf("[ontology] materialized %d observations for %s/%s",
		count, periodStart.Format("2006-01-02"), periodType)

	return e.EvaluatePeriod(ctx, periodStart, periodType)
}

// EvaluatePeriod 對一個時間週期執行推理評估
func (e *OntologyEngine) EvaluatePeriod(ctx context.Context, periodStart time.Time, periodType string) (*EvaluationResult, error) {
	if !e.schemaLoaded {
		if err := e.LoadSchema(ctx); err != nil {
			return nil, err
		}
	}

	result := &EvaluationResult{
		PeriodStart: periodStart,
		PeriodType:  periodType,
	}

	// 1. 載入 object 資訊（name + class）
	objMap, err := e.loadObjectMap(ctx)
	if err != nil {
		return nil, err
	}

	// 2. 載入本期觀測
	currentObs, err := e.obsRepo.ListObservationsForPeriod(ctx, periodStart, periodType)
	if err != nil {
		return nil, fmt.Errorf("load current observations: %w", err)
	}
	result.Observations = len(currentObs)

	// 3. 計算 delta
	currentIDs := make(map[string]bool, len(currentObs))
	var deltas []*entity.ObservationDelta

	for _, obs := range currentObs {
		currentIDs[obs.ObjectID] = true

		info, ok := objMap[obs.ObjectID]
		if !ok {
			continue
		}

		prev, err := e.obsRepo.FindPreviousObservation(ctx, obs.ObjectID, periodStart, periodType)
		if err != nil {
			log.Printf("[ontology] warn: prev obs for %s: %v", info.name, err)
			continue
		}

		deltas = append(deltas, computeDelta(obs, prev, info.name, info.classSlug))
	}

	// 4. 偵測沉默 entity（前期有觀測、本期沒有）
	prevPeriodStart := stepBack(periodStart, periodType)
	prevObs, err := e.obsRepo.ListObservationsForPeriod(ctx, prevPeriodStart, periodType)
	if err == nil {
		for _, prev := range prevObs {
			if currentIDs[prev.ObjectID] {
				continue
			}
			info, ok := objMap[prev.ObjectID]
			if !ok {
				continue
			}
			synthetic := &entity.EntityObservation{
				ObjectID:    prev.ObjectID,
				PeriodStart: periodStart,
				PeriodType:  periodType,
			}
			deltas = append(deltas, computeDelta(synthetic, prev, info.name, info.classSlug))
		}
	}

	result.Deltas = len(deltas)

	// 5. 評估規則
	for _, rule := range e.rules {
		for _, delta := range deltas {
			result.RulesChecked++

			facts, err := e.evaluateRule(ctx, rule, delta, periodStart, periodType)
			if err != nil {
				log.Printf("[ontology] warn: rule %s on %s: %v", rule.Name, delta.ObjectName, err)
				continue
			}

			for _, fact := range facts {
				if err := e.factRepo.SaveFact(ctx, fact); err != nil {
					log.Printf("[ontology] warn: save fact: %v", err)
					continue
				}
				result.FactsCreated++
				result.Facts = append(result.Facts, fact)
			}
		}
	}

	// 6. 晉升 emerging topics
	if err := e.promoteTopics(ctx); err != nil {
		log.Printf("[ontology] warn: promote topics: %v", err)
	}

	// 7. 生成 narrative（如果有 narrativeSvc 且有 facts）
	if e.narrativeSvc != nil && len(result.Facts) > 0 {
		narrativeFacts, err := e.GenerateNarratives(ctx, result.Facts, periodStart, periodType)
		if err != nil {
			log.Printf("[ontology] warn: generate narratives: %v", err)
		} else {
			result.NarrativeFacts = narrativeFacts
		}
	}

	return result, nil
}

// SetNarrativeService 注入敘事生成器（可選依賴）
func (e *OntologyEngine) SetNarrativeService(svc NarrativeService) {
	e.narrativeSvc = svc
}

// GenerateNarratives 按 entity 分群 facts 並生成敘事洞察
func (e *OntologyEngine) GenerateNarratives(
	ctx context.Context,
	facts []*entity.DerivedFact,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	// 按 ObjectID 分群
	grouped := make(map[string][]*entity.DerivedFact)
	for _, f := range facts {
		grouped[f.ObjectID] = append(grouped[f.ObjectID], f)
	}

	// 載入 object 資訊
	objMap, err := e.loadObjectMap(ctx)
	if err != nil {
		return nil, err
	}

	periodLabel := periodStart.Format("2006-01-02") + " 週報"
	if periodType == "day" {
		periodLabel = periodStart.Format("2006-01-02") + " 日報"
	}

	var narrativeFacts []*entity.DerivedFact
	for objectID, entityFacts := range grouped {
		// 只對 >= 2 facts 的 entity 生成 narrative
		if len(entityFacts) < 2 {
			continue
		}

		info, ok := objMap[objectID]
		if !ok {
			continue
		}

		req := &NarrativeRequest{
			EntityName:  info.name,
			EntityClass: info.classSlug,
			PeriodLabel: periodLabel,
			Facts:       entityFacts,
		}

		result, err := e.narrativeSvc.GenerateNarrative(ctx, req)
		if err != nil {
			log.Printf("[ontology] warn: narrative for %s: %v", info.name, err)
			continue
		}

		factKey := fmt.Sprintf("narrative:%s:%s", objectID, periodStart.Format("2006-01-02"))
		expiresAt := periodStart.AddDate(0, 0, 30)
		fact := &entity.DerivedFact{
			ObjectID:       objectID,
			FactType:       entity.FactTypeInsight,
			FactKey:        factKey,
			Severity:       entity.FactSeverityInfo,
			Title:          result.Title,
			Description:    result.Body,
			DerivedFromRule: 0,
			PeriodStart:    &periodStart,
			PeriodType:     periodType,
			ExpiresAt:      &expiresAt,
			Evidence: map[string]any{
				"source_facts": len(entityFacts),
				"entity_name":  info.name,
				"entity_class": info.classSlug,
			},
		}

		if err := e.factRepo.SaveFact(ctx, fact); err != nil {
			log.Printf("[ontology] warn: save narrative fact: %v", err)
			continue
		}

		narrativeFacts = append(narrativeFacts, fact)
		log.Printf("[ontology] narrative: %s → %s", info.name, result.Title)
	}

	return narrativeFacts, nil
}

// ============================================
// Schema helpers
// ============================================

type objInfo struct {
	name      string
	classSlug string
}

func (e *OntologyEngine) loadObjectMap(ctx context.Context) (map[string]objInfo, error) {
	objects, err := e.objectRepo.ListActiveObjects(ctx)
	if err != nil {
		return nil, fmt.Errorf("load objects: %w", err)
	}
	m := make(map[string]objInfo, len(objects))
	for _, o := range objects {
		m[o.ID] = objInfo{
			name:      o.CanonicalName,
			classSlug: mapTypeToClassSlug(o.Type),
		}
	}
	return m, nil
}

func mapTypeToClassSlug(t entity.ObjectType) string {
	switch t {
	case entity.ObjectTypeWork:
		return "creative_work"
	case entity.ObjectTypeContentTopic:
		return "topic"
	default:
		return string(t)
	}
}

func (e *OntologyEngine) matchesClass(ruleClass, entityClass string) bool {
	if ruleClass == "entity" || ruleClass == "" {
		return true
	}
	if ruleClass == entityClass {
		return true
	}
	cls, ok := e.classBySlug[entityClass]
	if !ok {
		return false
	}
	return cls.IsA(ruleClass)
}

// ============================================
// Delta 計算
// ============================================

func computeDelta(current, previous *entity.EntityObservation, name, classSlug string) *entity.ObservationDelta {
	d := &entity.ObservationDelta{
		ObjectID:   current.ObjectID,
		ObjectName: name,
		ClassSlug:  classSlug,
		Current:    current,
		Previous:   previous,
	}

	if previous == nil {
		// 無前期：所有面向都算「新」
		for _, a := range current.AspectData {
			d.NewAspects = append(d.NewAspects, a.Aspect)
		}
		return d
	}

	// Sentiment delta
	d.SentimentDelta = current.AvgSentiment - previous.AvgSentiment
	if previous.AvgSentiment != 0 {
		d.SentimentDeltaPct = d.SentimentDelta / math.Abs(previous.AvgSentiment) * 100
	}

	// Mention delta
	d.MentionDelta = current.MentionCount - previous.MentionCount
	if previous.MentionCount > 0 {
		d.MentionDeltaPct = float64(d.MentionDelta) / float64(previous.MentionCount) * 100
	}

	// Aspect delta
	prevMap := aspectMap(previous.AspectData)
	currMap := aspectMap(current.AspectData)

	for aspect := range currMap {
		if _, ok := prevMap[aspect]; !ok {
			d.NewAspects = append(d.NewAspects, aspect)
		}
	}
	for aspect := range prevMap {
		if _, ok := currMap[aspect]; !ok {
			d.RemovedAspects = append(d.RemovedAspects, aspect)
		}
	}
	for aspect, curr := range currMap {
		if prev, ok := prevMap[aspect]; ok {
			ad := entity.AspectDelta{
				Aspect:            aspect,
				CurrentCount:      curr.Count,
				PreviousCount:     prev.Count,
				CurrentSentiment:  curr.AvgSentiment,
				PreviousSentiment: prev.AvgSentiment,
				SentimentDelta:    curr.AvgSentiment - prev.AvgSentiment,
			}
			if (prev.AvgSentiment >= 0.5 && curr.AvgSentiment < 0.5) ||
				(prev.AvgSentiment < 0.5 && curr.AvgSentiment >= 0.5) {
				ad.IsFlipped = true
			}
			d.AspectDeltas = append(d.AspectDeltas, ad)
		}
	}

	return d
}

func aspectMap(data []entity.AspectObservation) map[string]*entity.AspectObservation {
	m := make(map[string]*entity.AspectObservation, len(data))
	for i := range data {
		m[data[i].Aspect] = &data[i]
	}
	return m
}

func stepBack(t time.Time, periodType string) time.Time {
	switch periodType {
	case "day":
		return t.AddDate(0, 0, -1)
	default: // week
		return t.AddDate(0, 0, -7)
	}
}

// ============================================
// 規則評估
// ============================================

func (e *OntologyEngine) evaluateRule(
	ctx context.Context,
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	cond := rule.Condition

	// class 匹配
	if !e.matchesClass(cond.EntityClass, delta.ClassSlug) {
		return nil, nil
	}

	// min_mentions 門檻
	if cond.MinMentions > 0 && delta.Current.MentionCount < cond.MinMentions {
		return nil, nil
	}

	switch cond.Metric {
	case "avg_sentiment":
		return e.evalSentiment(ctx, rule, delta, periodStart, periodType)
	case "mention_count":
		return e.evalMention(ctx, rule, delta, periodStart, periodType)
	case "new_aspects":
		return e.evalNewAspects(rule, delta, periodStart, periodType)
	case "aspect_sentiment":
		return e.evalAspectFlip(rule, delta, periodStart, periodType)
	default:
		return nil, nil
	}
}

// --- R1, R3: avg_sentiment decrease/increase ---

func (e *OntologyEngine) evalSentiment(
	ctx context.Context,
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	if delta.Previous == nil {
		return nil, nil
	}

	matched := false
	switch rule.Condition.Operator {
	case "decrease_pct":
		matched = delta.SentimentDeltaPct <= -rule.Condition.Threshold
	case "increase_pct":
		matched = delta.SentimentDeltaPct >= rule.Condition.Threshold
	}
	if !matched {
		return nil, nil
	}

	return e.createFacts(ctx, rule, delta, periodStart, periodType)
}

// --- R2, R6: mention_count increase/equals ---

func (e *OntologyEngine) evalMention(
	ctx context.Context,
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	if delta.Previous == nil {
		return nil, nil
	}

	matched := false
	switch rule.Condition.Operator {
	case "increase_pct":
		matched = delta.MentionDeltaPct >= rule.Condition.Threshold
	case "decrease_pct":
		matched = delta.MentionDeltaPct <= -rule.Condition.Threshold
	case "equals":
		matched = float64(delta.Current.MentionCount) == rule.Condition.Threshold
		// consecutive_periods: 前期也要符合
		if matched && rule.Condition.ConsecutivePeriods > 1 {
			matched = float64(delta.Previous.MentionCount) == rule.Condition.Threshold
		}
	}
	if !matched {
		return nil, nil
	}

	return e.createFacts(ctx, rule, delta, periodStart, periodType)
}

// --- R4: new_aspects exists ---

func (e *OntologyEngine) evalNewAspects(
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	if rule.Condition.Operator != "exists" {
		return nil, nil
	}

	minAM := rule.Condition.MinAspectMentions
	if minAM <= 0 {
		minAM = 1
	}

	// 篩選足夠提及數的新面向
	currMap := make(map[string]int)
	for _, a := range delta.Current.AspectData {
		currMap[a.Aspect] = a.Count
	}

	var qualified []string
	for _, aspect := range delta.NewAspects {
		if cnt, ok := currMap[aspect]; ok && cnt >= minAM {
			qualified = append(qualified, aspect)
		}
	}
	if len(qualified) == 0 {
		return nil, nil
	}

	factKey := fmt.Sprintf("%s:%s", rule.Name, periodStart.Format("2006-01-02"))
	r := strings.NewReplacer(
		"{{entity.name}}", delta.ObjectName,
		"{{new_aspects}}", strings.Join(qualified, "、"),
		"{{new_aspect_count}}", fmt.Sprintf("%d", len(qualified)),
	)

	fact := &entity.DerivedFact{
		ObjectID:        delta.ObjectID,
		FactType:        resolveFactType(rule),
		FactKey:         factKey,
		Severity:        entity.FactSeverity(rule.ActionConfig.Severity),
		Title:           r.Replace(rule.ActionConfig.TitleTemplate),
		Description:     r.Replace(rule.ActionConfig.BodyTemplate),
		DerivedFromRule:  rule.ID,
		PeriodStart:     &periodStart,
		PeriodType:      periodType,
		Evidence: map[string]any{
			"rule_id":     rule.ID,
			"rule_name":   rule.Name,
			"new_aspects": qualified,
		},
	}
	return []*entity.DerivedFact{fact}, nil
}

// --- R5: aspect_sentiment sign_flip ---

func (e *OntologyEngine) evalAspectFlip(
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	if rule.Condition.Operator != "sign_flip" || delta.Previous == nil {
		return nil, nil
	}

	minAM := rule.Condition.MinAspectMentions
	if minAM <= 0 {
		minAM = 1
	}

	var facts []*entity.DerivedFact
	for _, ad := range delta.AspectDeltas {
		if !ad.IsFlipped || ad.CurrentCount < minAM {
			continue
		}

		factKey := fmt.Sprintf("%s:%s:%s", rule.Name, ad.Aspect, periodStart.Format("2006-01-02"))
		r := strings.NewReplacer(
			"{{entity.name}}", delta.ObjectName,
			"{{aspect}}", ad.Aspect,
			"{{prev_sentiment_label}}", sentimentLabel(ad.PreviousSentiment),
			"{{current_sentiment_label}}", sentimentLabel(ad.CurrentSentiment),
			"{{prev_value}}", fmt.Sprintf("%.2f", ad.PreviousSentiment),
			"{{current_value}}", fmt.Sprintf("%.2f", ad.CurrentSentiment),
		)

		fact := &entity.DerivedFact{
			ObjectID:        delta.ObjectID,
			FactType:        resolveFactType(rule),
			FactKey:         factKey,
			Severity:        entity.FactSeverity(rule.ActionConfig.Severity),
			Title:           r.Replace(rule.ActionConfig.TitleTemplate),
			Description:     r.Replace(rule.ActionConfig.BodyTemplate),
			DerivedFromRule:  rule.ID,
			PeriodStart:     &periodStart,
			PeriodType:      periodType,
			Evidence: map[string]any{
				"rule_id":           rule.ID,
				"rule_name":         rule.Name,
				"aspect":            ad.Aspect,
				"prev_sentiment":    ad.PreviousSentiment,
				"current_sentiment": ad.CurrentSentiment,
			},
		}
		facts = append(facts, fact)
	}

	return facts, nil
}

// ============================================
// Fact 建立（通用 + 關係遍歷）
// ============================================

func (e *OntologyEngine) createFacts(
	ctx context.Context,
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
) ([]*entity.DerivedFact, error) {
	absDelta := math.Abs(delta.SentimentDeltaPct)
	if rule.Condition.Metric == "mention_count" {
		absDelta = math.Abs(delta.MentionDeltaPct)
	}

	var changedAspects []string
	for _, ad := range delta.AspectDeltas {
		if math.Abs(ad.SentimentDelta) > 0.1 {
			changedAspects = append(changedAspects, ad.Aspect)
		}
	}
	changedStr := "無"
	if len(changedAspects) > 0 {
		changedStr = strings.Join(changedAspects, "、")
	}

	if rule.ActionConfig.Traverse != nil {
		return e.createTraverseFacts(ctx, rule, delta, periodStart, periodType, absDelta, changedStr)
	}
	return e.createDirectFact(rule, delta, periodStart, periodType, absDelta, changedStr)
}

func (e *OntologyEngine) createDirectFact(
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
	absDelta float64,
	changedAspects string,
) ([]*entity.DerivedFact, error) {
	factKey := fmt.Sprintf("%s:%s", rule.Name, periodStart.Format("2006-01-02"))

	prevMentionDate := ""
	if delta.Previous != nil {
		prevMentionDate = delta.Previous.PeriodStart.Format("2006-01-02")
	}

	r := strings.NewReplacer(
		"{{entity.name}}", delta.ObjectName,
		"{{source.name}}", delta.ObjectName,
		"{{delta_pct}}", fmt.Sprintf("%.1f", absDelta),
		"{{current_value}}", fmt.Sprintf("%d", delta.Current.MentionCount),
		"{{prev_value}}", prevMentionCount(delta),
		"{{top_changed_aspects}}", changedAspects,
		"{{last_mention_date}}", prevMentionDate,
	)

	fact := &entity.DerivedFact{
		ObjectID:        delta.ObjectID,
		FactType:        resolveFactType(rule),
		FactKey:         factKey,
		Severity:        entity.FactSeverity(rule.ActionConfig.Severity),
		Title:           r.Replace(rule.ActionConfig.TitleTemplate),
		Description:     r.Replace(rule.ActionConfig.BodyTemplate),
		DerivedFromRule:  rule.ID,
		PeriodStart:     &periodStart,
		PeriodType:      periodType,
		Evidence: map[string]any{
			"rule_id":       rule.ID,
			"rule_name":     rule.Name,
			"delta_pct":     absDelta,
			"current_value": metricValue(rule, delta.Current),
			"prev_value":    metricValuePrev(rule, delta.Previous),
		},
	}
	return []*entity.DerivedFact{fact}, nil
}

func (e *OntologyEngine) createTraverseFacts(
	ctx context.Context,
	rule *entity.Rule,
	delta *entity.ObservationDelta,
	periodStart time.Time,
	periodType string,
	absDelta float64,
	changedAspects string,
) ([]*entity.DerivedFact, error) {
	tc := rule.ActionConfig.Traverse

	relations, err := e.relRepo.TraverseRelation(ctx, delta.ObjectID, tc.Relation, tc.Direction)
	if err != nil {
		return nil, fmt.Errorf("traverse %s/%s: %w", tc.Relation, tc.Direction, err)
	}
	if len(relations) == 0 {
		return nil, nil
	}

	var facts []*entity.DerivedFact
	for _, rel := range relations {
		// 確定遍歷的「另一端」
		targetID := rel.TargetID
		if tc.Direction == "incoming" {
			targetID = rel.SourceID
		}

		targetObj, err := e.objectRepo.FindObjectByID(ctx, targetID)
		if err != nil || targetObj == nil {
			continue
		}

		factKey := fmt.Sprintf("%s:%s:%s:%s",
			rule.Name, delta.ObjectID, targetID, periodStart.Format("2006-01-02"))

		r := strings.NewReplacer(
			"{{source.name}}", delta.ObjectName,
			"{{target.name}}", targetObj.CanonicalName,
			"{{entity.name}}", delta.ObjectName,
			"{{delta_pct}}", fmt.Sprintf("%.1f", absDelta),
			"{{current_value}}", fmt.Sprintf("%.0f", metricValue(rule, delta.Current)),
			"{{prev_value}}", fmt.Sprintf("%.0f", metricValuePrev(rule, delta.Previous)),
			"{{top_changed_aspects}}", changedAspects,
		)

		// Fact 建立在 TARGET 上（品牌主需要看到來自子產品/創辦人的警報）
		fact := &entity.DerivedFact{
			ObjectID:        targetID,
			FactType:        resolveFactType(rule),
			FactKey:         factKey,
			Severity:        entity.FactSeverity(rule.ActionConfig.Severity),
			Title:           r.Replace(rule.ActionConfig.TitleTemplate),
			Description:     r.Replace(rule.ActionConfig.BodyTemplate),
			DerivedFromRule:  rule.ID,
			PeriodStart:     &periodStart,
			PeriodType:      periodType,
			Evidence: map[string]any{
				"rule_id":            rule.ID,
				"rule_name":          rule.Name,
				"source_object_id":   delta.ObjectID,
				"source_object_name": delta.ObjectName,
				"target_object_id":   targetID,
				"target_object_name": targetObj.CanonicalName,
				"relation_slug":      tc.Relation,
				"delta_pct":          absDelta,
				"current_value":      metricValue(rule, delta.Current),
				"prev_value":         metricValuePrev(rule, delta.Previous),
			},
		}
		facts = append(facts, fact)
	}

	return facts, nil
}

// ============================================
// Helpers
// ============================================

func resolveFactType(rule *entity.Rule) entity.FactType {
	if rule.ActionConfig.FactType != "" {
		return entity.FactType(rule.ActionConfig.FactType)
	}
	switch rule.ActionType {
	case "create_alert":
		return entity.FactTypeAlert
	case "propagate":
		return entity.FactTypeRiskSignal
	default:
		return entity.FactTypeTrend
	}
}

func sentimentLabel(score float64) string {
	if score >= 0.5 {
		return "正面"
	}
	return "負面"
}

func metricValue(rule *entity.Rule, obs *entity.EntityObservation) float64 {
	if obs == nil {
		return 0
	}
	switch rule.Condition.Metric {
	case "avg_sentiment":
		return obs.AvgSentiment
	case "mention_count":
		return float64(obs.MentionCount)
	default:
		return 0
	}
}

func metricValuePrev(rule *entity.Rule, obs *entity.EntityObservation) float64 {
	if obs == nil {
		return 0
	}
	return metricValue(rule, obs)
}

func prevMentionCount(delta *entity.ObservationDelta) string {
	if delta.Previous == nil {
		return "0"
	}
	return fmt.Sprintf("%d", delta.Previous.MentionCount)
}

// ============================================
// Topic 晉升邏輯
// ============================================

// promoteTopics 將符合門檻的 emerging topic 晉升為 active
// 門檻：≥ 3 篇提及 × ≥ 2 不同來源
func (e *OntologyEngine) promoteTopics(ctx context.Context) error {
	objects, err := e.objectRepo.ListActiveObjects(ctx)
	if err != nil {
		return err
	}

	promoted := 0
	for _, obj := range objects {
		if obj.Type != entity.ObjectTypeContentTopic {
			continue
		}

		// 檢查是否已經 active
		if obj.Properties != nil {
			if status, ok := obj.Properties["topic_status"].(string); ok && status == string(entity.TopicStatusActive) {
				continue
			}
		}

		// 查提及數
		mentions, err := e.objectRepo.FindMentionsByObject(ctx, obj.ID, 100)
		if err != nil {
			continue
		}

		if len(mentions) < 3 {
			continue
		}

		// 計算不同來源（post_id 去重不夠，需要看 post 的 author/source，
		// 但我們可以用 distinct post 數近似）
		postSet := make(map[string]bool)
		for _, m := range mentions {
			postSet[m.PostID] = true
		}
		if len(postSet) < 2 {
			continue
		}

		// 晉升
		if err := e.objectRepo.UpdateProperties(ctx, obj.ID, map[string]any{
			"topic_status": string(entity.TopicStatusActive),
		}); err != nil {
			log.Printf("[ontology] failed to promote topic %s: %v", obj.CanonicalName, err)
			continue
		}
		promoted++
		log.Printf("[ontology] topic promoted: %s → active (%d mentions, %d sources)",
			obj.CanonicalName, len(mentions), len(postSet))
	}

	if promoted > 0 {
		log.Printf("[ontology] promoted %d topics to active", promoted)
	}
	return nil
}
