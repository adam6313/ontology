package service

import "context"

// EntityExtractionService LLM Entity 抽取介面
type EntityExtractionService interface {
	// ExtractEntities 從貼文內容中抽取 Entity 和歸屬的 Aspect
	// knownEntities: 系統中已知的 Entity 列表，注入 Prompt 讓 LLM 做消歧
	ExtractEntities(ctx context.Context, content string, knownEntities []KnownEntity) (*EntityExtractionResult, error)
}

// KnownEntity 已知 Entity（注入 Prompt 用）
type KnownEntity struct {
	CanonicalName string
	Type          string
	ClassName     string // ontology class slug（如 venue, creator, brand）
	Category      string // content_topic 專用：美妝/穿搭/美食 etc.
}

// EntityExtractionResult LLM 抽取結果
type EntityExtractionResult struct {
	Entities      []ExtractedEntity      `json:"entities"`
	Relationships []ExtractedRelationship `json:"relationships"`
}

// ExtractedRelationship LLM 識別出的 Entity 間關係
type ExtractedRelationship struct {
	Source   string `json:"source"`    // 來源 Entity 名稱（須與 entities[].name 一致）
	Target   string `json:"target"`    // 目標 Entity 名稱
	LinkType string `json:"link_type"` // 舊欄位（backward compat）
	Relation string `json:"relation"`  // ontology relation slug（優先使用）
}

// ExtractedEntity LLM 識別出的 Entity
type ExtractedEntity struct {
	Name           string           `json:"name"`            // 如果匹配已知 Entity 則用 canonical_name
	Type           string           `json:"type"`            // brand / product / place / person / work / event / organization / content_topic
	Class          string           `json:"class"`           // ontology class slug（優先使用）
	SubType        string           `json:"sub_type"`        // 細分類型：restaurant / cafe / salon / movie / concert...
	Category       string           `json:"category"`        // content_topic 專用：美妝/穿搭/美食/旅遊/3C/生活/健身/寵物/其他
	Sentiment      string           `json:"sentiment"`       // positive / negative / neutral / mixed
	SentimentScore float64          `json:"sentiment_score"` // 0.0 ~ 1.0
	MentionText    string           `json:"mention_text"`    // 原文片段
	Aspects        []EntityAspectLLM `json:"aspects"`        // 歸屬此 Entity 的 Aspect
}

// PostForExtraction 待 Entity 抽取的貼文
type PostForExtraction struct {
	PostID  string
	Content string
}

// EntityAspectLLM LLM 回傳的 Entity Aspect
type EntityAspectLLM struct {
	Aspect         string  `json:"aspect"`          // 面向：薯條、服務、電池...
	Sentiment      string  `json:"sentiment"`       // positive / negative / neutral
	SentimentScore float64 `json:"sentiment_score"` // 0.0 ~ 1.0
	Mention        string  `json:"mention"`         // 原文片段
}
