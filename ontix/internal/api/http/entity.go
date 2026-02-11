package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ikala/ontix/internal/domain/service"
)

// --- Response Types ---

// EntitySummary Entity 摘要（列表用）
type EntitySummary struct {
	ID            string  `json:"id"`
	CanonicalName string  `json:"canonical_name"`
	Type          string  `json:"type"`
	SubType       string  `json:"sub_type,omitempty"`
	MentionCount  int     `json:"mention_count"`
	AspectCount   int     `json:"aspect_count"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	MentionDelta  *int    `json:"mention_delta,omitempty"`
	Sparkline     []int   `json:"sparkline,omitempty"`
}

// EntityDetailResponse GET /api/entities/:id 回應
type EntityDetailResponse struct {
	ID            string                `json:"id"`
	CanonicalName string                `json:"canonical_name"`
	Type          string                `json:"type"`
	SubType       string                `json:"sub_type,omitempty"`
	Status        string                `json:"status"`
	Properties    map[string]any        `json:"properties,omitempty"`
	CreatedAt     string                `json:"created_at"`
	Aliases       []string              `json:"aliases"`
	Stats         EntityDetailStats     `json:"stats"`
	TopAspects    []EntityAspectSummary `json:"top_aspects,omitempty"`
	Links         []EntityLinkItem      `json:"links,omitempty"`
	Mentions      []EntityMentionItem   `json:"recent_mentions,omitempty"`
}

// EntityDetailStats Entity 統計
type EntityDetailStats struct {
	MentionCount  int     `json:"mention_count"`
	AspectCount   int     `json:"aspect_count"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	PositiveCount int     `json:"positive_count"`
	NegativeCount int     `json:"negative_count"`
	NeutralCount  int     `json:"neutral_count"`
	MixedCount    int     `json:"mixed_count"`
}

// EntityAspectSummary Aspect 摘要
type EntityAspectSummary struct {
	Aspect        string  `json:"aspect"`
	Total         int     `json:"total"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	PositiveCount int     `json:"positive_count"`
	NegativeCount int     `json:"negative_count"`
	NeutralCount  int     `json:"neutral_count"`
}

// EntityLinkItem Entity 之間的關係
type EntityLinkItem struct {
	Direction  string `json:"direction"`
	LinkedID   string `json:"linked_id"`
	LinkedName string `json:"linked_name"`
	LinkedType string `json:"linked_type"`
	LinkType   string `json:"link_type"`
	CreatedAt  string `json:"created_at"`
}

// EntityMentionItem 貼文提及
type EntityMentionItem struct {
	PostID         string  `json:"post_id"`
	Content        string  `json:"content"`
	Sentiment      string  `json:"sentiment"`
	SentimentScore float64 `json:"sentiment_score"`
	MentionText    string  `json:"mention_text"`
	AuthorName     string  `json:"author_name"`
	Platform       string  `json:"platform"`
	CreatedAt      string  `json:"created_at"`
}

// EntityTypeItem Entity type 統計
type EntityTypeItem struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	EntityCount int    `json:"entity_count"`
}

// Graph API types (nodes reuse EntitySummary)
type GraphEdge struct {
	SourceID string `json:"source_id"`
	TargetID string `json:"target_id"`
	LinkType string `json:"link_type"`
}

type GraphResponse struct {
	Nodes []EntitySummary `json:"nodes"`
	Edges []GraphEdge     `json:"edges"`
}

// ObservationItem 觀測趨勢資料點
type ObservationItem struct {
	PeriodStart   string  `json:"period_start"`
	PeriodType    string  `json:"period_type"`
	MentionCount  int     `json:"mention_count"`
	AvgSentiment  float64 `json:"avg_sentiment"`
	PositiveCount int     `json:"positive_count"`
	NegativeCount int     `json:"negative_count"`
	NeutralCount  int     `json:"neutral_count"`
	MixedCount    int     `json:"mixed_count"`
}

// --- Handlers ---

// listEntities GET /api/entities?type=brand&sub_type=beauty&q=麥當&sentiment_min=0.3&mention_min=5&sort=mention_count&order=desc&offset=0&limit=50
func (s *Server) listEntities(c *gin.Context) {
	ctx := c.Request.Context()
	params := parseEntityListParams(c)

	entities, total := s.getEntityListV2(ctx, params)
	respondList(c, entities, params.Offset, params.Limit, total)
}

// getEntity GET /api/entities/:id?include=aspects,mentions,links
func (s *Server) getEntity(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	// Parse include parameter
	includeParam := c.Query("include")
	includeAll := includeParam == ""
	includes := map[string]bool{}
	if !includeAll {
		for _, part := range strings.Split(includeParam, ",") {
			includes[strings.TrimSpace(part)] = true
		}
	}

	detail := s.getEntityDetail(ctx, id, includeAll, includes, c.Query("period"))
	if detail == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	}

	respondOne(c, detail)
}

// getEntityAspects GET /api/entities/:id/aspects?q=服務&sentiment=positive&sort=total&order=desc&offset=0&limit=20
func (s *Server) getEntityAspects(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	params := parseAspectListParams(c)

	aspects, total := s.getEntityAspectStatsV2(ctx, id, params)
	respondList(c, aspects, params.Offset, params.Limit, total)
}

// getEntityMentions GET /api/entities/:id/mentions?sentiment=positive&sort=created_at&order=desc&offset=0&limit=20
func (s *Server) getEntityMentions(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	params := parseMentionListParams(c)

	mentions, total := s.getEntityMentionListV2(ctx, id, params)
	respondList(c, mentions, params.Offset, params.Limit, total)
}

// getEntityLinks GET /api/entities/:id/links
func (s *Server) getEntityLinks(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	links := s.getEntityLinkList(ctx, id)
	respondOne(c, links)
}

// getEntityTypes GET /api/entity-types
func (s *Server) getEntityTypes(c *gin.Context) {
	ctx := c.Request.Context()

	var types []EntityTypeItem
	rows, err := s.db.Pool.Query(ctx, `
		SELECT ot.name, ot.display_name, COUNT(o.id) as entity_count
		FROM object_types ot
		LEFT JOIN objects o ON ot.id = o.type_id AND o.status = 'active'
		GROUP BY ot.name, ot.display_name
		ORDER BY entity_count DESC
	`)
	if err != nil {
		respondOne(c, types)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var t EntityTypeItem
		if err := rows.Scan(&t.Name, &t.DisplayName, &t.EntityCount); err != nil {
			continue
		}
		types = append(types, t)
	}

	respondOne(c, types)
}

// --- Query Methods ---

func (s *Server) getEntityListV2(ctx context.Context, p EntityListParams) ([]EntitySummary, int) {
	var entities []EntitySummary

	periodInterval := parsePeriodInterval(p.Period)

	// Build FROM clause: materialized view (all-time) or subquery (period-filtered)
	var fromSQL string
	args := []any{}
	argIdx := 1

	if periodInterval != "" {
		fromSQL = `(
			SELECT pem.object_id, o2.canonical_name, ot.name as object_type,
				COUNT(*) as mention_count,
				COALESCE(AVG(pem.sentiment_score), 0) as avg_sentiment_score
			FROM post_entity_mentions pem
			JOIN objects o2 ON pem.object_id = o2.id
			JOIN object_types ot ON o2.type_id = ot.id
			WHERE pem.created_at >= NOW() - $1::interval
			GROUP BY pem.object_id, o2.canonical_name, ot.name
		) es`
		args = append(args, periodInterval)
		argIdx = 2
	} else {
		fromSQL = "entity_stats es"
	}

	// Build WHERE clauses
	whereClauses := []string{}

	if p.Type != "" {
		whereClauses = append(whereClauses, "es.object_type = $"+strconv.Itoa(argIdx))
		args = append(args, p.Type)
		argIdx++
	}

	if p.SubType != "" {
		whereClauses = append(whereClauses, "COALESCE(o.properties->>'sub_type', '') = $"+strconv.Itoa(argIdx))
		args = append(args, p.SubType)
		argIdx++
	}

	if p.Q != "" {
		whereClauses = append(whereClauses, "(es.canonical_name ILIKE '%' || $"+strconv.Itoa(argIdx)+" || '%' OR EXISTS (SELECT 1 FROM object_aliases oa WHERE oa.object_id = es.object_id AND oa.alias ILIKE '%' || $"+strconv.Itoa(argIdx)+" || '%'))")
		args = append(args, p.Q)
		argIdx++
	}

	if p.SentimentMin != nil {
		whereClauses = append(whereClauses, "COALESCE(es.avg_sentiment_score, 0) >= $"+strconv.Itoa(argIdx))
		args = append(args, *p.SentimentMin)
		argIdx++
	}

	if p.SentimentMax != nil {
		whereClauses = append(whereClauses, "COALESCE(es.avg_sentiment_score, 0) <= $"+strconv.Itoa(argIdx))
		args = append(args, *p.SentimentMax)
		argIdx++
	}

	if p.MentionMin != nil {
		whereClauses = append(whereClauses, "es.mention_count >= $"+strconv.Itoa(argIdx))
		args = append(args, *p.MentionMin)
		argIdx++
	}

	if p.MentionMax != nil {
		whereClauses = append(whereClauses, "es.mention_count <= $"+strconv.Itoa(argIdx))
		args = append(args, *p.MentionMax)
		argIdx++
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Count query
	countQuery := `SELECT COUNT(*) FROM ` + fromSQL + ` JOIN objects o ON es.object_id = o.id` + whereSQL

	var total int
	if err := s.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return entities, 0
	}

	// Data query
	orderBy := resolveSort(p.Sort, p.Order, entitySortWhitelist, "es.mention_count")
	dataQuery := `
		SELECT
			es.object_id,
			es.canonical_name,
			es.object_type,
			COALESCE(o.properties->>'sub_type', '') as sub_type,
			es.mention_count,
			COALESCE((SELECT COUNT(*) FROM entity_aspect_stats eas WHERE eas.object_id = es.object_id), 0) as aspect_count,
			COALESCE(es.avg_sentiment_score, 0) as avg_sentiment,
			(SELECT cur.mention_count - prev.mention_count
			 FROM entity_observations cur
			 LEFT JOIN entity_observations prev
			   ON prev.object_id = cur.object_id AND prev.period_type = cur.period_type
			   AND prev.period_start = (SELECT MAX(p2.period_start) FROM entity_observations p2
			     WHERE p2.object_id = cur.object_id AND p2.period_type = 'week' AND p2.period_start < cur.period_start)
			 WHERE cur.object_id = es.object_id AND cur.period_type = 'week'
			 ORDER BY cur.period_start DESC LIMIT 1
			) as mention_delta
		FROM ` + fromSQL + `
		JOIN objects o ON es.object_id = o.id
	` + whereSQL + `
		ORDER BY ` + orderBy + `, es.canonical_name
		LIMIT $` + strconv.Itoa(argIdx) + ` OFFSET $` + strconv.Itoa(argIdx+1)

	dataArgs := append(args, p.Limit, p.Offset)

	rows, err := s.db.Pool.Query(ctx, dataQuery, dataArgs...)
	if err != nil {
		return entities, total
	}
	defer rows.Close()

	for rows.Next() {
		var e EntitySummary
		if err := rows.Scan(&e.ID, &e.CanonicalName, &e.Type, &e.SubType, &e.MentionCount, &e.AspectCount, &e.AvgSentiment, &e.MentionDelta); err != nil {
			continue
		}
		entities = append(entities, e)
	}

	// Batch load sparkline (last 8 weeks) for all entities
	if len(entities) > 0 {
		ids := make([]string, len(entities))
		for i, e := range entities {
			ids[i] = e.ID
		}
		sparkRows, err := s.db.Pool.Query(ctx, `
			SELECT object_id, array_agg(mention_count ORDER BY period_start) as sparkline
			FROM (
				SELECT object_id, period_start, mention_count
				FROM entity_observations
				WHERE object_id = ANY($1) AND period_type = 'week'
				ORDER BY period_start DESC
			) sub
			WHERE period_start >= (SELECT MAX(period_start) FROM entity_observations WHERE period_type = 'week') - INTERVAL '7 weeks'
			GROUP BY object_id
		`, ids)
		if err == nil {
			defer sparkRows.Close()
			sparkMap := make(map[string][]int)
			for sparkRows.Next() {
				var oid string
				var vals []int
				if err := sparkRows.Scan(&oid, &vals); err == nil {
					sparkMap[oid] = vals
				}
			}
			for i := range entities {
				if sp, ok := sparkMap[entities[i].ID]; ok {
					entities[i].Sparkline = sp
				}
			}
		}
	}

	return entities, total
}

func (s *Server) getEntityDetail(ctx context.Context, id string, includeAll bool, includes map[string]bool, period ...string) *EntityDetailResponse {
	periodInterval := ""
	if len(period) > 0 {
		periodInterval = parsePeriodInterval(period[0])
	}
	// 1. 基本資訊
	var detail EntityDetailResponse
	var createdAt time.Time
	var propsJSON []byte
	err := s.db.Pool.QueryRow(ctx, `
		SELECT
			o.id,
			o.canonical_name,
			ot.name as type,
			COALESCE(o.properties->>'sub_type', '') as sub_type,
			o.status,
			COALESCE(o.properties, '{}'::jsonb) as properties,
			o.created_at
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.id = $1
	`, id).Scan(&detail.ID, &detail.CanonicalName, &detail.Type, &detail.SubType, &detail.Status, &propsJSON, &createdAt)
	if err == nil && len(propsJSON) > 0 {
		_ = json.Unmarshal(propsJSON, &detail.Properties)
	}
	if err != nil {
		return nil
	}
	detail.CreatedAt = createdAt.Format(time.RFC3339)

	// 2. 別名
	detail.Aliases = s.getEntityAliases(ctx, id)

	// 3. Mention 統計 (with optional period filter)
	statsQuery := `
		SELECT
			COUNT(*) as mention_count,
			COALESCE(AVG(sentiment_score), 0) as avg_sentiment,
			COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
			COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
			COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
			COUNT(*) FILTER (WHERE sentiment = 'mixed') as mixed_count
		FROM post_entity_mentions
		WHERE object_id = $1`
	statsArgs := []any{id}
	if periodInterval != "" {
		statsQuery += " AND created_at >= NOW() - $2::interval"
		statsArgs = append(statsArgs, periodInterval)
	}
	s.db.Pool.QueryRow(ctx, statsQuery, statsArgs...).Scan(
		&detail.Stats.MentionCount,
		&detail.Stats.AvgSentiment,
		&detail.Stats.PositiveCount,
		&detail.Stats.NegativeCount,
		&detail.Stats.NeutralCount,
		&detail.Stats.MixedCount,
	)

	// 4. Aspect 數量
	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM entity_aspects WHERE object_id = $1
	`, id).Scan(&detail.Stats.AspectCount)

	// 5. Top Aspects (if included)
	if includeAll || includes["aspects"] {
		aspects, _ := s.getEntityAspectStatsV2(ctx, id, AspectListParams{Limit: 10})
		detail.TopAspects = aspects
	}

	// 6. Links (if included)
	if includeAll || includes["links"] {
		detail.Links = s.getEntityLinkList(ctx, id)
	}

	// 7. Recent Mentions (if included)
	if includeAll || includes["mentions"] {
		mentions, _ := s.getEntityMentionListV2(ctx, id, MentionListParams{Limit: 10})
		detail.Mentions = mentions
	}

	return &detail
}

func (s *Server) getEntityAliases(ctx context.Context, id string) []string {
	var aliases []string

	rows, err := s.db.Pool.Query(ctx, `
		SELECT alias FROM object_aliases
		WHERE object_id = $1
		ORDER BY source, created_at
	`, id)
	if err != nil {
		return aliases
	}
	defer rows.Close()

	for rows.Next() {
		var alias string
		if err := rows.Scan(&alias); err != nil {
			continue
		}
		aliases = append(aliases, alias)
	}

	return aliases
}

func (s *Server) getEntityAspectStatsV2(ctx context.Context, id string, p AspectListParams) ([]EntityAspectSummary, int) {
	var aspects []EntityAspectSummary

	whereClauses := []string{"object_id = $1"}
	args := []any{id}
	argIdx := 2

	if p.Q != "" {
		whereClauses = append(whereClauses, "aspect ILIKE '%' || $"+strconv.Itoa(argIdx)+" || '%'")
		args = append(args, p.Q)
		argIdx++
	}

	switch p.Sentiment {
	case "positive":
		whereClauses = append(whereClauses, "positive_count > negative_count AND positive_count > neutral_count")
	case "negative":
		whereClauses = append(whereClauses, "negative_count > positive_count AND negative_count > neutral_count")
	case "neutral":
		whereClauses = append(whereClauses, "neutral_count > positive_count AND neutral_count > negative_count")
	}

	whereSQL := " WHERE " + strings.Join(whereClauses, " AND ")

	// Count
	var total int
	countQuery := "SELECT COUNT(*) FROM entity_aspect_stats" + whereSQL
	if err := s.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return aspects, 0
	}

	// Data
	orderBy := resolveSort(p.Sort, p.Order, aspectSortWhitelist, "total")
	dataQuery := `
		SELECT
			aspect,
			total,
			COALESCE(avg_sentiment_score, 0) as avg_sentiment,
			positive_count,
			negative_count,
			neutral_count
		FROM entity_aspect_stats
	` + whereSQL + `
		ORDER BY ` + orderBy + `
		LIMIT $` + strconv.Itoa(argIdx) + ` OFFSET $` + strconv.Itoa(argIdx+1)

	dataArgs := append(args, p.Limit, p.Offset)

	rows, err := s.db.Pool.Query(ctx, dataQuery, dataArgs...)
	if err != nil {
		return aspects, total
	}
	defer rows.Close()

	for rows.Next() {
		var a EntityAspectSummary
		if err := rows.Scan(&a.Aspect, &a.Total, &a.AvgSentiment, &a.PositiveCount, &a.NegativeCount, &a.NeutralCount); err != nil {
			continue
		}
		aspects = append(aspects, a)
	}

	return aspects, total
}

func (s *Server) getEntityMentionListV2(ctx context.Context, id string, p MentionListParams) ([]EntityMentionItem, int) {
	var mentions []EntityMentionItem

	whereClauses := []string{"pem.object_id = $1"}
	args := []any{id}
	argIdx := 2

	// Aspect filter: use EXISTS to find posts with matching aspect
	if p.Aspect != "" {
		whereClauses = append(whereClauses, "EXISTS (SELECT 1 FROM post_aspects pa WHERE pa.post_id = pem.post_id AND pa.aspect = $"+strconv.Itoa(argIdx)+")")
		args = append(args, p.Aspect)
		argIdx++
	}

	if p.Sentiment != "" {
		whereClauses = append(whereClauses, "pem.sentiment = $"+strconv.Itoa(argIdx))
		args = append(args, p.Sentiment)
		argIdx++
	}

	whereSQL := " WHERE " + strings.Join(whereClauses, " AND ")

	// Count
	var total int
	countQuery := "SELECT COUNT(*) FROM post_entity_mentions pem" + whereSQL
	if err := s.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return mentions, 0
	}

	// Data
	orderBy := resolveSort(p.Sort, p.Order, mentionSortWhitelist, "pem.created_at")
	dataQuery := `
		SELECT
			pem.post_id,
			COALESCE(p.content, '') as content,
			pem.sentiment,
			pem.sentiment_score,
			pem.mention_text,
			COALESCE(p.author_username, '') as author_name,
			COALESCE(p.platform, '') as platform,
			pem.created_at
		FROM post_entity_mentions pem
		LEFT JOIN posts p ON pem.post_id = p.post_id
	` + whereSQL + `
		ORDER BY ` + orderBy + `
		LIMIT $` + strconv.Itoa(argIdx) + ` OFFSET $` + strconv.Itoa(argIdx+1)

	dataArgs := append(args, p.Limit, p.Offset)

	rows, err := s.db.Pool.Query(ctx, dataQuery, dataArgs...)
	if err != nil {
		return mentions, total
	}
	defer rows.Close()

	for rows.Next() {
		var m EntityMentionItem
		var createdAt time.Time
		if err := rows.Scan(&m.PostID, &m.Content, &m.Sentiment, &m.SentimentScore, &m.MentionText, &m.AuthorName, &m.Platform, &createdAt); err != nil {
			continue
		}
		m.CreatedAt = createdAt.Format(time.RFC3339)
		if len(m.Content) > 200 {
			m.Content = m.Content[:200] + "..."
		}
		mentions = append(mentions, m)
	}

	return mentions, total
}

func (s *Server) getEntityLinkList(ctx context.Context, id string) []EntityLinkItem {
	var links []EntityLinkItem

	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			'outgoing' as direction,
			t.id as linked_id,
			t.canonical_name as linked_name,
			ot.name as linked_type,
			ol.link_type,
			ol.created_at
		FROM object_links ol
		JOIN objects t ON ol.target_id = t.id
		JOIN object_types ot ON t.type_id = ot.id
		WHERE ol.source_id = $1
		UNION ALL
		SELECT
			'incoming' as direction,
			s.id as linked_id,
			s.canonical_name as linked_name,
			ot.name as linked_type,
			ol.link_type,
			ol.created_at
		FROM object_links ol
		JOIN objects s ON ol.source_id = s.id
		JOIN object_types ot ON s.type_id = ot.id
		WHERE ol.target_id = $1
		ORDER BY created_at
	`, id)
	if err != nil {
		return links
	}
	defer rows.Close()

	for rows.Next() {
		var l EntityLinkItem
		var createdAt time.Time
		if err := rows.Scan(&l.Direction, &l.LinkedID, &l.LinkedName, &l.LinkedType, &l.LinkType, &createdAt); err != nil {
			continue
		}
		l.CreatedAt = createdAt.Format(time.RFC3339)
		links = append(links, l)
	}

	return links
}

// getGraph GET /api/graph - Returns nodes + edges for force-directed graph
func (s *Server) getGraph(c *gin.Context) {
	ctx := c.Request.Context()
	periodInterval := parsePeriodInterval(c.Query("period"))

	// Build FROM clause
	var fromSQL string
	var nodeArgs []any
	if periodInterval != "" {
		fromSQL = `(
			SELECT pem.object_id, o2.canonical_name, ot.name as object_type,
				COUNT(*) as mention_count,
				COALESCE(AVG(pem.sentiment_score), 0) as avg_sentiment_score
			FROM post_entity_mentions pem
			JOIN objects o2 ON pem.object_id = o2.id
			JOIN object_types ot ON o2.type_id = ot.id
			WHERE pem.created_at >= NOW() - $1::interval
			GROUP BY pem.object_id, o2.canonical_name, ot.name
		) es`
		nodeArgs = []any{periodInterval}
	} else {
		fromSQL = "entity_stats es"
	}

	// 1. Load nodes (mention_count > 0, LIMIT 100)
	// Reuse EntitySummary schema so frontend has one data model
	var nodes []EntitySummary
	nodeRows, err := s.db.Pool.Query(ctx, `
		SELECT
			es.object_id,
			es.canonical_name,
			es.object_type,
			COALESCE(o.properties->>'sub_type', '') as sub_type,
			es.mention_count,
			COALESCE((SELECT COUNT(*) FROM entity_aspect_stats eas WHERE eas.object_id = es.object_id), 0) as aspect_count,
			COALESCE(es.avg_sentiment_score, 0) as avg_sentiment,
			(SELECT cur.mention_count - prev.mention_count
			 FROM entity_observations cur
			 LEFT JOIN entity_observations prev
			   ON prev.object_id = cur.object_id AND prev.period_type = cur.period_type
			   AND prev.period_start = (SELECT MAX(p2.period_start) FROM entity_observations p2
			     WHERE p2.object_id = cur.object_id AND p2.period_type = 'week' AND p2.period_start < cur.period_start)
			 WHERE cur.object_id = es.object_id AND cur.period_type = 'week'
			 ORDER BY cur.period_start DESC LIMIT 1
			) as mention_delta
		FROM `+fromSQL+`
		JOIN objects o ON es.object_id = o.id
		WHERE es.mention_count > 0
		ORDER BY es.mention_count DESC
		LIMIT 100
	`, nodeArgs...)
	if err != nil {
		respondOne(c, GraphResponse{Nodes: []EntitySummary{}, Edges: []GraphEdge{}})
		return
	}
	defer nodeRows.Close()

	nodeIDs := []string{}
	for nodeRows.Next() {
		var n EntitySummary
		if err := nodeRows.Scan(&n.ID, &n.CanonicalName, &n.Type, &n.SubType, &n.MentionCount, &n.AspectCount, &n.AvgSentiment, &n.MentionDelta); err != nil {
			continue
		}
		nodes = append(nodes, n)
		nodeIDs = append(nodeIDs, n.ID)
	}

	if len(nodes) == 0 {
		respondOne(c, GraphResponse{Nodes: []EntitySummary{}, Edges: []GraphEdge{}})
		return
	}

	// 2. Load edges from object_links where both ends are in nodeIDs
	var edges []GraphEdge
	edgeRows, err := s.db.Pool.Query(ctx, `
		SELECT source_id, target_id, link_type
		FROM object_links
		WHERE source_id = ANY($1) AND target_id = ANY($1)
	`, nodeIDs)
	if err != nil {
		respondOne(c, GraphResponse{Nodes: nodes, Edges: []GraphEdge{}})
		return
	}
	defer edgeRows.Close()

	for edgeRows.Next() {
		var e GraphEdge
		if err := edgeRows.Scan(&e.SourceID, &e.TargetID, &e.LinkType); err != nil {
			continue
		}
		edges = append(edges, e)
	}

	if edges == nil {
		edges = []GraphEdge{}
	}

	respondOne(c, GraphResponse{Nodes: nodes, Edges: edges})
}

// getEntityObservations GET /api/entities/:id/observations?period_type=week&limit=12
func (s *Server) getEntityObservations(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	periodType := c.DefaultQuery("period_type", "week")
	if periodType != "week" && periodType != "day" {
		periodType = "week"
	}

	limit := 12
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 && l <= 52 {
		limit = l
	}

	var observations []ObservationItem
	rows, err := s.db.Pool.Query(ctx, `
		SELECT
			period_start,
			period_type,
			mention_count,
			COALESCE(avg_sentiment, 0) as avg_sentiment,
			positive_count,
			negative_count,
			neutral_count,
			mixed_count
		FROM entity_observations
		WHERE object_id = $1 AND period_type = $2
		ORDER BY period_start DESC
		LIMIT $3
	`, id, periodType, limit)
	if err != nil {
		respondList(c, observations, 0, limit, 0)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var o ObservationItem
		var periodStart time.Time
		if err := rows.Scan(&periodStart, &o.PeriodType, &o.MentionCount, &o.AvgSentiment, &o.PositiveCount, &o.NegativeCount, &o.NeutralCount, &o.MixedCount); err != nil {
			continue
		}
		o.PeriodStart = periodStart.Format("2006-01-02")
		observations = append(observations, o)
	}

	// Reverse to chronological order (oldest first) for sparkline rendering
	for i, j := 0, len(observations)-1; i < j; i, j = i+1, j-1 {
		observations[i], observations[j] = observations[j], observations[i]
	}

	respondList(c, observations, 0, limit, len(observations))
}

// --- AI Summary ---

// ReasoningStepResponse 推理鏈步驟
type ReasoningStepResponse struct {
	Signal     string `json:"signal"`
	Reasoning  string `json:"reasoning"`
	Conclusion string `json:"conclusion"`
}

// ActionItemResponse 結構化建議行動回應
type ActionItemResponse struct {
	Trigger string `json:"trigger"`
	Action  string `json:"action"`
	Target  string `json:"target"`
}

// EntitySummaryResponse AI 摘要回應
type EntitySummaryResponse struct {
	Headline       string                  `json:"headline"`
	ReasoningChain []ReasoningStepResponse `json:"reasoning_chain"`
	Body           string                  `json:"body"`
	Actions        []ActionItemResponse    `json:"actions"`
	GeneratedAt    string                  `json:"generated_at"`
}

// getEntitySummary GET /api/entities/:id/summary?period=4w
func (s *Server) getEntitySummary(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	period := c.DefaultQuery("period", "4w")

	// 1. Check Redis cache
	cacheKey := "entity_summary:" + id + ":" + period
	if cached, err := s.redisClient.Get(ctx, cacheKey); err == nil {
		var resp EntitySummaryResponse
		if json.Unmarshal([]byte(cached), &resp) == nil {
			respondOne(c, resp)
			return
		}
	}

	// 2. Load entity detail
	detail := s.getEntityDetail(ctx, id, true, nil, period)
	if detail == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	}

	// 3. Load observations to determine trend
	var observations []ObservationItem
	obsRows, err := s.db.Pool.Query(ctx, `
		SELECT period_start, period_type, mention_count,
			COALESCE(avg_sentiment, 0), positive_count, negative_count, neutral_count, mixed_count
		FROM entity_observations
		WHERE object_id = $1 AND period_type = 'week'
		ORDER BY period_start DESC LIMIT 8
	`, id)
	if err == nil {
		defer obsRows.Close()
		for obsRows.Next() {
			var o ObservationItem
			var ps time.Time
			if obsRows.Scan(&ps, &o.PeriodType, &o.MentionCount, &o.AvgSentiment,
				&o.PositiveCount, &o.NegativeCount, &o.NeutralCount, &o.MixedCount) == nil {
				o.PeriodStart = ps.Format("2006-01-02")
				observations = append(observations, o)
			}
		}
	}

	// Determine trend direction
	trendDir := "持平"
	if len(observations) >= 2 {
		recent := observations[0].MentionCount
		older := observations[len(observations)-1].MentionCount
		if recent > older+2 {
			trendDir = "上升"
		} else if recent < older-2 {
			trendDir = "下降"
		}
	}

	// Mention delta
	var mentionDelta *int
	if len(observations) >= 2 {
		d := observations[0].MentionCount - observations[1].MentionCount
		mentionDelta = &d
	}

	// 4. Load recent facts (Ontology 推理引擎產出的 alerts/trends/insights)
	facts, _ := s.getInboxFactList(ctx, InboxListParams{Limit: 10}, id)
	var factBriefs []service.FactBrief
	for _, f := range facts {
		factBriefs = append(factBriefs, service.FactBrief{
			Type:        f.FactType,
			Severity:    f.Severity,
			Title:       f.Title,
			Description: f.Description,
			Evidence:    f.Evidence,
		})
	}

	// 5. Build aspect briefs
	var topAspects []service.AspectBrief
	var negAspects []service.AspectBrief
	for _, a := range detail.TopAspects {
		sentiment := "neutral"
		if a.PositiveCount > a.NegativeCount {
			sentiment = "positive"
		} else if a.NegativeCount > a.PositiveCount {
			sentiment = "negative"
		}
		ab := service.AspectBrief{
			Aspect:        a.Aspect,
			Sentiment:     sentiment,
			PositiveCount: a.PositiveCount,
			NegativeCount: a.NegativeCount,
			Total:         a.Total,
		}
		topAspects = append(topAspects, ab)
		if sentiment == "negative" {
			negAspects = append(negAspects, ab)
		}
	}

	// 6. Sample negative mentions
	negMentions, _ := s.getEntityMentionListV2(ctx, id, MentionListParams{
		Sentiment: "negative",
		Sort:      "created_at",
		Order:     "desc",
		Limit:     3,
	})
	var sampleNeg []string
	for _, m := range negMentions {
		text := m.Content
		if len(text) > 150 {
			text = text[:150] + "..."
		}
		sampleNeg = append(sampleNeg, text)
	}

	// 7. Period label
	periodLabel := "全部時間"
	switch period {
	case "1w":
		periodLabel = "近 1 週"
	case "4w":
		periodLabel = "近 4 週"
	case "12w":
		periodLabel = "近 12 週"
	}

	// 8. Call LLM
	summaryReq := &service.EntitySummaryRequest{
		EntityName:  detail.CanonicalName,
		EntityType:  detail.Type,
		PeriodLabel: periodLabel,
		Stats: service.SummaryStats{
			MentionCount:  detail.Stats.MentionCount,
			PositiveCount: detail.Stats.PositiveCount,
			NegativeCount: detail.Stats.NegativeCount,
			NeutralCount:  detail.Stats.NeutralCount,
			MixedCount:    detail.Stats.MixedCount,
			AvgSentiment:  detail.Stats.AvgSentiment,
			MentionDelta:  mentionDelta,
		},
		TopAspects:  topAspects,
		NegAspects:  negAspects,
		RecentFacts: factBriefs,
		TrendDir:    trendDir,
		SampleNeg:   sampleNeg,
	}

	result, err := s.summarySvc.GenerateEntitySummary(ctx, summaryReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate summary"})
		return
	}

	var chain []ReasoningStepResponse
	for _, s := range result.ReasoningChain {
		chain = append(chain, ReasoningStepResponse{
			Signal:     s.Signal,
			Reasoning:  s.Reasoning,
			Conclusion: s.Conclusion,
		})
	}

	var actions []ActionItemResponse
	for _, a := range result.Actions {
		actions = append(actions, ActionItemResponse{
			Trigger: a.Trigger,
			Action:  a.Action,
			Target:  a.Target,
		})
	}

	resp := EntitySummaryResponse{
		Headline:       result.Headline,
		ReasoningChain: chain,
		Body:           result.Body,
		Actions:        actions,
		GeneratedAt:    result.GeneratedAt,
	}

	// 9. Cache in Redis (TTL 6 hours)
	if cached, err := json.Marshal(resp); err == nil {
		s.redisClient.Set(ctx, cacheKey, string(cached), 6*time.Hour)
	}

	respondOne(c, resp)
}

// --- Follow-up Chat ---

// ChatRequest Follow-up chat 請求
type ChatRequest struct {
	Question  string `json:"question" binding:"required"`
	SessionID string `json:"session_id" binding:"required"`
}

// chatWithEntity POST /api/entities/:id/chat — SSE streaming chat
func (s *Server) chatWithEntity(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Load entity basic info
	var entityName, entityType string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT o.canonical_name, ot.name
		FROM objects o JOIN object_types ot ON o.type_id = ot.id
		WHERE o.id = $1
	`, id).Scan(&entityName, &entityType)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	}

	// 2. Load cached summary
	period := c.DefaultQuery("period", "4w")
	summaryKey := "entity_summary:" + id + ":" + period
	summaryJSON := ""
	if cached, err := s.redisClient.Get(ctx, summaryKey); err == nil {
		summaryJSON = cached
	}

	// 3. Build context data (aspects + stats)
	contextData := s.buildEntityContextData(ctx, id, period)

	// 4. Load chat history from Redis
	historyKey := "entity_chat:" + id + ":" + req.SessionID
	var history []service.ChatMessage
	if cached, err := s.redisClient.Get(ctx, historyKey); err == nil {
		json.Unmarshal([]byte(cached), &history)
	}

	// 5. Call streaming LLM
	chatReq := &service.EntityChatRequest{
		EntityName:  entityName,
		EntityType:  entityType,
		SummaryJSON: summaryJSON,
		ContextData: contextData,
		History:     history,
		Question:    req.Question,
	}

	tokenCh, errCh := s.summarySvc.StreamEntityChat(ctx, chatReq)

	// 6. Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	// 7. Stream tokens
	var fullResponse strings.Builder
	flusher, _ := c.Writer.(http.Flusher)

	for {
		select {
		case token, ok := <-tokenCh:
			if !ok {
				// Channel closed, check for errors
				select {
				case err := <-errCh:
					if err != nil {
						c.SSEvent("error", gin.H{"error": err.Error()})
						if flusher != nil {
							flusher.Flush()
						}
					}
				default:
				}
				// Send [DONE]
				c.Writer.WriteString("data: [DONE]\n\n")
				if flusher != nil {
					flusher.Flush()
				}

				// 8. Save history to Redis (append user question + assistant answer, max 10 rounds)
				history = append(history, service.ChatMessage{Role: "user", Content: req.Question})
				history = append(history, service.ChatMessage{Role: "assistant", Content: fullResponse.String()})
				// Keep last 10 rounds (20 messages)
				if len(history) > 20 {
					history = history[len(history)-20:]
				}
				if historyJSON, err := json.Marshal(history); err == nil {
					s.redisClient.Set(ctx, historyKey, string(historyJSON), 1*time.Hour)
				}
				return
			}
			fullResponse.WriteString(token)
			chunk, _ := json.Marshal(gin.H{"content": token})
			c.Writer.WriteString("data: " + string(chunk) + "\n\n")
			if flusher != nil {
				flusher.Flush()
			}

		case <-ctx.Done():
			return
		}
	}
}

// buildEntityContextData 組裝 entity 的上下文數據摘要
func (s *Server) buildEntityContextData(ctx context.Context, id string, period string) string {
	periodInterval := parsePeriodInterval(period)
	var b strings.Builder

	// Stats
	statsQuery := `
		SELECT COUNT(*), COALESCE(AVG(sentiment_score), 0),
			COUNT(*) FILTER (WHERE sentiment = 'positive'),
			COUNT(*) FILTER (WHERE sentiment = 'negative'),
			COUNT(*) FILTER (WHERE sentiment = 'neutral')
		FROM post_entity_mentions WHERE object_id = $1`
	statsArgs := []any{id}
	if periodInterval != "" {
		statsQuery += " AND created_at >= NOW() - $2::interval"
		statsArgs = append(statsArgs, periodInterval)
	}
	var mc int
	var avg float64
	var pos, neg, neu int
	s.db.Pool.QueryRow(ctx, statsQuery, statsArgs...).Scan(&mc, &avg, &pos, &neg, &neu)
	b.WriteString("【統計】")
	b.WriteString("提及數:" + strconv.Itoa(mc) + " 正面:" + strconv.Itoa(pos) + " 負面:" + strconv.Itoa(neg) + " 中性:" + strconv.Itoa(neu))
	b.WriteString(" 平均情感:" + strconv.FormatFloat(avg, 'f', 2, 64) + "\n")

	// Top aspects
	aspects, _ := s.getEntityAspectStatsV2(ctx, id, AspectListParams{Limit: 10})
	if len(aspects) > 0 {
		b.WriteString("【面向分析】\n")
		for _, a := range aspects {
			b.WriteString("- " + a.Aspect + " (total:" + strconv.Itoa(a.Total) + " +:" + strconv.Itoa(a.PositiveCount) + " -:" + strconv.Itoa(a.NegativeCount) + ")\n")
		}
	}

	// Recent facts
	facts, _ := s.getInboxFactList(ctx, InboxListParams{Limit: 5}, id)
	if len(facts) > 0 {
		b.WriteString("【推理引擎 Insights/Alerts】\n")
		for _, f := range facts {
			b.WriteString("- [" + f.FactType + "/" + f.Severity + "] " + f.Title + ": " + f.Description + "\n")
		}
	}

	// Related entities (for entity linking in chat responses)
	links := s.getEntityLinkList(ctx, id)
	if len(links) > 0 {
		b.WriteString("【關聯實體】（回答時可用 [[名稱|ID]] 格式引用）\n")
		for _, l := range links {
			b.WriteString("- " + l.LinkedName + " (" + l.LinkedType + ") ID=" + l.LinkedID + " 關係=" + l.LinkType + "\n")
		}
	}

	return b.String()
}

// --- KOL Attribution ---

// KOLAttributionItem KOL 歸因排名項目
type KOLAttributionItem struct {
	KOLID           string  `json:"kol_id"`
	KOLName         string  `json:"kol_name"`
	KOLType         string  `json:"kol_type"`
	RelationType    string  `json:"relation_type"`
	CoMentionCount  int     `json:"co_mention_count"`
	AvgSentiment    float64 `json:"avg_sentiment"`
	ContributionPct float64 `json:"contribution_pct"`
	Sparkline       []int   `json:"sparkline"`
}

// getKOLAttribution GET /api/entities/:id/kol-attribution?period=4w&limit=10
func (s *Server) getKOLAttribution(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	// Validate entity exists and is brand/product/organization type
	var entityType string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT ot.name FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.id = $1
	`, id).Scan(&entityType)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entity not found"})
		return
	}
	if entityType != "brand" && entityType != "product" && entityType != "organization" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "KOL attribution is only available for brand, product, or organization entities"})
		return
	}

	limit := clamp(parseIntDefault(c.Query("limit"), 10), 1, 50)
	periodInterval := parsePeriodInterval(c.Query("period"))

	// Build date filter
	dateFilter := ""
	args := []any{id}
	if periodInterval != "" {
		dateFilter = " AND p.created_at >= NOW() - $2::interval"
		args = append(args, periodInterval)
	}

	limitArgIdx := len(args) + 1

	// Strategy: KOL = post author (person entity matched via canonical_name/alias)
	// For each product/brand mention, find the post's author and match to a person entity.
	// This captures "who talks about this product" rather than "who is mentioned alongside".
	query := `
		WITH author_mentions AS (
			SELECT
				kol.id AS kol_id,
				COUNT(DISTINCT pem.post_id) AS co_mention_count,
				AVG(pem.sentiment_score) AS avg_sentiment
			FROM post_entity_mentions pem
			JOIN posts p ON pem.post_id = p.post_id
			JOIN objects kol ON kol.id IN (
				SELECT o2.id FROM objects o2
				JOIN object_types ot2 ON o2.type_id = ot2.id AND ot2.name = 'person'
				WHERE o2.canonical_name = p.author_username
				UNION
				SELECT oa.object_id FROM object_aliases oa
				JOIN objects o3 ON oa.object_id = o3.id
				JOIN object_types ot3 ON o3.type_id = ot3.id AND ot3.name = 'person'
				WHERE oa.alias = p.author_username
			)
			WHERE pem.object_id = $1` + dateFilter + `
			GROUP BY kol.id
		),
		total AS (
			SELECT COALESCE(SUM(co_mention_count), 0) AS total_mentions FROM author_mentions
		)
		SELECT
			am.kol_id,
			o.canonical_name AS kol_name,
			am.co_mention_count,
			COALESCE(am.avg_sentiment, 0),
			CASE WHEN t.total_mentions > 0
				THEN ROUND((am.co_mention_count::numeric / t.total_mentions) * 100, 1)
				ELSE 0
			END AS contribution_pct,
			COALESCE(
				(SELECT ol.link_type FROM object_links ol
				 WHERE (ol.source_id = am.kol_id AND ol.target_id = $1)
				    OR (ol.source_id = $1 AND ol.target_id = am.kol_id)
				 LIMIT 1),
				'co_mentioned'
			) AS relation_type
		FROM author_mentions am
		JOIN objects o ON am.kol_id = o.id
		CROSS JOIN total t
		ORDER BY am.co_mention_count DESC
		LIMIT $` + strconv.Itoa(limitArgIdx)

	args = append(args, limit)

	rows, err := s.db.Pool.Query(ctx, query, args...)
	if err != nil {
		respondOne(c, []KOLAttributionItem{})
		return
	}
	defer rows.Close()

	var items []KOLAttributionItem
	var kolIDs []string
	for rows.Next() {
		var item KOLAttributionItem
		if err := rows.Scan(&item.KOLID, &item.KOLName, &item.CoMentionCount, &item.AvgSentiment, &item.ContributionPct, &item.RelationType); err != nil {
			continue
		}
		item.KOLType = "person"
		item.Sparkline = []int{}
		items = append(items, item)
		kolIDs = append(kolIDs, item.KOLID)
	}

	// Load weekly sparklines for each KOL (author-based)
	if len(kolIDs) > 0 {
		sparkArgs := []any{id, kolIDs}
		sparkDateFilter := ""
		if periodInterval != "" {
			sparkDateFilter = " AND p.created_at >= NOW() - $3::interval"
			sparkArgs = append(sparkArgs, periodInterval)
		}

		sparkQuery := `
			SELECT
				kol.id AS kol_id,
				date_trunc('week', p.created_at) AS week,
				COUNT(DISTINCT pem.post_id) AS cnt
			FROM post_entity_mentions pem
			JOIN posts p ON pem.post_id = p.post_id
			JOIN objects kol ON kol.id = ANY($2)
				AND (kol.canonical_name = p.author_username
				  OR EXISTS (SELECT 1 FROM object_aliases oa WHERE oa.object_id = kol.id AND oa.alias = p.author_username))
			WHERE pem.object_id = $1` + sparkDateFilter + `
			GROUP BY kol.id, date_trunc('week', p.created_at)
			ORDER BY kol.id, week
		`

		sparkRows, err := s.db.Pool.Query(ctx, sparkQuery, sparkArgs...)
		if err == nil {
			defer sparkRows.Close()
			sparkMap := make(map[string][]int)
			for sparkRows.Next() {
				var kolID string
				var week time.Time
				var cnt int
				_ = week
				if err := sparkRows.Scan(&kolID, &week, &cnt); err == nil {
					sparkMap[kolID] = append(sparkMap[kolID], cnt)
				}
			}
			for i := range items {
				if sp, ok := sparkMap[items[i].KOLID]; ok {
					items[i].Sparkline = sp
				}
			}
		}
	}

	if items == nil {
		items = []KOLAttributionItem{}
	}

	respondOne(c, items)
}
