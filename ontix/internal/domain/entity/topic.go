package entity

import "time"

// Topic 預定義主題
type Topic struct {
	ID          int
	Code        string    // 英文代碼 (e.g., "gaming")
	Name        string    // 中文名稱 (e.g., "遊戲")
	Description string    // 主題描述
	Embedding   Vector    // 主題的 embedding
	PostCount   int       // 該主題的貼文數量
	IsActive    bool      // 是否啟用
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// PostTopic 貼文與主題的關聯
type PostTopic struct {
	ID           int64
	PostID       int64
	TopicID      int
	Similarity   float64
	Confidence   ConfidenceLevel
	IsAmbiguous  bool    // 是否模糊分類
	KeywordBoost float64 // 關鍵字加權值
	AssignedAt   time.Time
}

// TopicCode 主題代碼常數
type TopicCode string

const (
	TopicGaming                TopicCode = "gaming"
	TopicBeautyAndFashion      TopicCode = "beauty_and_fashion"
	TopicHealth                TopicCode = "health"
	TopicFood                  TopicCode = "food"
	TopicArtAndEntertainment   TopicCode = "art_and_entertainment"
	TopicSports                TopicCode = "sports"
	TopicBusinessAndEconomics  TopicCode = "business_and_economics"
	TopicFamilyAndRelationships TopicCode = "family_and_relationships"
	TopicTechnology            TopicCode = "technology"
	TopicLawPoliticsAndSociety TopicCode = "law_politics_and_society"
	TopicTravel                TopicCode = "travel"
	TopicEducationWorkLearning TopicCode = "education_work_and_learning"
	TopicPets                  TopicCode = "pets"
	TopicLifestyle             TopicCode = "lifestyle"
	TopicReligionAndFortune    TopicCode = "religion_and_fortunetelling"
	TopicAdult                 TopicCode = "adult"
	TopicVehicles              TopicCode = "vehicles"
	TopicDailyConversation     TopicCode = "daily_conversation_topics"
	TopicClimateAndEnvironment TopicCode = "climate_and_environment"
)
