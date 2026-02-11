package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var entityCmd = func() *cobra.Command {
	var content string
	var batch bool
	var limit int

	cmd := &cobra.Command{
		Use:   "entity",
		Short: "Entity 抽取：從貼文中識別品牌、產品、餐廳等實體",
		Run: func(cmd *cobra.Command, args []string) {
			if batch {
				entityBatchFx(limit)
				return
			}

			if content == "" && len(args) > 0 {
				content = args[0]
			}
			if content == "" {
				log.Fatal("請提供貼文內容: ontix entity -c \"內容\" 或 ontix entity --batch")
			}
			entitySingleFx(content)
		},
	}

	cmd.Flags().StringVarP(&content, "content", "c", "", "貼文內容（單筆測試）")
	cmd.Flags().BoolVar(&batch, "batch", false, "批次處理 DB 中已有的貼文")
	cmd.Flags().IntVarP(&limit, "limit", "l", 10, "批次處理筆數限制")
	return cmd
}

// === 單筆模式：測試 LLM 抽取效果 ===

func entitySingleFx(content string) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EntityExtractionService { return c },
			func(c *openai.Client) service.EmbeddingService { return c },
			postgres.New,
			postgres.NewObjectRepo,
			postgres.NewOntologySchemaRepo,
			postgres.NewObjectRelationRepo,
		),
		fx.Invoke(func(
			extractionSvc service.EntityExtractionService,
			embedSvc service.EmbeddingService,
			objectRepo repository.ObjectRepository,
			schemaRepo repository.OntologySchemaRepository,
			relRepo repository.ObjectRelationRepository,
		) {
			ctx := context.Background()

			fmt.Println("=== Ontix Entity Extraction ===")
			fmt.Printf("Content: %s\n\n", content)

			// Step 1: 載入已知 Entity（透過 extractor 以取得 class 資訊）
			extractor := service.NewEntityExtractor(extractionSvc, embedSvc, objectRepo, schemaRepo, relRepo)
			known, _ := extractor.BuildKnownEntities(ctx)
			if len(known) > 0 {
				fmt.Printf("已知 Entity: %d 個\n", len(known))
			} else {
				fmt.Println("已知 Entity: 0 個（首次運行）")
			}

			// Step 2: LLM 抽取 + 消歧
			fmt.Println("\n--- LLM 抽取結果 ---")
			result, err := extractionSvc.ExtractEntities(ctx, content, known)
			if err != nil {
				log.Fatalf("Entity extraction error: %v", err)
			}

			if len(result.Entities) == 0 {
				fmt.Println("未識別到任何實體")
				return
			}

			for i, e := range result.Entities {
				classInfo := ""
				if e.Class != "" {
					classInfo = fmt.Sprintf(" class=%s", e.Class)
				}
				fmt.Printf("\n[Entity %d] %s (%s%s)\n", i+1, e.Name, e.Type, classInfo)
				fmt.Printf("  Sentiment: %s (%.2f)\n", e.Sentiment, e.SentimentScore)
				fmt.Printf("  Mention: %s\n", e.MentionText)

				if len(e.Aspects) > 0 {
					fmt.Println("  Aspects:")
					for _, a := range e.Aspects {
						fmt.Printf("    - %s: %s (%.2f) \"%s\"\n", a.Aspect, a.Sentiment, a.SentimentScore, a.Mention)
					}
				}
			}

			// Step 3: 存入 DB
			fmt.Println("\n--- 存入 DB ---")
			summary, err := extractor.ProcessPost(ctx, fmt.Sprintf("test-%d", time.Now().Unix()), content)
			if err != nil {
				log.Fatalf("Process post error: %v", err)
			}

			// 顯示 relationships
			if len(result.Relationships) > 0 {
				fmt.Println("\n--- Relationships ---")
				for _, r := range result.Relationships {
					relLabel := r.Relation
					if relLabel == "" {
						relLabel = r.LinkType
					}
					fmt.Printf("  %s -[%s]-> %s\n", r.Source, relLabel, r.Target)
				}
			}

			fmt.Printf("\n=== 結果 ===\n")
			fmt.Printf("識別 Entity: %d\n", summary.EntitiesFound)
			fmt.Printf("新建 Entity: %d\n", summary.EntitiesCreated)
			fmt.Printf("Aspect 數量: %d\n", summary.AspectsFound)
			fmt.Printf("Link 數量: %d\n", summary.LinksFound)
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

// === 批次模式：處理 DB 中已有的貼文 ===

func entityBatchFx(limit int) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EntityExtractionService { return c },
			func(c *openai.Client) service.EmbeddingService { return c },
			postgres.New,
			postgres.NewObjectRepo,
			postgres.NewOntologySchemaRepo,
			postgres.NewObjectRelationRepo,
		),
		fx.Invoke(func(
			extractionSvc service.EntityExtractionService,
			embedSvc service.EmbeddingService,
			db *postgres.DB,
			objectRepo repository.ObjectRepository,
			schemaRepo repository.OntologySchemaRepository,
			relRepo repository.ObjectRelationRepository,
		) {
			ctx := context.Background()

			fmt.Println("=== Ontix Entity Extraction (Batch) ===")

			// 取得尚未做 Entity 抽取的貼文
			posts, err := findPostsWithoutEntities(ctx, db, limit)
			if err != nil {
				log.Fatalf("Failed to find posts: %v", err)
			}

			if len(posts) == 0 {
				fmt.Println("沒有需要處理的貼文")
				return
			}

			fmt.Printf("待處理貼文: %d\n\n", len(posts))

			extractor := service.NewEntityExtractor(extractionSvc, embedSvc, objectRepo, schemaRepo, relRepo)

			totalEntities := 0
			totalCreated := 0
			totalAspects := 0
			totalLinks := 0
			successCount := 0
			failCount := 0

			for i, post := range posts {
				fmt.Printf("[%d/%d] %s ", i+1, len(posts), post.PostID)

				content := post.Content
				if len(content) > 500 {
					content = content[:500]
				}

				summary, err := extractor.ProcessPost(ctx, post.PostID, content)
				if err != nil {
					fmt.Printf("error: %v\n", err)
					failCount++
					continue
				}

				fmt.Printf("entities=%d (new=%d) aspects=%d links=%d\n",
					summary.EntitiesFound, summary.EntitiesCreated, summary.AspectsFound, summary.LinksFound)

				totalEntities += summary.EntitiesFound
				totalCreated += summary.EntitiesCreated
				totalAspects += summary.AspectsFound
				totalLinks += summary.LinksFound
				successCount++

				// Rate limit: gpt-4o-mini 很快，但還是稍微等一下
				time.Sleep(200 * time.Millisecond)
			}

			fmt.Printf("\n=== 完成 ===\n")
			fmt.Printf("成功: %d / 失敗: %d\n", successCount, failCount)
			fmt.Printf("識別 Entity: %d (新建: %d)\n", totalEntities, totalCreated)
			fmt.Printf("Aspect 數量: %d\n", totalAspects)
			fmt.Printf("Link 數量: %d\n", totalLinks)
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

// findPostsWithoutEntities 找出尚未做 Entity 抽取的貼文
// 用 SQL 直接查：有內容但 post_entity_mentions 中還沒有紀錄的
func findPostsWithoutEntities(
	ctx context.Context,
	db *postgres.DB,
	limit int,
) ([]*service.PostForExtraction, error) {
	query := `
		SELECT p.post_id, p.content
		FROM posts p
		WHERE p.content IS NOT NULL AND p.content != ''
		  AND NOT EXISTS (
		    SELECT 1 FROM post_entity_mentions pem WHERE pem.post_id = p.post_id
		  )
		ORDER BY p.created_at DESC
		LIMIT $1`

	rows, err := db.Pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts: %w", err)
	}
	defer rows.Close()

	var result []*service.PostForExtraction
	for rows.Next() {
		var p service.PostForExtraction
		if err := rows.Scan(&p.PostID, &p.Content); err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		result = append(result, &p)
	}
	return result, nil
}
