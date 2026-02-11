package gemini

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/service"
	"google.golang.org/api/option"
)

// Client Gemini 客戶端
type Client struct {
	client         *genai.Client
	embeddingModel string
	llmModel       string
}

// New 建立 Gemini 客戶端
func New(cfg *config.Config) (*Client, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(cfg.GeminiAPIKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}

	return &Client{
		client:         client,
		embeddingModel: "text-embedding-004",
		llmModel:       "gemini-2.0-flash",
	}, nil
}

// Close 關閉客戶端
func (c *Client) Close() error {
	return c.client.Close()
}

// === EmbeddingService 實作 ===

// Embed 產生單一文本的向量
func (c *Client) Embed(ctx context.Context, text string) ([]float32, error) {
	model := c.client.EmbeddingModel(c.embeddingModel)
	res, err := model.EmbedContent(ctx, genai.Text(text))
	if err != nil {
		return nil, fmt.Errorf("failed to embed: %w", err)
	}
	return res.Embedding.Values, nil
}

// BatchEmbed 批次產生向量
func (c *Client) BatchEmbed(ctx context.Context, texts []string) ([][]float32, error) {
	model := c.client.EmbeddingModel(c.embeddingModel)
	batch := model.NewBatch()
	for _, t := range texts {
		batch.AddContent(genai.Text(t))
	}

	res, err := model.BatchEmbedContents(ctx, batch)
	if err != nil {
		return nil, fmt.Errorf("failed to batch embed: %w", err)
	}

	embeddings := make([][]float32, len(res.Embeddings))
	for i, e := range res.Embeddings {
		embeddings[i] = e.Values
	}
	return embeddings, nil
}

// === LLMService 實作 ===

// GenerateTags 使用 LLM 產生標籤
func (c *Client) GenerateTags(ctx context.Context, content string) ([]service.TagResult, error) {
	model := c.client.GenerativeModel(c.llmModel)
	model.SetTemperature(0.2)
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`分析以下社群貼文內容，產生相關標籤。

貼文內容：
%s

請以 JSON 格式回傳標籤列表：
[
  {"name": "標籤名稱", "confidence": 0.95, "is_hard_tag": false}
]

規則：
1. 產生 3-8 個相關標籤
2. confidence 範圍 0.0-1.0
3. is_hard_tag: 如果是明確的產品類別（如「口紅」「粉底」）設為 true
4. 標籤應涵蓋：產品類型、品牌、功效、使用場景、情感傾向`, content)

	res, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate tags: %w", err)
	}

	if len(res.Candidates) == 0 || len(res.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from gemini")
	}

	// 解析 JSON 回應
	return parseTagResponse(res.Candidates[0].Content.Parts[0])
}
