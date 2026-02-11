package entity

import "time"

// Cluster 主題聚類（作為 Topic 的子群）
type Cluster struct {
	ID        int64
	TopicID   *int          // 所屬 Topic（nil 表示未分類）
	Name      string
	Centroid  Vector
	Size      int
	Keywords  []string
	Status    ClusterStatus
	// 趨勢相關
	PrevWeekSize int
	GrowthRate   float64      // (本週-上週)/上週
	Trend        ClusterTrend // emerging, hot, growing, stable, declining
	// 時間範圍
	PeriodStart *time.Time
	PeriodEnd   *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ClusterTrend 聚類趨勢
type ClusterTrend string

const (
	ClusterTrendEmerging  ClusterTrend = "emerging"  // 新發現
	ClusterTrendHot       ClusterTrend = "hot"       // 熱門（成長 50%+）
	ClusterTrendGrowing   ClusterTrend = "growing"   // 成長中（10-50%）
	ClusterTrendStable    ClusterTrend = "stable"    // 穩定
	ClusterTrendDeclining ClusterTrend = "declining" // 衰退
)

// ClusterStatus 聚類狀態
type ClusterStatus string

const (
	ClusterStatusEmerging  ClusterStatus = "emerging"  // 新興 (<100 posts)
	ClusterStatusActive    ClusterStatus = "active"    // 活躍 (100-1000 posts)
	ClusterStatusTrending  ClusterStatus = "trending"  // 趨勢 (快速增長)
	ClusterStatusStable    ClusterStatus = "stable"    // 穩定 (>1000 posts)
	ClusterStatusDeclining ClusterStatus = "declining" // 衰退 (7天無新增)
	ClusterStatusArchived  ClusterStatus = "archived"  // 歸檔 (30天無新增)
)

// Centroid 聚類中心點
type Centroid struct {
	ClusterID string
	Vector    Vector
	UpdatedAt time.Time
}

// Match 計算向量與 Centroid 的相似度
func (c *Centroid) Match(v Vector) MatchResult {
	return MatchResult{
		ClusterID:  c.ClusterID,
		Similarity: c.Vector.CosineSimilarity(v),
	}
}

// MatchResult Centroid 比對結果
type MatchResult struct {
	ClusterID  string
	Similarity float64
}

// ConfidenceLevel 置信度等級
type ConfidenceLevel string

const (
	ConfidenceHigh   ConfidenceLevel = "high"   // 高信心 (similarity >= 0.75)
	ConfidenceMedium ConfidenceLevel = "medium" // 中等信心 (0.50 <= similarity < 0.75)
	ConfidenceLow    ConfidenceLevel = "low"    // 低信心 (tag 驗證失敗但仍分配)
)

