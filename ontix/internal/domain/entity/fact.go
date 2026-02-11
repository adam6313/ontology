package entity

import "time"

// ============================================
// Derived Facts — 推理引擎的產出
// ============================================

// FactType 事實類型
type FactType string

const (
	FactTypeAlert      FactType = "alert"       // 需要注意的異常
	FactTypeRiskSignal FactType = "risk_signal"  // 風險信號（沿關係傳播的）
	FactTypeTrend      FactType = "trend"        // 趨勢發現
	FactTypeInsight    FactType = "insight"       // LLM 生成的敘事洞察
)

// FactSeverity 嚴重程度
type FactSeverity string

const (
	FactSeverityInfo     FactSeverity = "info"
	FactSeverityWarning  FactSeverity = "warning"
	FactSeverityCritical FactSeverity = "critical"
)

// DerivedFact 推理引擎產出的事實/警報/洞察
type DerivedFact struct {
	ID              int64
	ObjectID        string
	FactType        FactType
	FactKey         string       // 去重 key
	Severity        FactSeverity
	Title           string
	Description     string
	Evidence        map[string]any // 源數據引用

	DerivedFromRule int    // ontology_rules.id
	PeriodStart     *time.Time
	PeriodType      string

	IsRead          bool
	IsDismissed     bool

	CreatedAt       time.Time
	ExpiresAt       *time.Time

	// Resolved references (populated on query)
	Object *Object
}

// FactEvidence 事實的證據（存入 Evidence JSONB）
type FactEvidence struct {
	RuleID           int                `json:"rule_id"`
	SourceObjectID   string             `json:"source_object_id,omitempty"`
	SourceObjectName string             `json:"source_object_name,omitempty"`
	TargetObjectID   string             `json:"target_object_id,omitempty"`
	TargetObjectName string             `json:"target_object_name,omitempty"`
	RelationSlug     string             `json:"relation_slug,omitempty"`
	DeltaPct         float64            `json:"delta_pct,omitempty"`
	CurrentValue     float64            `json:"current_value,omitempty"`
	PreviousValue    float64            `json:"prev_value,omitempty"`
	TopAspects       []AspectDelta      `json:"top_aspects,omitempty"`
	SampleMentions   []string           `json:"sample_mentions,omitempty"`
}
