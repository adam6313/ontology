package entity

import "time"

// Tag 標籤
type Tag struct {
	ID        string
	Name      string
	Type      TagType
	CreatedAt time.Time
}

// TagType 標籤類型
type TagType string

const (
	TagTypeHard TagType = "hard" // 靜態硬標籤 (278 類)
	TagTypeSoft TagType = "soft" // 動態軟標籤 (LLM 生成)
)

// HardTag 硬標籤 (系統預定義)
type HardTag struct {
	Tag
	Category string // 大類別
}

// TagCategory 標籤類別
type TagCategory string

const (
	TagCategoryBrand    TagCategory = "brand"    // 品牌
	TagCategoryProduct  TagCategory = "product"  // 產品
	TagCategoryTopic    TagCategory = "topic"    // 主題
	TagCategorySentiment TagCategory = "sentiment" // 情緒
)

// PostTag 貼文與標籤的關聯
type PostTag struct {
	PostID     string      // Use original platform post ID
	TagID      string
	TagType    TagType     // hard / soft
	Category   TagCategory // brand / product / topic / sentiment
	Confidence float64
	Source     TagSource
	CreatedAt  time.Time
}

// TagSource 標籤來源
type TagSource string

const (
	TagSourceLLM      TagSource = "llm"
	TagSourceCluster  TagSource = "cluster"
	TagSourceManual   TagSource = "manual"
	TagSourceFeedback TagSource = "feedback"
)
