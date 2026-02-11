package service

import "context"

// ChatMessage 對話訊息
type ChatMessage struct {
	Role    string `json:"role"`    // "system" / "user" / "assistant"
	Content string `json:"content"`
}

// EntityChatRequest Follow-up Chat 請求
type EntityChatRequest struct {
	EntityName  string
	EntityType  string
	SummaryJSON string        // 已生成的 summary（作為 system context）
	ContextData string        // 原始數據摘要（aspects, facts, stats）
	History     []ChatMessage // 對話歷史
	Question    string        // 用戶問題
}

// EntitySummaryService AI 摘要生成介面
type EntitySummaryService interface {
	GenerateEntitySummary(ctx context.Context, req *EntitySummaryRequest) (*EntitySummaryResult, error)
	StreamEntityChat(ctx context.Context, req *EntityChatRequest) (<-chan string, <-chan error)
}

// EntitySummaryRequest 摘要生成請求
type EntitySummaryRequest struct {
	EntityName  string
	EntityType  string
	PeriodLabel string        // "Last 4 weeks"
	Stats       SummaryStats  // mention_count, sentiment breakdown, delta%
	TopAspects  []AspectBrief // top 5 aspects + sentiment
	NegAspects  []AspectBrief // negative-leaning aspects
	RecentFacts []FactBrief   // recent alerts/trends
	TrendDir    string        // "rising" / "declining" / "stable"
	SampleNeg   []string      // 2-3 representative negative mentions
}

// SummaryStats 統計摘要
type SummaryStats struct {
	MentionCount  int
	PositiveCount int
	NegativeCount int
	NeutralCount  int
	MixedCount    int
	AvgSentiment  float64
	MentionDelta  *int // week-over-week change
}

// AspectBrief Aspect 簡要
type AspectBrief struct {
	Aspect        string
	Sentiment     string // "positive" / "negative" / "neutral"
	PositiveCount int
	NegativeCount int
	Total         int
}

// FactBrief Fact 簡要（由 Ontology 推理引擎產出）
type FactBrief struct {
	Type        string         // "alert" / "trend" / "insight" / "risk_signal"
	Severity    string
	Title       string
	Description string
	Evidence    map[string]any // 推理引擎的證據鏈（delta%, related aspects, etc.）
}

// ReasoningStep 推理鏈中的一步（訊號 → 推論 → 結論）
type ReasoningStep struct {
	Signal     string `json:"signal"`     // 偵測到的訊號（來自 Alert/Trend/Aspect）
	Reasoning  string `json:"reasoning"`  // 推理邏輯（為什麼這個訊號重要）
	Conclusion string `json:"conclusion"` // 結論（對品牌的影響）
}

// ActionItem 結構化建議行動
type ActionItem struct {
	Trigger string `json:"trigger"` // 觸發依據（Alert/Trend/Aspect）
	Action  string `json:"action"`  // 具體策略行動
	Target  string `json:"target"`  // 可量化的預期目標
}

// EntitySummaryResult LLM 生成的 AI 摘要
type EntitySummaryResult struct {
	Headline       string          `json:"headline"`        // 一句話重點（15-25字）
	ReasoningChain []ReasoningStep `json:"reasoning_chain"` // 推理鏈（2-3 步）
	Body           string          `json:"body"`            // 綜合分析（支援 **粗體** markdown）
	Actions        []ActionItem    `json:"actions"`         // 結構化建議行動
	GeneratedAt    string          `json:"generated_at"`
}
