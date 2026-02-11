package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/redis/go-redis/v9"
)

// Client Redis 客戶端
type Client struct {
	rdb *redis.Client
}

// New 建立 Redis 客戶端
func New(cfg *config.Config) (*Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisAddr(),
	})

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping redis: %w", err)
	}

	return &Client{rdb: rdb}, nil
}

// Close 關閉客戶端
func (c *Client) Close() error {
	return c.rdb.Close()
}

// Get 取得快取值
func (c *Client) Get(ctx context.Context, key string) (string, error) {
	return c.rdb.Get(ctx, key).Result()
}

// Set 設定快取值（含 TTL）
func (c *Client) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return c.rdb.Set(ctx, key, value, ttl).Err()
}
