package service

import (
	"context"
	"fmt"
	"math"

	"github.com/ikala/ontix/internal/domain/repository"
)

// SubClusterService Sub-cluster 分配服務（KNN）
type SubClusterService struct {
	coldStartRepo repository.ColdStartRepository
	centroidRepo  repository.CentroidRepository
	postRepo      repository.PostRepository
}

// NewSubClusterService 建立 SubClusterService
func NewSubClusterService(
	coldStartRepo repository.ColdStartRepository,
	centroidRepo repository.CentroidRepository,
	postRepo repository.PostRepository,
) *SubClusterService {
	return &SubClusterService{
		coldStartRepo: coldStartRepo,
		centroidRepo:  centroidRepo,
		postRepo:      postRepo,
	}
}

// SubClusterAssignmentResult KNN 分配結果
type SubClusterAssignmentResult struct {
	PostID      string
	TopicID     int
	ClusterID   string  // 分配的 sub-cluster ID (e.g., "topic_5_cluster_0")
	Distance    float64 // 到 centroid 的距離
	IsNoise     bool    // 距離超過閾值，標記為噪音
}

// AssignToSubCluster 使用 KNN 將 post 分配到 sub-cluster
// 返回分配結果，如果 topic 未 ready 則返回 nil
func (s *SubClusterService) AssignToSubCluster(ctx context.Context, postID string, topicID int) (*SubClusterAssignmentResult, error) {
	// 1. 檢查 topic 是否已完成冷啟動
	ready, err := s.coldStartRepo.IsReady(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to check cold start status: %w", err)
	}

	if !ready {
		// Topic 尚未 ready，不進行 sub-cluster 分配
		return nil, nil
	}

	// 2. 取得 post 的 embedding
	post, err := s.postRepo.FindByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil || len(post.Embedding) == 0 {
		return nil, fmt.Errorf("post %s not found or has no embedding", postID)
	}

	// 3. 取得此 topic 的所有 centroids
	centroids, err := s.centroidRepo.GetByTopicID(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to get centroids for topic %d: %w", topicID, err)
	}

	if len(centroids) == 0 {
		// 沒有 clusters（全是噪音），標記為 noise
		return &SubClusterAssignmentResult{
			PostID:    postID,
			TopicID:   topicID,
			ClusterID: fmt.Sprintf("topic_%d_noise", topicID),
			Distance:  0,
			IsNoise:   true,
		}, nil
	}

	// 4. KNN：找到最近的 centroid (K=1)
	var nearestClusterID string
	minDistance := math.MaxFloat64

	for _, centroid := range centroids {
		dist := cosineSimilarityDistance(post.Embedding, centroid.Vector)
		if dist < minDistance {
			minDistance = dist
			nearestClusterID = centroid.ClusterID
		}
	}

	// 5. 檢查是否超過閾值（可選：太遠的標記為噪音）
	// 使用 cosine distance，閾值 0.5 代表相似度低於 0.5
	const noiseThreshold = 0.5
	isNoise := minDistance > noiseThreshold

	result := &SubClusterAssignmentResult{
		PostID:    postID,
		TopicID:   topicID,
		ClusterID: nearestClusterID,
		Distance:  minDistance,
		IsNoise:   isNoise,
	}

	return result, nil
}

// BatchAssignToSubCluster 批次分配多個 posts
func (s *SubClusterService) BatchAssignToSubCluster(ctx context.Context, postIDs []string, topicID int) ([]*SubClusterAssignmentResult, error) {
	// 1. 檢查 topic 是否已完成冷啟動
	ready, err := s.coldStartRepo.IsReady(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to check cold start status: %w", err)
	}

	if !ready {
		return nil, nil
	}

	// 2. 取得此 topic 的所有 centroids
	centroids, err := s.centroidRepo.GetByTopicID(ctx, topicID)
	if err != nil {
		return nil, fmt.Errorf("failed to get centroids: %w", err)
	}

	results := make([]*SubClusterAssignmentResult, 0, len(postIDs))

	for _, postID := range postIDs {
		post, err := s.postRepo.FindByID(ctx, postID)
		if err != nil || post == nil || len(post.Embedding) == 0 {
			continue
		}

		var result *SubClusterAssignmentResult

		if len(centroids) == 0 {
			// 沒有 clusters，標記為 noise
			result = &SubClusterAssignmentResult{
				PostID:    postID,
				TopicID:   topicID,
				ClusterID: fmt.Sprintf("topic_%d_noise", topicID),
				Distance:  0,
				IsNoise:   true,
			}
		} else {
			// KNN 找最近的 centroid
			var nearestClusterID string
			minDistance := math.MaxFloat64

			for _, centroid := range centroids {
				dist := cosineSimilarityDistance(post.Embedding, centroid.Vector)
				if dist < minDistance {
					minDistance = dist
					nearestClusterID = centroid.ClusterID
				}
			}

			const noiseThreshold = 0.5
			result = &SubClusterAssignmentResult{
				PostID:    postID,
				TopicID:   topicID,
				ClusterID: nearestClusterID,
				Distance:  minDistance,
				IsNoise:   minDistance > noiseThreshold,
			}
		}

		results = append(results, result)
	}

	return results, nil
}

// cosineSimilarityDistance 計算 cosine 距離 (1 - cosine_similarity)
// 返回值範圍 [0, 2]，0 表示完全相同，2 表示完全相反
func cosineSimilarityDistance(a, b []float32) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return math.MaxFloat64
	}

	var dotProduct, normA, normB float64
	for i := 0; i < len(a); i++ {
		dotProduct += float64(a[i]) * float64(b[i])
		normA += float64(a[i]) * float64(a[i])
		normB += float64(b[i]) * float64(b[i])
	}

	if normA == 0 || normB == 0 {
		return math.MaxFloat64
	}

	cosineSim := dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
	return 1.0 - cosineSim
}
