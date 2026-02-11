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

// ClusterRepo PostgreSQL 實作的 ClusterRepository
type ClusterRepo struct {
	db *DB
}

// NewClusterRepo 建立 ClusterRepository
func NewClusterRepo(db *DB) repository.ClusterRepository {
	return &ClusterRepo{db: db}
}

// Save 儲存聚類
func (r *ClusterRepo) Save(ctx context.Context, cluster *entity.Cluster) error {
	query := `
		INSERT INTO clusters (id, name, centroid, size, keywords, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			centroid = EXCLUDED.centroid,
			size = EXCLUDED.size,
			keywords = EXCLUDED.keywords,
			status = EXCLUDED.status,
			updated_at = EXCLUDED.updated_at`

	now := time.Now()
	if cluster.CreatedAt.IsZero() {
		cluster.CreatedAt = now
	}
	cluster.UpdatedAt = now

	_, err := r.db.Pool.Exec(ctx, query,
		cluster.ID,
		cluster.Name,
		pgvector.NewVector(cluster.Centroid),
		cluster.Size,
		cluster.Keywords,
		cluster.Status,
		cluster.CreatedAt,
		cluster.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save cluster: %w", err)
	}
	return nil
}

// FindByID 根據 ID 查詢聚類
func (r *ClusterRepo) FindByID(ctx context.Context, id string) (*entity.Cluster, error) {
	query := `
		SELECT id, name, centroid, size, keywords, status, created_at, updated_at
		FROM clusters WHERE id = $1`

	row := r.db.Pool.QueryRow(ctx, query, id)
	return r.scanCluster(row)
}

// FindAll 查詢所有聚類
func (r *ClusterRepo) FindAll(ctx context.Context) ([]*entity.Cluster, error) {
	query := `
		SELECT id, name, centroid, size, keywords, status, created_at, updated_at
		FROM clusters ORDER BY size DESC`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query clusters: %w", err)
	}
	defer rows.Close()

	var clusters []*entity.Cluster
	for rows.Next() {
		cluster, err := r.scanClusterRows(rows)
		if err != nil {
			return nil, err
		}
		clusters = append(clusters, cluster)
	}
	return clusters, nil
}

// FindByStatus 根據狀態查詢聚類
func (r *ClusterRepo) FindByStatus(ctx context.Context, status entity.ClusterStatus) ([]*entity.Cluster, error) {
	query := `
		SELECT id, name, centroid, size, keywords, status, created_at, updated_at
		FROM clusters WHERE status = $1 ORDER BY size DESC`

	rows, err := r.db.Pool.Query(ctx, query, status)
	if err != nil {
		return nil, fmt.Errorf("failed to query clusters by status: %w", err)
	}
	defer rows.Close()

	var clusters []*entity.Cluster
	for rows.Next() {
		cluster, err := r.scanClusterRows(rows)
		if err != nil {
			return nil, err
		}
		clusters = append(clusters, cluster)
	}
	return clusters, nil
}

// UpdateStatus 更新聚類狀態
func (r *ClusterRepo) UpdateStatus(ctx context.Context, id string, status entity.ClusterStatus) error {
	query := `UPDATE clusters SET status = $1, updated_at = $2 WHERE id = $3`

	_, err := r.db.Pool.Exec(ctx, query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update cluster status: %w", err)
	}
	return nil
}

func (r *ClusterRepo) scanCluster(row pgx.Row) (*entity.Cluster, error) {
	var cluster entity.Cluster
	var centroid pgvector.Vector
	err := row.Scan(
		&cluster.ID,
		&cluster.Name,
		&centroid,
		&cluster.Size,
		&cluster.Keywords,
		&cluster.Status,
		&cluster.CreatedAt,
		&cluster.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan cluster: %w", err)
	}
	cluster.Centroid = centroid.Slice()
	return &cluster, nil
}

func (r *ClusterRepo) scanClusterRows(rows pgx.Rows) (*entity.Cluster, error) {
	var cluster entity.Cluster
	var centroid pgvector.Vector
	err := rows.Scan(
		&cluster.ID,
		&cluster.Name,
		&centroid,
		&cluster.Size,
		&cluster.Keywords,
		&cluster.Status,
		&cluster.CreatedAt,
		&cluster.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan cluster: %w", err)
	}
	cluster.Centroid = centroid.Slice()
	return &cluster, nil
}
