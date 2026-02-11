package redis

import (
	"context"
	"fmt"

	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/redis/go-redis/v9"
)

const pendingPoolKey = "pending_pool"

// PendingPool Redis 實作的 PendingPool
type PendingPool struct {
	client *Client
}

// NewPendingPool 建立 PendingPool
func NewPendingPool(client *Client) repository.PendingPool {
	return &PendingPool{client: client}
}

// Add 新增貼文到待處理池
func (p *PendingPool) Add(ctx context.Context, postID string) error {
	if err := p.client.rdb.SAdd(ctx, pendingPoolKey, postID).Err(); err != nil {
		return fmt.Errorf("failed to add to pending pool: %w", err)
	}
	return nil
}

// GetBatch 批次取得待處理貼文 ID
func (p *PendingPool) GetBatch(ctx context.Context, limit int) ([]string, error) {
	// 使用 SRANDMEMBER 隨機取得指定數量
	postIDs, err := p.client.rdb.SRandMemberN(ctx, pendingPoolKey, int64(limit)).Result()
	if err != nil && err != redis.Nil {
		return nil, fmt.Errorf("failed to get batch from pending pool: %w", err)
	}
	return postIDs, nil
}

// Remove 從待處理池移除貼文
func (p *PendingPool) Remove(ctx context.Context, postIDs []string) error {
	if len(postIDs) == 0 {
		return nil
	}

	// 轉換為 interface{} slice
	members := make([]interface{}, len(postIDs))
	for i, id := range postIDs {
		members[i] = id
	}

	if err := p.client.rdb.SRem(ctx, pendingPoolKey, members...).Err(); err != nil {
		return fmt.Errorf("failed to remove from pending pool: %w", err)
	}
	return nil
}

// Size 取得待處理池大小
func (p *PendingPool) Size(ctx context.Context) (int64, error) {
	size, err := p.client.rdb.SCard(ctx, pendingPoolKey).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get pending pool size: %w", err)
	}
	return size, nil
}
