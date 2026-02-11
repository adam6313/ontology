package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	streamKey = "posts:incoming"
	groupName = "ontix-workers"
)

// PostMessage represents a message in Redis Stream
type PostMessage struct {
	ID             int64  `json:"id"`
	Platform       string `json:"platform"`
	PlatformUserID string `json:"platform_user_id"`
	Content        string `json:"content"`
	LikeCount      int    `json:"like_count"`
	CommentCount   int    `json:"comment_count"`
	ShareCount     int    `json:"share_count"`
	ViewCount      int    `json:"view_count"`
	OwnerUsername  string `json:"owner_username"`
	PostTime       string `json:"post_time"`
}

// StreamRepo handles Redis Stream operations
type StreamRepo struct {
	client     *Client
	consumerID string
}

// NewStreamRepo creates a new StreamRepo
// Uses a fixed consumer name so pending messages survive restarts.
func NewStreamRepo(client *Client) *StreamRepo {
	return &StreamRepo{
		client:     client,
		consumerID: "worker-main",
	}
}

// EnsureGroup ensures consumer group exists
func (s *StreamRepo) EnsureGroup(ctx context.Context) error {
	// Try to create group, ignore BUSYGROUP error if already exists
	err := s.client.rdb.XGroupCreateMkStream(ctx, streamKey, groupName, "0").Err()
	if err != nil && err.Error() != "BUSYGROUP Consumer Group name already exists" {
		return fmt.Errorf("failed to create consumer group: %w", err)
	}
	return nil
}

// Publish publishes a post to the stream
func (s *StreamRepo) Publish(ctx context.Context, msg PostMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return s.client.rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: streamKey,
		Values: map[string]interface{}{"data": string(data)},
	}).Err()
}

// Consume consumes messages (blocks waiting for new messages)
func (s *StreamRepo) Consume(ctx context.Context, batchSize int, timeout time.Duration) ([]PostMessage, []string, error) {
	results, err := s.client.rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    groupName,
		Consumer: s.consumerID,
		Streams:  []string{streamKey, ">"},
		Count:    int64(batchSize),
		Block:    timeout,
	}).Result()

	if err == redis.Nil {
		return nil, nil, nil
	}
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read stream: %w", err)
	}

	if len(results) == 0 || len(results[0].Messages) == 0 {
		return nil, nil, nil
	}

	var msgs []PostMessage
	var ids []string
	for _, r := range results[0].Messages {
		var msg PostMessage
		if data, ok := r.Values["data"].(string); ok {
			if err := json.Unmarshal([]byte(data), &msg); err != nil {
				continue
			}
			msgs = append(msgs, msg)
			ids = append(ids, r.ID)
		}
	}
	return msgs, ids, nil
}

// Ack acknowledges and deletes processed messages
func (s *StreamRepo) Ack(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	// ACK first
	if err := s.client.rdb.XAck(ctx, streamKey, groupName, ids...).Err(); err != nil {
		return err
	}
	// Then delete
	return s.client.rdb.XDel(ctx, streamKey, ids...).Err()
}

// ClaimStale claims pending messages that have been idle longer than maxIdle
// from any consumer and reassigns them to this consumer for reprocessing.
func (s *StreamRepo) ClaimStale(ctx context.Context, maxIdle time.Duration, batchSize int) ([]PostMessage, []string, error) {
	// XAUTOCLAIM moves stale pending entries to this consumer
	msgs, _, err := s.client.rdb.XAutoClaim(ctx, &redis.XAutoClaimArgs{
		Stream:   streamKey,
		Group:    groupName,
		Consumer: s.consumerID,
		MinIdle:  maxIdle,
		Start:    "0-0",
		Count:    int64(batchSize),
	}).Result()

	if err != nil {
		return nil, nil, fmt.Errorf("xautoclaim: %w", err)
	}

	if len(msgs) == 0 {
		return nil, nil, nil
	}

	var posts []PostMessage
	var ids []string
	for _, m := range msgs {
		var msg PostMessage
		if data, ok := m.Values["data"].(string); ok {
			if err := json.Unmarshal([]byte(data), &msg); err != nil {
				// Can't parse — ACK and skip
				_ = s.client.rdb.XAck(ctx, streamKey, groupName, m.ID).Err()
				_ = s.client.rdb.XDel(ctx, streamKey, m.ID).Err()
				continue
			}
			posts = append(posts, msg)
			ids = append(ids, m.ID)
		}
	}
	return posts, ids, nil
}

// Len returns the stream length
func (s *StreamRepo) Len(ctx context.Context) (int64, error) {
	return s.client.rdb.XLen(ctx, streamKey).Result()
}

// Pending returns the number of pending messages
func (s *StreamRepo) Pending(ctx context.Context) (int64, error) {
	info, err := s.client.rdb.XPending(ctx, streamKey, groupName).Result()
	if err != nil {
		return 0, err
	}
	return info.Count, nil
}
