package worker

import (
	"context"
	"log"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
)

// StreamWorker consumes messages from Redis Stream
type StreamWorker struct {
	stream      *redis.StreamRepo
	embedSvc    service.EmbeddingService
	llmSvc      service.LLMService
	taggingSvc  service.TaggingService // 全量 LLM 智能標註
	postRepo    repository.PostRepository
	tagRepo     repository.TagRepository
	clusterRepo repository.ClusterRepository
	topicRepo   repository.TopicRepository
	analysisRepo repository.PostAnalysisRepository // 分析結果儲存
	assigner    *service.Assigner
	llmClassifier *service.LLMClassifier
	coldStartSvc  *service.ColdStartService
	subClusterSvc *service.SubClusterService
	entityExtractor *service.EntityExtractor // Ontology Entity 抽取
	ontologyEngine  *service.OntologyEngine  // Ontology 推理引擎
	db              *postgres.DB             // for materialized view refresh

	batchSize    int
	batchTimeout time.Duration
	concurrency  int
}

// NewStreamWorker creates a new StreamWorker
func NewStreamWorker(
	stream *redis.StreamRepo,
	embedSvc service.EmbeddingService,
	llmSvc service.LLMService,
	postRepo repository.PostRepository,
	tagRepo repository.TagRepository,
	clusterRepo repository.ClusterRepository,
	topicRepo repository.TopicRepository,
	assigner *service.Assigner,
	llmClassifier *service.LLMClassifier,
) *StreamWorker {
	return &StreamWorker{
		stream:        stream,
		embedSvc:      embedSvc,
		llmSvc:        llmSvc,
		postRepo:      postRepo,
		tagRepo:       tagRepo,
		clusterRepo:   clusterRepo,
		topicRepo:     topicRepo,
		assigner:      assigner,
		llmClassifier: llmClassifier,
		batchSize:     1,
		batchTimeout:  1 * time.Second, // short timeout for graceful shutdown
		concurrency:   1,
	}
}

// SetTaggingService sets the intelligent tagging service
func (w *StreamWorker) SetTaggingService(svc service.TaggingService) {
	w.taggingSvc = svc
}

// SetAnalysisRepo sets the post analysis repository
func (w *StreamWorker) SetAnalysisRepo(repo repository.PostAnalysisRepository) {
	w.analysisRepo = repo
}

// SetBatchSize sets the batch size
func (w *StreamWorker) SetBatchSize(size int) {
	w.batchSize = size
}

// SetBatchTimeout sets the wait timeout
func (w *StreamWorker) SetBatchTimeout(timeout time.Duration) {
	w.batchTimeout = timeout
}

// SetConcurrency sets the number of concurrent workers
func (w *StreamWorker) SetConcurrency(n int) {
	w.concurrency = n
}

// SetColdStartService sets the cold start service
func (w *StreamWorker) SetColdStartService(svc *service.ColdStartService) {
	w.coldStartSvc = svc
}

// SetSubClusterService sets the sub-cluster service
func (w *StreamWorker) SetSubClusterService(svc *service.SubClusterService) {
	w.subClusterSvc = svc
}

// SetEntityExtractor sets the entity extractor for Ontology entity extraction
func (w *StreamWorker) SetEntityExtractor(svc *service.EntityExtractor) {
	w.entityExtractor = svc
}

// SetOntologyEngine sets the ontology inference engine
func (w *StreamWorker) SetOntologyEngine(engine *service.OntologyEngine) {
	w.ontologyEngine = engine
}

// SetDB sets the database for materialized view refresh
func (w *StreamWorker) SetDB(db *postgres.DB) {
	w.db = db
}

// Run starts the worker (blocking)
func (w *StreamWorker) Run(ctx context.Context) error {
	// Ensure consumer group exists
	if err := w.stream.EnsureGroup(ctx); err != nil {
		return err
	}

	log.Printf("Stream worker started (batch=%d, concurrency=%d, timeout=%s)", w.batchSize, w.concurrency, w.batchTimeout)

	// Drain stale pending messages from previous runs
	w.drainStalePending(ctx)

	// Periodic materialized view refresh (every 10 minutes)
	if w.db != nil {
		go w.periodicRefreshViews(ctx, 10*time.Minute)
	}

	// Periodic ontology evaluation (every hour)
	if w.ontologyEngine != nil {
		go w.periodicOntologyEval(ctx, 1*time.Hour)
	}

	for {
		select {
		case <-ctx.Done():
			log.Println("Stream worker stopped")
			return ctx.Err()
		default:
			w.processBatch(ctx)
		}
	}
}

// periodicRefreshViews 定期刷新 materialized views
func (w *StreamWorker) periodicRefreshViews(ctx context.Context, interval time.Duration) {
	// 啟動時先刷新一次
	if err := w.db.RefreshMaterializedViews(ctx); err != nil {
		log.Printf("Initial materialized view refresh error: %v", err)
	} else {
		log.Println("Materialized views refreshed (initial)")
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := w.db.RefreshMaterializedViews(ctx); err != nil {
				log.Printf("Materialized view refresh error: %v", err)
			} else {
				log.Println("Materialized views refreshed (periodic)")
			}
		}
	}
}

// periodicOntologyEval 定期執行推理引擎
func (w *StreamWorker) periodicOntologyEval(ctx context.Context, interval time.Duration) {
	// 啟動時先跑一次
	w.runOntologyEval(ctx)

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.runOntologyEval(ctx)
		}
	}
}

// runOntologyEval 計算本週 Monday 並執行 MaterializeAndEvaluate
func (w *StreamWorker) runOntologyEval(ctx context.Context) {
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	monday := now.AddDate(0, 0, -(weekday - 1))
	periodStart := time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, time.UTC)

	result, err := w.ontologyEngine.MaterializeAndEvaluate(ctx, periodStart, "week")
	if err != nil {
		log.Printf("[ontology] evaluation error: %v", err)
		return
	}

	log.Printf("[ontology] evaluation done: %d observations, %d deltas, %d facts created",
		result.Observations, result.Deltas, result.FactsCreated)
}

// drainStalePending claims and ACKs any messages pending for over 5 minutes.
// These are messages that were consumed but never acknowledged (e.g. worker
// crashed or embedding failed). We ACK+DEL them to prevent permanent queue
// growth; the underlying posts can be re-seeded if needed.
func (w *StreamWorker) drainStalePending(ctx context.Context) {
	const staleThreshold = 5 * time.Minute
	total := 0
	for {
		msgs, ids, err := w.stream.ClaimStale(ctx, staleThreshold, 100)
		if err != nil {
			log.Printf("drain stale pending error: %v", err)
			return
		}
		if len(ids) == 0 {
			break
		}
		// Try to process; on failure just ACK to unblock the queue
		for i, msg := range msgs {
			log.Printf("recovered stale message: post %d (%s)", msg.ID, ids[i])
		}
		_ = msgs // logged above
		if err := w.stream.Ack(ctx, ids); err != nil {
			log.Printf("ack stale messages error: %v", err)
		}
		total += len(ids)
	}
	if total > 0 {
		log.Printf("drained %d stale pending messages", total)
	}
}

// processedPost 處理完成的貼文資料（用於批次分配）
type processedPost struct {
	postID    string
	content   string
	embedding []float32
	tags      *service.PostTags
	analysis  *service.PostAnalysis // 全量 LLM 分析結果
}

func (w *StreamWorker) processBatch(ctx context.Context) {
	// 1. Consume messages
	msgs, ids, err := w.stream.Consume(ctx, w.batchSize, w.batchTimeout)
	if err != nil {
		log.Printf("consume error: %v", err)
		time.Sleep(time.Second)
		return
	}
	if len(msgs) == 0 {
		return
	}

	log.Printf("Processing batch of %d posts", len(msgs))

	// 2. 準備內容
	contents := make([]string, len(msgs))
	for i, m := range msgs {
		content := m.Content
		if len(content) > 500 {
			content = content[:500]
		}
		contents[i] = content
	}

	// 3. 並行執行 Embedding + LLM Analysis + Entity Extraction
	var embeddings [][]float32
	var analyses []*service.PostAnalysis
	var entitySummaries []*service.EntityExtractionSummary
	var embedErr error

	parallelCount := 2
	if w.entityExtractor != nil {
		parallelCount = 3
	}
	var parallelWg sync.WaitGroup
	parallelWg.Add(parallelCount)

	// 3.1 Batch Embedding
	go func() {
		defer parallelWg.Done()
		embeddings, embedErr = w.embedSvc.BatchEmbed(ctx, contents)
		if embedErr != nil {
			log.Printf("batch embed error: %v", embedErr)
		}
	}()

	// 3.2 LLM Analysis (並行處理每篇貼文)
	go func() {
		defer parallelWg.Done()
		if w.taggingSvc == nil {
			return
		}

		analyses = make([]*service.PostAnalysis, len(msgs))
		var analysisWg sync.WaitGroup
		sem := make(chan struct{}, w.concurrency) // 限制並行數

		for i, msg := range msgs {
			analysisWg.Add(1)
			go func(idx int, content string) {
				defer analysisWg.Done()
				sem <- struct{}{}
				defer func() { <-sem }()

				analysis, err := w.taggingSvc.AnalyzePost(ctx, content)
				if err != nil {
					log.Printf("analyze post error: %v", err)
					return
				}
				analyses[idx] = analysis
			}(i, msg.Content)
		}
		analysisWg.Wait()
	}()

	// 3.3 Entity Extraction（每 batch 載入一次 known entities）
	if w.entityExtractor != nil {
		go func() {
			defer parallelWg.Done()

			// 載入已知 Entity（整個 batch 共用）
			knownEntities, err := w.entityExtractor.BuildKnownEntities(ctx)
			if err != nil {
				log.Printf("load known entities error (continuing without): %v", err)
				knownEntities = nil
			}

			entitySummaries = make([]*service.EntityExtractionSummary, len(msgs))
			var entityWg sync.WaitGroup
			sem := make(chan struct{}, w.concurrency)

			for i, msg := range msgs {
				entityWg.Add(1)
				go func(idx int, m redis.PostMessage) {
					defer entityWg.Done()
					sem <- struct{}{}
					defer func() { <-sem }()

					postID := strconv.FormatInt(m.ID, 10)
					summary, err := w.entityExtractor.ProcessPostWithKnown(ctx, postID, m.Content, knownEntities)
					if err != nil {
						log.Printf("entity extraction error for post %d: %v", m.ID, err)
						return
					}
					entitySummaries[idx] = summary
				}(i, msg)
			}
			entityWg.Wait()
		}()
	}

	parallelWg.Wait()

	// 如果 embedding 失敗，ACK 消息避免永遠卡住，然後返回
	if embedErr != nil {
		log.Printf("embedding failed, ACK-ing %d messages to prevent queue stuck", len(ids))
		if err := w.stream.Ack(ctx, ids); err != nil {
			log.Printf("ack after embed error: %v", err)
		}
		return
	}

	// 4. Process each post concurrently, collect results for batch assignment
	var successCount int32
	var wg sync.WaitGroup
	sem := make(chan struct{}, w.concurrency)

	// 用於收集處理完成的貼文（線程安全）
	var mu sync.Mutex
	processed := make([]processedPost, 0, len(msgs))

	for i, msg := range msgs {
		wg.Add(1)
		go func(idx int, m redis.PostMessage) {
			defer wg.Done()
			sem <- struct{}{}        // acquire
			defer func() { <-sem }() // release

			var analysis *service.PostAnalysis
			if analyses != nil && idx < len(analyses) {
				analysis = analyses[idx]
			}

			result, err := w.processPostWithAnalysis(ctx, m, embeddings[idx], analysis)
			if err != nil {
				log.Printf("process post %d error: %v", m.ID, err)
				return
			}

			if result != nil {
				mu.Lock()
				processed = append(processed, *result)
				mu.Unlock()
			}
			atomic.AddInt32(&successCount, 1)
		}(i, msg)
	}
	wg.Wait()

	// 5. Batch assign to topics using LLM
	if w.llmClassifier != nil && len(processed) > 0 {
		w.batchAssignToTopics(ctx, processed)
	}

	// 6. Acknowledge processed messages
	if err := w.stream.Ack(ctx, ids); err != nil {
		log.Printf("ack error: %v", err)
	}

	// 7. Log entity extraction summary
	if entitySummaries != nil {
		var totalEntities, totalCreated, totalAspects, totalLinks int
		for _, s := range entitySummaries {
			if s != nil {
				totalEntities += s.EntitiesFound
				totalCreated += s.EntitiesCreated
				totalAspects += s.AspectsFound
				totalLinks += s.LinksFound
			}
		}
		if totalEntities > 0 {
			log.Printf("Entity extraction: %d entities (%d new), %d aspects, %d links", totalEntities, totalCreated, totalAspects, totalLinks)
		}
	}

	log.Printf("Batch done: %d/%d success", atomic.LoadInt32(&successCount), len(msgs))
}

// batchAssignToTopics 使用 LLM 批次分配貼文到主題
func (w *StreamWorker) batchAssignToTopics(ctx context.Context, posts []processedPost) {
	// 轉換為 entity.Post 格式供 LLM 分類
	entityPosts := make([]entity.Post, len(posts))
	for i, p := range posts {
		entityPosts[i] = entity.Post{
			PostID:  p.postID,
			Content: p.content,
		}
	}

	// 使用 LLM 批次分類
	results, err := w.llmClassifier.ClassifyBatch(ctx, entityPosts, func(current, total int) {
		log.Printf("LLM classifying: %d/%d", current, total)
	})
	if err != nil {
		log.Printf("LLM batch classify error: %v", err)
		return
	}

	// 儲存分類結果
	var highCount, mediumCount, lowCount, multiCount int
	var coldStartQueued, coldStartTriggered int

	for i, result := range results {
		postID := posts[i].postID

		// 找到主題 ID
		var primaryTopicID *int
		if topic := w.llmClassifier.FindTopicByName(result.PrimaryTopic); topic != nil {
			primaryTopicID = &topic.ID
		}

		// 儲存主要主題
		if primaryTopicID != nil {
			confidence := entity.ConfidenceMedium
			switch result.Confidence {
			case "high":
				confidence = entity.ConfidenceHigh
				highCount++
			case "medium":
				confidence = entity.ConfidenceMedium
				mediumCount++
			case "low":
				confidence = entity.ConfidenceLow
				lowCount++
			}

			pt := &entity.PostTopic{
				PostID:     parsePostID(postID),
				TopicID:    *primaryTopicID,
				Similarity: 0.9, // LLM 分類沒有相似度分數，使用固定值
				Confidence: confidence,
				AssignedAt: time.Now(),
			}
			if err := w.topicRepo.SavePostTopic(ctx, pt); err != nil {
				log.Printf("save topic error: %v", err)
			} else {
				log.Printf("post %s -> [%s] (%s) %s",
					postID, result.PrimaryTopic, result.Confidence, result.Reason)
			}

			// 冷啟動處理：檢查該 Topic 的 sub-cluster 是否已初始化
			if w.coldStartSvc != nil {
				csResult, err := w.coldStartSvc.HandleNewPost(ctx, *primaryTopicID, postID)
				if err != nil {
					log.Printf("cold start error for topic %d: %v", *primaryTopicID, err)
				} else {
					switch csResult.Action {
					case "queued":
						coldStartQueued++
					case "triggered":
						coldStartTriggered++
						// 異步執行 HDBSCAN 初始化
						go func(topicID int) {
							if err := w.coldStartSvc.ProcessColdStart(context.Background(), topicID); err != nil {
								log.Printf("cold start process error for topic %d: %v", topicID, err)
							}
						}(*primaryTopicID)
					case "already_ready":
						// 正常 KNN sub-cluster 分配
						if w.subClusterSvc != nil {
							result, err := w.subClusterSvc.AssignToSubCluster(ctx, postID, *primaryTopicID)
							if err != nil {
								log.Printf("sub-cluster assign error for post %s: %v", postID, err)
							} else if result != nil {
								log.Printf("post %s -> sub-cluster %s (distance: %.4f, noise: %v)",
									postID, result.ClusterID, result.Distance, result.IsNoise)
							}
						}
					}
				}
			}
		}

		// 處理次要主題
		if result.SecondaryTopic != nil && *result.SecondaryTopic != "" {
			multiCount++
			if secondaryTopic := w.llmClassifier.FindTopicByName(*result.SecondaryTopic); secondaryTopic != nil {
				pt := &entity.PostTopic{
					PostID:     parsePostID(postID),
					TopicID:    secondaryTopic.ID,
					Similarity: 0.7,
					Confidence: entity.ConfidenceMedium,
					AssignedAt: time.Now(),
				}
				w.topicRepo.SavePostTopic(ctx, pt)
			}
		}
	}

	total := highCount + mediumCount + lowCount
	if total > 0 {
		log.Printf("LLM classification: %d posts (high:%d, medium:%d, low:%d, multi:%d)",
			total, highCount, mediumCount, lowCount, multiCount)
	}
	if coldStartQueued > 0 || coldStartTriggered > 0 {
		log.Printf("Cold start: %d queued, %d triggered", coldStartQueued, coldStartTriggered)
	}
}

// parsePostID 將 postID 字串轉換為 int64
func parsePostID(postID string) int64 {
	id, _ := strconv.ParseInt(postID, 10, 64)
	return id
}

// processPostAndCollect 處理單篇貼文，返回處理結果供批次分配使用
func (w *StreamWorker) processPostAndCollect(ctx context.Context, msg redis.PostMessage, embedding []float32) (*processedPost, error) {
	postID := strconv.FormatInt(msg.ID, 10)

	// Check if already exists
	existing, _ := w.postRepo.FindByID(ctx, postID)
	if existing != nil {
		log.Printf("post %s already exists, skip", postID)
		return nil, nil // 已存在，不需要分配
	}

	// Generate tags
	tags, err := w.llmSvc.GenerateTags(ctx, msg.Content)
	if err != nil {
		return nil, err
	}

	// Parse time
	postTime, _ := time.Parse(time.RFC3339, msg.PostTime)
	if postTime.IsZero() {
		postTime = time.Now()
	}

	// Save post
	post := &entity.Post{
		PostID:   postID,
		Content:  msg.Content,
		Platform: toPlatform(msg.Platform),
		Author: entity.Author{
			ID:       msg.PlatformUserID,
			Username: msg.OwnerUsername,
		},
		Metrics: entity.Metrics{
			Likes:    msg.LikeCount,
			Comments: msg.CommentCount,
			Shares:   msg.ShareCount,
			Views:    msg.ViewCount,
		},
		Embedding: embedding,
		CreatedAt: postTime,
	}

	if err := w.postRepo.Save(ctx, post); err != nil {
		return nil, err
	}

	// 轉換 tags 為 PostTags 格式
	postTags := &service.PostTags{
		Topics:     make([]string, 0),
		Brands:     make([]string, 0),
		Products:   make([]string, 0),
		Sentiments: make([]string, 0),
	}

	// Save tags & collect for assignment
	for _, t := range tags {
		tagType := entity.TagTypeSoft
		if t.IsHardTag {
			tagType = entity.TagTypeHard
		}
		tagID := t.Name
		if t.HardTagID != "" {
			tagID = t.HardTagID
		}

		// Map service.TagCategory to entity.TagCategory
		category := entity.TagCategoryTopic
		switch t.Category {
		case service.TagCategoryBrand:
			category = entity.TagCategoryBrand
			postTags.Brands = append(postTags.Brands, t.Name)
		case service.TagCategoryProduct:
			category = entity.TagCategoryProduct
			postTags.Products = append(postTags.Products, t.Name)
		case service.TagCategorySentiment:
			category = entity.TagCategorySentiment
			postTags.Sentiments = append(postTags.Sentiments, t.Name)
		case service.TagCategoryTopic:
			category = entity.TagCategoryTopic
			postTags.Topics = append(postTags.Topics, t.Name)
		}

		postTag := &entity.PostTag{
			PostID:     post.PostID,
			TagID:      tagID,
			TagType:    tagType,
			Category:   category,
			Confidence: t.Confidence,
			Source:     entity.TagSourceLLM,
			CreatedAt:  time.Now(),
		}
		w.tagRepo.SavePostTag(ctx, postTag)
	}

	// 返回處理結果供批次分配
	return &processedPost{
		postID:    postID,
		content:   msg.Content,
		embedding: embedding,
		tags:      postTags,
	}, nil
}

// processPostWithAnalysis 處理單篇貼文（含全量 LLM 分析）
func (w *StreamWorker) processPostWithAnalysis(ctx context.Context, msg redis.PostMessage, embedding []float32, analysis *service.PostAnalysis) (*processedPost, error) {
	postID := strconv.FormatInt(msg.ID, 10)

	// Check if already exists
	existing, _ := w.postRepo.FindByID(ctx, postID)
	if existing != nil {
		log.Printf("post %s already exists, skip", postID)
		return nil, nil
	}

	// Parse time
	postTime, _ := time.Parse(time.RFC3339, msg.PostTime)
	if postTime.IsZero() {
		postTime = time.Now()
	}

	// Save post
	post := &entity.Post{
		PostID:   postID,
		Content:  msg.Content,
		Platform: toPlatform(msg.Platform),
		Author: entity.Author{
			ID:       msg.PlatformUserID,
			Username: msg.OwnerUsername,
		},
		Metrics: entity.Metrics{
			Likes:    msg.LikeCount,
			Comments: msg.CommentCount,
			Shares:   msg.ShareCount,
			Views:    msg.ViewCount,
		},
		Embedding: embedding,
		CreatedAt: postTime,
	}

	if err := w.postRepo.Save(ctx, post); err != nil {
		return nil, err
	}

	// 儲存全量 LLM 分析結果
	if analysis != nil && w.analysisRepo != nil {
		// 轉換 service.PostAnalysis -> repository.PostAnalysis
		repoAnalysis := serviceToRepoAnalysis(analysis)
		if err := w.analysisRepo.SaveAnalysis(ctx, postID, repoAnalysis); err != nil {
			log.Printf("save analysis error for post %s: %v", postID, err)
			// 不中斷流程，繼續處理
		} else {
			log.Printf("post %s analyzed: sentiment=%s (%.2f), tags=%d, aspects=%d, intent=%s",
				postID, analysis.Sentiment.Label, analysis.Sentiment.Score,
				len(analysis.SoftTags), len(analysis.Aspects), analysis.Intent)
		}
	}

	// 如果沒有 TaggingService，使用舊的 LLM 標籤邏輯
	var postTags *service.PostTags
	if analysis == nil && w.llmSvc != nil {
		tags, err := w.llmSvc.GenerateTags(ctx, msg.Content)
		if err != nil {
			log.Printf("generate tags error: %v", err)
		} else {
			postTags = &service.PostTags{
				Topics:     make([]string, 0),
				Brands:     make([]string, 0),
				Products:   make([]string, 0),
				Sentiments: make([]string, 0),
			}

			for _, t := range tags {
				tagType := entity.TagTypeSoft
				if t.IsHardTag {
					tagType = entity.TagTypeHard
				}
				tagID := t.Name
				if t.HardTagID != "" {
					tagID = t.HardTagID
				}

				category := entity.TagCategoryTopic
				switch t.Category {
				case service.TagCategoryBrand:
					category = entity.TagCategoryBrand
					postTags.Brands = append(postTags.Brands, t.Name)
				case service.TagCategoryProduct:
					category = entity.TagCategoryProduct
					postTags.Products = append(postTags.Products, t.Name)
				case service.TagCategorySentiment:
					category = entity.TagCategorySentiment
					postTags.Sentiments = append(postTags.Sentiments, t.Name)
				case service.TagCategoryTopic:
					category = entity.TagCategoryTopic
					postTags.Topics = append(postTags.Topics, t.Name)
				}

				postTag := &entity.PostTag{
					PostID:     post.PostID,
					TagID:      tagID,
					TagType:    tagType,
					Category:   category,
					Confidence: t.Confidence,
					Source:     entity.TagSourceLLM,
					CreatedAt:  time.Now(),
				}
				w.tagRepo.SavePostTag(ctx, postTag)
			}
		}
	}

	return &processedPost{
		postID:    postID,
		content:   msg.Content,
		embedding: embedding,
		tags:      postTags,
		analysis:  analysis,
	}, nil
}

func toPlatform(p string) entity.Platform {
	switch p {
	case "ig":
		return entity.PlatformInstagram
	case "fb":
		return entity.PlatformFacebook
	case "yt":
		return entity.PlatformYouTube
	case "tiktok":
		return entity.PlatformTikTok
	default:
		return entity.Platform(p)
	}
}

// serviceToRepoAnalysis 轉換 service.PostAnalysis -> repository.PostAnalysis
func serviceToRepoAnalysis(svc *service.PostAnalysis) *repository.PostAnalysis {
	if svc == nil {
		return nil
	}

	// 轉換 SoftTags
	softTags := make([]repository.SoftTag, len(svc.SoftTags))
	for i, t := range svc.SoftTags {
		softTags[i] = repository.SoftTag{
			Tag:        t.Tag,
			Confidence: t.Confidence,
		}
	}

	// 轉換 Aspects
	aspects := make([]repository.AspectResult, len(svc.Aspects))
	for i, a := range svc.Aspects {
		aspects[i] = repository.AspectResult{
			Aspect:    a.Aspect,
			Sentiment: a.Sentiment,
			Mention:   a.Mention,
		}
	}

	return &repository.PostAnalysis{
		Sentiment: repository.SentimentResult{
			Label:  svc.Sentiment.Label,
			Score:  svc.Sentiment.Score,
			Reason: svc.Sentiment.Reason,
		},
		SoftTags:    softTags,
		Aspects:     aspects,
		ProductType: svc.ProductType,
		Intent:      svc.Intent,
	}
}
