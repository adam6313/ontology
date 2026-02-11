package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// PostRepository 貼文儲存庫介面
type PostRepository interface {
	Save(ctx context.Context, post *entity.Post) error
	FindByID(ctx context.Context, id string) (*entity.Post, error)
	FindByIDs(ctx context.Context, ids []string) ([]*entity.Post, error)
	FindSimilar(ctx context.Context, postID string, limit int) ([]*entity.Post, error)
}
