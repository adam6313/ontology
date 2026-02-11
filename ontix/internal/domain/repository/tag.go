package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// TagRepository 標籤儲存庫介面
type TagRepository interface {
	SavePostTag(ctx context.Context, postTag *entity.PostTag) error
	FindTagsByPostID(ctx context.Context, postID string) ([]*entity.PostTag, error)
	FindPostsByTagID(ctx context.Context, tagID string, limit int) ([]string, error)
}
