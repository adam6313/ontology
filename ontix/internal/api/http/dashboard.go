package http

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// DashboardResponse Dashboard API 回應
type DashboardResponse struct {
	Stats            DashboardStats    `json:"stats"`
	Trends           []TrendItem       `json:"trends"`
	Topics           []TopicStats      `json:"topics"`
	LiveFeed         []LiveFeedPost    `json:"live_feed"`
	Aspects          []AspectStats     `json:"aspects"`
	TopTags          []SoftTagStats    `json:"top_tags"`
	EntityHighlights *EntityHighlights `json:"entity_highlights,omitempty"`
}

// EntityHighlights Ontology Entity 摘要（Dashboard 用）
type EntityHighlights struct {
	TopEntities      []EntityRankItem       `json:"top_entities"`
	RecentEntities   []RecentEntityItem     `json:"recent_entities"`
	SentimentRanking []EntitySentimentItem  `json:"sentiment_ranking"`
	TypeDistribution map[string]int         `json:"type_distribution"`
}

// EntityRankItem 被提及最多的 Entity
type EntityRankItem struct {
	ID            string  `json:"id"`
	CanonicalName string  `json:"canonical_name"`
	Type          string  `json:"type"`
	SubType       string  `json:"sub_type,omitempty"`
	MentionCount  int     `json:"mention_count"`
	AvgSentiment  float64 `json:"avg_sentiment"`
}

// RecentEntityItem 最近發現的新 Entity
type RecentEntityItem struct {
	ID            string `json:"id"`
	CanonicalName string `json:"canonical_name"`
	Type          string `json:"type"`
	SubType       string `json:"sub_type,omitempty"`
	CreatedAt     string `json:"created_at"`
}

// EntitySentimentItem 品牌情感排行
type EntitySentimentItem struct {
	ID            string  `json:"id"`
	CanonicalName string  `json:"canonical_name"`
	Type          string  `json:"type"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	MentionCount  int     `json:"mention_count"`
	PositiveRatio float64 `json:"positive_ratio"`
}

// DashboardStats 統計數據
type DashboardStats struct {
	TotalPosts    int64   `json:"total_posts"`
	PostsToday    int64   `json:"posts_today"`
	PostsThisWeek int64   `json:"posts_this_week"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	QueueLength   int64   `json:"queue_length"`
}

// TrendItem 趨勢項目
type TrendItem struct {
	ID         int64    `json:"id"`
	Name       string   `json:"name"`
	Count      int      `json:"count"`
	GrowthRate float64  `json:"growth_rate"`
	Keywords   []string `json:"keywords"`
	Trend      string   `json:"trend"` // emerging, hot, growing, stable, declining
}

// TopicStats 主題統計
type TopicStats struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	PostCount int    `json:"post_count"`
	Posts24h  int    `json:"posts_24h"`
}

// LiveFeedPost 即時動態貼文
type LiveFeedPost struct {
	PostID    string   `json:"post_id"`
	Content   string   `json:"content"`
	Sentiment string   `json:"sentiment"`
	Intent    string   `json:"intent"`
	SoftTags  []string `json:"soft_tags"`
	CreatedAt string   `json:"created_at"`
}

// AspectStats 面向統計
type AspectStats struct {
	Aspect        string  `json:"aspect"`
	Total         int     `json:"total"`
	PositiveCount int     `json:"positive_count"`
	NegativeCount int     `json:"negative_count"`
	NeutralCount  int     `json:"neutral_count"`
	PositiveRatio float64 `json:"positive_ratio"`
}

// SoftTagStats 軟標籤統計
type SoftTagStats struct {
	Tag           string  `json:"tag"`
	PostCount     int     `json:"post_count"`
	AvgConfidence float64 `json:"avg_confidence"`
}

// dashboard GET /api/dashboard?period=4w
func (s *Server) dashboard(c *gin.Context) {
	ctx := c.Request.Context()
	periodInterval := parsePeriodInterval(c.Query("period"))

	// 1. 取得基本統計
	stats := s.getDashboardStats(ctx, periodInterval)

	// 2. 取得趨勢（從 clusters）
	trends := s.getTrends(ctx)

	// 3. 取得主題統計
	topics := s.getTopicStats(ctx)

	// 4. 取得即時動態
	liveFeed := s.getLiveFeed(ctx, 10)

	// 5. 取得面向統計
	aspects := s.getAspectStats(ctx, 10)

	// 6. 取得熱門標籤
	topTags := s.getTopSoftTags(ctx, 15)

	// 7. 取得 Entity Highlights (Ontology)
	entityHighlights := s.getEntityHighlights(ctx, periodInterval)

	response := DashboardResponse{
		Stats:            stats,
		Trends:           trends,
		Topics:           topics,
		LiveFeed:         liveFeed,
		Aspects:          aspects,
		TopTags:          topTags,
		EntityHighlights: entityHighlights,
	}

	c.JSON(http.StatusOK, response)
}

func (s *Server) getDashboardStats(ctx context.Context, periodInterval string) DashboardStats {
	var stats DashboardStats

	if periodInterval != "" {
		// Period-filtered stats
		s.db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM posts WHERE created_at >= NOW() - $1::interval`, periodInterval).Scan(&stats.TotalPosts)
		s.db.Pool.QueryRow(ctx, `
			SELECT COALESCE(AVG(sentiment_score), 0.5) FROM posts
			WHERE sentiment_score IS NOT NULL AND created_at >= NOW() - $1::interval
		`, periodInterval).Scan(&stats.AvgSentiment)
	} else {
		// All-time stats
		s.db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM posts`).Scan(&stats.TotalPosts)
		s.db.Pool.QueryRow(ctx, `
			SELECT COALESCE(AVG(sentiment_score), 0.5) FROM posts
			WHERE sentiment_score IS NOT NULL
		`).Scan(&stats.AvgSentiment)
	}

	// Posts today (always)
	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM posts
		WHERE created_at > NOW() - INTERVAL '24 hours'
	`).Scan(&stats.PostsToday)

	// Posts this week (always)
	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM posts
		WHERE created_at > NOW() - INTERVAL '7 days'
	`).Scan(&stats.PostsThisWeek)

	// Queue length
	queueLen, _ := s.stream.Len(ctx)
	stats.QueueLength = queueLen

	return stats
}

func (s *Server) getTrends(ctx context.Context) []TrendItem {
	var trends []TrendItem

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			c.id,
			c.name,
			c.size,
			c.growth_rate,
			c.keywords,
			c.trend
		FROM clusters c
		WHERE c.status IN ('active', 'trending', 'emerging')
		ORDER BY c.size DESC
		LIMIT 10
	`)
	if err != nil {
		return trends
	}
	defer rows.Close()

	for rows.Next() {
		var t TrendItem
		var keywords []string
		var trend *string
		if err := rows.Scan(&t.ID, &t.Name, &t.Count, &t.GrowthRate, &keywords, &trend); err != nil {
			continue
		}
		t.Keywords = keywords
		if trend != nil {
			t.Trend = *trend
		} else {
			t.Trend = "stable"
		}
		trends = append(trends, t)
	}

	return trends
}

func (s *Server) getTopicStats(ctx context.Context) []TopicStats {
	var topics []TopicStats

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			t.id,
			t.name,
			COUNT(pt.post_id) as post_count,
			COUNT(pt.post_id) FILTER (WHERE pt.assigned_at > NOW() - INTERVAL '24 hours') as posts_24h
		FROM topics t
		LEFT JOIN post_topics pt ON t.id = pt.topic_id
		GROUP BY t.id, t.name
		ORDER BY post_count DESC
		LIMIT 10
	`)
	if err != nil {
		return topics
	}
	defer rows.Close()

	for rows.Next() {
		var t TopicStats
		if err := rows.Scan(&t.ID, &t.Name, &t.PostCount, &t.Posts24h); err != nil {
			continue
		}
		topics = append(topics, t)
	}

	return topics
}

func (s *Server) getLiveFeed(ctx context.Context, limit int) []LiveFeedPost {
	var posts []LiveFeedPost

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			p.post_id,
			p.content,
			COALESCE(p.sentiment, '') as sentiment,
			COALESCE(p.intent, '') as intent,
			COALESCE(
				(SELECT array_agg(tag ORDER BY confidence DESC)
				 FROM post_soft_tags pst WHERE pst.post_id = p.post_id LIMIT 3),
				'{}'::text[]
			) as soft_tags,
			p.created_at
		FROM posts p
		ORDER BY p.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return posts
	}
	defer rows.Close()

	for rows.Next() {
		var p LiveFeedPost
		var softTags []string
		var createdAt time.Time
		if err := rows.Scan(&p.PostID, &p.Content, &p.Sentiment, &p.Intent, &softTags, &createdAt); err != nil {
			continue
		}
		p.SoftTags = softTags
		p.CreatedAt = createdAt.Format(time.RFC3339)

		// 截斷內容
		if len(p.Content) > 150 {
			p.Content = p.Content[:150] + "..."
		}
		posts = append(posts, p)
	}

	return posts
}

func (s *Server) getAspectStats(ctx context.Context, limit int) []AspectStats {
	var aspects []AspectStats

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			aspect,
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
			COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
			COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
			ROUND(COUNT(*) FILTER (WHERE sentiment = 'positive')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as positive_ratio
		FROM post_aspects
		GROUP BY aspect
		ORDER BY total DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return aspects
	}
	defer rows.Close()

	for rows.Next() {
		var a AspectStats
		if err := rows.Scan(&a.Aspect, &a.Total, &a.PositiveCount, &a.NegativeCount, &a.NeutralCount, &a.PositiveRatio); err != nil {
			continue
		}
		aspects = append(aspects, a)
	}

	return aspects
}

// --- Entity Highlights ---

func (s *Server) getEntityHighlights(ctx context.Context, periodInterval string) *EntityHighlights {
	return &EntityHighlights{
		TopEntities:      s.getTopEntities(ctx, 10, periodInterval),
		RecentEntities:   s.getRecentEntities(ctx, 5),
		SentimentRanking: s.getEntitySentimentRanking(ctx, 10, periodInterval),
		TypeDistribution: s.getEntityTypeDistribution(ctx),
	}
}

// getTopEntities 被提及最多的 Entity（Top N）
func (s *Server) getTopEntities(ctx context.Context, limit int, periodInterval string) []EntityRankItem {
	var items []EntityRankItem

	periodFilter := ""
	queryArgs := []any{limit}
	if periodInterval != "" {
		periodFilter = " AND pem.created_at >= NOW() - $2::interval"
		queryArgs = append(queryArgs, periodInterval)
	}

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			o.id,
			o.canonical_name,
			ot.name as type,
			COALESCE(o.properties->>'sub_type', '') as sub_type,
			COUNT(pem.id) as mention_count,
			COALESCE(AVG(pem.sentiment_score), 0) as avg_sentiment
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		JOIN post_entity_mentions pem ON o.id = pem.object_id
		WHERE o.status = 'active'`+periodFilter+`
		GROUP BY o.id, o.canonical_name, ot.name, o.properties->>'sub_type'
		ORDER BY mention_count DESC
		LIMIT $1
	`, queryArgs...)
	if err != nil {
		return items
	}
	defer rows.Close()

	for rows.Next() {
		var e EntityRankItem
		if err := rows.Scan(&e.ID, &e.CanonicalName, &e.Type, &e.SubType, &e.MentionCount, &e.AvgSentiment); err != nil {
			continue
		}
		items = append(items, e)
	}
	return items
}

// getRecentEntities 最近發現的新 Entity
func (s *Server) getRecentEntities(ctx context.Context, limit int) []RecentEntityItem {
	var items []RecentEntityItem

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			o.id,
			o.canonical_name,
			ot.name as type,
			COALESCE(o.properties->>'sub_type', '') as sub_type,
			o.created_at
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.status = 'active'
		ORDER BY o.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return items
	}
	defer rows.Close()

	for rows.Next() {
		var e RecentEntityItem
		var createdAt time.Time
		if err := rows.Scan(&e.ID, &e.CanonicalName, &e.Type, &e.SubType, &createdAt); err != nil {
			continue
		}
		e.CreatedAt = createdAt.Format(time.RFC3339)
		items = append(items, e)
	}
	return items
}

// getEntitySentimentRanking 品牌情感排行（至少 2 次提及才列入）
func (s *Server) getEntitySentimentRanking(ctx context.Context, limit int, periodInterval string) []EntitySentimentItem {
	var items []EntitySentimentItem

	periodFilter := ""
	queryArgs := []any{limit}
	if periodInterval != "" {
		periodFilter = " AND pem.created_at >= NOW() - $2::interval"
		queryArgs = append(queryArgs, periodInterval)
	}

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			o.id,
			o.canonical_name,
			ot.name as type,
			COALESCE(AVG(pem.sentiment_score), 0) as avg_sentiment,
			COUNT(pem.id) as mention_count,
			ROUND(
				COUNT(pem.id) FILTER (WHERE pem.sentiment = 'positive')::NUMERIC
				/ NULLIF(COUNT(pem.id), 0) * 100, 1
			) as positive_ratio
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		JOIN post_entity_mentions pem ON o.id = pem.object_id
		WHERE o.status = 'active'`+periodFilter+`
		GROUP BY o.id, o.canonical_name, ot.name
		HAVING COUNT(pem.id) >= 2
		ORDER BY avg_sentiment DESC
		LIMIT $1
	`, queryArgs...)
	if err != nil {
		return items
	}
	defer rows.Close()

	for rows.Next() {
		var e EntitySentimentItem
		if err := rows.Scan(&e.ID, &e.CanonicalName, &e.Type, &e.AvgSentiment, &e.MentionCount, &e.PositiveRatio); err != nil {
			continue
		}
		items = append(items, e)
	}
	return items
}

// getEntityTypeDistribution Entity 類型分佈
func (s *Server) getEntityTypeDistribution(ctx context.Context) map[string]int {
	dist := make(map[string]int)

	rows, err := s.db.Pool.Query(ctx, `
		SELECT ot.name, COUNT(*)
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.status = 'active'
		GROUP BY ot.name
		ORDER BY COUNT(*) DESC
	`)
	if err != nil {
		return dist
	}
	defer rows.Close()

	for rows.Next() {
		var name string
		var count int
		if err := rows.Scan(&name, &count); err != nil {
			continue
		}
		dist[name] = count
	}
	return dist
}

func (s *Server) getTopSoftTags(ctx context.Context, limit int) []SoftTagStats {
	var tags []SoftTagStats

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			tag,
			COUNT(*) as post_count,
			AVG(confidence) as avg_confidence
		FROM post_soft_tags
		GROUP BY tag
		ORDER BY post_count DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return tags
	}
	defer rows.Close()

	for rows.Next() {
		var t SoftTagStats
		if err := rows.Scan(&t.Tag, &t.PostCount, &t.AvgConfidence); err != nil {
			continue
		}
		tags = append(tags, t)
	}

	return tags
}
