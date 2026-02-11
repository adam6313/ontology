package mlservice

import (
	"context"

	"github.com/ikala/ontix/internal/domain/service"
)

// ClusteringAdapter 將 ML Service Client 適配為 ClusteringService 介面
type ClusteringAdapter struct {
	client *Client
}

// NewClusteringAdapter 建立適配器
func NewClusteringAdapter(client *Client) service.ClusteringService {
	return &ClusteringAdapter{client: client}
}

// RunClustering 執行聚類
func (a *ClusteringAdapter) RunClustering(ctx context.Context, req *service.ClusteringRequest) (*service.ClusteringResponse, error) {
	// 轉換請求格式
	embeddings := make([]Embedding, len(req.Embeddings))
	for i, e := range req.Embeddings {
		embeddings[i] = Embedding{Values: e}
	}

	mlReq := &ClusteringRequest{
		Embeddings:     embeddings,
		Texts:          req.Texts,
		MinClusterSize: req.MinClusterSize,
	}

	// 呼叫 ML Service
	mlResp, err := a.client.RunClustering(ctx, mlReq)
	if err != nil {
		return nil, err
	}

	// 轉換回應格式
	clusters := make([]service.ClusterResult, len(mlResp.Clusters))
	for i, c := range mlResp.Clusters {
		clusters[i] = service.ClusterResult{
			Centroid: c.Centroid.Values,
			Size:     c.Size,
			Name:     c.Name,
			Keywords: c.Keywords,
		}
	}

	return &service.ClusteringResponse{
		Clusters:   clusters,
		NoiseCount: mlResp.NoiseCount,
	}, nil
}
