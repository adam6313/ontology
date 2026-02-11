package service

import (
	"context"
	"sort"
	"strings"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
)

// TopicAssignResult 主題分配結果
type TopicAssignResult struct {
	TopicID      int
	TopicCode    string
	TopicName    string
	Similarity   float64
	Confidence   entity.ConfidenceLevel
	Assigned     bool
	IsAmbiguous  bool    // 是否模糊分類 (top1-top2 gap < 0.02)
	KeywordBoost float64 // 關鍵字加權值
}

// KeywordRule 關鍵字加權規則
type KeywordRule struct {
	Keywords  []string // 關鍵字列表
	TopicCode string   // 目標主題代碼
	Boost     float64  // 加權值
}

// 預設關鍵字規則（根據數據分析結果）
var defaultKeywordRules = []KeywordRule{
	// 美妝時尚
	{Keywords: []string{"髮型", "髮色", "染髮", "燙髮", "瀏海", "剪髮", "美髮", "髮廊", "設計師", "羊毛卷", "韓系髮", "氛圍感"}, TopicCode: "beauty_and_fashion", Boost: 0.05},
	{Keywords: []string{"美甲", "指甲", "光療", "凝膠"}, TopicCode: "beauty_and_fashion", Boost: 0.05},
	{Keywords: []string{"妝容", "彩妝", "眼妝", "唇彩", "化妝"}, TopicCode: "beauty_and_fashion", Boost: 0.05},

	// 健康
	{Keywords: []string{"瘦身", "減肥", "減重", "代謝", "體重", "健身", "運動"}, TopicCode: "health", Boost: 0.05},
	{Keywords: []string{"保健", "營養", "維他命", "膠囊", "保養品"}, TopicCode: "health", Boost: 0.03},

	// 美食
	{Keywords: []string{"餐廳", "好吃", "美味", "料理", "食譜", "小吃", "甜點", "咖啡廳"}, TopicCode: "food", Boost: 0.05},
	{Keywords: []string{"早餐", "午餐", "晚餐", "下午茶", "宵夜"}, TopicCode: "food", Boost: 0.03},

	// 旅遊
	{Keywords: []string{"旅遊", "旅行", "景點", "自由行", "觀光", "住宿", "飯店", "民宿"}, TopicCode: "travel", Boost: 0.05},
	{Keywords: []string{"機票", "行程", "打卡", "必去"}, TopicCode: "travel", Boost: 0.03},

	// 寵物
	{Keywords: []string{"狗狗", "貓咪", "毛小孩", "寵物", "汪星人", "喵星人"}, TopicCode: "pets", Boost: 0.05},

	// 科技
	{Keywords: []string{"手機", "電腦", "3C", "科技", "APP", "軟體"}, TopicCode: "technology", Boost: 0.05},
}

// TopicAssigner 主題分配服務
type TopicAssigner struct {
	topicRepo       repository.TopicRepository
	threshold       float64 // 最低相似度閾值
	highThreshold   float64 // 高信心閾值
	ambiguousGap    float64 // 模糊分類的 gap 閾值
	topicCache      []*entity.Topic
	keywordRules    []KeywordRule
	enableKeywords  bool // 是否啟用關鍵字加權
}

// NewTopicAssigner 建立 TopicAssigner
func NewTopicAssigner(topicRepo repository.TopicRepository) *TopicAssigner {
	return &TopicAssigner{
		topicRepo:      topicRepo,
		threshold:      0.25, // 主題分類閾值（降低以提高召回率）
		highThreshold:  0.40, // 高信心閾值
		ambiguousGap:   0.02, // gap < 0.02 視為模糊
		keywordRules:   defaultKeywordRules,
		enableKeywords: true, // 預設啟用關鍵字加權
	}
}

// SetEnableKeywords 設定是否啟用關鍵字加權
func (a *TopicAssigner) SetEnableKeywords(enable bool) {
	a.enableKeywords = enable
}

// SetKeywordRules 設定關鍵字規則
func (a *TopicAssigner) SetKeywordRules(rules []KeywordRule) {
	a.keywordRules = rules
}

// calculateKeywordBoosts 計算每個主題的關鍵字加權
func (a *TopicAssigner) calculateKeywordBoosts(content string) map[string]float64 {
	boosts := make(map[string]float64)
	if !a.enableKeywords || content == "" {
		return boosts
	}

	contentLower := strings.ToLower(content)
	for _, rule := range a.keywordRules {
		for _, keyword := range rule.Keywords {
			if strings.Contains(contentLower, strings.ToLower(keyword)) {
				// 累加 boost（同一主題可能多個關鍵字命中）
				if boosts[rule.TopicCode] < rule.Boost {
					boosts[rule.TopicCode] = rule.Boost // 取最大值而非累加，避免過度加權
				}
				break // 一個規則只算一次
			}
		}
	}
	return boosts
}

// SetThreshold 設定相似度閾值
func (a *TopicAssigner) SetThreshold(threshold float64) {
	a.threshold = threshold
}

// SetHighThreshold 設定高信心閾值
func (a *TopicAssigner) SetHighThreshold(threshold float64) {
	a.highThreshold = threshold
}

// LoadTopics 載入所有主題到快取
func (a *TopicAssigner) LoadTopics(ctx context.Context) error {
	topics, err := a.topicRepo.FindAll(ctx)
	if err != nil {
		return err
	}
	a.topicCache = topics
	return nil
}

// Assign 將貼文分配到最相似的主題（不使用關鍵字加權）
func (a *TopicAssigner) Assign(ctx context.Context, embedding entity.Vector) (*TopicAssignResult, error) {
	return a.AssignWithContent(ctx, embedding, "")
}

// AssignWithContent 將貼文分配到最相似的主題（使用關鍵字加權）
func (a *TopicAssigner) AssignWithContent(ctx context.Context, embedding entity.Vector, content string) (*TopicAssignResult, error) {
	// 確保快取已載入
	if len(a.topicCache) == 0 {
		if err := a.LoadTopics(ctx); err != nil {
			return nil, err
		}
	}

	// 計算關鍵字加權
	keywordBoosts := a.calculateKeywordBoosts(content)

	// 計算與所有主題的相似度
	type match struct {
		topic        *entity.Topic
		similarity   float64 // 原始相似度
		boostedSim   float64 // 加權後相似度
		keywordBoost float64 // 關鍵字加權值
	}
	var matches []match

	for _, t := range a.topicCache {
		if len(t.Embedding) == 0 {
			continue // 跳過沒有 embedding 的主題
		}
		sim := embedding.CosineSimilarity(t.Embedding)
		boost := keywordBoosts[t.Code]
		matches = append(matches, match{
			topic:        t,
			similarity:   sim,
			boostedSim:   sim + boost,
			keywordBoost: boost,
		})
	}

	if len(matches) == 0 {
		return &TopicAssignResult{Assigned: false}, nil
	}

	// 按加權後相似度排序
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].boostedSim > matches[j].boostedSim
	})

	best := matches[0]

	// 計算 gap 判斷是否模糊
	isAmbiguous := false
	if len(matches) > 1 {
		gap := best.boostedSim - matches[1].boostedSim
		isAmbiguous = gap < a.ambiguousGap
	}

	// 判斷信心等級（使用原始相似度）
	var confidence entity.ConfidenceLevel
	assigned := true

	if best.similarity >= a.highThreshold {
		confidence = entity.ConfidenceHigh
	} else if best.similarity >= a.threshold {
		confidence = entity.ConfidenceMedium
	} else {
		confidence = entity.ConfidenceLow
		// 即使低於閾值也分配，但標記為低信心（歸入「日常話題」）
		for _, m := range matches {
			if m.topic.Code == "daily_conversation_topics" {
				best = m
				break
			}
		}
	}

	return &TopicAssignResult{
		TopicID:      best.topic.ID,
		TopicCode:    best.topic.Code,
		TopicName:    best.topic.Name,
		Similarity:   best.similarity, // 回傳原始相似度
		Confidence:   confidence,
		Assigned:     assigned,
		IsAmbiguous:  isAmbiguous,
		KeywordBoost: best.keywordBoost,
	}, nil
}

// AssignBatch 批次分配
func (a *TopicAssigner) AssignBatch(ctx context.Context, embeddings []entity.Vector) ([]*TopicAssignResult, error) {
	// 確保快取已載入
	if len(a.topicCache) == 0 {
		if err := a.LoadTopics(ctx); err != nil {
			return nil, err
		}
	}

	results := make([]*TopicAssignResult, len(embeddings))
	for i, emb := range embeddings {
		result, err := a.Assign(ctx, emb)
		if err != nil {
			return nil, err
		}
		results[i] = result
	}
	return results, nil
}

// TopicScore 單一主題的分數（用於記錄完整分數）
type TopicScore struct {
	TopicID    int
	Similarity float64
	Rank       int
}

// GetAllScores 取得對所有主題的相似度分數
func (a *TopicAssigner) GetAllScores(ctx context.Context, embedding entity.Vector) ([]TopicScore, error) {
	// 確保快取已載入
	if len(a.topicCache) == 0 {
		if err := a.LoadTopics(ctx); err != nil {
			return nil, err
		}
	}

	scores := make([]TopicScore, 0, len(a.topicCache))
	for _, t := range a.topicCache {
		if len(t.Embedding) == 0 {
			continue
		}
		sim := embedding.CosineSimilarity(t.Embedding)
		scores = append(scores, TopicScore{
			TopicID:    t.ID,
			Similarity: sim,
		})
	}

	// 按相似度排序並設定 rank
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Similarity > scores[j].Similarity
	})

	for i := range scores {
		scores[i].Rank = i + 1
	}

	return scores, nil
}

// GetTopMatches 取得前 N 個最相似的主題
func (a *TopicAssigner) GetTopMatches(ctx context.Context, embedding entity.Vector, n int) ([]*TopicAssignResult, error) {
	// 確保快取已載入
	if len(a.topicCache) == 0 {
		if err := a.LoadTopics(ctx); err != nil {
			return nil, err
		}
	}

	type match struct {
		topic      *entity.Topic
		similarity float64
	}
	var matches []match

	for _, t := range a.topicCache {
		if len(t.Embedding) == 0 {
			continue
		}
		sim := embedding.CosineSimilarity(t.Embedding)
		matches = append(matches, match{topic: t, similarity: sim})
	}

	sort.Slice(matches, func(i, j int) bool {
		return matches[i].similarity > matches[j].similarity
	})

	if n > len(matches) {
		n = len(matches)
	}

	results := make([]*TopicAssignResult, n)
	for i := 0; i < n; i++ {
		m := matches[i]
		confidence := entity.ConfidenceLow
		if m.similarity >= a.highThreshold {
			confidence = entity.ConfidenceHigh
		} else if m.similarity >= a.threshold {
			confidence = entity.ConfidenceMedium
		}

		results[i] = &TopicAssignResult{
			TopicID:    m.topic.ID,
			TopicCode:  m.topic.Code,
			TopicName:  m.topic.Name,
			Similarity: m.similarity,
			Confidence: confidence,
			Assigned:   m.similarity >= a.threshold,
		}
	}
	return results, nil
}
