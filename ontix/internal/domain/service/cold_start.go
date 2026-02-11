package service

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
)

// ColdStartService 冷啟動服務
type ColdStartService struct {
	coldStartRepo  repository.ColdStartRepository
	centroidRepo   repository.CentroidRepository
	postRepo       repository.PostRepository
	clusteringService ClusteringService
	config         *entity.ColdStartConfig
}

// NewColdStartService 建立冷啟動服務
func NewColdStartService(
	coldStartRepo repository.ColdStartRepository,
	centroidRepo repository.CentroidRepository,
	postRepo repository.PostRepository,
	clusteringService ClusteringService,
	config *entity.ColdStartConfig,
) *ColdStartService {
	if config == nil {
		config = entity.DefaultColdStartConfig()
	}
	return &ColdStartService{
		coldStartRepo:     coldStartRepo,
		centroidRepo:      centroidRepo,
		postRepo:          postRepo,
		clusteringService: clusteringService,
		config:            config,
	}
}

// ColdStartResult 冷啟動處理結果
type ColdStartResult struct {
	TopicID      int
	Action       string // "queued", "triggered", "skip", "already_ready"
	PostCount    int
	ShouldProcess bool
}

// HandleNewPost 處理新文章的冷啟動邏輯
// 返回是否需要執行 HDBSCAN 初始化
func (s *ColdStartService) HandleNewPost(ctx context.Context, topicID int, postID string) (*ColdStartResult, error) {
	// 1. 檢查是否已經 ready
	ready, err := s.coldStartRepo.IsReady(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to check cold start status: %w", err)
	}

	if ready {
		return &ColdStartResult{
			TopicID:       topicID,
			Action:        "already_ready",
			ShouldProcess: false,
		}, nil
	}

	// 2. 加入冷啟動佇列並檢查是否觸發
	result, err := s.coldStartRepo.AddPost(ctx, topicID, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to add post to cold start: %w", err)
	}

	// 3. 取得當前狀態
	state, err := s.coldStartRepo.GetState(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cold start state: %w", err)
	}

	shouldProcess := result == entity.ColdStartTriggerTriggered

	return &ColdStartResult{
		TopicID:       topicID,
		Action:        string(result),
		PostCount:     state.PostCount,
		ShouldProcess: shouldProcess,
	}, nil
}

// ProcessColdStart 執行冷啟動初始化（HDBSCAN）
func (s *ColdStartService) ProcessColdStart(ctx context.Context, topicID int) error {
	log.Printf("[ColdStart] Processing topic %d", topicID)

	// 1. 取得狀態
	state, err := s.coldStartRepo.GetState(ctx, topicID)
	if err != nil {
		return fmt.Errorf("failed to get cold start state: %w", err)
	}

	// 2. 檢查重試次數
	if state.RetryCount >= s.config.MaxRetry {
		log.Printf("[ColdStart] Topic %d exceeded max retry (%d), skipping", topicID, s.config.MaxRetry)
		return fmt.Errorf("exceeded max retry count")
	}

	// 3. 設定為處理中
	if err := s.coldStartRepo.SetStatus(ctx, topicID, entity.ColdStartStatusProcessing); err != nil {
		return fmt.Errorf("failed to set processing status: %w", err)
	}

	// 4. 取得所有文章 ID
	postIDs, err := s.coldStartRepo.GetPostIDs(ctx, topicID)
	if err != nil {
		s.coldStartRepo.SetFailed(ctx, topicID, err.Error())
		return fmt.Errorf("failed to get post ids: %w", err)
	}

	log.Printf("[ColdStart] Topic %d has %d posts for clustering", topicID, len(postIDs))

	// 5. 從 DB 取得 embeddings
	embeddings := make([][]float32, 0, len(postIDs))
	texts := make([]string, 0, len(postIDs))
	validPostIDs := make([]string, 0, len(postIDs))

	for _, postID := range postIDs {
		post, err := s.postRepo.FindByID(ctx, postID)
		if err != nil || post == nil {
			continue
		}
		if len(post.Embedding) == 0 {
			continue
		}

		embeddings = append(embeddings, post.Embedding)
		texts = append(texts, truncateText(post.Content, 200))
		validPostIDs = append(validPostIDs, postID)
	}

	if len(embeddings) < s.config.MinCountFallback {
		err := fmt.Errorf("not enough posts with embeddings: %d", len(embeddings))
		s.coldStartRepo.SetFailed(ctx, topicID, err.Error())
		return err
	}

	log.Printf("[ColdStart] Running HDBSCAN with %d posts", len(embeddings))

	// 6. 執行 HDBSCAN
	// 動態調整 min_cluster_size：數據少時降低門檻
	minClusterSize := 5
	if len(embeddings) < 30 {
		minClusterSize = 3 // 少量數據時，3 個相似帖子即可形成 cluster
	}
	if len(embeddings) < 15 {
		minClusterSize = 2 // 極少數據時，2 個即可
	}

	clusterResp, err := s.clusteringService.RunClustering(ctx, &ClusteringRequest{
		Embeddings:     embeddings,
		Texts:          texts,
		MinClusterSize: minClusterSize,
	})
	if err != nil {
		s.coldStartRepo.SetFailed(ctx, topicID, err.Error())
		return fmt.Errorf("clustering failed: %w", err)
	}

	log.Printf("[ColdStart] HDBSCAN found %d clusters, %d noise", len(clusterResp.Clusters), clusterResp.NoiseCount)

	// 7. 儲存 centroids 到 Redis
	for i, cluster := range clusterResp.Clusters {
		clusterID := fmt.Sprintf("topic_%d_cluster_%d", topicID, i)
		centroid := &entity.Centroid{
			ClusterID: clusterID,
			Vector:    cluster.Centroid,
			UpdatedAt: time.Now(),
		}
		if err := s.centroidRepo.Save(ctx, centroid); err != nil {
			log.Printf("[ColdStart] Failed to save centroid %s: %v", clusterID, err)
		}
	}

	// 8. 設定為完成
	if err := s.coldStartRepo.SetReady(ctx, topicID); err != nil {
		return fmt.Errorf("failed to set ready status: %w", err)
	}

	log.Printf("[ColdStart] Topic %d cold start completed: %d clusters created", topicID, len(clusterResp.Clusters))

	return nil
}

// GetStatus 取得冷啟動狀態
func (s *ColdStartService) GetStatus(ctx context.Context, topicID int) (*entity.ColdStartState, error) {
	return s.coldStartRepo.GetState(ctx, topicID)
}

// IsReady 檢查是否已完成冷啟動
func (s *ColdStartService) IsReady(ctx context.Context, topicID int) (bool, error) {
	return s.coldStartRepo.IsReady(ctx, topicID)
}

// Reset 重置冷啟動狀態（用於重新初始化）
func (s *ColdStartService) Reset(ctx context.Context, topicID int) error {
	return s.coldStartRepo.Clear(ctx, topicID)
}

func truncateText(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen]
}
