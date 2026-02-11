package service

import "context"

// EmbeddingService 向量服務介面
type EmbeddingService interface {
	Embed(ctx context.Context, text string) ([]float32, error)
	BatchEmbed(ctx context.Context, texts []string) ([][]float32, error)
}
