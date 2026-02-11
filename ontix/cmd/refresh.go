package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var refreshCmd = func() *cobra.Command {
	return &cobra.Command{
		Use:   "refresh-views",
		Short: "手動刷新 Materialized Views (entity_stats, entity_aspect_stats)",
		Run: func(cmd *cobra.Command, args []string) {
			app := fx.New(
				fx.NopLogger,
				fx.Supply(config.ConfigPath),
				fx.Provide(
					config.New,
					postgres.New,
				),
				fx.Invoke(func(db *postgres.DB) {
					ctx := context.Background()

					fmt.Println("=== Refresh Materialized Views ===")
					start := time.Now()

					if err := db.RefreshMaterializedViews(ctx); err != nil {
						log.Fatalf("Refresh failed: %v", err)
					}

					fmt.Printf("Done in %s\n", time.Since(start).Round(time.Millisecond))

					// 顯示 view 統計
					var entityCount, aspectCount int
					db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM entity_stats").Scan(&entityCount)
					db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM entity_aspect_stats").Scan(&aspectCount)
					fmt.Printf("entity_stats: %d rows\n", entityCount)
					fmt.Printf("entity_aspect_stats: %d rows\n", aspectCount)
				}),
			)

			if err := app.Err(); err != nil {
				log.Fatal(err)
			}
		},
	}
}
