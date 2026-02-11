package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// ObjectRelationRepo PostgreSQL 實作的 ObjectRelationRepository
type ObjectRelationRepo struct {
	db *DB
}

// NewObjectRelationRepo 建立 ObjectRelationRepository
func NewObjectRelationRepo(db *DB) repository.ObjectRelationRepository {
	return &ObjectRelationRepo{db: db}
}

// SaveRelation 儲存 typed relation（UPSERT on source + target + type）
func (r *ObjectRelationRepo) SaveRelation(ctx context.Context, rel *entity.ObjectRelation) error {
	propsJSON, err := json.Marshal(rel.Properties)
	if err != nil {
		return fmt.Errorf("failed to marshal relation properties: %w", err)
	}

	query := `
		INSERT INTO object_relations
			(source_id, target_id, relation_type_id, confidence, source, properties)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (source_id, target_id, relation_type_id)
		DO UPDATE SET
			confidence = EXCLUDED.confidence,
			source     = EXCLUDED.source,
			properties = EXCLUDED.properties
		RETURNING id, created_at`

	err = r.db.Pool.QueryRow(ctx, query,
		rel.SourceID, rel.TargetID, rel.RelationTypeID,
		rel.Confidence, rel.Source, propsJSON,
	).Scan(&rel.ID, &rel.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to save relation: %w", err)
	}
	return nil
}

// FindRelationsBySource 查詢某 entity 的所有出向關係（含 target object 資訊）
func (r *ObjectRelationRepo) FindRelationsBySource(ctx context.Context, sourceID string) ([]*entity.ObjectRelation, error) {
	query := `
		SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
		       r.confidence, r.source, r.properties, r.created_at,
		       rt.slug, rt.name, rt.display_name,
		       o.canonical_name AS target_name
		FROM object_relations r
		JOIN ontology_relation_types rt ON r.relation_type_id = rt.id
		JOIN objects o ON r.target_id = o.id
		WHERE r.source_id = $1
		ORDER BY rt.id, r.created_at`

	rows, err := r.db.Pool.Query(ctx, query, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to query relations by source: %w", err)
	}
	defer rows.Close()

	var relations []*entity.ObjectRelation
	for rows.Next() {
		rel, err := r.scanRelationWithMeta(rows)
		if err != nil {
			return nil, err
		}
		relations = append(relations, rel)
	}
	return relations, nil
}

// FindRelationsByTarget 查詢某 entity 的所有入向關係（含 source object 資訊）
func (r *ObjectRelationRepo) FindRelationsByTarget(ctx context.Context, targetID string) ([]*entity.ObjectRelation, error) {
	query := `
		SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
		       r.confidence, r.source, r.properties, r.created_at,
		       rt.slug, rt.name, rt.display_name,
		       o.canonical_name AS source_name
		FROM object_relations r
		JOIN ontology_relation_types rt ON r.relation_type_id = rt.id
		JOIN objects o ON r.source_id = o.id
		WHERE r.target_id = $1
		ORDER BY rt.id, r.created_at`

	rows, err := r.db.Pool.Query(ctx, query, targetID)
	if err != nil {
		return nil, fmt.Errorf("failed to query relations by target: %w", err)
	}
	defer rows.Close()

	var relations []*entity.ObjectRelation
	for rows.Next() {
		rel, err := r.scanRelationWithMeta(rows)
		if err != nil {
			return nil, err
		}
		relations = append(relations, rel)
	}
	return relations, nil
}

// FindRelationsByType 查詢某 entity 沿特定關係類型的相關 entities
// direction: "outgoing" / "incoming" / "both"
func (r *ObjectRelationRepo) FindRelationsByType(ctx context.Context, objectID string, relationTypeID int, direction string) ([]*entity.ObjectRelation, error) {
	var query string
	var args []any

	switch direction {
	case "outgoing":
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at
			FROM object_relations r
			WHERE r.source_id = $1 AND r.relation_type_id = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationTypeID}
	case "incoming":
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at
			FROM object_relations r
			WHERE r.target_id = $1 AND r.relation_type_id = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationTypeID}
	default: // "both"
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at
			FROM object_relations r
			WHERE (r.source_id = $1 OR r.target_id = $1) AND r.relation_type_id = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationTypeID}
	}

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query relations by type: %w", err)
	}
	defer rows.Close()

	var relations []*entity.ObjectRelation
	for rows.Next() {
		rel, err := r.scanRelation(rows)
		if err != nil {
			return nil, err
		}
		relations = append(relations, rel)
	}
	return relations, nil
}

// TraverseRelation 沿指定關係 slug 遍歷圖（推理引擎核心）
// 回傳沿關係連結的 target objects + 對應的 relation
// direction: "outgoing" → 沿 source→target; "incoming" → 沿 target→source
func (r *ObjectRelationRepo) TraverseRelation(ctx context.Context, objectID string, relationSlug string, direction string) ([]*entity.ObjectRelation, error) {
	var query string
	var args []any

	switch direction {
	case "outgoing":
		// 沿 source→target 方向：找 source_id = objectID 且 relation slug 匹配的
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at,
			       rt.slug, rt.name, rt.display_name,
			       o.canonical_name AS other_name
			FROM object_relations r
			JOIN ontology_relation_types rt ON r.relation_type_id = rt.id
			JOIN objects o ON r.target_id = o.id
			WHERE r.source_id = $1 AND rt.slug = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationSlug}
	case "incoming":
		// 沿 target→source 方向：找 target_id = objectID 且 relation slug 匹配的
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at,
			       rt.slug, rt.name, rt.display_name,
			       o.canonical_name AS other_name
			FROM object_relations r
			JOIN ontology_relation_types rt ON r.relation_type_id = rt.id
			JOIN objects o ON r.source_id = o.id
			WHERE r.target_id = $1 AND rt.slug = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationSlug}
	default: // "both"
		// 雙向：找任一端為 objectID 且 slug 匹配的
		query = `
			SELECT r.id, r.source_id, r.target_id, r.relation_type_id,
			       r.confidence, r.source, r.properties, r.created_at,
			       rt.slug, rt.name, rt.display_name,
			       CASE
			           WHEN r.source_id = $1 THEN t.canonical_name
			           ELSE s.canonical_name
			       END AS other_name
			FROM object_relations r
			JOIN ontology_relation_types rt ON r.relation_type_id = rt.id
			JOIN objects s ON r.source_id = s.id
			JOIN objects t ON r.target_id = t.id
			WHERE (r.source_id = $1 OR r.target_id = $1) AND rt.slug = $2
			ORDER BY r.created_at`
		args = []any{objectID, relationSlug}
	}

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to traverse relation: %w", err)
	}
	defer rows.Close()

	var relations []*entity.ObjectRelation
	for rows.Next() {
		rel, err := r.scanRelationWithMeta(rows)
		if err != nil {
			return nil, err
		}
		relations = append(relations, rel)
	}
	return relations, nil
}

// --- scan helpers ---

// scanRelation 掃描基本 relation 欄位（不含 JOIN 的額外欄位）
func (r *ObjectRelationRepo) scanRelation(row pgx.Row) (*entity.ObjectRelation, error) {
	var rel entity.ObjectRelation
	var propsJSON []byte

	err := row.Scan(
		&rel.ID, &rel.SourceID, &rel.TargetID, &rel.RelationTypeID,
		&rel.Confidence, &rel.Source, &propsJSON, &rel.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan relation: %w", err)
	}

	if propsJSON != nil {
		if err := json.Unmarshal(propsJSON, &rel.Properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal relation properties: %w", err)
		}
	}
	return &rel, nil
}

// scanRelationWithMeta 掃描 relation + relation_type 名稱 + 對端 object 名稱
func (r *ObjectRelationRepo) scanRelationWithMeta(row pgx.Row) (*entity.ObjectRelation, error) {
	var rel entity.ObjectRelation
	var propsJSON []byte
	var rtSlug, rtName, rtDisplayName string
	var otherName string

	err := row.Scan(
		&rel.ID, &rel.SourceID, &rel.TargetID, &rel.RelationTypeID,
		&rel.Confidence, &rel.Source, &propsJSON, &rel.CreatedAt,
		&rtSlug, &rtName, &rtDisplayName,
		&otherName,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan relation with meta: %w", err)
	}

	if propsJSON != nil {
		if err := json.Unmarshal(propsJSON, &rel.Properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal relation properties: %w", err)
		}
	}

	// Populate relation type
	rel.RelationType = &entity.RelationTypeDef{
		ID:          rel.RelationTypeID,
		Slug:        rtSlug,
		Name:        rtName,
		DisplayName: rtDisplayName,
	}

	return &rel, nil
}
