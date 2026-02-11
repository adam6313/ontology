package postgres

import (
	"context"
	"fmt"

	"github.com/ikala/ontix/config"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	pgxvec "github.com/pgvector/pgvector-go/pgx"
)

// DB PostgreSQL 連線池
type DB struct {
	Pool *pgxpool.Pool
}

// New 建立 PostgreSQL 連線池
func New(cfg *config.Config) (*DB, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.PostgresDSN())
	if err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// 註冊 pgvector 類型
	poolCfg.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		return pgxvec.RegisterTypes(ctx, conn)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping: %w", err)
	}

	return &DB{Pool: pool}, nil
}

// Close 關閉連線池
func (db *DB) Close() {
	db.Pool.Close()
}

// RefreshMaterializedViews 刷新 Ontology 相關的 materialized views
func (db *DB) RefreshMaterializedViews(ctx context.Context) error {
	views := []string{"entity_stats", "entity_aspect_stats"}
	for _, v := range views {
		if _, err := db.Pool.Exec(ctx, "REFRESH MATERIALIZED VIEW CONCURRENTLY "+v); err != nil {
			return fmt.Errorf("refresh %s: %w", v, err)
		}
	}
	return nil
}
