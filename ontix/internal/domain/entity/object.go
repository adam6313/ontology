package entity

import "time"

// ObjectType Entity 類型
type ObjectType string

const (
	ObjectTypeBrand        ObjectType = "brand"        // 商業實體：公司、品牌、連鎖、平台
	ObjectTypeProduct      ObjectType = "product"      // 具體產品或商品
	ObjectTypePlace        ObjectType = "place"        // 可以去的地方：餐廳、店家、景點、城市
	ObjectTypePerson       ObjectType = "person"       // 人物：KOL、藝人、政治人物
	ObjectTypeWork         ObjectType = "work"         // 創作作品：電影、遊戲、音樂、書籍
	ObjectTypeEvent        ObjectType = "event"        // 活動：演唱會、展覽、週年慶
	ObjectTypeOrganization  ObjectType = "organization"   // 組織：政府、學校、醫院、NGO
	ObjectTypeContentTopic ObjectType = "content_topic"  // 可追蹤的內容主題
)

// TopicStatus 主題生命週期狀態
type TopicStatus string

const (
	TopicStatusEmerging TopicStatus = "emerging" // 新興：尚未通過晉升門檻
	TopicStatusActive   TopicStatus = "active"   // 活躍：≥3 篇 × ≥2 來源
	TopicStatusArchived TopicStatus = "archived" // 歸檔：連續 4 週無提及
)

// ObjectStatus Entity 狀態
type ObjectStatus string

const (
	ObjectStatusActive   ObjectStatus = "active"
	ObjectStatusMerged   ObjectStatus = "merged"   // 被合併到另一個 Entity
	ObjectStatusArchived ObjectStatus = "archived"
)

// Object 核心 Entity（品牌、產品、地方、人物、作品、活動、組織）
type Object struct {
	ID            string
	TypeID        int
	Type          ObjectType
	ClassID       *int              // ontology class ID（可為 nil = 尚未分類）
	CanonicalName string            // 正規名稱：麥當勞、iPhone 17
	Properties    map[string]any    // 彈性屬性：industry, category, price_range...
	Status        ObjectStatus
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// AliasSource 別名來源
type AliasSource string

const (
	AliasSourceSystem       AliasSource = "system"
	AliasSourceLLMDiscovered AliasSource = "llm_discovered"
	AliasSourceManual       AliasSource = "manual"
)

// ObjectAlias Entity 別名（用於消歧）
type ObjectAlias struct {
	ID         int64
	ObjectID   string
	Alias      string
	Source     AliasSource
	Confidence float64
	CreatedAt  time.Time
}

// ObjectLink Entity 之間的關係
type ObjectLink struct {
	ID         int64
	SourceID   string
	TargetID   string
	LinkType   string          // has_product, belongs_to_brand, located_in, endorses
	Properties map[string]any
	CreatedAt  time.Time
}

// PostEntityMention 貼文提及 Entity
type PostEntityMention struct {
	ID             int64
	PostID         string
	ObjectID       string
	Sentiment      string   // positive / negative / neutral / mixed
	SentimentScore float64
	MentionText    string   // 原文片段
	Source         string   // llm / manual / rule
	CreatedAt      time.Time
}

// EntityAspect Entity 的 Aspect 評價
type EntityAspect struct {
	ID             int64
	PostID         string
	ObjectID       string
	Aspect         string   // 薯條、服務、電池、相機...
	Sentiment      string   // positive / negative / neutral
	SentimentScore float64
	MentionText    string   // 原文片段
	CreatedAt      time.Time
}
