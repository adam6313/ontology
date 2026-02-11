package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/infra/mlservice"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
	"github.com/pgvector/pgvector-go"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var subclusterCmd = func() *cobra.Command {
	var minClusterSize int
	var days int
	var topicCode string

	cmd := &cobra.Command{
		Use:   "subcluster",
		Short: "對各 Topic 內的貼文進行子群聚類",
		Run: func(cmd *cobra.Command, args []string) {
			runSubcluster(minClusterSize, days, topicCode)
		},
	}

	cmd.Flags().IntVarP(&minClusterSize, "min-size", "m", 5, "最小聚類大小")
	cmd.Flags().IntVarP(&days, "days", "d", 7, "分析最近幾天的資料")
	cmd.Flags().StringVarP(&topicCode, "topic", "t", "", "只處理特定 Topic (空=全部)")
	return cmd
}

func runSubcluster(minClusterSize int, days int, topicCode string) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			postgres.New,
			postgres.NewTopicRepo,
			mlservice.New,
			redis.New,
			redis.NewCentroidRepo,
		),
		fx.Invoke(func(
			topicRepo repository.TopicRepository,
			mlClient *mlservice.Client,
			db *postgres.DB,
			centroidRepo repository.CentroidRepository,
		) {
			ctx := context.Background()
			periodEnd := time.Now()
			periodStart := periodEnd.AddDate(0, 0, -days)

			fmt.Println("=== Topic Sub-Clustering ===")
			fmt.Printf("期間: %s ~ %s (%d 天)\n", periodStart.Format("2006-01-02"), periodEnd.Format("2006-01-02"), days)
			fmt.Printf("最小聚類大小: %d\n\n", minClusterSize)

			// 取得要處理的 Topics
			topics, err := topicRepo.FindAll(ctx)
			if err != nil {
				log.Fatalf("查詢 Topics 失敗: %v", err)
			}

			for _, topic := range topics {
				// 如果指定了特定 topic，跳過其他的
				if topicCode != "" && topic.Code != topicCode {
					continue
				}

				fmt.Printf("━━━ %s (%s) ━━━\n", topic.Name, topic.Code)

				// 查詢該 Topic 在指定期間內的貼文
				rows, err := db.Pool.Query(ctx, `
					SELECT p.post_id, p.content, pe.embedding
					FROM posts p
					JOIN post_embeddings pe ON p.post_id = pe.post_id
					JOIN post_topics pt ON p.post_id::bigint = pt.post_id
					WHERE pt.topic_id = $1
					  AND p.created_at >= $2
					  AND p.created_at < $3
				`, topic.ID, periodStart, periodEnd)
				if err != nil {
					fmt.Printf("  ❌ 查詢失敗: %v\n\n", err)
					continue
				}

				type postData struct {
					ID        string
					Content   string
					Embedding pgvector.Vector
				}
				var posts []postData
				for rows.Next() {
					var p postData
					if err := rows.Scan(&p.ID, &p.Content, &p.Embedding); err != nil {
						continue
					}
					posts = append(posts, p)
				}
				rows.Close()

				if len(posts) < minClusterSize {
					fmt.Printf("  貼文數量不足 (%d < %d)，跳過\n\n", len(posts), minClusterSize)
					continue
				}

				fmt.Printf("  貼文數: %d\n", len(posts))

				// 準備聚類請求
				req := &mlservice.ClusteringRequest{
					Embeddings:     make([]mlservice.Embedding, len(posts)),
					Texts:          make([]string, len(posts)),
					MinClusterSize: minClusterSize,
					TopicContext:   topic.Name, // 傳入 Topic 名稱讓 ML 生成更精準的子群名稱
				}

				for i, p := range posts {
					req.Embeddings[i] = mlservice.Embedding{Values: p.Embedding.Slice()}
					content := p.Content
					if len(content) > 300 {
						content = content[:300]
					}
					req.Texts[i] = content
				}

				// 呼叫 ML Service
				resp, err := mlClient.RunClustering(ctx, req)
				if err != nil {
					fmt.Printf("  ❌ 聚類失敗: %v\n\n", err)
					continue
				}

				if len(resp.Clusters) == 0 {
					fmt.Printf("  未發現子群 (噪點: %d)\n\n", resp.NoiseCount)
					continue
				}

				fmt.Printf("  發現 %d 個子群，噪點 %d\n", len(resp.Clusters), resp.NoiseCount)

				// 先清除該 Topic 舊的 clusters（本期間內的）
				db.Pool.Exec(ctx, `
					DELETE FROM cluster_assignments
					WHERE cluster_id IN (
						SELECT id FROM clusters
						WHERE topic_id = $1 AND period_start = $2
					)
				`, topic.ID, periodStart)
				db.Pool.Exec(ctx, `
					DELETE FROM clusters
					WHERE topic_id = $1 AND period_start = $2
				`, topic.ID, periodStart)

				// 儲存新的 clusters
				clusterIDs := make([]int64, len(resp.Clusters))
				for i, c := range resp.Clusters {
					// 查詢上週同名 cluster 的大小（用於計算趨勢）
					var prevSize int
					prevStart := periodStart.AddDate(0, 0, -days)
					db.Pool.QueryRow(ctx, `
						SELECT COALESCE(size, 0) FROM clusters
						WHERE topic_id = $1 AND name = $2 AND period_start = $3
					`, topic.ID, c.Name, prevStart).Scan(&prevSize)

					// 計算成長率和趨勢
					growthRate := 0.0
					trend := entity.ClusterTrendEmerging
					if prevSize > 0 {
						growthRate = float64(c.Size-prevSize) / float64(prevSize)
						trend = calculateTrend(growthRate)
					}

					// 儲存 cluster
					var clusterID int64
					err := db.Pool.QueryRow(ctx, `
						INSERT INTO clusters (topic_id, name, centroid, size, keywords, status,
							prev_week_size, growth_rate, trend, period_start, period_end, created_at, updated_at)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
						RETURNING id
					`, topic.ID, c.Name, pgvector.NewVector(c.Centroid.Values),
						c.Size, c.Keywords, entity.ClusterStatusEmerging,
						prevSize, growthRate, trend, periodStart, periodEnd,
						time.Now(), time.Now()).Scan(&clusterID)

					if err != nil {
						fmt.Printf("    ❌ 儲存 cluster 失敗: %v\n", err)
						continue
					}
					clusterIDs[i] = clusterID

					// 儲存 centroid 到 Redis
					centroid := &entity.Centroid{
						ClusterID: fmt.Sprintf("%d", clusterID),
						Vector:    c.Centroid.Values,
						UpdatedAt: time.Now(),
					}
					centroidRepo.Save(ctx, centroid)

					// 顯示趨勢
					trendIcon := getTrendIcon(trend)
					fmt.Printf("    %s %s (size: %d, %s)\n", trendIcon, c.Name, c.Size, trend)
				}

				// 儲存 post-cluster 分配
				assignedCount := 0
				for i, label := range resp.Labels {
					if label < 0 || label >= len(clusterIDs) {
						continue
					}
					postID := posts[i].ID
					clusterID := clusterIDs[label]

					_, err := db.Pool.Exec(ctx, `
						INSERT INTO cluster_assignments (post_id, cluster_id, topic_id, similarity, confidence, assigned_at)
						VALUES ($1, $2, $3, $4, $5, $6)
						ON CONFLICT DO NOTHING
					`, postID, clusterID, topic.ID, 1.0, entity.ConfidenceHigh, time.Now())
					if err == nil {
						assignedCount++
					}
				}
				fmt.Printf("  分配 %d 篇貼文到子群\n\n", assignedCount)
			}

			// 顯示總覽
			fmt.Println("=== 總覽 ===")
			rows, _ := db.Pool.Query(ctx, `
				SELECT t.name, c.name, c.size, c.trend, c.growth_rate
				FROM clusters c
				JOIN topics t ON c.topic_id = t.id
				WHERE c.period_start = $1
				ORDER BY c.growth_rate DESC
				LIMIT 20
			`, periodStart)

			fmt.Printf("\n%-15s %-25s %8s %12s %10s\n", "Topic", "Sub-Cluster", "Size", "Trend", "Growth")
			fmt.Println("────────────────────────────────────────────────────────────────────────")
			for rows.Next() {
				var topicName, clusterName, trend string
				var size int
				var growthRate float64
				rows.Scan(&topicName, &clusterName, &size, &trend, &growthRate)
				trendIcon := getTrendIcon(entity.ClusterTrend(trend))
				fmt.Printf("%-15s %-25s %8d %s %-10s %+.1f%%\n",
					truncate(topicName, 15), truncate(clusterName, 25),
					size, trendIcon, trend, growthRate*100)
			}
			rows.Close()

			fmt.Println("\n=== Done ===")
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

func calculateTrend(growthRate float64) entity.ClusterTrend {
	if growthRate >= 0.5 {
		return entity.ClusterTrendHot
	} else if growthRate >= 0.1 {
		return entity.ClusterTrendGrowing
	} else if growthRate >= -0.1 {
		return entity.ClusterTrendStable
	}
	return entity.ClusterTrendDeclining
}

func getTrendIcon(trend entity.ClusterTrend) string {
	switch trend {
	case entity.ClusterTrendEmerging:
		return "🆕"
	case entity.ClusterTrendHot:
		return "🔥"
	case entity.ClusterTrendGrowing:
		return "📈"
	case entity.ClusterTrendStable:
		return "➖"
	case entity.ClusterTrendDeclining:
		return "📉"
	default:
		return "  "
	}
}

func truncate(s string, maxLen int) string {
	runes := []rune(s)
	if len(runes) <= maxLen {
		return s
	}
	return string(runes[:maxLen-1]) + "…"
}
