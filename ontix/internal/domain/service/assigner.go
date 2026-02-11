package service

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
)

// AssignResult 分配結果
type AssignResult struct {
	ClusterID    string
	ClusterName  string
	Similarity   float64
	Assigned     bool                   // 是否成功分配（相似度超過閾值）
	Confidence   entity.ConfidenceLevel // 置信度等級
	TagMatched   bool                   // tag 驗證是否通過
	RejectReason string                 // 拒絕原因（如果未分配）
}

// PostTags 貼文標籤（用於驗證）
type PostTags struct {
	Topics     []string // 主題標籤
	Brands     []string // 品牌標籤
	Products   []string // 產品標籤
	Sentiments []string // 情緒標籤
}

// AllTags 返回所有標籤
func (t *PostTags) AllTags() []string {
	all := make([]string, 0, len(t.Topics)+len(t.Brands)+len(t.Products))
	all = append(all, t.Topics...)
	all = append(all, t.Brands...)
	all = append(all, t.Products...)
	return all
}

// Assigner 貼文分配服務
type Assigner struct {
	centroidRepo    repository.CentroidRepository
	clusterRepo     repository.ClusterRepository
	threshold       float64 // 相似度閾值
	highConfidence  float64 // 高信心閾值（超過此值跳過 tag 驗證）
	tagValidation   bool    // 是否啟用 tag 驗證
}

// NewAssigner 建立 Assigner
func NewAssigner(centroidRepo repository.CentroidRepository, clusterRepo repository.ClusterRepository) *Assigner {
	return &Assigner{
		centroidRepo:   centroidRepo,
		clusterRepo:    clusterRepo,
		threshold:      0.5,  // 預設閾值 50%
		highConfidence: 0.85, // 高信心閾值 85%（超過此值跳過 tag 驗證）
		tagValidation:  true, // 預設啟用 tag 驗證
	}
}

// SetThreshold 設定相似度閾值
func (a *Assigner) SetThreshold(threshold float64) {
	a.threshold = threshold
}

// SetHighConfidenceThreshold 設定高信心閾值
func (a *Assigner) SetHighConfidenceThreshold(threshold float64) {
	a.highConfidence = threshold
}

// SetTagValidation 設定是否啟用 tag 驗證
func (a *Assigner) SetTagValidation(enabled bool) {
	a.tagValidation = enabled
}

// Assign 將貼文分配到最近的聚類（不帶 tag 驗證，向後相容）
func (a *Assigner) Assign(ctx context.Context, embedding entity.Vector) (*AssignResult, error) {
	return a.AssignWithTags(ctx, embedding, nil)
}

// AssignWithTags 將貼文分配到最近的聚類（帶 tag 驗證）
func (a *Assigner) AssignWithTags(ctx context.Context, embedding entity.Vector, tags *PostTags) (*AssignResult, error) {
	centroids, err := a.centroidRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	if len(centroids) == 0 {
		return &AssignResult{Assigned: false, RejectReason: "no_clusters"}, nil
	}

	// 計算與所有 centroid 的相似度
	type match struct {
		clusterID  string
		similarity float64
	}
	matches := make([]match, 0, len(centroids))

	for _, c := range centroids {
		sim := embedding.CosineSimilarity(c.Vector)
		matches = append(matches, match{
			clusterID:  c.ClusterID,
			similarity: sim,
		})
	}

	// 按相似度排序
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].similarity > matches[j].similarity
	})

	best := matches[0]

	// 相似度不足，直接拒絕
	if best.similarity < a.threshold {
		return &AssignResult{
			ClusterID:    best.clusterID,
			Similarity:   best.similarity,
			Assigned:     false,
			Confidence:   entity.ConfidenceLow,
			TagMatched:   false,
			RejectReason: "low_similarity",
		}, nil
	}

	// 高信心度，跳過 tag 驗證直接分配
	if best.similarity >= a.highConfidence {
		clusterName := a.getClusterName(ctx, best.clusterID)
		return &AssignResult{
			ClusterID:   best.clusterID,
			ClusterName: clusterName,
			Similarity:  best.similarity,
			Assigned:    true,
			Confidence:  entity.ConfidenceHigh,
			TagMatched:  true, // 高信心度視同 tag 驗證通過
		}, nil
	}

	// 中等相似度，執行 tag 驗證
	cluster, _ := a.clusterRepo.FindByID(ctx, best.clusterID)
	clusterName := ""
	if cluster != nil {
		clusterName = cluster.Name
	}

	tagMatched := true // 預設通過
	if a.tagValidation && tags != nil && len(tags.AllTags()) > 0 && cluster != nil {
		tagMatched = a.validateTagsWithCluster(tags, cluster)
	}

	// 新邏輯：tag 驗證失敗仍分配，但標記為低信心
	confidence := entity.ConfidenceMedium
	if !tagMatched {
		confidence = entity.ConfidenceLow
	}

	return &AssignResult{
		ClusterID:   best.clusterID,
		ClusterName: clusterName,
		Similarity:  best.similarity,
		Assigned:    true, // 即使 tag 不匹配也分配
		Confidence:  confidence,
		TagMatched:  tagMatched,
	}, nil
}

// getClusterName 取得 cluster 名稱
func (a *Assigner) getClusterName(ctx context.Context, clusterID string) string {
	if a.clusterRepo == nil {
		return ""
	}
	cluster, err := a.clusterRepo.FindByID(ctx, clusterID)
	if err != nil || cluster == nil {
		return ""
	}
	return cluster.Name
}

// validateTagsWithCluster 驗證 tags 是否與 cluster 相關
func (a *Assigner) validateTagsWithCluster(tags *PostTags, cluster *entity.Cluster) bool {
	// 建立 cluster 關鍵詞集合（名稱 + keywords）
	clusterTerms := make(map[string]bool)

	// 加入 cluster 名稱的每個字詞
	for _, word := range splitChineseWords(cluster.Name) {
		clusterTerms[strings.ToLower(word)] = true
	}

	// 加入 cluster keywords
	for _, kw := range cluster.Keywords {
		clusterTerms[strings.ToLower(kw)] = true
	}

	// 檢查 tags 是否有任何匹配
	allTags := tags.AllTags()
	for _, tag := range allTags {
		tagLower := strings.ToLower(tag)

		// 完全匹配
		if clusterTerms[tagLower] {
			return true
		}

		// 部分匹配（tag 包含 cluster 關鍵詞，或反過來）
		for term := range clusterTerms {
			if strings.Contains(tagLower, term) || strings.Contains(term, tagLower) {
				return true
			}
		}
	}

	return false
}

// splitChineseWords 簡單的中文分詞（按常見詞長度切分）
func splitChineseWords(s string) []string {
	words := []string{s} // 先加入完整字串

	runes := []rune(s)
	if len(runes) <= 2 {
		return words
	}

	// 2-gram
	for i := 0; i < len(runes)-1; i++ {
		words = append(words, string(runes[i:i+2]))
	}

	// 3-gram (如果長度足夠)
	if len(runes) >= 3 {
		for i := 0; i < len(runes)-2; i++ {
			words = append(words, string(runes[i:i+3]))
		}
	}

	return words
}

// AssignBatch 批次分配（不帶 tag 驗證）
func (a *Assigner) AssignBatch(ctx context.Context, embeddings []entity.Vector) ([]*AssignResult, error) {
	tagsList := make([]*PostTags, len(embeddings))
	return a.AssignBatchWithTags(ctx, embeddings, tagsList)
}

// AssignBatchWithTags 批次分配（帶 tag 驗證）
func (a *Assigner) AssignBatchWithTags(ctx context.Context, embeddings []entity.Vector, tagsList []*PostTags) ([]*AssignResult, error) {
	centroids, err := a.centroidRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	results := make([]*AssignResult, len(embeddings))

	if len(centroids) == 0 {
		for i := range results {
			results[i] = &AssignResult{Assigned: false, RejectReason: "no_clusters"}
		}
		return results, nil
	}

	// 預先載入所有 clusters（避免 N+1 查詢）
	clusterCache := make(map[string]*entity.Cluster)
	if a.tagValidation && a.clusterRepo != nil {
		clusters, err := a.clusterRepo.FindAll(ctx)
		if err == nil {
			for _, c := range clusters {
				clusterCache[fmt.Sprintf("%d", c.ID)] = c
			}
		}
	}

	for i, emb := range embeddings {
		var bestClusterID string
		var bestSim float64

		for _, c := range centroids {
			sim := emb.CosineSimilarity(c.Vector)
			if sim > bestSim {
				bestSim = sim
				bestClusterID = c.ClusterID
			}
		}

		// 相似度不足
		if bestSim < a.threshold {
			results[i] = &AssignResult{
				ClusterID:    bestClusterID,
				Similarity:   bestSim,
				Assigned:     false,
				Confidence:   entity.ConfidenceLow,
				TagMatched:   false,
				RejectReason: "low_similarity",
			}
			continue
		}

		// 高信心度，跳過驗證
		if bestSim >= a.highConfidence {
			cluster := clusterCache[bestClusterID]
			clusterName := ""
			if cluster != nil {
				clusterName = cluster.Name
			}
			results[i] = &AssignResult{
				ClusterID:   bestClusterID,
				ClusterName: clusterName,
				Similarity:  bestSim,
				Assigned:    true,
				Confidence:  entity.ConfidenceHigh,
				TagMatched:  true,
			}
			continue
		}

		// 中等相似度，執行 tag 驗證
		var tags *PostTags
		if i < len(tagsList) {
			tags = tagsList[i]
		}

		cluster := clusterCache[bestClusterID]
		clusterName := ""
		if cluster != nil {
			clusterName = cluster.Name
		}

		tagMatched := true
		if a.tagValidation && tags != nil && len(tags.AllTags()) > 0 && cluster != nil {
			tagMatched = a.validateTagsWithCluster(tags, cluster)
		}

		// 新邏輯：tag 驗證失敗仍分配，但標記為低信心
		confidence := entity.ConfidenceMedium
		if !tagMatched {
			confidence = entity.ConfidenceLow
		}

		results[i] = &AssignResult{
			ClusterID:   bestClusterID,
			ClusterName: clusterName,
			Similarity:  bestSim,
			Assigned:    true,
			Confidence:  confidence,
			TagMatched:  tagMatched,
		}
	}

	return results, nil
}
