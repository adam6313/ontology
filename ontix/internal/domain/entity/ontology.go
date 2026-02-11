package entity

import "time"

// ============================================
// Ontology Schema Layer — 定義世界的結構
// ============================================

// Class 概念類別（支援 IS-A 層級繼承）
type Class struct {
	ID          int
	Slug        string // 程式用："brand", "product"
	Name        string // 顯示用："品牌", "產品"
	ParentID    *int   // nil = root class
	Description string
	Icon        string // Material Symbols icon name
	SortOrder   int
	CreatedAt   time.Time

	// Eager-loaded relations (populated by schema loader)
	Parent     *Class
	Children   []*Class
	Properties []*PropertyDef
	OutgoingRelations []*RelationTypeDef
	IncomingRelations []*RelationTypeDef
}

// IsA 判斷此 class 是否是 target class 或其子類
// Brand.IsA("organization") → true
// Brand.IsA("brand") → true
// Brand.IsA("product") → false
func (c *Class) IsA(slug string) bool {
	if c.Slug == slug {
		return true
	}
	if c.Parent != nil {
		return c.Parent.IsA(slug)
	}
	return false
}

// AncestorSlugs 回傳此 class 到 root 的所有 slug（含自身）
func (c *Class) AncestorSlugs() []string {
	slugs := []string{c.Slug}
	if c.Parent != nil {
		slugs = append(slugs, c.Parent.AncestorSlugs()...)
	}
	return slugs
}

// PropertyDef 屬性定義（typed, per-class）
type PropertyDef struct {
	ID           int
	ClassID      int
	Name         string // "market_segment"
	DisplayName  string // "市場區隔"
	DataType     string // string / integer / float / enum / boolean / date
	EnumValues   []string
	IsRequired   bool
	DefaultValue any
	Description  string
}

// RelationTypeDef 關係類型定義
type RelationTypeDef struct {
	ID             int
	Slug           string // "belongs_to"
	Name           string // "BELONGS_TO"
	DisplayName    string // "隸屬於"
	SourceClassID  int
	TargetClassID  int
	Cardinality    string // one_to_one / one_to_many / many_to_one / many_to_many
	InverseID      *int
	Description    string

	// Resolved references (populated by schema loader)
	SourceClass *Class
	TargetClass *Class
	Inverse     *RelationTypeDef
}

// Rule 推理規則
type Rule struct {
	ID          int
	Name        string
	Description string
	Priority    int
	IsActive    bool

	TriggerType string // observation_change / schedule / relation_change

	Condition   RuleCondition
	ActionType  string // create_alert / derive_fact / propagate
	ActionConfig RuleActionConfig

	CreatedAt time.Time
}

// RuleCondition 規則條件（從 JSONB 反序列化）
type RuleCondition struct {
	EntityClass        string  `json:"entity_class"`         // "product", "brand", "entity"(=any)
	Metric             string  `json:"metric"`               // avg_sentiment / mention_count / new_aspects / aspect_sentiment
	Compare            string  `json:"compare"`              // prev_period
	Operator           string  `json:"operator"`             // decrease_pct / increase_pct / above / below / equals / exists / sign_flip
	Threshold          float64 `json:"threshold"`            // 15 = 15%
	MinMentions        int     `json:"min_mentions"`         // 最少提及數才觸發
	MinAspectMentions  int     `json:"min_aspect_mentions"`  // 面向最少提及數
	ConsecutivePeriods int     `json:"consecutive_periods"`  // 連續幾期符合
}

// RuleActionConfig 規則動作配置（從 JSONB 反序列化）
type RuleActionConfig struct {
	Severity      string          `json:"severity"`       // info / warning / critical
	FactType      string          `json:"fact_type"`      // alert / trend / insight
	Traverse      *TraverseConfig `json:"traverse"`       // 沿關係傳播（可選）
	TitleTemplate string          `json:"title_template"` // Go template with {{.source.name}} etc
	BodyTemplate  string          `json:"body_template"`
}

// TraverseConfig 關係遍歷配置
type TraverseConfig struct {
	Relation  string `json:"relation"`  // relation slug: "belongs_to"
	Direction string `json:"direction"` // outgoing / incoming / both
}

// ============================================
// Typed Relations（取代 ObjectLink）
// ============================================

// ObjectRelation 有 schema 約束的 entity 關係
type ObjectRelation struct {
	ID             int64
	SourceID       string
	TargetID       string
	RelationTypeID int
	Confidence     float64 // LLM=0.8, manual=1.0, inferred=0.6
	Source         string  // llm / manual / inferred
	Properties     map[string]any
	CreatedAt      time.Time

	// Resolved references (populated on query)
	RelationType *RelationTypeDef
	SourceObject *Object
	TargetObject *Object
}
