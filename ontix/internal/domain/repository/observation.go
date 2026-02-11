package repository

import (
	"context"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
)

// ObservationRepository 時間分桶觀測的讀寫
type ObservationRepository interface {
	// SaveObservation 儲存或更新觀測（UPSERT on object_id + period_start + period_type）
	SaveObservation(ctx context.Context, obs *entity.EntityObservation) error

	// FindObservation 查詢特定 entity 的特定期觀測
	FindObservation(ctx context.Context, objectID string, periodStart time.Time, periodType string) (*entity.EntityObservation, error)

	// FindPreviousObservation 查詢前一期觀測（用於 delta 計算）
	FindPreviousObservation(ctx context.Context, objectID string, periodStart time.Time, periodType string) (*entity.EntityObservation, error)

	// ListRecentObservations 查詢某 entity 最近 N 期觀測（用於趨勢顯示）
	ListRecentObservations(ctx context.Context, objectID string, periodType string, limit int) ([]*entity.EntityObservation, error)

	// ListObservationsForPeriod 查詢某期所有有觀測的 entity（推理引擎批次用）
	ListObservationsForPeriod(ctx context.Context, periodStart time.Time, periodType string) ([]*entity.EntityObservation, error)

	// MaterializeObservations 從 post_entity_mentions + entity_aspects 聚合產生觀測
	// 這是核心的聚合邏輯：把原始 mentions 壓縮為 period-level 統計
	MaterializeObservations(ctx context.Context, periodStart time.Time, periodType string) (int, error)
}
