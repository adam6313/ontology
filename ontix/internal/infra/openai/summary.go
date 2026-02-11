package openai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ikala/ontix/internal/domain/service"
)

// GenerateEntitySummary 使用 LLM 為 Entity 生成 AI 洞察摘要
func (c *Client) GenerateEntitySummary(ctx context.Context, req *service.EntitySummaryRequest) (*service.EntitySummaryResult, error) {
	// Format aspects
	var aspectLines []string
	for _, a := range req.TopAspects {
		aspectLines = append(aspectLines, fmt.Sprintf("- %s (%s, +%d/-%d, total %d)",
			a.Aspect, a.Sentiment, a.PositiveCount, a.NegativeCount, a.Total))
	}
	aspectSection := "None"
	if len(aspectLines) > 0 {
		aspectSection = strings.Join(aspectLines, "\n")
	}

	// Format negative aspects
	var negLines []string
	for _, a := range req.NegAspects {
		negLines = append(negLines, fmt.Sprintf("- %s (negative %d/%d)", a.Aspect, a.NegativeCount, a.Total))
	}
	negSection := "None"
	if len(negLines) > 0 {
		negSection = strings.Join(negLines, "\n")
	}

	// Format facts with evidence
	var factLines []string
	for _, f := range req.RecentFacts {
		line := fmt.Sprintf("- [%s/%s] %s: %s", f.Type, f.Severity, f.Title, f.Description)
		if len(f.Evidence) > 0 {
			if evJSON, err := json.Marshal(f.Evidence); err == nil {
				line += fmt.Sprintf("\n  證據: %s", string(evJSON))
			}
		}
		factLines = append(factLines, line)
	}
	factSection := "無"
	if len(factLines) > 0 {
		factSection = strings.Join(factLines, "\n")
	}

	// Format sample negative mentions
	negMentions := "None"
	if len(req.SampleNeg) > 0 {
		var quoted []string
		for _, q := range req.SampleNeg {
			quoted = append(quoted, fmt.Sprintf("  \"%s\"", q))
		}
		negMentions = strings.Join(quoted, "\n")
	}

	// Sentiment delta text
	deltaText := "無資料"
	if req.Stats.MentionDelta != nil {
		d := *req.Stats.MentionDelta
		if d > 0 {
			deltaText = fmt.Sprintf("較上期 +%d", d)
		} else if d < 0 {
			deltaText = fmt.Sprintf("較上期 %d", d)
		} else {
			deltaText = "與上期持平"
		}
	}

	prompt := fmt.Sprintf(`你是 Ontix 品牌知識圖譜的輿情分析師。Ontix 透過 Ontology 推理引擎，從社群數據中自動建構實體知識圖譜，並持續追蹤每個實體的 Aspect 面向評價、情感趨勢、跨實體關聯，最終產出 Alerts（異常警報）、Trends（趨勢變化）、Insights（洞察）和 Risk Signals（風險訊號）。

現在請根據以下 Ontology 引擎為「%s」（%s）產出的結構化數據，撰寫一段精煉的中文洞察摘要。

時間範圍：%s
趨勢方向：%s

【統計概覽】
- 總提及數：%d（%s）
- 平均情感分數：%.2f
- 正面：%d｜負面：%d｜中性：%d｜混合：%d

【Aspect 面向分析】（Ontology 自動識別的消費者關注面向）
%s

【負面突出面向】
%s

【Ontology 推理引擎產出的 Insights & Alerts】
以下是推理引擎透過跨期比較、異常偵測、關聯分析自動產出的警報與洞察，這是最重要的資訊來源，請務必深入分析每一條：
%s

【代表性負面提及原文】
%s

要求：
1. headline：一句話重點（15-25字），點出最關鍵的變化或洞察
2. reasoning_chain：推理鏈，2-3 個步驟，每步包含：
   - signal：偵測到的訊號（直接引用 Alert/Trend 的標題或 Aspect 數據，例如「B5修復霜過敏通報增加 3 則」）
   - reasoning：推理邏輯（為什麼這個訊號重要，跟其他訊號有什麼因果關聯）
   - conclusion：結論（對品牌的具體影響）
   這是展現 Ontology 推理引擎價值的核心，務必讓每一步邏輯清晰、有數據佐證
3. body：中文綜合分析（150-250字）。串聯 reasoning_chain 的結論，給出整體研判。
   - 正面/重要的數據和結論用 **粗體** 標記，例如「**正面評價佔比提升至 65%%**」
   - 負面/風險/下降的數據用 !!紅色標記!!，例如「!!負面提及較上期增加 45%%!!」「!!品牌信任度面臨風險!!」
4. actions：每條 action 必須是 reasoning_chain 某一步 conclusion 的直接延伸，禁止憑空發明與數據無關的建議（例如「發布專題文章介紹成分功效」就是典型的空泛行銷建議，與數據無關）。
   每條為一個物件，包含：
   - trigger：直接複製 reasoning_chain 中對應步驟的 conclusion 關鍵句（讓用戶能追溯這條建議從哪來）
   - action：針對該 conclusion 的具體回應措施。必須回答「做什麼 + 怎麼做 + 誰來做」。
     禁止清單：「加強溝通」「持續關注」「推出專題文章」「進行推廣」「吸引互動」等無法追溯到數據的通用行銷語句。
     好的範例（假設 conclusion 是「B5修復霜過敏通報 3 則集中在同一批號」）：「品管團隊立即凍結該批號庫存，客服團隊逐一聯繫 3 位通報者確認症狀與使用方式，48 小時內產出初步調查報告」
   - target：從上方統計數據中引用具體數字，說明改善前→改善後的預期變化（例如「將『成分安全性』Aspect 負面佔比從目前 45%% 降至 25%%」）

回覆嚴格 JSON 格式（不要加任何其他文字）：
{"headline": "...", "reasoning_chain": [{"signal": "...", "reasoning": "...", "conclusion": "..."}, ...], "body": "...", "actions": [{"trigger": "...", "action": "...", "target": "..."}, ...]}`,
		req.EntityName, req.EntityType, req.PeriodLabel, req.TrendDir,
		req.Stats.MentionCount, deltaText, req.Stats.AvgSentiment,
		req.Stats.PositiveCount, req.Stats.NegativeCount, req.Stats.NeutralCount, req.Stats.MixedCount,
		aspectSection, negSection, factSection, negMentions)

	chatReq := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens:   1200,
		Temperature: 0.3,
	}

	body, err := json.Marshal(chatReq)
	if err != nil {
		return nil, fmt.Errorf("marshal summary request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create summary request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send summary request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read summary response: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("unmarshal summary response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("empty summary response")
	}

	// Extract JSON object from response
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
		return nil, fmt.Errorf("no JSON object found in summary response: %s", responseText)
	}

	jsonStr := responseText[start:end]

	var summary service.EntitySummaryResult
	if err := json.Unmarshal([]byte(jsonStr), &summary); err != nil {
		return nil, fmt.Errorf("parse summary result (json: %s): %w", jsonStr, err)
	}

	summary.GeneratedAt = time.Now().UTC().Format(time.RFC3339)

	return &summary, nil
}
