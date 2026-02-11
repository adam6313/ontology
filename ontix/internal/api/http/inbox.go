package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// --- Response Types ---

// InboxFactItem Inbox 事實回應
type InboxFactItem struct {
	ID          int64          `json:"id"`
	ObjectID    string         `json:"object_id"`
	EntityName  string         `json:"entity_name"`
	EntityType  string         `json:"entity_type"`
	FactType    string         `json:"fact_type"`
	Severity    string         `json:"severity"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Evidence    map[string]any `json:"evidence,omitempty"`
	PeriodStart *string        `json:"period_start,omitempty"`
	PeriodType  string         `json:"period_type,omitempty"`
	IsRead      bool           `json:"is_read"`
	CreatedAt   string         `json:"created_at"`
}

// --- Handlers ---

// listInboxFacts GET /api/inbox
func (s *Server) listInboxFacts(c *gin.Context) {
	ctx := c.Request.Context()
	params := parseInboxListParams(c)

	facts, total := s.getInboxFactList(ctx, params, "")
	respondList(c, facts, params.Offset, params.Limit, total)
}

// getInboxCount GET /api/inbox/count
func (s *Server) getInboxCount(c *gin.Context) {
	ctx := c.Request.Context()

	count, err := s.factRepo.CountUnreadFacts(ctx)
	if err != nil {
		count = 0
	}

	respondOne(c, gin.H{"unread": count})
}

// markFactRead PATCH /api/inbox/:id/read
func (s *Server) markFactRead(c *gin.Context) {
	factID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := s.factRepo.MarkAsRead(c.Request.Context(), factID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark as read"})
		return
	}

	respondOne(c, gin.H{"status": "ok"})
}

// dismissFact PATCH /api/inbox/:id/dismiss
func (s *Server) dismissFact(c *gin.Context) {
	factID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := s.factRepo.MarkAsDismissed(c.Request.Context(), factID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to dismiss"})
		return
	}

	respondOne(c, gin.H{"status": "ok"})
}

// batchInboxAction PATCH /api/inbox/batch
func (s *Server) batchInboxAction(c *gin.Context) {
	var req struct {
		IDs    []int64 `json:"ids"    binding:"required,min=1"`
		Action string  `json:"action" binding:"required,oneof=read dismiss"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var col string
	switch req.Action {
	case "read":
		col = "is_read"
	case "dismiss":
		col = "is_dismissed"
	}

	query := `UPDATE derived_facts SET ` + col + ` = true WHERE id = ANY($1)`
	tag, err := s.db.Pool.Exec(c.Request.Context(), query, req.IDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "batch update failed"})
		return
	}

	respondOne(c, gin.H{"status": "ok", "updated": tag.RowsAffected()})
}

// getEntityFacts GET /api/entities/:id/facts
func (s *Server) getEntityFacts(c *gin.Context) {
	ctx := c.Request.Context()
	objectID := c.Param("id")
	params := parseInboxListParams(c)

	facts, total := s.getInboxFactList(ctx, params, objectID)
	respondList(c, facts, params.Offset, params.Limit, total)
}

// --- Query Method ---

func (s *Server) getInboxFactList(ctx context.Context, p InboxListParams, objectID string) ([]InboxFactItem, int) {
	var facts []InboxFactItem

	whereClauses := []string{"NOT f.is_dismissed", "(f.expires_at IS NULL OR f.expires_at > NOW())"}
	args := []any{}
	argIdx := 1

	if objectID != "" {
		whereClauses = append(whereClauses, "f.object_id = $"+strconv.Itoa(argIdx))
		args = append(args, objectID)
		argIdx++
	}

	if p.Severity != "" {
		whereClauses = append(whereClauses, "f.severity = $"+strconv.Itoa(argIdx))
		args = append(args, p.Severity)
		argIdx++
	}

	if p.FactType != "" {
		whereClauses = append(whereClauses, "f.fact_type = $"+strconv.Itoa(argIdx))
		args = append(args, p.FactType)
		argIdx++
	}

	whereSQL := " WHERE " + strings.Join(whereClauses, " AND ")

	// Count
	countQuery := `
		SELECT COUNT(*)
		FROM derived_facts f
	` + whereSQL

	var total int
	if err := s.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return facts, 0
	}

	// Data
	orderBy := resolveSort(p.Sort, p.Order, inboxSortWhitelist, "f.created_at")
	dataQuery := `
		SELECT f.id, f.object_id, o.canonical_name, ot.name,
		       f.fact_type, f.severity, f.title, f.description,
		       f.evidence, f.period_start, f.period_type,
		       f.is_read, f.created_at
		FROM derived_facts f
		JOIN objects o ON f.object_id = o.id
		JOIN object_types ot ON o.type_id = ot.id
	` + whereSQL + `
		ORDER BY ` + orderBy + `, f.id DESC
		LIMIT $` + strconv.Itoa(argIdx) + ` OFFSET $` + strconv.Itoa(argIdx+1)

	dataArgs := append(args, p.Limit, p.Offset)

	rows, err := s.db.Pool.Query(ctx, dataQuery, dataArgs...)
	if err != nil {
		return facts, total
	}
	defer rows.Close()

	for rows.Next() {
		var item InboxFactItem
		var evidence []byte
		var periodStart *time.Time
		var createdAt time.Time

		if err := rows.Scan(
			&item.ID, &item.ObjectID, &item.EntityName, &item.EntityType,
			&item.FactType, &item.Severity, &item.Title, &item.Description,
			&evidence, &periodStart, &item.PeriodType,
			&item.IsRead, &createdAt,
		); err != nil {
			continue
		}

		if evidence != nil {
			_ = json.Unmarshal(evidence, &item.Evidence)
		}
		if periodStart != nil {
			ps := periodStart.Format("2006-01-02")
			item.PeriodStart = &ps
		}
		item.CreatedAt = createdAt.Format(time.RFC3339)
		facts = append(facts, item)
	}

	return facts, total
}
