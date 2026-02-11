package service

import "context"

// ClusteringService HDBSCAN 聚類服務介面
type ClusteringService interface {
	RunClustering(ctx context.Context, req *ClusteringRequest) (*ClusteringResponse, error)
}

// ClusteringRequest 聚類請求
type ClusteringRequest struct {
	Embeddings     [][]float32
	Texts          []string
	MinClusterSize int
}

// ClusteringResponse 聚類回應
type ClusteringResponse struct {
	Clusters   []ClusterResult
	NoiseCount int
}

// ClusterResult 聚類結果
type ClusterResult struct {
	Centroid []float32
	Size     int
	Name     string
	Keywords []string
}
