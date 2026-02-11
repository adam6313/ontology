package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// TagRepo PostgreSQL 實作的 TagRepository
type TagRepo struct {
	db *DB
}

// NewTagRepo 建立 TagRepository
func NewTagRepo(db *DB) repository.TagRepository {
	return &TagRepo{db: db}
}

// SavePostTag 儲存貼文與標籤的關聯
func (r *TagRepo) SavePostTag(ctx context.Context, postTag *entity.PostTag) error {
	createdAt := postTag.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now()
	}

	// 分區表無法使用 (post_id, tag_id) 唯一約束，先檢查再插入
	var exists bool
	err := r.db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM post_tags WHERE post_id = $1 AND tag_id = $2)`,
		postTag.PostID, postTag.TagID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check existing tag: %w", err)
	}

	if exists {
		// 更新
		_, err = r.db.Pool.Exec(ctx, `
			UPDATE post_tags SET confidence = $1, source = $2, category = $3
			WHERE post_id = $4 AND tag_id = $5`,
			postTag.Confidence, postTag.Source, postTag.Category, postTag.PostID, postTag.TagID)
	} else {
		// 插入
		_, err = r.db.Pool.Exec(ctx, `
			INSERT INTO post_tags (post_id, tag_id, tag_type, category, confidence, source, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			postTag.PostID, postTag.TagID, postTag.TagType, postTag.Category,
			postTag.Confidence, postTag.Source, createdAt)
	}

	if err != nil {
		return fmt.Errorf("failed to save post tag: %w", err)
	}
	return nil
}

// FindTagsByPostID 根據貼文 ID 查詢標籤
func (r *TagRepo) FindTagsByPostID(ctx context.Context, postID string) ([]*entity.PostTag, error) {
	query := `
		SELECT post_id, tag_id, tag_type, category, confidence, source, created_at
		FROM post_tags WHERE post_id = $1
		ORDER BY confidence DESC`

	rows, err := r.db.Pool.Query(ctx, query, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to query post tags: %w", err)
	}
	defer rows.Close()

	var tags []*entity.PostTag
	for rows.Next() {
		tag, err := r.scanPostTag(rows)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}
	return tags, nil
}

// FindPostsByTagID 根據標籤 ID 查詢貼文 ID 列表
func (r *TagRepo) FindPostsByTagID(ctx context.Context, tagID string, limit int) ([]string, error) {
	query := `
		SELECT post_id FROM post_tags
		WHERE tag_id = $1
		ORDER BY confidence DESC
		LIMIT $2`

	rows, err := r.db.Pool.Query(ctx, query, tagID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts by tag: %w", err)
	}
	defer rows.Close()

	var postIDs []string
	for rows.Next() {
		var postID string
		if err := rows.Scan(&postID); err != nil {
			return nil, fmt.Errorf("failed to scan post id: %w", err)
		}
		postIDs = append(postIDs, postID)
	}
	return postIDs, nil
}

func (r *TagRepo) scanPostTag(rows pgx.Rows) (*entity.PostTag, error) {
	var tag entity.PostTag
	err := rows.Scan(
		&tag.PostID,
		&tag.TagID,
		&tag.TagType,
		&tag.Category,
		&tag.Confidence,
		&tag.Source,
		&tag.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan post tag: %w", err)
	}
	return &tag, nil
}
