package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/redis/go-redis/v9"
)

const (
	centroidKeyPrefix = "centroid:"
	centroidSetKey    = "centroids"
)

// CentroidRepo Redis 實作的 CentroidRepository
type CentroidRepo struct {
	client *Client
}

// NewCentroidRepo 建立 CentroidRepository
func NewCentroidRepo(client *Client) repository.CentroidRepository {
	return &CentroidRepo{client: client}
}

type centroidData struct {
	ClusterID string    `json:"cluster_id"`
	Vector    []float32 `json:"vector"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Save 儲存 Centroid
func (r *CentroidRepo) Save(ctx context.Context, centroid *entity.Centroid) error {
	data := centroidData{
		ClusterID: centroid.ClusterID,
		Vector:    centroid.Vector,
		UpdatedAt: centroid.UpdatedAt,
	}
	if data.UpdatedAt.IsZero() {
		data.UpdatedAt = time.Now()
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal centroid: %w", err)
	}

	key := centroidKeyPrefix + centroid.ClusterID
	pipe := r.client.rdb.Pipeline()
	pipe.Set(ctx, key, jsonData, 0)
	pipe.SAdd(ctx, centroidSetKey, centroid.ClusterID)

	if _, err := pipe.Exec(ctx); err != nil {
		return fmt.Errorf("failed to save centroid: %w", err)
	}
	return nil
}

// GetAll 取得所有 Centroid
func (r *CentroidRepo) GetAll(ctx context.Context) ([]*entity.Centroid, error) {
	// 取得所有 cluster IDs
	clusterIDs, err := r.client.rdb.SMembers(ctx, centroidSetKey).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get centroid set: %w", err)
	}

	if len(clusterIDs) == 0 {
		return nil, nil
	}

	// 批次取得所有 centroid
	keys := make([]string, len(clusterIDs))
	for i, id := range clusterIDs {
		keys[i] = centroidKeyPrefix + id
	}

	values, err := r.client.rdb.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get centroids: %w", err)
	}

	centroids := make([]*entity.Centroid, 0, len(values))
	for _, v := range values {
		if v == nil {
			continue
		}

		str, ok := v.(string)
		if !ok {
			continue
		}

		var data centroidData
		if err := json.Unmarshal([]byte(str), &data); err != nil {
			continue
		}

		centroids = append(centroids, &entity.Centroid{
			ClusterID: data.ClusterID,
			Vector:    data.Vector,
			UpdatedAt: data.UpdatedAt,
		})
	}

	return centroids, nil
}

// GetByTopicID 取得特定 Topic 的所有 Centroid
func (r *CentroidRepo) GetByTopicID(ctx context.Context, topicID int) ([]*entity.Centroid, error) {
	// 取得所有 cluster IDs
	clusterIDs, err := r.client.rdb.SMembers(ctx, centroidSetKey).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get centroid set: %w", err)
	}

	if len(clusterIDs) == 0 {
		return nil, nil
	}

	// 過濾出屬於此 topic 的 cluster IDs (格式: topic_{topicID}_cluster_{i})
	prefix := fmt.Sprintf("topic_%d_cluster_", topicID)
	filteredIDs := make([]string, 0)
	for _, id := range clusterIDs {
		if strings.HasPrefix(id, prefix) {
			filteredIDs = append(filteredIDs, id)
		}
	}

	if len(filteredIDs) == 0 {
		return nil, nil
	}

	// 批次取得 centroids
	keys := make([]string, len(filteredIDs))
	for i, id := range filteredIDs {
		keys[i] = centroidKeyPrefix + id
	}

	values, err := r.client.rdb.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get centroids: %w", err)
	}

	centroids := make([]*entity.Centroid, 0, len(values))
	for _, v := range values {
		if v == nil {
			continue
		}

		str, ok := v.(string)
		if !ok {
			continue
		}

		var data centroidData
		if err := json.Unmarshal([]byte(str), &data); err != nil {
			continue
		}

		centroids = append(centroids, &entity.Centroid{
			ClusterID: data.ClusterID,
			Vector:    data.Vector,
			UpdatedAt: data.UpdatedAt,
		})
	}

	return centroids, nil
}

// Delete 刪除 Centroid
func (r *CentroidRepo) Delete(ctx context.Context, clusterID string) error {
	key := centroidKeyPrefix + clusterID
	pipe := r.client.rdb.Pipeline()
	pipe.Del(ctx, key)
	pipe.SRem(ctx, centroidSetKey, clusterID)

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return fmt.Errorf("failed to delete centroid: %w", err)
	}
	return nil
}

// Clear removes all centroids from Redis
func (r *CentroidRepo) Clear(ctx context.Context) error {
	// Get all cluster IDs
	clusterIDs, err := r.client.rdb.SMembers(ctx, centroidSetKey).Result()
	if err != nil && err != redis.Nil {
		return fmt.Errorf("failed to get centroid set: %w", err)
	}

	if len(clusterIDs) == 0 {
		return nil
	}

	// Delete all centroid keys and the set
	pipe := r.client.rdb.Pipeline()
	for _, id := range clusterIDs {
		pipe.Del(ctx, centroidKeyPrefix+id)
	}
	pipe.Del(ctx, centroidSetKey)

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return fmt.Errorf("failed to clear centroids: %w", err)
	}
	return nil
}
