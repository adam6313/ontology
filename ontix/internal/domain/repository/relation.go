package repository

import (
	"context"

	"github.com/ikala/ontix/internal/domain/entity"
)

// ObjectRelationRepository typed relations 的讀寫
// 取代 ObjectRepository 中舊的 SaveLink / FindLinksBySource
type ObjectRelationRepository interface {
	// SaveRelation 儲存 typed relation（UPSERT on source + target + type）
	SaveRelation(ctx context.Context, rel *entity.ObjectRelation) error

	// FindRelationsBySource 查詢某 entity 的所有出向關係
	FindRelationsBySource(ctx context.Context, sourceID string) ([]*entity.ObjectRelation, error)

	// FindRelationsByTarget 查詢某 entity 的所有入向關係
	FindRelationsByTarget(ctx context.Context, targetID string) ([]*entity.ObjectRelation, error)

	// FindRelationsByType 查詢某 entity 沿特定關係類型的相關 entities
	// direction: "outgoing" / "incoming" / "both"
	FindRelationsByType(ctx context.Context, objectID string, relationTypeID int, direction string) ([]*entity.ObjectRelation, error)

	// TraverseRelation 沿指定關係 slug 遍歷圖（推理引擎核心）
	// 回傳目標 objects + 對應的 relation
	TraverseRelation(ctx context.Context, objectID string, relationSlug string, direction string) ([]*entity.ObjectRelation, error)
}
