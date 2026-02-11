package openai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/service"
)

// GenerateNarrative 使用 LLM 將一組 facts 串聯成中文敘事洞察
func (c *Client) GenerateNarrative(ctx context.Context, req *service.NarrativeRequest) (*service.NarrativeResult, error) {
	// 格式化 facts 清單
	var factLines []string
	for i, f := range req.Facts {
		icon := "INFO"
		switch f.Severity {
		case entity.FactSeverityCritical:
			icon = "CRITICAL"
		case entity.FactSeverityWarning:
			icon = "WARNING"
		}
		factLines = append(factLines, fmt.Sprintf("%d. [%s] %s — %s", i+1, icon, f.Title, f.Description))
	}
	factList := strings.Join(factLines, "\n")

	prompt := fmt.Sprintf(`你是品牌輿情分析師。請根據以下推理引擎產出的警報/趨勢，為「%s」（%s）撰寫一段中文週報洞察。

時間：%s

本期警報/趨勢：
%s

要求：
1. 串聯因果：將多個警報的關聯性點出（例如產品口碑下滑 + 競品崛起 = 雙重壓力）
2. 歸納趨勢：識別整體走向（上升/下滑/分化）
3. 給出建議：一句話建議品牌方接下來該關注什麼
4. title: 短標題，15-20字，點出核心洞察
5. body: 敘事內容，100-200字，語氣專業但易讀

回覆 JSON（嚴格遵守格式，不要加任何其他文字）：
{"title": "短標題", "body": "敘事內容"}`, req.EntityName, req.EntityClass, req.PeriodLabel, factList)

	chatReq := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens:   500,
		Temperature: 0.3,
	}

	body, err := json.Marshal(chatReq)
	if err != nil {
		return nil, fmt.Errorf("marshal narrative request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create narrative request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send narrative request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read narrative response: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("unmarshal narrative response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("empty narrative response")
	}

	// 解析 JSON 回應
	responseText := result.Choices[0].Message.Content

	start := -1
	end := -1
	depth := 0
	for i, ch := range responseText {
		if ch == '{' {
			if start == -1 {
				start = i
			}
			depth++
		}
		if ch == '}' {
			depth--
			if depth == 0 {
				end = i + 1
				break
			}
		}
	}

	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no JSON object found in narrative response: %s", responseText)
	}

	jsonStr := responseText[start:end]

	var narrative service.NarrativeResult
	if err := json.Unmarshal([]byte(jsonStr), &narrative); err != nil {
		return nil, fmt.Errorf("parse narrative result (json: %s): %w", jsonStr, err)
	}

	return &narrative, nil
}
