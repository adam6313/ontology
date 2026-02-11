package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// DerivedFactRepo PostgreSQL 實作的 DerivedFactRepository
type DerivedFactRepo struct {
	db *DB
}

// NewDerivedFactRepo 建立 DerivedFactRepository
func NewDerivedFactRepo(db *DB) repository.DerivedFactRepository {
	return &DerivedFactRepo{db: db}
}

// SaveFact 儲存推理事實（UPSERT on object_id + fact_key）
func (r *DerivedFactRepo) SaveFact(ctx context.Context, fact *entity.DerivedFact) error {
	evidenceJSON, err := json.Marshal(fact.Evidence)
	if err != nil {
		return fmt.Errorf("failed to marshal evidence: %w", err)
	}

	query := `
		INSERT INTO derived_facts
			(object_id, fact_type, fact_key, severity, title, description,
			 evidence, derived_from_rule, period_start, period_type, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (object_id, fact_key)
		DO UPDATE SET
			fact_type        = EXCLUDED.fact_type,
			severity         = EXCLUDED.severity,
			title            = EXCLUDED.title,
			description      = EXCLUDED.description,
			evidence         = EXCLUDED.evidence,
			derived_from_rule = EXCLUDED.derived_from_rule,
			period_start     = EXCLUDED.period_start,
			period_type      = EXCLUDED.period_type,
			expires_at       = EXCLUDED.expires_at,
			is_read          = FALSE,
			is_dismissed     = FALSE
		RETURNING id, created_at`

	// DerivedFromRule = 0 means no rule (e.g. narrative insight) → pass NULL to avoid FK violation
	var ruleID any = fact.DerivedFromRule
	if fact.DerivedFromRule == 0 {
		ruleID = nil
	}

	err = r.db.Pool.QueryRow(ctx, query,
		fact.ObjectID, fact.FactType, fact.FactKey, fact.Severity,
		fact.Title, fact.Description, evidenceJSON,
		ruleID, fact.PeriodStart, fact.PeriodType,
		fact.ExpiresAt,
	).Scan(&fact.ID, &fact.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to save fact: %w", err)
	}
	return nil
}

// FindFactByKey 根據去重 key 查詢
func (r *DerivedFactRepo) FindFactByKey(ctx context.Context, objectID string, factKey string) (*entity.DerivedFact, error) {
	query := `
		SELECT id, object_id, fact_type, fact_key, severity, title, description,
		       evidence, derived_from_rule, period_start, period_type,
		       is_read, is_dismissed, created_at, expires_at
		FROM derived_facts
		WHERE object_id = $1 AND fact_key = $2`

	row := r.db.Pool.QueryRow(ctx, query, objectID, factKey)
	return r.scanFact(row)
}

// ListUnreadFacts 查詢未讀事實（Inbox 用）
func (r *DerivedFactRepo) ListUnreadFacts(ctx context.Context, severity string, limit, offset int) ([]*entity.DerivedFact, error) {
	var query string
	var args []any

	if severity != "" {
		query = `
			SELECT f.id, f.object_id, f.fact_type, f.fact_key, f.severity, f.title, f.description,
			       f.evidence, f.derived_from_rule, f.period_start, f.period_type,
			       f.is_read, f.is_dismissed, f.created_at, f.expires_at
			FROM derived_facts f
			WHERE f.is_read = FALSE AND f.is_dismissed = FALSE AND f.severity = $1
			  AND (f.expires_at IS NULL OR f.expires_at > NOW())
			ORDER BY f.created_at DESC
			LIMIT $2 OFFSET $3`
		args = []any{severity, limit, offset}
	} else {
		query = `
			SELECT f.id, f.object_id, f.fact_type, f.fact_key, f.severity, f.title, f.description,
			       f.evidence, f.derived_from_rule, f.period_start, f.period_type,
			       f.is_read, f.is_dismissed, f.created_at, f.expires_at
			FROM derived_facts f
			WHERE f.is_read = FALSE AND f.is_dismissed = FALSE
			  AND (f.expires_at IS NULL OR f.expires_at > NOW())
			ORDER BY f.created_at DESC
			LIMIT $1 OFFSET $2`
		args = []any{limit, offset}
	}

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list unread facts: %w", err)
	}
	defer rows.Close()

	var facts []*entity.DerivedFact
	for rows.Next() {
		f, err := r.scanFact(rows)
		if err != nil {
			return nil, err
		}
		facts = append(facts, f)
	}
	return facts, nil
}

// ListFactsByObject 查詢某 entity 的所有事實
func (r *DerivedFactRepo) ListFactsByObject(ctx context.Context, objectID string, limit, offset int) ([]*entity.DerivedFact, error) {
	query := `
		SELECT id, object_id, fact_type, fact_key, severity, title, description,
		       evidence, derived_from_rule, period_start, period_type,
		       is_read, is_dismissed, created_at, expires_at
		FROM derived_facts
		WHERE object_id = $1 AND NOT is_dismissed
		  AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Pool.Query(ctx, query, objectID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list facts by object: %w", err)
	}
	defer rows.Close()

	var facts []*entity.DerivedFact
	for rows.Next() {
		f, err := r.scanFact(rows)
		if err != nil {
			return nil, err
		}
		facts = append(facts, f)
	}
	return facts, nil
}

// CountUnreadFacts 未讀計數（badge 用）
func (r *DerivedFactRepo) CountUnreadFacts(ctx context.Context) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM derived_facts
		WHERE is_read = FALSE AND is_dismissed = FALSE
		  AND (expires_at IS NULL OR expires_at > NOW())`

	var count int
	err := r.db.Pool.QueryRow(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread facts: %w", err)
	}
	return count, nil
}

// MarkAsRead 標記已讀
func (r *DerivedFactRepo) MarkAsRead(ctx context.Context, factID int64) error {
	_, err := r.db.Pool.Exec(ctx,
		`UPDATE derived_facts SET is_read = TRUE WHERE id = $1`, factID)
	if err != nil {
		return fmt.Errorf("failed to mark fact as read: %w", err)
	}
	return nil
}

// MarkAsDismissed 標記忽略
func (r *DerivedFactRepo) MarkAsDismissed(ctx context.Context, factID int64) error {
	_, err := r.db.Pool.Exec(ctx,
		`UPDATE derived_facts SET is_dismissed = TRUE WHERE id = $1`, factID)
	if err != nil {
		return fmt.Errorf("failed to mark fact as dismissed: %w", err)
	}
	return nil
}

// DeleteExpiredFacts 刪除過期事實
func (r *DerivedFactRepo) DeleteExpiredFacts(ctx context.Context) (int, error) {
	tag, err := r.db.Pool.Exec(ctx,
		`DELETE FROM derived_facts WHERE expires_at IS NOT NULL AND expires_at < NOW()`)
	if err != nil {
		return 0, fmt.Errorf("failed to delete expired facts: %w", err)
	}
	return int(tag.RowsAffected()), nil
}

// --- scan helpers ---

func (r *DerivedFactRepo) scanFact(row pgx.Row) (*entity.DerivedFact, error) {
	var f entity.DerivedFact
	var evidenceJSON []byte

	err := row.Scan(
		&f.ID, &f.ObjectID, &f.FactType, &f.FactKey, &f.Severity,
		&f.Title, &f.Description, &evidenceJSON,
		&f.DerivedFromRule, &f.PeriodStart, &f.PeriodType,
		&f.IsRead, &f.IsDismissed, &f.CreatedAt, &f.ExpiresAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan derived fact: %w", err)
	}

	if evidenceJSON != nil {
		if err := json.Unmarshal(evidenceJSON, &f.Evidence); err != nil {
			return nil, fmt.Errorf("failed to unmarshal evidence: %w", err)
		}
	}
	return &f, nil
}
