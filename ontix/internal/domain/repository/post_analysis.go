package repository

import (
	"context"
)

// PostAnalysis 貼文分析結果 (避免 import cycle，從 service 複製)
type PostAnalysis struct {
	Sentiment   SentimentResult `json:"sentiment"`
	SoftTags    []SoftTag       `json:"soft_tags"`
	Aspects     []AspectResult  `json:"aspects"`
	ProductType string          `json:"product_type"`
	Intent      string          `json:"intent"`
}

// SentimentResult 情感分析結果
type SentimentResult struct {
	Label  string  `json:"label"`
	Score  float64 `json:"score"`
	Reason string  `json:"reason"`
}

// SoftTag 軟標籤
type SoftTag struct {
	Tag        string  `json:"tag"`
	Confidence float64 `json:"confidence"`
}

// AspectResult 面向情感分析
type AspectResult struct {
	Aspect    string `json:"aspect"`
	Sentiment string `json:"sentiment"`
	Mention   string `json:"mention"`
}

// PostAnalysisRepository 貼文分析結果儲存庫介面
type PostAnalysisRepository interface {
	// SaveAnalysis 儲存完整分析結果 (sentiment, soft_tags, aspects)
	SaveAnalysis(ctx context.Context, postID string, analysis *PostAnalysis) error

	// SaveSoftTags 批次儲存軟標籤
	SaveSoftTags(ctx context.Context, postID string, tags []SoftTag) error

	// SaveAspects 批次儲存面向情感
	SaveAspects(ctx context.Context, postID string, aspects []AspectResult) error

	// GetSoftTagsByPostID 取得貼文的軟標籤
	GetSoftTagsByPostID(ctx context.Context, postID string) ([]SoftTag, error)

	// GetAspectsByPostID 取得貼文的面向情感
	GetAspectsByPostID(ctx context.Context, postID string) ([]AspectResult, error)

	// GetTopSoftTags 取得熱門軟標籤
	GetTopSoftTags(ctx context.Context, limit int) ([]SoftTagStats, error)

	// GetAspectSentimentStats 取得面向情感統計
	GetAspectSentimentStats(ctx context.Context, limit int) ([]AspectSentimentStats, error)
}

// SoftTagStats 軟標籤統計
type SoftTagStats struct {
	Tag           string  `json:"tag"`
	PostCount     int     `json:"post_count"`
	AvgConfidence float64 `json:"avg_confidence"`
}

// AspectSentimentStats 面向情感統計
type AspectSentimentStats struct {
	Aspect        string  `json:"aspect"`
	Total         int     `json:"total"`
	PositiveCount int     `json:"positive_count"`
	NegativeCount int     `json:"negative_count"`
	NeutralCount  int     `json:"neutral_count"`
	PositiveRatio float64 `json:"positive_ratio"`
}

// PostClusterRepository 貼文-聚類關聯儲存庫介面
type PostClusterRepository interface {
	// SavePostCluster 儲存貼文與聚類的關聯
	SavePostCluster(ctx context.Context, pc *PostClusterAssignment) error

	// GetClustersByPostID 取得貼文所屬的聚類
	GetClustersByPostID(ctx context.Context, postID string) ([]*PostClusterAssignment, error)

	// GetPostsByClusterID 取得聚類中的貼文
	GetPostsByClusterID(ctx context.Context, clusterID int64, limit int) ([]string, error)

	// GetClusterStats 取得聚類統計
	GetClusterStats(ctx context.Context, clusterID int64) (*ClusterPostStats, error)
}

// PostClusterAssignment 貼文-聚類關聯
type PostClusterAssignment struct {
	PostID     string  `json:"post_id"`
	ClusterID  int64   `json:"cluster_id"`
	Similarity float64 `json:"similarity"`
	Confidence string  `json:"confidence"` // high, medium, low
}

// ClusterPostStats 聚類貼文統計
type ClusterPostStats struct {
	ClusterID     int64   `json:"cluster_id"`
	ClusterName   string  `json:"cluster_name"`
	Keywords      []string `json:"keywords"`
	TopicID       *int    `json:"topic_id"`
	TopicName     string  `json:"topic_name"`
	TotalPosts    int     `json:"total_posts"`
	Posts24h      int     `json:"posts_24h"`
	Posts7d       int     `json:"posts_7d"`
	AvgSimilarity float64 `json:"avg_similarity"`
}
