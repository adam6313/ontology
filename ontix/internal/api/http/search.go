package http

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pgvector/pgvector-go"
)

// SearchResult 搜尋結果
type SearchResult struct {
	PostID     string   `json:"post_id"`
	Content    string   `json:"content"`
	Similarity float64  `json:"similarity"`
	Sentiment  string   `json:"sentiment,omitempty"`
	Intent     string   `json:"intent,omitempty"`
	SoftTags   []string `json:"soft_tags,omitempty"`
}

// SearchResponse 搜尋回應
type SearchResponse struct {
	Query        string                `json:"query"`
	Results      []SearchResult        `json:"results"`
	Distribution SemanticDistribution  `json:"distribution"`
	Neighbors    []SemanticNeighbor    `json:"neighbors"`
}

// SemanticDistribution 語意分佈
type SemanticDistribution struct {
	Sentiments map[string]int `json:"sentiments"`
	Intents    map[string]int `json:"intents"`
	TopTags    []TagCount     `json:"top_tags"`
}

// TagCount 標籤計數
type TagCount struct {
	Tag   string `json:"tag"`
	Count int    `json:"count"`
}

// SemanticNeighbor 語意鄰居
type SemanticNeighbor struct {
	Term       string  `json:"term"`
	Similarity float64 `json:"similarity"`
}

// search GET /api/search?q=xxx&limit=20
func (s *Server) search(c *gin.Context) {
	ctx := c.Request.Context()
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	// 1. 產生查詢向量
	embedding, err := s.embedSvc.Embed(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate embedding"})
		return
	}

	// 2. 向量搜尋 (包含 sentiment, intent, soft_tags)
	dbQuery := `
		SELECT
			p.post_id,
			p.content,
			1 - (pe.embedding <=> $1::vector) as similarity,
			COALESCE(p.sentiment, '') as sentiment,
			COALESCE(p.intent, '') as intent,
			COALESCE(
				(SELECT array_agg(tag ORDER BY confidence DESC)
				 FROM post_soft_tags pst WHERE pst.post_id = p.post_id LIMIT 5),
				'{}'::text[]
			) as soft_tags
		FROM posts p
		JOIN post_embeddings pe ON p.post_id = pe.post_id
		ORDER BY pe.embedding <=> $1::vector
		LIMIT $2`

	rows, err := s.db.Pool.Query(ctx, dbQuery, pgvector.NewVector(embedding), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}
	defer rows.Close()

	var results []SearchResult
	sentimentCounts := make(map[string]int)
	intentCounts := make(map[string]int)
	tagCounts := make(map[string]int)

	for rows.Next() {
		var r SearchResult
		var softTags []string
		if err := rows.Scan(&r.PostID, &r.Content, &r.Similarity, &r.Sentiment, &r.Intent, &softTags); err != nil {
			continue
		}
		r.SoftTags = softTags

		// 截斷內容
		if len(r.Content) > 300 {
			r.Content = r.Content[:300] + "..."
		}

		results = append(results, r)

		// 統計分佈
		if r.Sentiment != "" {
			sentimentCounts[r.Sentiment]++
		}
		if r.Intent != "" {
			intentCounts[r.Intent]++
		}
		for _, tag := range softTags {
			tagCounts[tag]++
		}
	}

	// 3. 取得 Top Tags
	topTags := getTopTags(tagCounts, 10)

	// 4. 計算語意鄰居 (基於搜尋結果的高頻標籤)
	neighbors := computeSemanticNeighbors(tagCounts, 5)

	// 5. 回傳結果
	response := SearchResponse{
		Query:   query,
		Results: results,
		Distribution: SemanticDistribution{
			Sentiments: sentimentCounts,
			Intents:    intentCounts,
			TopTags:    topTags,
		},
		Neighbors: neighbors,
	}

	c.JSON(http.StatusOK, response)
}

// getTopTags 取得 Top N 標籤
func getTopTags(counts map[string]int, limit int) []TagCount {
	var tags []TagCount
	for tag, count := range counts {
		tags = append(tags, TagCount{Tag: tag, Count: count})
	}

	// 排序
	for i := 0; i < len(tags)-1; i++ {
		for j := i + 1; j < len(tags); j++ {
			if tags[j].Count > tags[i].Count {
				tags[i], tags[j] = tags[j], tags[i]
			}
		}
	}

	if len(tags) > limit {
		tags = tags[:limit]
	}
	return tags
}

// computeSemanticNeighbors 計算語意鄰居
func computeSemanticNeighbors(tagCounts map[string]int, limit int) []SemanticNeighbor {
	var neighbors []SemanticNeighbor

	// 基於標籤頻率計算相似度
	totalTags := 0
	for _, count := range tagCounts {
		totalTags += count
	}

	if totalTags == 0 {
		return neighbors
	}

	for tag, count := range tagCounts {
		similarity := float64(count) / float64(totalTags)
		neighbors = append(neighbors, SemanticNeighbor{
			Term:       tag,
			Similarity: similarity,
		})
	}

	// 排序
	for i := 0; i < len(neighbors)-1; i++ {
		for j := i + 1; j < len(neighbors); j++ {
			if neighbors[j].Similarity > neighbors[i].Similarity {
				neighbors[i], neighbors[j] = neighbors[j], neighbors[i]
			}
		}
	}

	if len(neighbors) > limit {
		neighbors = neighbors[:limit]
	}
	return neighbors
}
