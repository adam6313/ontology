package mlservice

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ikala/ontix/config"
)

// Client ML Service HTTP 客戶端
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// New 建立 ML Service 客戶端
func New(cfg *config.Config) *Client {
	return &Client{
		baseURL:    "http://" + cfg.MLServiceAddr(),
		httpClient: &http.Client{},
	}
}

// Embedding 向量
type Embedding struct {
	Values []float32 `json:"values"`
}

// Cluster 聚類結果
type Cluster struct {
	Centroid Embedding `json:"centroid"`
	Size     int       `json:"size"`
	Name     string    `json:"name"`
	Keywords []string  `json:"keywords"`
}

// ClusteringRequest 聚類請求
type ClusteringRequest struct {
	Embeddings     []Embedding `json:"embeddings"`
	Texts          []string    `json:"texts"`
	MinClusterSize int         `json:"min_cluster_size"`
	TopicContext   string      `json:"topic_context,omitempty"` // Topic 名稱，用於生成更精準的子群名稱
}

// ClusteringResponse 聚類回應
type ClusteringResponse struct {
	Clusters   []Cluster `json:"clusters"`
	Labels     []int     `json:"labels"` // cluster index for each post (-1 = noise)
	NoiseCount int       `json:"noise_count"`
}

// RunClustering 執行 HDBSCAN 聚類
func (c *Client) RunClustering(ctx context.Context, req *ClusteringRequest) (*ClusteringResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/cluster", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("server error %d: %s", resp.StatusCode, string(respBody))
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var result ClusteringResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	return &result, nil
}
