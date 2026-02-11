package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// PostAnalysisRepo PostgreSQL 實作的 PostAnalysisRepository
type PostAnalysisRepo struct {
	db *DB
}

// NewPostAnalysisRepo 建立 PostAnalysisRepository
func NewPostAnalysisRepo(db *DB) repository.PostAnalysisRepository {
	return &PostAnalysisRepo{db: db}
}

// SaveAnalysis 儲存完整分析結果
func (r *PostAnalysisRepo) SaveAnalysis(ctx context.Context, postID string, analysis *repository.PostAnalysis) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. 更新 posts 表的 sentiment 欄位
	_, err = tx.Exec(ctx, `
		UPDATE posts SET
			sentiment = $1,
			sentiment_score = $2,
			sentiment_reason = $3,
			intent = $4,
			product_type = $5
		WHERE post_id = $6`,
		analysis.Sentiment.Label,
		analysis.Sentiment.Score,
		analysis.Sentiment.Reason,
		analysis.Intent,
		analysis.ProductType,
		postID,
	)
	if err != nil {
		return fmt.Errorf("failed to update post sentiment: %w", err)
	}

	// 2. 儲存 soft_tags
	for _, tag := range analysis.SoftTags {
		_, err = tx.Exec(ctx, `
			INSERT INTO post_soft_tags (post_id, tag, confidence, created_at)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (post_id, tag) DO UPDATE SET
				confidence = EXCLUDED.confidence`,
			postID, tag.Tag, tag.Confidence, time.Now(),
		)
		if err != nil {
			return fmt.Errorf("failed to save soft tag: %w", err)
		}
	}

	// 3. 儲存 aspects
	for _, aspect := range analysis.Aspects {
		_, err = tx.Exec(ctx, `
			INSERT INTO post_aspects (post_id, aspect, sentiment, mention, created_at)
			VALUES ($1, $2, $3, $4, $5)`,
			postID, aspect.Aspect, aspect.Sentiment, aspect.Mention, time.Now(),
		)
		if err != nil {
			return fmt.Errorf("failed to save aspect: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// SaveSoftTags 批次儲存軟標籤
func (r *PostAnalysisRepo) SaveSoftTags(ctx context.Context, postID string, tags []repository.SoftTag) error {
	batch := &pgx.Batch{}
	for _, tag := range tags {
		batch.Queue(`
			INSERT INTO post_soft_tags (post_id, tag, confidence, created_at)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (post_id, tag) DO UPDATE SET
				confidence = EXCLUDED.confidence`,
			postID, tag.Tag, tag.Confidence, time.Now(),
		)
	}

	br := r.db.Pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(tags); i++ {
		if _, err := br.Exec(); err != nil {
			return fmt.Errorf("failed to save soft tag %d: %w", i, err)
		}
	}
	return nil
}

// SaveAspects 批次儲存面向情感
func (r *PostAnalysisRepo) SaveAspects(ctx context.Context, postID string, aspects []repository.AspectResult) error {
	batch := &pgx.Batch{}
	for _, aspect := range aspects {
		batch.Queue(`
			INSERT INTO post_aspects (post_id, aspect, sentiment, mention, created_at)
			VALUES ($1, $2, $3, $4, $5)`,
			postID, aspect.Aspect, aspect.Sentiment, aspect.Mention, time.Now(),
		)
	}

	br := r.db.Pool.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < len(aspects); i++ {
		if _, err := br.Exec(); err != nil {
			return fmt.Errorf("failed to save aspect %d: %w", i, err)
		}
	}
	return nil
}

// GetSoftTagsByPostID 取得貼文的軟標籤
func (r *PostAnalysisRepo) GetSoftTagsByPostID(ctx context.Context, postID string) ([]repository.SoftTag, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT tag, confidence FROM post_soft_tags
		WHERE post_id = $1
		ORDER BY confidence DESC`,
		postID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query soft tags: %w", err)
	}
	defer rows.Close()

	var tags []repository.SoftTag
	for rows.Next() {
		var tag repository.SoftTag
		if err := rows.Scan(&tag.Tag, &tag.Confidence); err != nil {
			return nil, fmt.Errorf("failed to scan soft tag: %w", err)
		}
		tags = append(tags, tag)
	}
	return tags, nil
}

// GetAspectsByPostID 取得貼文的面向情感
func (r *PostAnalysisRepo) GetAspectsByPostID(ctx context.Context, postID string) ([]repository.AspectResult, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT aspect, sentiment, mention FROM post_aspects
		WHERE post_id = $1`,
		postID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query aspects: %w", err)
	}
	defer rows.Close()

	var aspects []repository.AspectResult
	for rows.Next() {
		var aspect repository.AspectResult
		if err := rows.Scan(&aspect.Aspect, &aspect.Sentiment, &aspect.Mention); err != nil {
			return nil, fmt.Errorf("failed to scan aspect: %w", err)
		}
		aspects = append(aspects, aspect)
	}
	return aspects, nil
}

// GetTopSoftTags 取得熱門軟標籤
func (r *PostAnalysisRepo) GetTopSoftTags(ctx context.Context, limit int) ([]repository.SoftTagStats, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT tag, COUNT(*) as post_count, AVG(confidence) as avg_confidence
		FROM post_soft_tags
		GROUP BY tag
		ORDER BY post_count DESC
		LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query top soft tags: %w", err)
	}
	defer rows.Close()

	var stats []repository.SoftTagStats
	for rows.Next() {
		var s repository.SoftTagStats
		if err := rows.Scan(&s.Tag, &s.PostCount, &s.AvgConfidence); err != nil {
			return nil, fmt.Errorf("failed to scan soft tag stats: %w", err)
		}
		stats = append(stats, s)
	}
	return stats, nil
}

// GetAspectSentimentStats 取得面向情感統計
func (r *PostAnalysisRepo) GetAspectSentimentStats(ctx context.Context, limit int) ([]repository.AspectSentimentStats, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			aspect,
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
			COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
			COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
			ROUND(COUNT(*) FILTER (WHERE sentiment = 'positive')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as positive_ratio
		FROM post_aspects
		GROUP BY aspect
		ORDER BY total DESC
		LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query aspect sentiment stats: %w", err)
	}
	defer rows.Close()

	var stats []repository.AspectSentimentStats
	for rows.Next() {
		var s repository.AspectSentimentStats
		if err := rows.Scan(&s.Aspect, &s.Total, &s.PositiveCount, &s.NegativeCount, &s.NeutralCount, &s.PositiveRatio); err != nil {
			return nil, fmt.Errorf("failed to scan aspect sentiment stats: %w", err)
		}
		stats = append(stats, s)
	}
	return stats, nil
}
