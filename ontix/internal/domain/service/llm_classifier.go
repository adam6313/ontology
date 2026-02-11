package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/sashabaranov/go-openai"
)

// LLMClassifier LLM 分類服務
type LLMClassifier struct {
	client *openai.Client
	model  string
	topics []*entity.Topic
}

// LLMClassificationResult LLM 分類結果
type LLMClassificationResult struct {
	PrimaryTopic   string  `json:"primary"`
	SecondaryTopic *string `json:"secondary"`
	Confidence     string  `json:"confidence"` // high, medium, low
	Reason         string  `json:"reason"`

	// 元數據
	InputTokens  int
	OutputTokens int
	CostUSD      float64
	LatencyMS    int64
	ModelUsed    string
}

// NewLLMClassifier 建立 LLM 分類器
func NewLLMClassifier(apiKey string, model string, topics []*entity.Topic) *LLMClassifier {
	client := openai.NewClient(apiKey)
	if model == "" {
		model = openai.GPT4oMini
	}
	return &LLMClassifier{
		client: client,
		model:  model,
		topics: topics,
	}
}

// Classify 使用 LLM 分類單篇貼文
func (c *LLMClassifier) Classify(ctx context.Context, content string) (*LLMClassificationResult, error) {
	start := time.Now()

	// 準備主題列表
	topicNames := make([]string, len(c.topics))
	for i, t := range c.topics {
		topicNames[i] = t.Name
	}

	// 截斷過長內容
	if len(content) > 500 {
		content = content[:500] + "..."
	}

	prompt := fmt.Sprintf(`你是社群貼文分類專家。請分析以下貼文並分類到最適合的主題。

可用主題列表：
%s

貼文內容：
%s

請分析貼文內容，選擇最適合的主題。如果貼文明顯涵蓋兩個主題，可以指定次要主題。

回傳 JSON 格式（只回傳 JSON，不要其他文字）：
{
  "primary": "主要主題名稱",
  "secondary": "次要主題名稱（如果沒有則為 null）",
  "confidence": "high/medium/low",
  "reason": "簡短說明分類理由（20字內）"
}`, strings.Join(topicNames, "、"), content)

	resp, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: c.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleUser, Content: prompt},
		},
		Temperature: 0,
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("OpenAI API error: %w", err)
	}

	latency := time.Since(start).Milliseconds()

	// 解析回應
	var result LLMClassificationResult
	if len(resp.Choices) > 0 {
		if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
			return nil, fmt.Errorf("failed to parse LLM response: %w", err)
		}
	}

	// 計算成本 (GPT-4o-mini pricing)
	result.InputTokens = resp.Usage.PromptTokens
	result.OutputTokens = resp.Usage.CompletionTokens
	result.CostUSD = c.calculateCost(resp.Usage.PromptTokens, resp.Usage.CompletionTokens)
	result.LatencyMS = latency
	result.ModelUsed = c.model

	return &result, nil
}

// ClassifyBatch 批次分類多篇貼文
func (c *LLMClassifier) ClassifyBatch(ctx context.Context, posts []entity.Post, onProgress func(current, total int)) ([]*LLMClassificationResult, error) {
	results := make([]*LLMClassificationResult, len(posts))

	for i, post := range posts {
		result, err := c.Classify(ctx, post.Content)
		if err != nil {
			// 記錄錯誤但繼續處理
			results[i] = &LLMClassificationResult{
				PrimaryTopic: "其他",
				Confidence:   "low",
				Reason:       fmt.Sprintf("分類失敗: %v", err),
			}
			continue
		}
		results[i] = result

		if onProgress != nil {
			onProgress(i+1, len(posts))
		}

		// Rate limiting: 避免超過 API 限制
		if i < len(posts)-1 {
			time.Sleep(50 * time.Millisecond)
		}
	}

	return results, nil
}

// FindTopicByName 根據名稱找主題
func (c *LLMClassifier) FindTopicByName(name string) *entity.Topic {
	for _, t := range c.topics {
		if t.Name == name {
			return t
		}
	}
	return nil
}

// calculateCost 計算 API 成本
func (c *LLMClassifier) calculateCost(inputTokens, outputTokens int) float64 {
	// GPT-4o-mini pricing (as of 2024)
	// Input: $0.15 per 1M tokens
	// Output: $0.60 per 1M tokens
	var inputPrice, outputPrice float64

	switch c.model {
	case openai.GPT4oMini:
		inputPrice = 0.15 / 1_000_000
		outputPrice = 0.60 / 1_000_000
	case openai.GPT4o:
		inputPrice = 2.50 / 1_000_000
		outputPrice = 10.00 / 1_000_000
	default:
		// gpt-4o-mini pricing as default
		inputPrice = 0.15 / 1_000_000
		outputPrice = 0.60 / 1_000_000
	}

	return float64(inputTokens)*inputPrice + float64(outputTokens)*outputPrice
}

// GetTopics 取得主題列表
func (c *LLMClassifier) GetTopics() []*entity.Topic {
	return c.topics
}
