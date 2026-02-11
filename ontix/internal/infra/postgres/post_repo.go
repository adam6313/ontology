package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
	"github.com/pgvector/pgvector-go"
)

// PostRepo PostgreSQL 實作的 PostRepository
type PostRepo struct {
	db *DB
}

// NewPostRepo 建立 PostRepository
func NewPostRepo(db *DB) repository.PostRepository {
	return &PostRepo{db: db}
}

// Save 儲存貼文 (分離 embedding 到獨立表)
func (r *PostRepo) Save(ctx context.Context, post *entity.Post) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. 檢查是否已存在
	var existingID int64
	err = tx.QueryRow(ctx, `SELECT id FROM posts WHERE post_id = $1`, post.PostID).Scan(&existingID)

	if err == nil {
		// 已存在，更新
		post.ID = existingID
		_, err = tx.Exec(ctx, `
			UPDATE posts SET content = $1, likes = $2, comments = $3
			WHERE id = $4`,
			post.Content, post.Metrics.Likes, post.Metrics.Comments, existingID)
		if err != nil {
			return fmt.Errorf("failed to update post: %w", err)
		}
	} else if err == pgx.ErrNoRows {
		// 不存在，插入
		query := `
			INSERT INTO posts (post_id, content, platform, author_id, author_username, author_followers,
				likes, comments, shares, views, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id`

		err = tx.QueryRow(ctx, query,
			post.PostID,
			post.Content,
			post.Platform,
			post.Author.ID,
			post.Author.Username,
			post.Author.Followers,
			post.Metrics.Likes,
			post.Metrics.Comments,
			post.Metrics.Shares,
			post.Metrics.Views,
			post.CreatedAt,
		).Scan(&post.ID)
		if err != nil {
			return fmt.Errorf("failed to insert post: %w", err)
		}
	} else {
		return fmt.Errorf("failed to check existing post: %w", err)
	}

	// 2. 插入/更新 embedding (如果有)
	if len(post.Embedding) > 0 {
		embQuery := `
			INSERT INTO post_embeddings (post_id, embedding, created_at)
			VALUES ($1, $2, $3)
			ON CONFLICT (post_id) DO UPDATE SET
				embedding = EXCLUDED.embedding`
		_, err = tx.Exec(ctx, embQuery, post.PostID, pgvector.NewVector(post.Embedding), time.Now())
		if err != nil {
			return fmt.Errorf("failed to save embedding: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// FindByID 根據內部 ID 查詢貼文
func (r *PostRepo) FindByID(ctx context.Context, id string) (*entity.Post, error) {
	query := `
		SELECT p.id, p.post_id, p.content, p.platform,
			p.author_id, p.author_username, p.author_followers,
			p.likes, p.comments, p.shares, p.views,
			pe.embedding, p.created_at
		FROM posts p
		LEFT JOIN post_embeddings pe ON p.post_id = pe.post_id
		WHERE p.post_id = $1`

	row := r.db.Pool.QueryRow(ctx, query, id)
	return r.scanPost(row)
}

// FindByIDs 根據 ID 列表查詢貼文
func (r *PostRepo) FindByIDs(ctx context.Context, ids []string) ([]*entity.Post, error) {
	query := `
		SELECT p.id, p.post_id, p.content, p.platform,
			p.author_id, p.author_username, p.author_followers,
			p.likes, p.comments, p.shares, p.views,
			pe.embedding, p.created_at
		FROM posts p
		LEFT JOIN post_embeddings pe ON p.post_id = pe.post_id
		WHERE p.post_id = ANY($1)`

	rows, err := r.db.Pool.Query(ctx, query, ids)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post
	for rows.Next() {
		post, err := r.scanPostRows(rows)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

// FindSimilar 查詢相似貼文 (使用 HNSW 索引)
func (r *PostRepo) FindSimilar(ctx context.Context, postID string, limit int) ([]*entity.Post, error) {
	query := `
		WITH target AS (
			SELECT pe.embedding
			FROM post_embeddings pe
			WHERE pe.post_id = $1
		)
		SELECT p.id, p.post_id, p.content, p.platform,
			p.author_id, p.author_username, p.author_followers,
			p.likes, p.comments, p.shares, p.views,
			pe.embedding, p.created_at
		FROM posts p
		JOIN post_embeddings pe ON p.post_id = pe.post_id, target t
		WHERE p.post_id != $1
		ORDER BY pe.embedding <=> t.embedding
		LIMIT $2`

	rows, err := r.db.Pool.Query(ctx, query, postID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query similar posts: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post
	for rows.Next() {
		post, err := r.scanPostRows(rows)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

// FindWithEmbeddings 批次取得有 embedding 的貼文 (用於聚類)
func (r *PostRepo) FindWithEmbeddings(ctx context.Context, limit int, offset int) ([]*entity.Post, error) {
	query := `
		SELECT p.id, p.post_id, p.content, p.platform,
			p.author_id, p.author_username, p.author_followers,
			p.likes, p.comments, p.shares, p.views,
			pe.embedding, p.created_at
		FROM posts p
		JOIN post_embeddings pe ON p.post_id = pe.post_id
		ORDER BY p.created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.Pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts with embeddings: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post
	for rows.Next() {
		post, err := r.scanPostRows(rows)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

// CountWithEmbeddings 統計有 embedding 的貼文數量
func (r *PostRepo) CountWithEmbeddings(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM post_embeddings`).Scan(&count)
	return count, err
}

func (r *PostRepo) scanPost(row pgx.Row) (*entity.Post, error) {
	var post entity.Post
	var authorID, authorUsername string
	var authorFollowers int
	var likes, comments, shares, views int
	var embedding *pgvector.Vector
	var createdAt time.Time

	err := row.Scan(
		&post.ID,
		&post.PostID,
		&post.Content,
		&post.Platform,
		&authorID,
		&authorUsername,
		&authorFollowers,
		&likes,
		&comments,
		&shares,
		&views,
		&embedding,
		&createdAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan post: %w", err)
	}

	post.Author = entity.Author{ID: authorID, Username: authorUsername, Followers: authorFollowers}
	post.Metrics = entity.Metrics{Likes: likes, Comments: comments, Shares: shares, Views: views}
	if embedding != nil {
		post.Embedding = embedding.Slice()
	}
	post.CreatedAt = createdAt
	return &post, nil
}

func (r *PostRepo) scanPostRows(rows pgx.Rows) (*entity.Post, error) {
	var post entity.Post
	var authorID, authorUsername string
	var authorFollowers int
	var likes, comments, shares, views int
	var embedding *pgvector.Vector
	var createdAt time.Time

	err := rows.Scan(
		&post.ID,
		&post.PostID,
		&post.Content,
		&post.Platform,
		&authorID,
		&authorUsername,
		&authorFollowers,
		&likes,
		&comments,
		&shares,
		&views,
		&embedding,
		&createdAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan post: %w", err)
	}

	post.Author = entity.Author{ID: authorID, Username: authorUsername, Followers: authorFollowers}
	post.Metrics = entity.Metrics{Likes: likes, Comments: comments, Shares: shares, Views: views}
	if embedding != nil {
		post.Embedding = embedding.Slice()
	}
	post.CreatedAt = createdAt
	return &post, nil
}
