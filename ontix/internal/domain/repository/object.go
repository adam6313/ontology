package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// ObjectRepository Entity 儲存庫介面
type ObjectRepository interface {
	// --- Object CRUD ---

	// SaveObject 建立或更新 Entity（同時自動建立 canonical_name 為別名）
	SaveObject(ctx context.Context, obj *entity.Object) error

	// FindObjectByID 根據 ID 查詢 Entity
	FindObjectByID(ctx context.Context, id string) (*entity.Object, error)

	// FindObjectByName 根據正規名稱查詢（精確匹配）
	FindObjectByName(ctx context.Context, objectType entity.ObjectType, name string) (*entity.Object, error)

	// SetClassID 設定 Entity 的 ontology class（class_id）
	SetClassID(ctx context.Context, objectID string, classID int) error

	// ListActiveObjects 列出所有 active Entity（用於 Prompt 注入消歧）
	ListActiveObjects(ctx context.Context) ([]*entity.Object, error)

	// UpdateProperties 更新 Entity 的 properties JSONB 欄位（merge，非覆蓋）
	UpdateProperties(ctx context.Context, objectID string, props map[string]any) error

	// --- Alias & Entity Resolution ---

	// ResolveEntity 用任意名稱找到對應 Entity（查別名表）
	// 這是 Entity Resolution 的核心：傳入「麥當當」回傳「麥當勞」的 Object
	ResolveEntity(ctx context.Context, name string) (*entity.Object, error)

	// SaveAlias 新增別名
	SaveAlias(ctx context.Context, alias *entity.ObjectAlias) error

	// --- Links ---

	// SaveLink 建立 Entity 之間的關係
	SaveLink(ctx context.Context, link *entity.ObjectLink) error

	// FindLinksBySource 查詢某 Entity 的所有關係（例：SK-II 的所有產品）
	FindLinksBySource(ctx context.Context, sourceID string) ([]*entity.ObjectLink, error)

	// --- Mentions ---

	// SaveMention 記錄貼文提及 Entity
	SaveMention(ctx context.Context, mention *entity.PostEntityMention) error

	// FindMentionsByObject 查詢某 Entity 被哪些貼文提及
	FindMentionsByObject(ctx context.Context, objectID string, limit int) ([]*entity.PostEntityMention, error)

	// --- Entity Aspects ---

	// SaveEntityAspect 儲存 Entity 的 Aspect 評價
	SaveEntityAspect(ctx context.Context, aspect *entity.EntityAspect) error

	// FindAspectsByObject 查詢某 Entity 的所有 Aspect 評價
	FindAspectsByObject(ctx context.Context, objectID string) ([]*entity.EntityAspect, error)
}
