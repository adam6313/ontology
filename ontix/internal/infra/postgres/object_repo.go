package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/jackc/pgx/v5"
)

// ObjectRepo PostgreSQL 實作的 ObjectRepository
type ObjectRepo struct {
	db *DB
}

// NewObjectRepo 建立 ObjectRepository
func NewObjectRepo(db *DB) repository.ObjectRepository {
	return &ObjectRepo{db: db}
}

// SaveObject 建立或更新 Entity
// 同時自動將 canonical_name 存為別名，確保用正規名稱也能 ResolveEntity
func (r *ObjectRepo) SaveObject(ctx context.Context, obj *entity.Object) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	propsJSON, err := json.Marshal(obj.Properties)
	if err != nil {
		return fmt.Errorf("failed to marshal properties: %w", err)
	}

	now := time.Now()

	if obj.ID != "" {
		// 更新
		_, err = tx.Exec(ctx, `
			UPDATE objects SET canonical_name = $1, properties = $2, status = $3, updated_at = $4
			WHERE id = $5`,
			obj.CanonicalName, propsJSON, obj.Status, now, obj.ID)
		if err != nil {
			return fmt.Errorf("failed to update object: %w", err)
		}
	} else {
		// 新建：用 type name 查 type_id
		var typeID int
		err = tx.QueryRow(ctx,
			`SELECT id FROM object_types WHERE name = $1`, string(obj.Type)).Scan(&typeID)
		if err != nil {
			return fmt.Errorf("failed to find object type %q: %w", obj.Type, err)
		}

		err = tx.QueryRow(ctx, `
			INSERT INTO objects (type_id, canonical_name, properties, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $5)
			RETURNING id`,
			typeID, obj.CanonicalName, propsJSON, entity.ObjectStatusActive, now,
		).Scan(&obj.ID)
		if err != nil {
			return fmt.Errorf("failed to insert object: %w", err)
		}
		obj.TypeID = typeID
		obj.Status = entity.ObjectStatusActive
		obj.CreatedAt = now
		obj.UpdatedAt = now

		// 自動將 canonical_name 加為別名
		_, err = tx.Exec(ctx, `
			INSERT INTO object_aliases (object_id, alias, source, confidence)
			VALUES ($1, $2, 'system', 1.0)
			ON CONFLICT (alias) DO NOTHING`,
			obj.ID, obj.CanonicalName)
		if err != nil {
			return fmt.Errorf("failed to insert canonical alias: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// SetClassID 設定 Entity 的 ontology class
func (r *ObjectRepo) SetClassID(ctx context.Context, objectID string, classID int) error {
	_, err := r.db.Pool.Exec(ctx,
		`UPDATE objects SET class_id = $1, updated_at = NOW() WHERE id = $2`,
		classID, objectID)
	if err != nil {
		return fmt.Errorf("failed to set class_id: %w", err)
	}
	return nil
}

// UpdateProperties 合併更新 Entity 的 properties
func (r *ObjectRepo) UpdateProperties(ctx context.Context, objectID string, props map[string]any) error {
	propsJSON, err := json.Marshal(props)
	if err != nil {
		return fmt.Errorf("marshal properties: %w", err)
	}
	_, err = r.db.Pool.Exec(ctx,
		`UPDATE objects SET properties = COALESCE(properties, '{}'::jsonb) || $1::jsonb, updated_at = NOW() WHERE id = $2`,
		propsJSON, objectID)
	if err != nil {
		return fmt.Errorf("failed to update properties: %w", err)
	}
	return nil
}

// FindObjectByID 根據 UUID 查詢 Entity
func (r *ObjectRepo) FindObjectByID(ctx context.Context, id string) (*entity.Object, error) {
	query := `
		SELECT o.id, o.type_id, ot.name, o.class_id, o.canonical_name, o.properties, o.status, o.created_at, o.updated_at
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.id = $1`

	row := r.db.Pool.QueryRow(ctx, query, id)
	return r.scanObject(row)
}

// ListActiveObjects 列出所有 active Entity（用於 Prompt 注入消歧）
func (r *ObjectRepo) ListActiveObjects(ctx context.Context) ([]*entity.Object, error) {
	query := `
		SELECT o.id, o.type_id, ot.name, o.class_id, o.canonical_name, o.properties, o.status, o.created_at, o.updated_at
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE o.status = 'active'
		ORDER BY o.canonical_name`

	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list active objects: %w", err)
	}
	defer rows.Close()

	var objects []*entity.Object
	for rows.Next() {
		var obj entity.Object
		var propsJSON []byte
		err := rows.Scan(
			&obj.ID, &obj.TypeID, &obj.Type, &obj.ClassID,
			&obj.CanonicalName, &propsJSON,
			&obj.Status, &obj.CreatedAt, &obj.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan object: %w", err)
		}
		if propsJSON != nil {
			if err := json.Unmarshal(propsJSON, &obj.Properties); err != nil {
				return nil, fmt.Errorf("failed to unmarshal properties: %w", err)
			}
		}
		objects = append(objects, &obj)
	}
	return objects, nil
}

// FindObjectByName 根據正規名稱精確查詢
func (r *ObjectRepo) FindObjectByName(ctx context.Context, objectType entity.ObjectType, name string) (*entity.Object, error) {
	query := `
		SELECT o.id, o.type_id, ot.name, o.class_id, o.canonical_name, o.properties, o.status, o.created_at, o.updated_at
		FROM objects o
		JOIN object_types ot ON o.type_id = ot.id
		WHERE ot.name = $1 AND o.canonical_name = $2 AND o.status = 'active'`

	row := r.db.Pool.QueryRow(ctx, query, string(objectType), name)
	return r.scanObject(row)
}

// ResolveEntity 用任意名稱（含別名）找到對應 Entity
// 先查別名表，找到 object_id 再撈 object
func (r *ObjectRepo) ResolveEntity(ctx context.Context, name string) (*entity.Object, error) {
	query := `
		SELECT o.id, o.type_id, ot.name, o.class_id, o.canonical_name, o.properties, o.status, o.created_at, o.updated_at
		FROM object_aliases oa
		JOIN objects o ON oa.object_id = o.id
		JOIN object_types ot ON o.type_id = ot.id
		WHERE oa.alias = $1 AND o.status = 'active'`

	row := r.db.Pool.QueryRow(ctx, query, name)
	return r.scanObject(row)
}

// SaveAlias 新增別名
func (r *ObjectRepo) SaveAlias(ctx context.Context, alias *entity.ObjectAlias) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO object_aliases (object_id, alias, source, confidence)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (alias) DO UPDATE SET
			confidence = GREATEST(object_aliases.confidence, EXCLUDED.confidence)`,
		alias.ObjectID, alias.Alias, alias.Source, alias.Confidence)
	if err != nil {
		return fmt.Errorf("failed to save alias: %w", err)
	}
	return nil
}

// SaveLink 建立 Entity 之間的關係
func (r *ObjectRepo) SaveLink(ctx context.Context, link *entity.ObjectLink) error {
	propsJSON, err := json.Marshal(link.Properties)
	if err != nil {
		return fmt.Errorf("failed to marshal link properties: %w", err)
	}

	_, err = r.db.Pool.Exec(ctx, `
		INSERT INTO object_links (source_id, target_id, link_type, properties)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (source_id, target_id, link_type) DO UPDATE SET
			properties = EXCLUDED.properties`,
		link.SourceID, link.TargetID, link.LinkType, propsJSON)
	if err != nil {
		return fmt.Errorf("failed to save link: %w", err)
	}
	return nil
}

// FindLinksBySource 查詢某 Entity 的所有向外關係
func (r *ObjectRepo) FindLinksBySource(ctx context.Context, sourceID string) ([]*entity.ObjectLink, error) {
	query := `
		SELECT id, source_id, target_id, link_type, properties, created_at
		FROM object_links
		WHERE source_id = $1
		ORDER BY created_at`

	rows, err := r.db.Pool.Query(ctx, query, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to query links: %w", err)
	}
	defer rows.Close()

	var links []*entity.ObjectLink
	for rows.Next() {
		link, err := r.scanLink(rows)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}
	return links, nil
}

// SaveMention 記錄貼文提及 Entity
func (r *ObjectRepo) SaveMention(ctx context.Context, mention *entity.PostEntityMention) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO post_entity_mentions (post_id, object_id, sentiment, sentiment_score, mention_text, source)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (post_id, object_id) DO UPDATE SET
			sentiment = EXCLUDED.sentiment,
			sentiment_score = EXCLUDED.sentiment_score,
			mention_text = EXCLUDED.mention_text`,
		mention.PostID, mention.ObjectID, mention.Sentiment,
		mention.SentimentScore, mention.MentionText, mention.Source)
	if err != nil {
		return fmt.Errorf("failed to save mention: %w", err)
	}
	return nil
}

// FindMentionsByObject 查詢某 Entity 被哪些貼文提及
func (r *ObjectRepo) FindMentionsByObject(ctx context.Context, objectID string, limit int) ([]*entity.PostEntityMention, error) {
	query := `
		SELECT id, post_id, object_id, sentiment, sentiment_score, mention_text, source, created_at
		FROM post_entity_mentions
		WHERE object_id = $1
		ORDER BY created_at DESC
		LIMIT $2`

	rows, err := r.db.Pool.Query(ctx, query, objectID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query mentions: %w", err)
	}
	defer rows.Close()

	var mentions []*entity.PostEntityMention
	for rows.Next() {
		m, err := r.scanMention(rows)
		if err != nil {
			return nil, err
		}
		mentions = append(mentions, m)
	}
	return mentions, nil
}

// SaveEntityAspect 儲存 Entity 的 Aspect 評價
func (r *ObjectRepo) SaveEntityAspect(ctx context.Context, aspect *entity.EntityAspect) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		aspect.PostID, aspect.ObjectID, aspect.Aspect,
		aspect.Sentiment, aspect.SentimentScore, aspect.MentionText)
	if err != nil {
		return fmt.Errorf("failed to save entity aspect: %w", err)
	}
	return nil
}

// FindAspectsByObject 查詢某 Entity 的所有 Aspect 評價
func (r *ObjectRepo) FindAspectsByObject(ctx context.Context, objectID string) ([]*entity.EntityAspect, error) {
	query := `
		SELECT id, post_id, object_id, aspect, sentiment, sentiment_score, mention_text, created_at
		FROM entity_aspects
		WHERE object_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Pool.Query(ctx, query, objectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query entity aspects: %w", err)
	}
	defer rows.Close()

	var aspects []*entity.EntityAspect
	for rows.Next() {
		a, err := r.scanEntityAspect(rows)
		if err != nil {
			return nil, err
		}
		aspects = append(aspects, a)
	}
	return aspects, nil
}

// --- scan helpers ---

func (r *ObjectRepo) scanObject(row pgx.Row) (*entity.Object, error) {
	var obj entity.Object
	var propsJSON []byte

	err := row.Scan(
		&obj.ID, &obj.TypeID, &obj.Type, &obj.ClassID,
		&obj.CanonicalName, &propsJSON,
		&obj.Status, &obj.CreatedAt, &obj.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan object: %w", err)
	}

	if propsJSON != nil {
		if err := json.Unmarshal(propsJSON, &obj.Properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal properties: %w", err)
		}
	}
	return &obj, nil
}

func (r *ObjectRepo) scanLink(rows pgx.Rows) (*entity.ObjectLink, error) {
	var link entity.ObjectLink
	var propsJSON []byte

	err := rows.Scan(
		&link.ID, &link.SourceID, &link.TargetID,
		&link.LinkType, &propsJSON, &link.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan link: %w", err)
	}

	if propsJSON != nil {
		if err := json.Unmarshal(propsJSON, &link.Properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal link properties: %w", err)
		}
	}
	return &link, nil
}

func (r *ObjectRepo) scanMention(rows pgx.Rows) (*entity.PostEntityMention, error) {
	var m entity.PostEntityMention
	err := rows.Scan(
		&m.ID, &m.PostID, &m.ObjectID,
		&m.Sentiment, &m.SentimentScore,
		&m.MentionText, &m.Source, &m.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan mention: %w", err)
	}
	return &m, nil
}

func (r *ObjectRepo) scanEntityAspect(rows pgx.Rows) (*entity.EntityAspect, error) {
	var a entity.EntityAspect
	err := rows.Scan(
		&a.ID, &a.PostID, &a.ObjectID,
		&a.Aspect, &a.Sentiment, &a.SentimentScore,
		&a.MentionText, &a.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan entity aspect: %w", err)
	}
	return &a, nil
}
