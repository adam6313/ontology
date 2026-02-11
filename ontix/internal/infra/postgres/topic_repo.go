package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/pgvector/pgvector-go"
)

// TopicRepo PostgreSQL 實作的 TopicRepository
type TopicRepo struct {
	db *DB
}

// NewTopicRepo 建立 TopicRepository
func NewTopicRepo(db *DB) repository.TopicRepository {
	return &TopicRepo{db: db}
}

// FindAll 查詢所有主題
func (r *TopicRepo) FindAll(ctx context.Context) ([]*entity.Topic, error) {
	query := `
		SELECT id, code, name, description, embedding, post_count, is_active, created_at, updated_at
		FROM topics
		WHERE is_active = true
		ORDER BY post_count DESC`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query topics: %w", err)
	}
	defer rows.Close()

	var topics []*entity.Topic
	for rows.Next() {
		var t entity.Topic
		var embedding *pgvector.Vector
		err := rows.Scan(
			&t.ID, &t.Code, &t.Name, &t.Description,
			&embedding, &t.PostCount, &t.IsActive,
			&t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan topic: %w", err)
		}
		if embedding != nil {
			t.Embedding = embedding.Slice()
		}
		topics = append(topics, &t)
	}
	return topics, nil
}

// FindByCode 根據代碼查詢主題
func (r *TopicRepo) FindByCode(ctx context.Context, code string) (*entity.Topic, error) {
	query := `
		SELECT id, code, name, description, embedding, post_count, is_active, created_at, updated_at
		FROM topics
		WHERE code = $1`

	var t entity.Topic
	var embedding *pgvector.Vector
	err := r.db.Pool.QueryRow(ctx, query, code).Scan(
		&t.ID, &t.Code, &t.Name, &t.Description,
		&embedding, &t.PostCount, &t.IsActive,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find topic by code: %w", err)
	}
	if embedding != nil {
		t.Embedding = embedding.Slice()
	}
	return &t, nil
}

// FindByID 根據 ID 查詢主題
func (r *TopicRepo) FindByID(ctx context.Context, id int) (*entity.Topic, error) {
	query := `
		SELECT id, code, name, description, embedding, post_count, is_active, created_at, updated_at
		FROM topics
		WHERE id = $1`

	var t entity.Topic
	var embedding *pgvector.Vector
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.Code, &t.Name, &t.Description,
		&embedding, &t.PostCount, &t.IsActive,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find topic by id: %w", err)
	}
	if embedding != nil {
		t.Embedding = embedding.Slice()
	}
	return &t, nil
}

// UpdateEmbedding 更新主題的 embedding
func (r *TopicRepo) UpdateEmbedding(ctx context.Context, id int, embedding entity.Vector) error {
	query := `UPDATE topics SET embedding = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Pool.Exec(ctx, query, pgvector.NewVector(embedding), time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update topic embedding: %w", err)
	}
	return nil
}

// SavePostTopic 儲存貼文-主題關聯
func (r *TopicRepo) SavePostTopic(ctx context.Context, pt *entity.PostTopic) error {
	query := `
		INSERT INTO post_topics (post_id, topic_id, similarity, confidence, is_ambiguous, keyword_boost, assigned_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT DO NOTHING`

	assignedAt := pt.AssignedAt
	if assignedAt.IsZero() {
		assignedAt = time.Now()
	}

	confidence := pt.Confidence
	if confidence == "" {
		confidence = entity.ConfidenceMedium
	}

	_, err := r.db.Pool.Exec(ctx, query,
		pt.PostID, pt.TopicID, pt.Similarity, confidence, pt.IsAmbiguous, pt.KeywordBoost, assignedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save post topic: %w", err)
	}
	return nil
}

// FindPostTopics 查詢貼文的所有主題
func (r *TopicRepo) FindPostTopics(ctx context.Context, postID int64) ([]*entity.PostTopic, error) {
	query := `
		SELECT id, post_id, topic_id, similarity, confidence, assigned_at
		FROM post_topics
		WHERE post_id = $1
		ORDER BY similarity DESC`

	rows, err := r.db.Pool.Query(ctx, query, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to query post topics: %w", err)
	}
	defer rows.Close()

	var pts []*entity.PostTopic
	for rows.Next() {
		var pt entity.PostTopic
		err := rows.Scan(&pt.ID, &pt.PostID, &pt.TopicID, &pt.Similarity, &pt.Confidence, &pt.AssignedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post topic: %w", err)
		}
		pts = append(pts, &pt)
	}
	return pts, nil
}

// FindTopicPosts 查詢主題下的所有貼文 ID
func (r *TopicRepo) FindTopicPosts(ctx context.Context, topicID int, limit int, offset int) ([]int64, error) {
	query := `
		SELECT post_id
		FROM post_topics
		WHERE topic_id = $1
		ORDER BY assigned_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Pool.Query(ctx, query, topicID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query topic posts: %w", err)
	}
	defer rows.Close()

	var postIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan post id: %w", err)
		}
		postIDs = append(postIDs, id)
	}
	return postIDs, nil
}

// GetTopicStats 取得各主題的統計
func (r *TopicRepo) GetTopicStats(ctx context.Context) (map[string]int, error) {
	query := `SELECT code, post_count FROM topics WHERE is_active = true`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query topic stats: %w", err)
	}
	defer rows.Close()

	stats := make(map[string]int)
	for rows.Next() {
		var code string
		var count int
		if err := rows.Scan(&code, &count); err != nil {
			return nil, fmt.Errorf("failed to scan topic stat: %w", err)
		}
		stats[code] = count
	}
	return stats, nil
}
