package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// DerivedFactRepository 推理產出的讀寫
type DerivedFactRepository interface {
	// SaveFact 儲存推理事實（UPSERT on object_id + fact_key）
	SaveFact(ctx context.Context, fact *entity.DerivedFact) error

	// FindFactByKey 根據去重 key 查詢
	FindFactByKey(ctx context.Context, objectID string, factKey string) (*entity.DerivedFact, error)

	// --- 讀取（API 用） ---

	// ListUnreadFacts 查詢未讀事實（Inbox 用）
	// severity 為空字串表示不過濾
	ListUnreadFacts(ctx context.Context, severity string, limit, offset int) ([]*entity.DerivedFact, error)

	// ListFactsByObject 查詢某 entity 的所有事實
	ListFactsByObject(ctx context.Context, objectID string, limit, offset int) ([]*entity.DerivedFact, error)

	// CountUnreadFacts 未讀計數（badge 用）
	CountUnreadFacts(ctx context.Context) (int, error)

	// --- 狀態更新 ---

	// MarkAsRead 標記已讀
	MarkAsRead(ctx context.Context, factID int64) error

	// MarkAsDismissed 標記忽略
	MarkAsDismissed(ctx context.Context, factID int64) error

	// --- 清理 ---

	// DeleteExpiredFacts 刪除過期事實
	DeleteExpiredFacts(ctx context.Context) (int, error)
}
