package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// ClusterRepository 聚類儲存庫介面
type ClusterRepository interface {
	Save(ctx context.Context, cluster *entity.Cluster) error
	FindByID(ctx context.Context, id string) (*entity.Cluster, error)
	FindAll(ctx context.Context) ([]*entity.Cluster, error)
	FindByStatus(ctx context.Context, status entity.ClusterStatus) ([]*entity.Cluster, error)
	UpdateStatus(ctx context.Context, id string, status entity.ClusterStatus) error
}

// CentroidRepository Centroid 儲存庫介面 (Redis)
type CentroidRepository interface {
	Save(ctx context.Context, centroid *entity.Centroid) error
	GetAll(ctx context.Context) ([]*entity.Centroid, error)
	GetByTopicID(ctx context.Context, topicID int) ([]*entity.Centroid, error)
	Delete(ctx context.Context, clusterID string) error
	Clear(ctx context.Context) error
}

// PendingPool Pending Pool 介面 (Redis)
type PendingPool interface {
	Add(ctx context.Context, postID string) error
	GetBatch(ctx context.Context, limit int) ([]string, error)
	Remove(ctx context.Context, postIDs []string) error
	Size(ctx context.Context) (int64, error)
}

// ColdStartRepository 冷啟動管理介面 (Redis)
type ColdStartRepository interface {
	// AddPost 加入文章到冷啟動佇列，返回觸發結果
	AddPost(ctx context.Context, topicID int, postID string) (entity.ColdStartTriggerResult, error)
	// GetState 取得冷啟動狀態
	GetState(ctx context.Context, topicID int) (*entity.ColdStartState, error)
	// GetPostIDs 取得冷啟動佇列中的所有文章 ID
	GetPostIDs(ctx context.Context, topicID int) ([]string, error)
	// SetStatus 設定狀態
	SetStatus(ctx context.Context, topicID int, status entity.ColdStartStatus) error
	// SetProcessing 設定為處理中（取得鎖）
	SetProcessing(ctx context.Context, topicID int, workerID string) (bool, error)
	// SetReady 設定為完成
	SetReady(ctx context.Context, topicID int) error
	// SetFailed 設定為失敗
	SetFailed(ctx context.Context, topicID int, err string) error
	// Clear 清除冷啟動資料（完成後）
	Clear(ctx context.Context, topicID int) error
	// IsReady 檢查是否已完成冷啟動
	IsReady(ctx context.Context, topicID int) (bool, error)
}
