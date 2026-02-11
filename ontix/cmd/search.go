package cmd

import (
	"context"
	"fmt"
	"log"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/pgvector/pgvector-go"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var searchCmd = func() *cobra.Command {
	var limit int

	cmd := &cobra.Command{
		Use:   "search [query]",
		Short: "語意搜尋貼文",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			query := args[0]
			searchFx(query, limit)
		},
	}

	cmd.Flags().IntVarP(&limit, "limit", "l", 5, "結果數量")
	return cmd
}

func searchFx(query string, limit int) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EmbeddingService { return c },
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
		),
		fx.Invoke(func(
			embedSvc service.EmbeddingService,
			postRepo repository.PostRepository,
			tagRepo repository.TagRepository,
			db *postgres.DB,
		) {
			ctx := context.Background()

			fmt.Printf("=== Ontix 語意搜尋 ===\n")
			fmt.Printf("查詢: %s\n\n", query)

			// 1. 產生查詢向量
			embedding, err := embedSvc.Embed(ctx, query)
			if err != nil {
				log.Fatalf("Embedding error: %v", err)
			}

			// 2. 向量搜尋
			results, err := searchSimilar(ctx, db, embedding, limit)
			if err != nil {
				log.Fatalf("Search error: %v", err)
			}

			if len(results) == 0 {
				fmt.Println("找不到相關貼文")
				return
			}

			// 3. 輸出結果
			for i, r := range results {
				fmt.Printf("--- #%d (相似度: %.2f%%) ---\n", i+1, r.Similarity*100)
				fmt.Printf("ID: %s\n", r.PostID)

				content := r.Content
				if len(content) > 200 {
					content = content[:200] + "..."
				}
				fmt.Printf("內容: %s\n", content)

				// 取得標籤
				tags, _ := tagRepo.FindTagsByPostID(ctx, r.PostID)
				if len(tags) > 0 {
					fmt.Print("標籤: ")
					for j, t := range tags {
						if j > 0 {
							fmt.Print(", ")
						}
						fmt.Print(t.TagID)
					}
					fmt.Println()
				}
				fmt.Println()
			}
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

type SearchResult struct {
	PostID     string
	Content    string
	Similarity float64
}

func searchSimilar(ctx context.Context, db *postgres.DB, embedding []float32, limit int) ([]SearchResult, error) {
	// 新結構：JOIN post_embeddings
	query := `
		SELECT p.post_id, p.content, 1 - (pe.embedding <=> $1::vector) as similarity
		FROM posts p
		JOIN post_embeddings pe ON p.post_id = pe.post_id
		ORDER BY pe.embedding <=> $1::vector
		LIMIT $2`

	rows, err := db.Pool.Query(ctx, query, pgvector.NewVector(embedding), limit)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.PostID, &r.Content, &r.Similarity); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		results = append(results, r)
	}
	return results, nil
}
