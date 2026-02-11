package entity

import "time"

// ============================================
// Time-Bucketed Observations — 趨勢與異常偵測基礎
// ============================================

// EntityObservation 一個 entity 在一個時間段內的聚合觀測
type EntityObservation struct {
	ID           int64
	ObjectID     string
	PeriodStart  time.Time
	PeriodType   string // "day" / "week"

	MentionCount  int
	PositiveCount int
	NegativeCount int
	NeutralCount  int
	MixedCount    int
	AvgSentiment  float64

	// 面向快照：本期 top aspects
	AspectData []AspectObservation

	CreatedAt time.Time
}

// AspectObservation 單個面向的觀測彙總
type AspectObservation struct {
	Aspect       string  `json:"aspect"`
	Count        int     `json:"count"`
	AvgSentiment float64 `json:"avg_sentiment"`
}

// ObservationDelta 兩期 observation 的差異（推理引擎的核心輸入）
type ObservationDelta struct {
	ObjectID     string
	ObjectName   string
	ClassSlug    string

	Current      *EntityObservation
	Previous     *EntityObservation

	// 計算出的 delta
	SentimentDelta    float64 // current - previous
	SentimentDeltaPct float64 // (current - previous) / |previous| * 100
	MentionDelta      int
	MentionDeltaPct   float64

	// 面向 delta
	NewAspects     []string           // 本期有、上期沒有的面向
	RemovedAspects []string           // 上期有、本期沒有的面向
	AspectDeltas   []AspectDelta      // 兩期都有的面向的 sentiment 變化
}

// AspectDelta 單個面向的兩期差異
type AspectDelta struct {
	Aspect           string
	CurrentCount     int
	PreviousCount    int
	CurrentSentiment float64
	PreviousSentiment float64
	SentimentDelta   float64 // current - previous
	IsFlipped        bool    // 正→負 或 負→正
}
