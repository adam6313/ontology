package service

import "context"

// TaggingService 智能標註服務介面
type TaggingService interface {
	// AnalyzePost 分析貼文，回傳完整標註結果
	AnalyzePost(ctx context.Context, content string) (*PostAnalysis, error)
}

// PostAnalysis 貼文分析結果
type PostAnalysis struct {
	Sentiment   SentimentResult `json:"sentiment"`
	SoftTags    []SoftTag       `json:"soft_tags"`
	Aspects     []AspectResult  `json:"aspects"`
	ProductType string          `json:"product_type"`
	Intent      string          `json:"intent"`
}

// SentimentResult 情感分析結果
type SentimentResult struct {
	Label  string  `json:"label"`  // positive/negative/neutral/mixed
	Score  float64 `json:"score"`  // 0.0 ~ 1.0
	Reason string  `json:"reason"` // LLM 解釋
}

// SoftTag 軟標籤
type SoftTag struct {
	Tag        string  `json:"tag"`
	Confidence float64 `json:"confidence"` // 0.0 ~ 1.0
}

// AspectResult 面向情感分析
type AspectResult struct {
	Aspect    string `json:"aspect"`    // 面向名稱 (持妝度、控油...)
	Sentiment string `json:"sentiment"` // positive/negative/neutral
	Mention   string `json:"mention"`   // 原文片段
}
