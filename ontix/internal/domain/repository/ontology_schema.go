package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// OntologySchemaRepository 讀取 ontology schema 定義
// Schema 通常在啟動時載入 + 快取，不需要高頻寫入
type OntologySchemaRepository interface {
	// --- Classes ---

	// ListClasses 載入所有 class（含層級關係）
	ListClasses(ctx context.Context) ([]*entity.Class, error)

	// FindClassBySlug 根據 slug 查詢
	FindClassBySlug(ctx context.Context, slug string) (*entity.Class, error)

	// FindClassByID 根據 ID 查詢
	FindClassByID(ctx context.Context, id int) (*entity.Class, error)

	// --- Property Definitions ---

	// ListPropertyDefs 載入某 class 的屬性定義（含繼承的父類屬性）
	ListPropertyDefs(ctx context.Context, classID int) ([]*entity.PropertyDef, error)

	// ListAllPropertyDefs 載入所有屬性定義
	ListAllPropertyDefs(ctx context.Context) ([]*entity.PropertyDef, error)

	// --- Relation Types ---

	// ListRelationTypes 載入所有關係類型定義
	ListRelationTypes(ctx context.Context) ([]*entity.RelationTypeDef, error)

	// FindRelationTypeBySlug 根據 slug + source/target class 查詢
	FindRelationTypeBySlug(ctx context.Context, slug string, sourceClassID, targetClassID int) (*entity.RelationTypeDef, error)

	// FindRelationTypeByID 根據 ID 查詢
	FindRelationTypeByID(ctx context.Context, id int) (*entity.RelationTypeDef, error)

	// --- Rules ---

	// ListActiveRules 載入所有啟用的推理規則（按 priority DESC 排序）
	ListActiveRules(ctx context.Context) ([]*entity.Rule, error)

	// FindRuleByName 根據名稱查詢
	FindRuleByName(ctx context.Context, name string) (*entity.Rule, error)
}
