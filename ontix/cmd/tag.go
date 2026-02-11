package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var tagCmd = func() *cobra.Command {
	var content string
	var filePath string
	var limit int

	cmd := &cobra.Command{
		Use:   "tag",
		Short: "為貼文產生標籤",
		Run: func(cmd *cobra.Command, args []string) {
			// 批次模式
			if filePath != "" {
				tagBatchFx(filePath, limit)
				return
			}

			// 單筆模式
			if content == "" && len(args) > 0 {
				content = args[0]
			}
			if content == "" {
				log.Fatal("請提供貼文內容: ontix tag -c \"內容\" 或 ontix tag -f data.json")
			}
			tagSingleFx(content)
		},
	}

	cmd.Flags().StringVarP(&content, "content", "c", "", "貼文內容")
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "JSON 資料檔案 (批次模式)")
	cmd.Flags().IntVarP(&limit, "limit", "l", 0, "處理筆數限制 (0=全部)")
	return cmd
}

// === 單筆模式 ===

func tagSingleFx(content string) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EmbeddingService { return c },
			func(c *openai.Client) service.LLMService { return c },
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
			postgres.NewClusterRepo,
			redis.New,
			redis.NewCentroidRepo,
			service.NewAssigner,
		),
		fx.Invoke(func(
			embedSvc service.EmbeddingService,
			llmSvc service.LLMService,
			postRepo repository.PostRepository,
			tagRepo repository.TagRepository,
			assigner *service.Assigner,
		) {
			ctx := context.Background()
			postID := uuid.New().String()

			fmt.Println("=== Ontix Tagging ===")
			fmt.Printf("PostID: %s\n", postID)
			fmt.Printf("Content: %s\n\n", content)

			// 1. Embedding
			embedding, err := embedSvc.Embed(ctx, content)
			if err != nil {
				log.Fatalf("Embedding error: %v", err)
			}
			fmt.Printf("Embedding: %d dim\n", len(embedding))

			// 2. 標籤
			tags, err := llmSvc.GenerateTags(ctx, content)
			if err != nil {
				log.Fatalf("LLM error: %v", err)
			}

			fmt.Println("\n標籤:")
			for _, t := range tags {
				tagType := "軟"
				if t.IsHardTag {
					tagType = "硬"
				}
				fmt.Printf("  • %s (%.0f%%) [%s]\n", t.Name, t.Confidence*100, tagType)
			}

			// 3. 儲存
			post := &entity.Post{
				PostID: postID,
				Content:    content,
				Platform:   entity.PlatformInstagram,
				Embedding:  embedding,
				CreatedAt:  time.Now(),
			}
			if err := postRepo.Save(ctx, post); err != nil {
				log.Fatalf("Save post error: %v", err)
			}

			for _, t := range tags {
				tagType := entity.TagTypeSoft
				if t.IsHardTag {
					tagType = entity.TagTypeHard
				}
				tagID := t.Name
				if t.HardTagID != "" {
					tagID = t.HardTagID
				}

				postTag := &entity.PostTag{
					PostID:     post.PostID,
					TagID:      tagID,
					TagType:    tagType,
					Confidence: t.Confidence,
					Source:     entity.TagSourceLLM,
					CreatedAt:  time.Now(),
				}
				if err := tagRepo.SavePostTag(ctx, postTag); err != nil {
					log.Fatalf("Save tag error: %v", err)
				}
			}

			// 4. Centroid 匹配（分配到聚類）
			result, err := assigner.Assign(ctx, embedding)
			if err != nil {
				fmt.Printf("\n⚠️ Centroid 匹配失敗: %v\n", err)
			} else if result.Assigned {
				fmt.Printf("\n聚類: %s (相似度: %.1f%%)\n", result.ClusterID, result.Similarity*100)
			} else if result.ClusterID != "" {
				fmt.Printf("\n聚類: 未達閾值 (最近: %s, %.1f%%)\n", result.ClusterID, result.Similarity*100)
			} else {
				fmt.Println("\n聚類: 無可用 Centroid")
			}

			fmt.Println("\n已儲存!")
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

// === 批次模式 ===

type RawPost struct {
	ID             int64  `json:"id"`
	Platform       string `json:"platform"`
	PlatformUserID string `json:"platform_user_id"`
	Content        string `json:"content"`
	LikeCount      int    `json:"like_count"`
	CommentCount   int    `json:"comment_count"`
	ShareCount     int    `json:"share_count"`
	ViewCount      int    `json:"view_count"`
	OwnerUsername  string `json:"owner_username"`
	PostTime       string `json:"post_time"`
}

func tagBatchFx(filePath string, limit int) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EmbeddingService { return c },
			func(c *openai.Client) service.LLMService { return c },
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
		),
		fx.Invoke(func(
			embedSvc service.EmbeddingService,
			llmSvc service.LLMService,
			postRepo repository.PostRepository,
			tagRepo repository.TagRepository,
		) {
			ctx := context.Background()

			// 讀取 JSON
			data, err := os.ReadFile(filePath)
			if err != nil {
				log.Fatalf("讀取檔案失敗: %v", err)
			}

			var rawData map[string][]RawPost
			if err := json.Unmarshal(data, &rawData); err != nil {
				log.Fatalf("解析 JSON 失敗: %v", err)
			}

			var posts []RawPost
			for _, v := range rawData {
				posts = v
				break
			}

			// 過濾有效貼文
			var validPosts []RawPost
			for _, p := range posts {
				if p.Content != "" && len(p.Content) > 10 {
					validPosts = append(validPosts, p)
				}
			}

			if limit > 0 && limit < len(validPosts) {
				validPosts = validPosts[:limit]
			}

			fmt.Printf("=== Ontix Batch Tagging ===\n")
			fmt.Printf("檔案: %s\n", filePath)
			fmt.Printf("有效貼文: %d\n\n", len(validPosts))

			successCount := 0
			failCount := 0

			for i, raw := range validPosts {
				postID := strconv.FormatInt(raw.ID, 10)
				fmt.Printf("[%d/%d] %s ", i+1, len(validPosts), postID)

				// 檢查是否已存在
				existing, _ := postRepo.FindByID(ctx, postID)
				if existing != nil {
					fmt.Println("⏭️ 已存在")
					continue
				}

				content := raw.Content
				if len(content) > 500 {
					content = content[:500]
				}

				// Embedding
				embedding, err := embedSvc.Embed(ctx, content)
				if err != nil {
					fmt.Printf("❌ embed: %v\n", err)
					failCount++
					continue
				}

				// 標籤
				tags, err := llmSvc.GenerateTags(ctx, content)
				if err != nil {
					fmt.Printf("❌ llm: %v\n", err)
					failCount++
					continue
				}

				// 儲存貼文
				postTime, _ := time.Parse(time.RFC3339, raw.PostTime)
				post := &entity.Post{
					PostID: postID,
					Content:    raw.Content,
					Platform:   toPlatform(raw.Platform),
					Author: entity.Author{
						ID:       raw.PlatformUserID,
						Username: raw.OwnerUsername,
					},
					Metrics: entity.Metrics{
						Likes:    raw.LikeCount,
						Comments: raw.CommentCount,
						Shares:   raw.ShareCount,
						Views:    raw.ViewCount,
					},
					Embedding: embedding,
					CreatedAt: postTime,
				}

				if err := postRepo.Save(ctx, post); err != nil {
					fmt.Printf("❌ save: %v\n", err)
					failCount++
					continue
				}

				// 儲存標籤
				for _, t := range tags {
					tagType := entity.TagTypeSoft
					if t.IsHardTag {
						tagType = entity.TagTypeHard
					}
					tagID := t.Name
					if t.HardTagID != "" {
						tagID = t.HardTagID
					}

					postTag := &entity.PostTag{
						PostID:     post.PostID,
						TagID:      tagID,
						TagType:    tagType,
						Confidence: t.Confidence,
						Source:     entity.TagSourceLLM,
						CreatedAt:  time.Now(),
					}
					tagRepo.SavePostTag(ctx, postTag)
				}

				var tagNames []string
				for _, t := range tags {
					tagNames = append(tagNames, t.Name)
				}
				fmt.Printf("✅ %v\n", tagNames)
				successCount++

				time.Sleep(100 * time.Millisecond)
			}

			fmt.Printf("\n=== 完成 ===\n")
			fmt.Printf("成功: %d / 失敗: %d\n", successCount, failCount)
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

func toPlatform(p string) entity.Platform {
	switch p {
	case "ig":
		return entity.PlatformInstagram
	case "fb":
		return entity.PlatformFacebook
	case "yt":
		return entity.PlatformYouTube
	case "tiktok":
		return entity.PlatformTikTok
	default:
		return entity.Platform(p)
	}
}
