package service

import "context"

// LLMService LLM 服務介面
type LLMService interface {
	GenerateTags(ctx context.Context, content string) ([]TagResult, error)
}

// TagCategory 標籤類別
type TagCategory string

const (
	TagCategoryBrand    TagCategory = "brand"    // 品牌：Apple, Samsung, MAC
	TagCategoryProduct  TagCategory = "product"  // 產品：iPhone, 口紅, 粉底
	TagCategoryTopic    TagCategory = "topic"    // 主題：開箱, 評測, 教學
	TagCategorySentiment TagCategory = "sentiment" // 情緒：推薦, 不推, 普通
)

// TagResult 標籤結果
type TagResult struct {
	Name       string
	Category   TagCategory
	Confidence float64
	IsHardTag  bool
	HardTagID  string
}
