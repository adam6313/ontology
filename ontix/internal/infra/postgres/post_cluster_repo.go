package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/repository"
)

// PostClusterRepo PostgreSQL 實作的 PostClusterRepository
type PostClusterRepo struct {
	db *DB
}

// NewPostClusterRepo 建立 PostClusterRepository
func NewPostClusterRepo(db *DB) repository.PostClusterRepository {
	return &PostClusterRepo{db: db}
}

// SavePostCluster 儲存貼文與聚類的關聯
func (r *PostClusterRepo) SavePostCluster(ctx context.Context, pc *repository.PostClusterAssignment) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO post_clusters (post_id, cluster_id, similarity, confidence, assigned_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (post_id, cluster_id) DO UPDATE SET
			similarity = EXCLUDED.similarity,
			confidence = EXCLUDED.confidence,
			assigned_at = EXCLUDED.assigned_at`,
		pc.PostID, pc.ClusterID, pc.Similarity, pc.Confidence, time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to save post cluster: %w", err)
	}
	return nil
}

// GetClustersByPostID 取得貼文所屬的聚類
func (r *PostClusterRepo) GetClustersByPostID(ctx context.Context, postID string) ([]*repository.PostClusterAssignment, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT post_id, cluster_id, similarity, confidence
		FROM post_clusters
		WHERE post_id = $1
		ORDER BY similarity DESC`,
		postID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query post clusters: %w", err)
	}
	defer rows.Close()

	var assignments []*repository.PostClusterAssignment
	for rows.Next() {
		var pc repository.PostClusterAssignment
		if err := rows.Scan(&pc.PostID, &pc.ClusterID, &pc.Similarity, &pc.Confidence); err != nil {
			return nil, fmt.Errorf("failed to scan post cluster: %w", err)
		}
		assignments = append(assignments, &pc)
	}
	return assignments, nil
}

// GetPostsByClusterID 取得聚類中的貼文
func (r *PostClusterRepo) GetPostsByClusterID(ctx context.Context, clusterID int64, limit int) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT post_id FROM post_clusters
		WHERE cluster_id = $1
		ORDER BY similarity DESC, assigned_at DESC
		LIMIT $2`,
		clusterID, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query cluster posts: %w", err)
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

// GetClusterStats 取得聚類統計
func (r *PostClusterRepo) GetClusterStats(ctx context.Context, clusterID int64) (*repository.ClusterPostStats, error) {
	var stats repository.ClusterPostStats
	var keywords []string

	err := r.db.Pool.QueryRow(ctx, `
		SELECT
			pc.cluster_id,
			c.name as cluster_name,
			c.keywords,
			c.topic_id,
			COALESCE(t.name, '') as topic_name,
			COUNT(*) as total_posts,
			COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '24 hours') as posts_24h,
			COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '7 days') as posts_7d,
			AVG(pc.similarity) as avg_similarity
		FROM post_clusters pc
		JOIN clusters c ON pc.cluster_id = c.id
		LEFT JOIN topics t ON c.topic_id = t.id
		WHERE pc.cluster_id = $1
		GROUP BY pc.cluster_id, c.name, c.keywords, c.topic_id, t.name`,
		clusterID,
	).Scan(
		&stats.ClusterID,
		&stats.ClusterName,
		&keywords,
		&stats.TopicID,
		&stats.TopicName,
		&stats.TotalPosts,
		&stats.Posts24h,
		&stats.Posts7d,
		&stats.AvgSimilarity,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query cluster stats: %w", err)
	}

	stats.Keywords = keywords
	return &stats, nil
}

// GetTrendingClusters 取得趨勢聚類（24h 增長最快）
func (r *PostClusterRepo) GetTrendingClusters(ctx context.Context, limit int) ([]repository.ClusterPostStats, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			pc.cluster_id,
			c.name as cluster_name,
			c.keywords,
			c.topic_id,
			COALESCE(t.name, '') as topic_name,
			COUNT(*) as total_posts,
			COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '24 hours') as posts_24h,
			COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '7 days') as posts_7d,
			AVG(pc.similarity) as avg_similarity
		FROM post_clusters pc
		JOIN clusters c ON pc.cluster_id = c.id
		LEFT JOIN topics t ON c.topic_id = t.id
		GROUP BY pc.cluster_id, c.name, c.keywords, c.topic_id, t.name
		ORDER BY posts_24h DESC
		LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query trending clusters: %w", err)
	}
	defer rows.Close()

	var results []repository.ClusterPostStats
	for rows.Next() {
		var stats repository.ClusterPostStats
		var keywords []string

		if err := rows.Scan(
			&stats.ClusterID,
			&stats.ClusterName,
			&keywords,
			&stats.TopicID,
			&stats.TopicName,
			&stats.TotalPosts,
			&stats.Posts24h,
			&stats.Posts7d,
			&stats.AvgSimilarity,
		); err != nil {
			return nil, fmt.Errorf("failed to scan cluster stats: %w", err)
		}
		stats.Keywords = keywords
		results = append(results, stats)
	}
	return results, nil
}
