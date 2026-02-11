package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ApiResponse 統一列表回應 envelope
type ApiResponse struct {
	Data       any             `json:"data"`
	Pagination *PaginationMeta `json:"pagination,omitempty"`
}

// PaginationMeta 分頁資訊
type PaginationMeta struct {
	Offset  int  `json:"offset"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasMore bool `json:"has_more"`
}

// respondList 回應列表資料（含分頁）
func respondList(c *gin.Context, data any, offset, limit, total int) {
	c.JSON(http.StatusOK, ApiResponse{
		Data: data,
		Pagination: &PaginationMeta{
			Offset:  offset,
			Limit:   limit,
			Total:   total,
			HasMore: offset+limit < total,
		},
	})
}

// respondOne 回應單筆資料
func respondOne(c *gin.Context, data any) {
	c.JSON(http.StatusOK, ApiResponse{Data: data})
}
