package redis

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/redis/go-redis/v9"
)

const (
	coldStartKeyPrefix = "cold_start:"
)

// ColdStartRepo Redis 實作的 ColdStartRepository
type ColdStartRepo struct {
	client *Client
	config *entity.ColdStartConfig
}

// NewColdStartRepo 建立 ColdStartRepository
func NewColdStartRepo(client *Client, config *entity.ColdStartConfig) repository.ColdStartRepository {
	if config == nil {
		config = entity.DefaultColdStartConfig()
	}
	return &ColdStartRepo{client: client, config: config}
}

// Redis key helpers
func (r *ColdStartRepo) keyPostIDs(topicID int) string {
	return fmt.Sprintf("%s%d:post_ids", coldStartKeyPrefix, topicID)
}

func (r *ColdStartRepo) keyStatus(topicID int) string {
	return fmt.Sprintf("%s%d:status", coldStartKeyPrefix, topicID)
}

func (r *ColdStartRepo) keyStartedAt(topicID int) string {
	return fmt.Sprintf("%s%d:started_at", coldStartKeyPrefix, topicID)
}

func (r *ColdStartRepo) keyLock(topicID int) string {
	return fmt.Sprintf("%s%d:lock", coldStartKeyPrefix, topicID)
}

func (r *ColdStartRepo) keyRetryCount(topicID int) string {
	return fmt.Sprintf("%s%d:retry_count", coldStartKeyPrefix, topicID)
}

func (r *ColdStartRepo) keyLastError(topicID int) string {
	return fmt.Sprintf("%s%d:last_error", coldStartKeyPrefix, topicID)
}

// Lua script for atomic add and trigger check
var addPostScript = redis.NewScript(`
-- KEYS[1] = post_ids set
-- KEYS[2] = status
-- KEYS[3] = started_at
-- KEYS[4] = lock
-- ARGV[1] = post_id
-- ARGV[2] = current_timestamp (unix seconds)
-- ARGV[3] = worker_id
-- ARGV[4] = min_count_ideal (100)
-- ARGV[5] = min_count_acceptable (50)
-- ARGV[6] = min_count_fallback (20)
-- ARGV[7] = time_threshold_seconds (24hr = 86400)
-- ARGV[8] = max_wait_seconds (7 days = 604800)
-- ARGV[9] = lock_timeout_seconds (600)

-- 1. Check status, skip if ready or processing
local status = redis.call('GET', KEYS[2])
if status == 'ready' then
    return 'skip'
end
if status == 'processing' then
    return 'skip'
end

-- 2. Add post to set
redis.call('SADD', KEYS[1], ARGV[1])
local count = redis.call('SCARD', KEYS[1])

-- 3. Set started_at if first post
if count == 1 then
    redis.call('SET', KEYS[3], ARGV[2])
end

-- 4. Calculate elapsed time
local started = tonumber(redis.call('GET', KEYS[3])) or tonumber(ARGV[2])
local elapsed = tonumber(ARGV[2]) - started

-- 5. Parse config
local min_ideal = tonumber(ARGV[4])
local min_acceptable = tonumber(ARGV[5])
local min_fallback = tonumber(ARGV[6])
local time_threshold = tonumber(ARGV[7])
local max_wait = tonumber(ARGV[8])
local lock_timeout = tonumber(ARGV[9])

-- 6. Check trigger conditions
local should_trigger = false

-- Condition A: count >= 100
if count >= min_ideal then
    should_trigger = true
-- Condition B: count >= 50 AND time >= 24hr
elseif count >= min_acceptable and elapsed >= time_threshold then
    should_trigger = true
-- Condition C: count >= 20 AND time >= 7 days
elseif count >= min_fallback and elapsed >= max_wait then
    should_trigger = true
end

-- 7. Try to acquire lock and trigger
if should_trigger then
    local locked = redis.call('SETNX', KEYS[4], ARGV[3])
    if locked == 1 then
        redis.call('EXPIRE', KEYS[4], lock_timeout)
        redis.call('SET', KEYS[2], 'pending')
        return 'triggered'
    else
        return 'already_triggered'
    end
end

-- 8. Set status to collecting if not set
if not status then
    redis.call('SET', KEYS[2], 'collecting')
end

return 'queued'
`)

// AddPost 加入文章到冷啟動佇列
func (r *ColdStartRepo) AddPost(ctx context.Context, topicID int, postID string) (entity.ColdStartTriggerResult, error) {
	now := time.Now().Unix()

	result, err := addPostScript.Run(ctx, r.client.rdb,
		[]string{
			r.keyPostIDs(topicID),
			r.keyStatus(topicID),
			r.keyStartedAt(topicID),
			r.keyLock(topicID),
		},
		postID,
		now,
		fmt.Sprintf("worker-%d", now), // simple worker ID
		r.config.MinCountIdeal,
		r.config.MinCountAcceptable,
		r.config.MinCountFallback,
		int(r.config.TimeThreshold.Seconds()),
		int(r.config.MaxWaitTime.Seconds()),
		int(r.config.LockTimeout.Seconds()),
	).Text()

	if err != nil {
		return "", fmt.Errorf("failed to add post to cold start: %w", err)
	}

	switch result {
	case "triggered":
		return entity.ColdStartTriggerTriggered, nil
	case "already_triggered":
		return entity.ColdStartTriggerAlreadyTriggered, nil
	case "skip":
		return entity.ColdStartTriggerSkip, nil
	default:
		return entity.ColdStartTriggerQueued, nil
	}
}

// GetState 取得冷啟動狀態
func (r *ColdStartRepo) GetState(ctx context.Context, topicID int) (*entity.ColdStartState, error) {
	pipe := r.client.rdb.Pipeline()

	statusCmd := pipe.Get(ctx, r.keyStatus(topicID))
	countCmd := pipe.SCard(ctx, r.keyPostIDs(topicID))
	startedAtCmd := pipe.Get(ctx, r.keyStartedAt(topicID))
	retryCountCmd := pipe.Get(ctx, r.keyRetryCount(topicID))
	lastErrorCmd := pipe.Get(ctx, r.keyLastError(topicID))

	_, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		// Ignore nil errors for missing keys
	}

	state := &entity.ColdStartState{
		TopicID:   topicID,
		Status:    entity.ColdStartStatusCollecting,
		PostCount: 0,
		UpdatedAt: time.Now(),
	}

	if status, err := statusCmd.Result(); err == nil {
		state.Status = entity.ColdStartStatus(status)
	}

	if count, err := countCmd.Result(); err == nil {
		state.PostCount = int(count)
	}

	if startedAt, err := startedAtCmd.Result(); err == nil {
		if ts, err := strconv.ParseInt(startedAt, 10, 64); err == nil {
			state.StartedAt = time.Unix(ts, 0)
		}
	}

	if retryCount, err := retryCountCmd.Result(); err == nil {
		if rc, err := strconv.Atoi(retryCount); err == nil {
			state.RetryCount = rc
		}
	}

	if lastError, err := lastErrorCmd.Result(); err == nil {
		state.LastError = lastError
	}

	return state, nil
}

// GetPostIDs 取得冷啟動佇列中的所有文章 ID
func (r *ColdStartRepo) GetPostIDs(ctx context.Context, topicID int) ([]string, error) {
	postIDs, err := r.client.rdb.SMembers(ctx, r.keyPostIDs(topicID)).Result()
	if err != nil && err != redis.Nil {
		return nil, fmt.Errorf("failed to get post ids: %w", err)
	}
	return postIDs, nil
}

// SetStatus 設定狀態
func (r *ColdStartRepo) SetStatus(ctx context.Context, topicID int, status entity.ColdStartStatus) error {
	return r.client.rdb.Set(ctx, r.keyStatus(topicID), string(status), 0).Err()
}

// SetProcessing 設定為處理中（取得鎖）
func (r *ColdStartRepo) SetProcessing(ctx context.Context, topicID int, workerID string) (bool, error) {
	// Try to acquire lock
	ok, err := r.client.rdb.SetNX(ctx, r.keyLock(topicID), workerID, r.config.LockTimeout).Result()
	if err != nil {
		return false, fmt.Errorf("failed to acquire lock: %w", err)
	}

	if ok {
		// Set status to processing
		r.client.rdb.Set(ctx, r.keyStatus(topicID), string(entity.ColdStartStatusProcessing), 0)
	}

	return ok, nil
}

// SetReady 設定為完成
func (r *ColdStartRepo) SetReady(ctx context.Context, topicID int) error {
	pipe := r.client.rdb.Pipeline()
	pipe.Set(ctx, r.keyStatus(topicID), string(entity.ColdStartStatusReady), 0)
	pipe.Del(ctx, r.keyLock(topicID))
	_, err := pipe.Exec(ctx)
	return err
}

// SetFailed 設定為失敗
func (r *ColdStartRepo) SetFailed(ctx context.Context, topicID int, errMsg string) error {
	pipe := r.client.rdb.Pipeline()
	pipe.Set(ctx, r.keyStatus(topicID), string(entity.ColdStartStatusFailed), 0)
	pipe.Set(ctx, r.keyLastError(topicID), errMsg, 0)
	pipe.Incr(ctx, r.keyRetryCount(topicID))
	pipe.Del(ctx, r.keyLock(topicID))
	_, err := pipe.Exec(ctx)
	return err
}

// Clear 清除冷啟動資料
func (r *ColdStartRepo) Clear(ctx context.Context, topicID int) error {
	keys := []string{
		r.keyPostIDs(topicID),
		r.keyStatus(topicID),
		r.keyStartedAt(topicID),
		r.keyLock(topicID),
		r.keyRetryCount(topicID),
		r.keyLastError(topicID),
	}
	return r.client.rdb.Del(ctx, keys...).Err()
}

// IsReady 檢查是否已完成冷啟動
func (r *ColdStartRepo) IsReady(ctx context.Context, topicID int) (bool, error) {
	status, err := r.client.rdb.Get(ctx, r.keyStatus(topicID)).Result()
	if err == redis.Nil {
		return false, nil // No status means not started
	}
	if err != nil {
		return false, err
	}
	return status == string(entity.ColdStartStatusReady), nil
}
