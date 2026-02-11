package service

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// NarrativeService 敘事生成器介面
type NarrativeService interface {
	GenerateNarrative(ctx context.Context, req *NarrativeRequest) (*NarrativeResult, error)
}

// NarrativeRequest 敘事生成請求
type NarrativeRequest struct {
	EntityName  string
	EntityClass string
	PeriodLabel string // "2026-02-02 週報"
	Facts       []*entity.DerivedFact
}

// NarrativeResult LLM 生成的敘事結果
type NarrativeResult struct {
	Title string `json:"title"` // 短標題（~20字）
	Body  string `json:"body"`  // 敘事內容（100-200字）
}
