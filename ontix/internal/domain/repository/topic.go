package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// TopicRepository 主題儲存庫介面
type TopicRepository interface {
	// 主題 CRUD
	FindAll(ctx context.Context) ([]*entity.Topic, error)
	FindByCode(ctx context.Context, code string) (*entity.Topic, error)
	FindByID(ctx context.Context, id int) (*entity.Topic, error)
	UpdateEmbedding(ctx context.Context, id int, embedding entity.Vector) error

	// 貼文-主題關聯
	SavePostTopic(ctx context.Context, pt *entity.PostTopic) error
	FindPostTopics(ctx context.Context, postID int64) ([]*entity.PostTopic, error)
	FindTopicPosts(ctx context.Context, topicID int, limit int, offset int) ([]int64, error)

	// 統計
	GetTopicStats(ctx context.Context) (map[string]int, error)
}
