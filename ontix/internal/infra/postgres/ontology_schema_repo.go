package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// OntologySchemaRepo PostgreSQL 實作的 OntologySchemaRepository
type OntologySchemaRepo struct {
	db *DB
}

// NewOntologySchemaRepo 建立 OntologySchemaRepository
func NewOntologySchemaRepo(db *DB) repository.OntologySchemaRepository {
	return &OntologySchemaRepo{db: db}
}

// ListClasses 載入所有 class 並組裝 IS-A 層級
func (r *OntologySchemaRepo) ListClasses(ctx context.Context) ([]*entity.Class, error) {
	query := `
		SELECT id, slug, name, parent_id, description, icon, sort_order, created_at
		FROM ontology_classes
		ORDER BY sort_order, id`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list classes: %w", err)
	}
	defer rows.Close()

	var classes []*entity.Class
	classMap := make(map[int]*entity.Class)

	for rows.Next() {
		c, err := r.scanClass(rows)
		if err != nil {
			return nil, err
		}
		classes = append(classes, c)
		classMap[c.ID] = c
	}

	// 組裝 parent-child 關係
	for _, c := range classes {
		if c.ParentID != nil {
			if parent, ok := classMap[*c.ParentID]; ok {
				c.Parent = parent
				parent.Children = append(parent.Children, c)
			}
		}
	}

	return classes, nil
}

// FindClassBySlug 根據 slug 查詢
func (r *OntologySchemaRepo) FindClassBySlug(ctx context.Context, slug string) (*entity.Class, error) {
	query := `
		SELECT id, slug, name, parent_id, description, icon, sort_order, created_at
		FROM ontology_classes
		WHERE slug = $1`

	row := r.db.Pool.QueryRow(ctx, query, slug)
	return r.scanClass(row)
}

// FindClassByID 根據 ID 查詢
func (r *OntologySchemaRepo) FindClassByID(ctx context.Context, id int) (*entity.Class, error) {
	query := `
		SELECT id, slug, name, parent_id, description, icon, sort_order, created_at
		FROM ontology_classes
		WHERE id = $1`

	row := r.db.Pool.QueryRow(ctx, query, id)
	return r.scanClass(row)
}

// ListPropertyDefs 載入某 class 的屬性定義（含繼承的父類屬性）
// 透過 recursive CTE 遍歷 IS-A 層級
func (r *OntologySchemaRepo) ListPropertyDefs(ctx context.Context, classID int) ([]*entity.PropertyDef, error) {
	query := `
		WITH RECURSIVE ancestors AS (
			SELECT id, parent_id FROM ontology_classes WHERE id = $1
			UNION ALL
			SELECT c.id, c.parent_id
			FROM ontology_classes c
			JOIN ancestors a ON c.id = a.parent_id
		)
		SELECT p.id, p.class_id, p.name, p.display_name, p.data_type,
		       p.enum_values, p.is_required, p.default_value, p.description
		FROM ontology_property_defs p
		JOIN ancestors a ON p.class_id = a.id
		ORDER BY p.class_id, p.id`

	rows, err := r.db.Pool.Query(ctx, query, classID)
	if err != nil {
		return nil, fmt.Errorf("failed to list property defs for class %d: %w", classID, err)
	}
	defer rows.Close()

	var defs []*entity.PropertyDef
	for rows.Next() {
		d, err := r.scanPropertyDef(rows)
		if err != nil {
			return nil, err
		}
		defs = append(defs, d)
	}
	return defs, nil
}

// ListAllPropertyDefs 載入所有屬性定義
func (r *OntologySchemaRepo) ListAllPropertyDefs(ctx context.Context) ([]*entity.PropertyDef, error) {
	query := `
		SELECT id, class_id, name, display_name, data_type,
		       enum_values, is_required, default_value, description
		FROM ontology_property_defs
		ORDER BY class_id, id`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list all property defs: %w", err)
	}
	defer rows.Close()

	var defs []*entity.PropertyDef
	for rows.Next() {
		d, err := r.scanPropertyDef(rows)
		if err != nil {
			return nil, err
		}
		defs = append(defs, d)
	}
	return defs, nil
}

// ListRelationTypes 載入所有關係類型定義
func (r *OntologySchemaRepo) ListRelationTypes(ctx context.Context) ([]*entity.RelationTypeDef, error) {
	query := `
		SELECT id, slug, name, display_name, source_class_id, target_class_id,
		       cardinality, inverse_id, description
		FROM ontology_relation_types
		ORDER BY id`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list relation types: %w", err)
	}
	defer rows.Close()

	var types []*entity.RelationTypeDef
	for rows.Next() {
		t, err := r.scanRelationType(rows)
		if err != nil {
			return nil, err
		}
		types = append(types, t)
	}
	return types, nil
}

// FindRelationTypeBySlug 根據 slug + source/target class 查詢
func (r *OntologySchemaRepo) FindRelationTypeBySlug(ctx context.Context, slug string, sourceClassID, targetClassID int) (*entity.RelationTypeDef, error) {
	query := `
		SELECT id, slug, name, display_name, source_class_id, target_class_id,
		       cardinality, inverse_id, description
		FROM ontology_relation_types
		WHERE slug = $1 AND source_class_id = $2 AND target_class_id = $3`

	row := r.db.Pool.QueryRow(ctx, query, slug, sourceClassID, targetClassID)
	return r.scanRelationType(row)
}

// FindRelationTypeByID 根據 ID 查詢
func (r *OntologySchemaRepo) FindRelationTypeByID(ctx context.Context, id int) (*entity.RelationTypeDef, error) {
	query := `
		SELECT id, slug, name, display_name, source_class_id, target_class_id,
		       cardinality, inverse_id, description
		FROM ontology_relation_types
		WHERE id = $1`

	row := r.db.Pool.QueryRow(ctx, query, id)
	return r.scanRelationType(row)
}

// ListActiveRules 載入所有啟用的推理規則（按 priority DESC 排序）
func (r *OntologySchemaRepo) ListActiveRules(ctx context.Context) ([]*entity.Rule, error) {
	query := `
		SELECT id, name, description, priority, is_active,
		       trigger_type, condition, action_type, action_config, created_at
		FROM ontology_rules
		WHERE is_active = TRUE
		ORDER BY priority DESC, id`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list active rules: %w", err)
	}
	defer rows.Close()

	var rules []*entity.Rule
	for rows.Next() {
		rule, err := r.scanRule(rows)
		if err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

// FindRuleByName 根據名稱查詢
func (r *OntologySchemaRepo) FindRuleByName(ctx context.Context, name string) (*entity.Rule, error) {
	query := `
		SELECT id, name, description, priority, is_active,
		       trigger_type, condition, action_type, action_config, created_at
		FROM ontology_rules
		WHERE name = $1`

	row := r.db.Pool.QueryRow(ctx, query, name)
	return r.scanRule(row)
}

// --- scan helpers ---

func (r *OntologySchemaRepo) scanClass(row pgx.Row) (*entity.Class, error) {
	var c entity.Class
	err := row.Scan(
		&c.ID, &c.Slug, &c.Name, &c.ParentID,
		&c.Description, &c.Icon, &c.SortOrder, &c.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan class: %w", err)
	}
	return &c, nil
}

func (r *OntologySchemaRepo) scanPropertyDef(row pgx.Row) (*entity.PropertyDef, error) {
	var d entity.PropertyDef
	var enumJSON []byte
	var defaultJSON []byte

	err := row.Scan(
		&d.ID, &d.ClassID, &d.Name, &d.DisplayName, &d.DataType,
		&enumJSON, &d.IsRequired, &defaultJSON, &d.Description,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan property def: %w", err)
	}

	if enumJSON != nil {
		if err := json.Unmarshal(enumJSON, &d.EnumValues); err != nil {
			return nil, fmt.Errorf("failed to unmarshal enum_values: %w", err)
		}
	}
	if defaultJSON != nil {
		if err := json.Unmarshal(defaultJSON, &d.DefaultValue); err != nil {
			return nil, fmt.Errorf("failed to unmarshal default_value: %w", err)
		}
	}

	return &d, nil
}

func (r *OntologySchemaRepo) scanRelationType(row pgx.Row) (*entity.RelationTypeDef, error) {
	var t entity.RelationTypeDef
	err := row.Scan(
		&t.ID, &t.Slug, &t.Name, &t.DisplayName,
		&t.SourceClassID, &t.TargetClassID,
		&t.Cardinality, &t.InverseID, &t.Description,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan relation type: %w", err)
	}
	return &t, nil
}

func (r *OntologySchemaRepo) scanRule(row pgx.Row) (*entity.Rule, error) {
	var rule entity.Rule
	var condJSON []byte
	var actionJSON []byte

	err := row.Scan(
		&rule.ID, &rule.Name, &rule.Description, &rule.Priority, &rule.IsActive,
		&rule.TriggerType, &condJSON, &rule.ActionType, &actionJSON, &rule.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan rule: %w", err)
	}

	if condJSON != nil {
		if err := json.Unmarshal(condJSON, &rule.Condition); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rule condition: %w", err)
		}
	}
	if actionJSON != nil {
		if err := json.Unmarshal(actionJSON, &rule.ActionConfig); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rule action_config: %w", err)
		}
	}

	return &rule, nil
}
