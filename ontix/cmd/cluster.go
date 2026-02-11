package cmd

import (
	"context"
	"fmt"
	"log"
	"strings"
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

var clusterCmd = func() *cobra.Command {
	var minClusterSize int
	var force bool

	cmd := &cobra.Command{
		Use:   "cluster",
		Short: "Run HDBSCAN clustering",
		Run: func(cmd *cobra.Command, args []string) {
			clusterFx(minClusterSize, force)
		},
	}

	cmd.Flags().IntVarP(&minClusterSize, "min-size", "m", 3, "Minimum cluster size")
	cmd.Flags().BoolVarP(&force, "force", "f", false, "Clear existing clusters before running")
	return cmd
}

func clusterFx(minClusterSize int, force bool) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
			mlservice.New,
			redis.New,
			redis.NewCentroidRepo,
		),
		fx.Invoke(func(
			postRepo repository.PostRepository,
			tagRepo repository.TagRepository,
			mlClient *mlservice.Client,
			db *postgres.DB,
			centroidRepo repository.CentroidRepository,
		) {
			ctx := context.Background()

			fmt.Println("=== Ontix Clustering ===")
			fmt.Printf("Min cluster size: %d\n", minClusterSize)

			// Clear existing clusters if --force
			if force {
				fmt.Println("Clearing existing clusters...")
				db.Pool.Exec(ctx, "TRUNCATE post_clusters RESTART IDENTITY CASCADE")
				db.Pool.Exec(ctx, "TRUNCATE clusters RESTART IDENTITY CASCADE")
				centroidRepo.Clear(ctx)
				fmt.Println("Cleared.\n")
			}

			// 1. 取得所有有 embedding 的貼文 (新結構：posts + post_embeddings)
			rows, err := db.Pool.Query(ctx, `
				SELECT p.post_id, p.content, pe.embedding
				FROM posts p
				JOIN post_embeddings pe ON p.post_id = pe.post_id
			`)
			if err != nil {
				log.Fatalf("Query error: %v", err)
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
					log.Fatalf("Scan error: %v", err)
				}
				posts = append(posts, p)
			}
			rows.Close()

			if len(posts) < minClusterSize {
				fmt.Printf("貼文數量不足 (%d < %d)，無法聚類\n", len(posts), minClusterSize)
				return
			}

			fmt.Printf("載入 %d 篇貼文\n", len(posts))

			// 2. 準備聚類請求
			req := &mlservice.ClusteringRequest{
				Embeddings:     make([]mlservice.Embedding, len(posts)),
				Texts:          make([]string, len(posts)),
				MinClusterSize: minClusterSize,
			}

			for i, p := range posts {
				req.Embeddings[i] = mlservice.Embedding{Values: p.Embedding.Slice()}
				content := p.Content
				if len(content) > 300 {
					content = content[:300]
				}
				req.Texts[i] = content
			}

			// 3. 呼叫 ML Service
			fmt.Println("呼叫 ML Service 執行 HDBSCAN...")
			resp, err := mlClient.RunClustering(ctx, req)
			if err != nil {
				log.Fatalf("Clustering error: %v", err)
			}

			fmt.Printf("\n找到 %d 個聚類，%d 個噪點\n\n", len(resp.Clusters), resp.NoiseCount)

			// 4. 儲存聚類結果
			clusterIDs := make([]int64, len(resp.Clusters))
			for i, c := range resp.Clusters {
				fmt.Printf("--- Cluster #%d: %s ---\n", i+1, c.Name)
				fmt.Printf("  Size: %d posts\n", c.Size)

				// 儲存到資料庫
				var clusterID int64
				err := db.Pool.QueryRow(ctx, `
					INSERT INTO clusters (name, centroid, size, keywords, status, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7)
					RETURNING id
				`, c.Name, pgvector.NewVector(c.Centroid.Values),
					c.Size, c.Keywords, entity.ClusterStatusEmerging,
					time.Now(), time.Now()).Scan(&clusterID)

				if err != nil {
					fmt.Printf("  X DB save failed: %v\n", err)
					continue
				}
				clusterIDs[i] = clusterID

				// 存入 Redis 緩存
				centroid := &entity.Centroid{
					ClusterID: fmt.Sprintf("%d", clusterID),
					Vector:    c.Centroid.Values,
					UpdatedAt: time.Now(),
				}
				if err := centroidRepo.Save(ctx, centroid); err != nil {
					fmt.Printf("  X Redis cache failed: %v\n", err)
				} else {
					fmt.Printf("  OK saved + cached (ID: %d)\n", clusterID)
				}
				fmt.Println()
			}

			// 5. 儲存 post-cluster 分配關係（預設 high confidence，因為是 HDBSCAN 直接分配）
			fmt.Println("Saving cluster assignments...")
			assignedCount := 0
			for i, label := range resp.Labels {
				if label < 0 || label >= len(clusterIDs) {
					continue // noise point
				}
				postID := posts[i].ID
				clusterID := clusterIDs[label]

				_, err := db.Pool.Exec(ctx, `
					INSERT INTO post_clusters (post_id, cluster_id, similarity, confidence, assigned_at)
					VALUES ($1, $2, $3, $4, $5)
					ON CONFLICT DO NOTHING
				`, postID, clusterID, 1.0, entity.ConfidenceHigh, time.Now())
				if err != nil {
					fmt.Printf("  X assign %s -> %d failed: %v\n", postID, clusterID, err)
				} else {
					assignedCount++
				}
			}
			fmt.Printf("Assigned %d posts to clusters\n\n", assignedCount)

			// 6. Tag 驗證：標記不匹配的分配為低信心（不刪除）
			fmt.Println("Validating assignments with tags...")

			// 建立 cluster name 快取
			clusterNames := make(map[int64]string)
			for i, c := range resp.Clusters {
				clusterNames[clusterIDs[i]] = c.Name
			}

			// 查詢所有分配關係
			assignRows, err := db.Pool.Query(ctx, `
				SELECT post_id, cluster_id
				FROM post_clusters
			`)
			if err != nil {
				log.Printf("Query assignments error: %v", err)
			} else {
				var lowConfidenceCount int
				var assignments []struct {
					postID    string
					clusterID int64
				}
				for assignRows.Next() {
					var a struct {
						postID    string
						clusterID int64
					}
					if err := assignRows.Scan(&a.postID, &a.clusterID); err == nil {
						assignments = append(assignments, a)
					}
				}
				assignRows.Close()

				for _, a := range assignments {
					// 取得貼文的 tags
					tags, err := tagRepo.FindTagsByPostID(ctx, a.postID)
					if err != nil || len(tags) == 0 {
						continue // 沒有 tags，保留高信心
					}

					// 取得 cluster 名稱
					clusterName := clusterNames[a.clusterID]
					if clusterName == "" {
						continue
					}

					// 驗證 tags 是否與 cluster 相關
					if !validateTagsWithClusterName(tags, clusterName) {
						// 標記為低信心（不刪除，保留供人工審核）
						_, err := db.Pool.Exec(ctx, `
							UPDATE post_clusters
							SET confidence = $1
							WHERE post_id = $2 AND cluster_id = $3
						`, entity.ConfidenceLow, a.postID, a.clusterID)
						if err == nil {
							lowConfidenceCount++
							// 找出貼文內容前 40 字
							var content string
							for _, p := range posts {
								if p.ID == a.postID {
									content = p.Content
									if len(content) > 40 {
										content = content[:40]
									}
									break
								}
							}
							fmt.Printf("  ⚠ Low confidence: [%s] in [%s] (tag mismatch)\n", content, clusterName)
						}
					}
				}

				fmt.Printf("\nMarked %d assignments as low confidence (tag mismatch)\n", lowConfidenceCount)
				fmt.Printf("High confidence: %d\n", len(assignments)-lowConfidenceCount)
			}

			// 7. 顯示最終統計
			fmt.Println("\n=== Summary ===")
			var stats struct {
				total  int
				high   int
				medium int
				low    int
			}
			statsRows, _ := db.Pool.Query(ctx, `
				SELECT confidence, COUNT(*)
				FROM post_clusters
				GROUP BY confidence
			`)
			for statsRows.Next() {
				var conf string
				var count int
				statsRows.Scan(&conf, &count)
				stats.total += count
				switch conf {
				case "high":
					stats.high = count
				case "medium":
					stats.medium = count
				case "low":
					stats.low = count
				}
			}
			statsRows.Close()

			fmt.Printf("Total assignments: %d\n", stats.total)
			fmt.Printf("  High confidence:   %d (%.1f%%)\n", stats.high, float64(stats.high)/float64(stats.total)*100)
			fmt.Printf("  Medium confidence: %d (%.1f%%)\n", stats.medium, float64(stats.medium)/float64(stats.total)*100)
			fmt.Printf("  Low confidence:    %d (%.1f%%) <- needs review\n", stats.low, float64(stats.low)/float64(stats.total)*100)

			fmt.Println("\n=== Done ===")
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

// validateTagsWithClusterName 驗證 tags 是否與 cluster 名稱相關
func validateTagsWithClusterName(tags []*entity.PostTag, clusterName string) bool {
	// 建立 cluster 關鍵詞集合
	clusterTerms := make(map[string]bool)

	// 加入 cluster 名稱的每個字詞
	for _, word := range splitChineseWordsCluster(clusterName) {
		clusterTerms[strings.ToLower(word)] = true
	}

	// 檢查 tags 是否有任何匹配
	for _, tag := range tags {
		// 跳過情緒標籤
		if tag.Category == entity.TagCategorySentiment {
			continue
		}

		tagLower := strings.ToLower(tag.TagID)

		// 完全匹配
		if clusterTerms[tagLower] {
			return true
		}

		// 部分匹配
		for term := range clusterTerms {
			if len(term) >= 2 && len(tagLower) >= 2 {
				if strings.Contains(tagLower, term) || strings.Contains(term, tagLower) {
					return true
				}
			}
		}
	}

	return false
}

// splitChineseWordsCluster 簡單的中文分詞
func splitChineseWordsCluster(s string) []string {
	words := []string{s}

	runes := []rune(s)
	if len(runes) <= 2 {
		return words
	}

	// 2-gram
	for i := 0; i < len(runes)-1; i++ {
		words = append(words, string(runes[i:i+2]))
	}

	return words
}
