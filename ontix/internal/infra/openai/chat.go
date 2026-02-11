package openai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/ikala/ontix/internal/domain/service"
)

type streamChatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens"`
	Temperature float64       `json:"temperature"`
	Stream      bool          `json:"stream"`
}

type streamDelta struct {
	Content string `json:"content"`
}

type streamChoice struct {
	Delta        streamDelta `json:"delta"`
	FinishReason *string     `json:"finish_reason"`
}

type streamChunk struct {
	Choices []streamChoice `json:"choices"`
}

// StreamEntityChat 使用 OpenAI streaming API 進行 Entity follow-up 對話
func (c *Client) StreamEntityChat(ctx context.Context, req *service.EntityChatRequest) (<-chan string, <-chan error) {
	tokenCh := make(chan string, 64)
	errCh := make(chan error, 1)

	go func() {
		defer close(tokenCh)
		defer close(errCh)

		// Build system prompt
		systemPrompt := fmt.Sprintf(`你是 Ontix Ontology 推理引擎的分析師。你已為「%s」（%s）生成以下洞察摘要，用戶正在針對摘要內容追問。

已生成的摘要：
%s

原始數據上下文：
%s

回答規則：
1. 引用具體數據佐證你的回答
2. 支援 **粗體** 標記重要數據和結論
3. 支援 !!紅色!! 標記風險或負面資訊
4. 提及【關聯實體】清單中的任何實體時，一律使用 [[實體名稱|實體ID]] 格式，系統會自動渲染為可點擊連結（用戶只看到名稱，看不到 ID）。絕對不要在回答中直接顯示 ID。每一次提到清單中的實體名稱都必須用此格式包裹，不能有遺漏。只引用清單中存在的實體，不要編造 ID
5. 回答簡潔精準，150-300 字
6. 如果用戶問的超出你掌握的數據範圍，坦白說明`, req.EntityName, req.EntityType, req.SummaryJSON, req.ContextData)

		// Assemble messages
		messages := []chatMessage{
			{Role: "system", Content: systemPrompt},
		}
		for _, h := range req.History {
			messages = append(messages, chatMessage{Role: h.Role, Content: h.Content})
		}
		messages = append(messages, chatMessage{Role: "user", Content: req.Question})

		chatReq := streamChatRequest{
			Model:       "gpt-4o-mini",
			Messages:    messages,
			MaxTokens:   800,
			Temperature: 0.4,
			Stream:      true,
		}

		body, err := json.Marshal(chatReq)
		if err != nil {
			errCh <- fmt.Errorf("marshal chat request: %w", err)
			return
		}

		httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
		if err != nil {
			errCh <- fmt.Errorf("create chat request: %w", err)
			return
		}

		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

		resp, err := c.httpClient.Do(httpReq)
		if err != nil {
			errCh <- fmt.Errorf("send chat request: %w", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			errCh <- fmt.Errorf("OpenAI API returned status %d", resp.StatusCode)
			return
		}

		// Read SSE stream from OpenAI
		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				break
			}

			var chunk streamChunk
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}

			for _, choice := range chunk.Choices {
				if choice.Delta.Content != "" {
					select {
					case tokenCh <- choice.Delta.Content:
					case <-ctx.Done():
						return
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			errCh <- fmt.Errorf("read stream: %w", err)
		}
	}()

	return tokenCh, errCh
}
