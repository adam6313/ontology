package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// ObservationRepo PostgreSQL 實作的 ObservationRepository
type ObservationRepo struct {
	db *DB
}

// NewObservationRepo 建立 ObservationRepository
func NewObservationRepo(db *DB) repository.ObservationRepository {
	return &ObservationRepo{db: db}
}

// SaveObservation 儲存或更新觀測（UPSERT on object_id + period_start + period_type）
func (r *ObservationRepo) SaveObservation(ctx context.Context, obs *entity.EntityObservation) error {
	aspectJSON, err := json.Marshal(obs.AspectData)
	if err != nil {
		return fmt.Errorf("failed to marshal aspect_data: %w", err)
	}

	query := `
		INSERT INTO entity_observations
			(object_id, period_start, period_type, mention_count,
			 positive_count, negative_count, neutral_count, mixed_count,
			 avg_sentiment, aspect_data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (object_id, period_start, period_type)
		DO UPDATE SET
			mention_count  = EXCLUDED.mention_count,
			positive_count = EXCLUDED.positive_count,
			negative_count = EXCLUDED.negative_count,
			neutral_count  = EXCLUDED.neutral_count,
			mixed_count    = EXCLUDED.mixed_count,
			avg_sentiment  = EXCLUDED.avg_sentiment,
			aspect_data    = EXCLUDED.aspect_data
		RETURNING id`

	err = r.db.Pool.QueryRow(ctx, query,
		obs.ObjectID, obs.PeriodStart, obs.PeriodType,
		obs.MentionCount, obs.PositiveCount, obs.NegativeCount,
		obs.NeutralCount, obs.MixedCount, obs.AvgSentiment,
		aspectJSON,
	).Scan(&obs.ID)
	if err != nil {
		return fmt.Errorf("failed to save observation: %w", err)
	}
	return nil
}

// FindObservation 查詢特定 entity 的特定期觀測
func (r *ObservationRepo) FindObservation(ctx context.Context, objectID string, periodStart time.Time, periodType string) (*entity.EntityObservation, error) {
	query := `
		SELECT id, object_id, period_start, period_type,
		       mention_count, positive_count, negative_count, neutral_count, mixed_count,
		       avg_sentiment, aspect_data, created_at
		FROM entity_observations
		WHERE object_id = $1 AND period_start = $2 AND period_type = $3`

	row := r.db.Pool.QueryRow(ctx, query, objectID, periodStart, periodType)
	return r.scanObservation(row)
}

// FindPreviousObservation 查詢前一期觀測（用於 delta 計算）
func (r *ObservationRepo) FindPreviousObservation(ctx context.Context, objectID string, periodStart time.Time, periodType string) (*entity.EntityObservation, error) {
	query := `
		SELECT id, object_id, period_start, period_type,
		       mention_count, positive_count, negative_count, neutral_count, mixed_count,
		       avg_sentiment, aspect_data, created_at
		FROM entity_observations
		WHERE object_id = $1 AND period_type = $2 AND period_start < $3
		ORDER BY period_start DESC
		LIMIT 1`

	row := r.db.Pool.QueryRow(ctx, query, objectID, periodType, periodStart)
	return r.scanObservation(row)
}

// ListRecentObservations 查詢某 entity 最近 N 期觀測（用於趨勢顯示）
func (r *ObservationRepo) ListRecentObservations(ctx context.Context, objectID string, periodType string, limit int) ([]*entity.EntityObservation, error) {
	query := `
		SELECT id, object_id, period_start, period_type,
		       mention_count, positive_count, negative_count, neutral_count, mixed_count,
		       avg_sentiment, aspect_data, created_at
		FROM entity_observations
		WHERE object_id = $1 AND period_type = $2
		ORDER BY period_start DESC
		LIMIT $3`

	rows, err := r.db.Pool.Query(ctx, query, objectID, periodType, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to list recent observations: %w", err)
	}
	defer rows.Close()

	var obs []*entity.EntityObservation
	for rows.Next() {
		o, err := r.scanObservation(rows)
		if err != nil {
			return nil, err
		}
		obs = append(obs, o)
	}
	return obs, nil
}

// ListObservationsForPeriod 查詢某期所有有觀測的 entity（推理引擎批次用）
func (r *ObservationRepo) ListObservationsForPeriod(ctx context.Context, periodStart time.Time, periodType string) ([]*entity.EntityObservation, error) {
	query := `
		SELECT id, object_id, period_start, period_type,
		       mention_count, positive_count, negative_count, neutral_count, mixed_count,
		       avg_sentiment, aspect_data, created_at
		FROM entity_observations
		WHERE period_start = $1 AND period_type = $2
		ORDER BY mention_count DESC`

	rows, err := r.db.Pool.Query(ctx, query, periodStart, periodType)
	if err != nil {
		return nil, fmt.Errorf("failed to list observations for period: %w", err)
	}
	defer rows.Close()

	var obs []*entity.EntityObservation
	for rows.Next() {
		o, err := r.scanObservation(rows)
		if err != nil {
			return nil, err
		}
		obs = append(obs, o)
	}
	return obs, nil
}

// MaterializeObservations 從 post_entity_mentions + entity_aspects 聚合產生觀測
// 回傳新建/更新的觀測數量
func (r *ObservationRepo) MaterializeObservations(ctx context.Context, periodStart time.Time, periodType string) (int, error) {
	// 計算 period_end
	var interval string
	switch periodType {
	case "week":
		interval = "7 days"
	case "day":
		interval = "1 day"
	default:
		return 0, fmt.Errorf("unsupported period_type: %s", periodType)
	}

	// Step 1: UPSERT mention aggregates
	mentionQuery := fmt.Sprintf(`
		INSERT INTO entity_observations
			(object_id, period_start, period_type,
			 mention_count, positive_count, negative_count, neutral_count, mixed_count,
			 avg_sentiment, aspect_data)
		SELECT
			m.object_id,
			$1::date AS period_start,
			$2 AS period_type,
			COUNT(*),
			COUNT(*) FILTER (WHERE m.sentiment = 'positive'),
			COUNT(*) FILTER (WHERE m.sentiment = 'negative'),
			COUNT(*) FILTER (WHERE m.sentiment = 'neutral'),
			COUNT(*) FILTER (WHERE m.sentiment = 'mixed'),
			AVG(m.sentiment_score),
			'[]'::jsonb
		FROM post_entity_mentions m
		WHERE m.created_at >= $1::timestamptz
		  AND m.created_at < ($1::timestamptz + interval '%s')
		GROUP BY m.object_id
		ON CONFLICT (object_id, period_start, period_type)
		DO UPDATE SET
			mention_count  = EXCLUDED.mention_count,
			positive_count = EXCLUDED.positive_count,
			negative_count = EXCLUDED.negative_count,
			neutral_count  = EXCLUDED.neutral_count,
			mixed_count    = EXCLUDED.mixed_count,
			avg_sentiment  = EXCLUDED.avg_sentiment`, interval)

	tag, err := r.db.Pool.Exec(ctx, mentionQuery, periodStart, periodType)
	if err != nil {
		return 0, fmt.Errorf("failed to materialize mention observations: %w", err)
	}
	count := int(tag.RowsAffected())

	// Step 2: Update aspect_data from entity_aspects
	aspectQuery := fmt.Sprintf(`
		UPDATE entity_observations eo
		SET aspect_data = COALESCE(asp_agg.data, '[]'::jsonb)
		FROM (
			SELECT
				per_aspect.object_id,
				jsonb_agg(
					jsonb_build_object(
						'aspect', per_aspect.aspect,
						'count', per_aspect.cnt,
						'avg_sentiment', per_aspect.avg_s
					) ORDER BY per_aspect.cnt DESC
				) AS data
			FROM (
				SELECT
					object_id,
					aspect,
					COUNT(*) AS cnt,
					ROUND(AVG(sentiment_score)::NUMERIC, 3) AS avg_s
				FROM entity_aspects
				WHERE created_at >= $1::timestamptz
				  AND created_at < ($1::timestamptz + interval '%s')
				GROUP BY object_id, aspect
			) per_aspect
			GROUP BY per_aspect.object_id
		) asp_agg
		WHERE eo.object_id = asp_agg.object_id
		  AND eo.period_start = $1::date
		  AND eo.period_type = $2`, interval)

	_, err = r.db.Pool.Exec(ctx, aspectQuery, periodStart, periodType)
	if err != nil {
		return count, fmt.Errorf("failed to update aspect_data: %w", err)
	}

	return count, nil
}

// --- scan helpers ---

func (r *ObservationRepo) scanObservation(row pgx.Row) (*entity.EntityObservation, error) {
	var obs entity.EntityObservation
	var aspectJSON []byte
	var avgSentiment *float64

	err := row.Scan(
		&obs.ID, &obs.ObjectID, &obs.PeriodStart, &obs.PeriodType,
		&obs.MentionCount, &obs.PositiveCount, &obs.NegativeCount,
		&obs.NeutralCount, &obs.MixedCount,
		&avgSentiment, &aspectJSON, &obs.CreatedAt,
	)
	if avgSentiment != nil {
		obs.AvgSentiment = *avgSentiment
	}
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan observation: %w", err)
	}

	if aspectJSON != nil {
		if err := json.Unmarshal(aspectJSON, &obs.AspectData); err != nil {
			return nil, fmt.Errorf("failed to unmarshal aspect_data: %w", err)
		}
	}
	return &obs, nil
}
