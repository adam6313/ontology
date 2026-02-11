package entity

import "time"

// ColdStartStatus 冷啟動狀態
type ColdStartStatus string

const (
	ColdStartStatusCollecting  ColdStartStatus = "collecting"  // 收集中
	ColdStartStatusPending     ColdStartStatus = "pending"     // 等待處理
	ColdStartStatusProcessing  ColdStartStatus = "processing"  // 處理中
	ColdStartStatusReady       ColdStartStatus = "ready"       // 已完成
	ColdStartStatusFailed      ColdStartStatus = "failed"      // 失敗
)

// ColdStartTriggerResult 觸發結果
type ColdStartTriggerResult string

const (
	ColdStartTriggerQueued          ColdStartTriggerResult = "queued"           // 已加入佇列
	ColdStartTriggerTriggered       ColdStartTriggerResult = "triggered"        // 觸發初始化
	ColdStartTriggerAlreadyTriggered ColdStartTriggerResult = "already_triggered" // 已被其他 worker 觸發
	ColdStartTriggerSkip            ColdStartTriggerResult = "skip"             // 已完成，跳過
)

// ColdStartState 冷啟動狀態資訊
type ColdStartState struct {
	TopicID     int
	Status      ColdStartStatus
	PostCount   int
	StartedAt   time.Time
	UpdatedAt   time.Time
	RetryCount  int
	LastError   string
}

// ColdStartConfig 冷啟動配置
type ColdStartConfig struct {
	// 觸發條件
	MinCountIdeal      int           // 條件 A: 理想數量 (100)
	MinCountAcceptable int           // 條件 B: 可接受數量 (50)
	MinCountFallback   int           // 條件 C: 保底數量 (20)
	TimeThreshold      time.Duration // 條件 B: 時間閾值 (24hr)
	MaxWaitTime        time.Duration // 條件 C: 最大等待時間 (7 days)

	// 執行配置
	LockTimeout    time.Duration // 分散式鎖超時 (10 min)
	MaxRetry       int           // 最大重試次數 (3)
	BackfillBatch  int           // 回填批次大小 (50)
}

// DefaultColdStartConfig 預設配置
func DefaultColdStartConfig() *ColdStartConfig {
	return &ColdStartConfig{
		MinCountIdeal:      10,  // 極端測試用，正式環境改回 100
		MinCountAcceptable: 8,   // 極端測試用，正式環境改回 50
		MinCountFallback:   5,   // 極端測試用，正式環境改回 20
		TimeThreshold:      24 * time.Hour,
		MaxWaitTime:        7 * 24 * time.Hour,
		LockTimeout:        10 * time.Minute,
		MaxRetry:           3,
		BackfillBatch:      50,
	}
}
