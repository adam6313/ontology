package http

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// EntityListParams Entity 列表查詢參數
type EntityListParams struct {
	Q            string
	Type         string
	SubType      string
	SentimentMin *float64
	SentimentMax *float64
	MentionMin   *int
	MentionMax   *int
	Period       string // 1w, 4w, 12w, or empty for all-time
	Sort         string
	Order        string
	Offset       int
	Limit        int
}

// MentionListParams Mention 列表查詢參數
type MentionListParams struct {
	Aspect    string
	Sentiment string
	Sort      string
	Order     string
	Offset    int
	Limit     int
}

// AspectListParams Aspect 列表查詢參數
type AspectListParams struct {
	Q         string
	Sentiment string
	Sort      string
	Order     string
	Offset    int
	Limit     int
}

// --- Sort Whitelists ---

var entitySortWhitelist = map[string]string{
	"mention_count":  "es.mention_count",
	"aspect_count":   "aspect_count",
	"avg_sentiment":  "COALESCE(es.avg_sentiment_score, 0)",
	"canonical_name": "es.canonical_name",
}

var mentionSortWhitelist = map[string]string{
	"created_at":      "pem.created_at",
	"sentiment_score": "pem.sentiment_score",
}

var aspectSortWhitelist = map[string]string{
	"total":         "total",
	"avg_sentiment": "COALESCE(avg_sentiment_score, 0)",
	"aspect":        "aspect",
}

var inboxSortWhitelist = map[string]string{
	"created_at": "f.created_at",
	"severity":   "CASE f.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END",
}

// resolveSort 白名單校驗排序欄位，防 SQL injection
func resolveSort(field, order string, whitelist map[string]string, defaultCol string) string {
	col, ok := whitelist[field]
	if !ok {
		col = defaultCol
	}
	if order == "asc" {
		return col + " ASC"
	}
	return col + " DESC"
}

// --- Parse Functions ---

// parsePeriodInterval maps period shorthand to SQL interval string
func parsePeriodInterval(period string) string {
	switch period {
	case "1w":
		return "7 days"
	case "4w":
		return "28 days"
	case "12w":
		return "84 days"
	default:
		return ""
	}
}

func parseEntityListParams(c *gin.Context) EntityListParams {
	p := EntityListParams{
		Q:       c.Query("q"),
		Type:    c.Query("type"),
		SubType: c.Query("sub_type"),
		Period:  c.Query("period"),
		Sort:    c.Query("sort"),
		Order:   c.Query("order"),
		Offset:  parseIntDefault(c.Query("offset"), 0),
		Limit:   clamp(parseIntDefault(c.Query("limit"), 50), 1, 200),
	}

	if v := c.Query("sentiment_min"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			p.SentimentMin = &f
		}
	}
	if v := c.Query("sentiment_max"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			p.SentimentMax = &f
		}
	}
	if v := c.Query("mention_min"); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			p.MentionMin = &i
		}
	}
	if v := c.Query("mention_max"); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			p.MentionMax = &i
		}
	}

	return p
}

func parseMentionListParams(c *gin.Context) MentionListParams {
	return MentionListParams{
		Aspect:    c.Query("aspect"),
		Sentiment: c.Query("sentiment"),
		Sort:      c.Query("sort"),
		Order:     c.Query("order"),
		Offset:    parseIntDefault(c.Query("offset"), 0),
		Limit:     clamp(parseIntDefault(c.Query("limit"), 20), 1, 100),
	}
}

func parseAspectListParams(c *gin.Context) AspectListParams {
	return AspectListParams{
		Q:         c.Query("q"),
		Sentiment: c.Query("sentiment"),
		Sort:      c.Query("sort"),
		Order:     c.Query("order"),
		Offset:    parseIntDefault(c.Query("offset"), 0),
		Limit:     clamp(parseIntDefault(c.Query("limit"), 20), 1, 100),
	}
}

// InboxListParams Inbox 列表查詢參數
type InboxListParams struct {
	Severity string
	FactType string
	Sort     string
	Order    string
	Offset   int
	Limit    int
}

func parseInboxListParams(c *gin.Context) InboxListParams {
	return InboxListParams{
		Severity: c.Query("severity"),
		FactType: c.Query("fact_type"),
		Sort:     c.Query("sort"),
		Order:    c.Query("order"),
		Offset:   parseIntDefault(c.Query("offset"), 0),
		Limit:    clamp(parseIntDefault(c.Query("limit"), 30), 1, 100),
	}
}

// --- Helpers ---

func parseIntDefault(s string, defaultVal int) int {
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}

func clamp(v, min, max int) int {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}
