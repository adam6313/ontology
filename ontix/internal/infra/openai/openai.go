package openai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/service"
)

// Client OpenAI 客戶端
type Client struct {
	apiKey         string
	embeddingModel string
	httpClient     *http.Client
}

// New 建立 OpenAI 客戶端
func New(cfg *config.Config) (*Client, error) {
	apiKey := cfg.OpenAIAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is required")
	}

	return &Client{
		apiKey:         apiKey,
		embeddingModel: "text-embedding-3-small",
		httpClient:     &http.Client{},
	}, nil
}

// === EmbeddingService 實作 ===

type embeddingRequest struct {
	Model string `json:"model"`
	Input string `json:"input"`
}

type embeddingResponse struct {
	Data []struct {
		Embedding []float32 `json:"embedding"`
	} `json:"data"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type batchEmbeddingRequest struct {
	Model string   `json:"model"`
	Input []string `json:"input"`
}

// Embed 產生單一文本的向量
func (c *Client) Embed(ctx context.Context, text string) ([]float32, error) {
	req := embeddingRequest{
		Model: c.embeddingModel,
		Input: text,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result embeddingResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Data) == 0 {
		return nil, fmt.Errorf("empty embedding response")
	}

	return result.Data[0].Embedding, nil
}

// BatchEmbed 批次產生向量
func (c *Client) BatchEmbed(ctx context.Context, texts []string) ([][]float32, error) {
	req := batchEmbeddingRequest{
		Model: c.embeddingModel,
		Input: texts,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result embeddingResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	embeddings := make([][]float32, len(result.Data))
	for i, d := range result.Data {
		embeddings[i] = d.Embedding
	}

	return embeddings, nil
}

// === LLMService 實作 ===

type chatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens"`
	Temperature float64       `json:"temperature"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type tagResult struct {
	Name       string  `json:"name"`
	Type       string  `json:"type"`
	Confidence float64 `json:"confidence"`
}

// GenerateTags 使用 LLM 產生標籤
func (c *Client) GenerateTags(ctx context.Context, content string) ([]service.TagResult, error) {
	prompt := fmt.Sprintf(`分析以下社群貼文，提取結構化標籤。

貼文內容：
%s

請以 JSON 格式回傳標籤列表：
[
  {"name": "標籤名稱", "type": "類型", "confidence": 0.95}
]

標籤類型（type）必須是以下之一：
- brand: 品牌名稱（如 Apple, Samsung, MAC, 蘭蔻, Nike）
- product: 產品名稱（如 iPhone 16, 口紅, 粉底, AirPods）
- topic: 主題/內容類型（如 開箱, 評測, 教學, 比較）
- sentiment: 情緒傾向（只能是：推薦, 不推, 普通）

規則：
1. 品牌和產品必須提取，如果貼文有明確提到的話
2. 情緒標籤必須有且只有一個
3. 主題標籤 1-3 個
4. confidence 範圍 0.0-1.0
5. 總共 3-8 個標籤`, content)

	req := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens:   500,
		Temperature: 0.2,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("empty response")
	}

	// 解析 JSON 回應
	responseText := result.Choices[0].Message.Content

	// 嘗試找到 JSON 陣列
	start := -1
	end := -1
	for i, ch := range responseText {
		if ch == '[' && start == -1 {
			start = i
		}
		if ch == ']' {
			end = i + 1
		}
	}

	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no JSON array found in response")
	}

	jsonStr := responseText[start:end]

	var tags []tagResult
	if err := json.Unmarshal([]byte(jsonStr), &tags); err != nil {
		return nil, fmt.Errorf("failed to parse tags: %w", err)
	}

	// 轉換為返回類型
	results := make([]service.TagResult, len(tags))
	for i, t := range tags {
		category := service.TagCategoryTopic
		isHardTag := false
		switch t.Type {
		case "brand":
			category = service.TagCategoryBrand
			isHardTag = true
		case "product":
			category = service.TagCategoryProduct
			isHardTag = true
		case "sentiment":
			category = service.TagCategorySentiment
		case "topic":
			category = service.TagCategoryTopic
		}
		results[i] = service.TagResult{
			Name:       t.Name,
			Category:   category,
			Confidence: t.Confidence,
			IsHardTag:  isHardTag,
		}
	}

	return results, nil
}

// === TaggingService 實作 (全量 LLM 智能標註) ===

// AnalyzePost 分析貼文，回傳完整標註結果
func (c *Client) AnalyzePost(ctx context.Context, content string) (*service.PostAnalysis, error) {
	prompt := fmt.Sprintf(`你是社群貼文分析專家。分析以下貼文：

貼文內容：
"""
%s
"""

請回覆 JSON（嚴格遵守格式，不要加任何其他文字）：
{
  "sentiment": {
    "label": "positive 或 negative 或 neutral 或 mixed",
    "score": 0.0到1.0之間的數字,
    "reason": "簡短說明原因"
  },
  "soft_tags": [
    {"tag": "標籤名稱", "confidence": 0.0到1.0之間的數字}
  ],
  "aspects": [
    {"aspect": "面向名稱", "sentiment": "positive或negative或neutral", "mention": "相關原文片段"}
  ],
  "product_type": "產品類型（如無則為空字串）",
  "intent": "review 或 question 或 sharing 或 complaint 或 recommendation"
}

規則：
1. soft_tags 提取 3-8 個標籤，包含產品特性、使用場景、膚質類型等
2. aspects 提取貼文中提到的具體面向評價（如持妝度、遮瑕力、控油效果等）
3. sentiment.label 根據整體情感傾向判斷
4. sentiment.score: positive=0.7-1.0, neutral=0.4-0.6, negative=0.0-0.3, mixed=0.4-0.6
5. intent 判斷貼文意圖類型`, content)

	req := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens:   800,
		Temperature: 0.1,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("empty response")
	}

	// 解析 JSON 回應
	responseText := result.Choices[0].Message.Content

	// 嘗試找到 JSON 物件
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
		return nil, fmt.Errorf("no JSON object found in response: %s", responseText)
	}

	jsonStr := responseText[start:end]

	var analysis service.PostAnalysis
	if err := json.Unmarshal([]byte(jsonStr), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse analysis (json: %s): %w", jsonStr, err)
	}

	return &analysis, nil
}

// === EntityExtractionService 實作 ===

// ExtractEntities 從貼文中抽取 Entity 及歸屬的 Aspect
//
// 方案 E：Prompt 注入已知 Entity + 手動別名兜底
// - knownEntities 注入 Prompt，LLM 直接回傳 canonical_name（一次呼叫完成抽取+消歧）
// - 例如：已知 [星巴克(brand)]，貼文出現 "Starbucks" → LLM 直接回傳 name="星巴克"
func (c *Client) ExtractEntities(ctx context.Context, content string, knownEntities []service.KnownEntity) (*service.EntityExtractionResult, error) {
	// 建構已知 Entity 列表字串
	knownSection := ""
	if len(knownEntities) > 0 {
		knownSection = "\n\n【已知實體清單】\n以下是系統中已存在的實體。如果貼文提到這些實體（包含翻譯、暱稱、簡稱、英文名），" +
			"請直接使用清單中的名稱作為 name，不要用貼文中的原始寫法。\n"
		for _, e := range knownEntities {
			switch {
			case e.ClassName != "" && e.Category != "":
				knownSection += fmt.Sprintf("- %s (%s/%s) [%s]\n", e.CanonicalName, e.Type, e.ClassName, e.Category)
			case e.ClassName != "":
				knownSection += fmt.Sprintf("- %s (%s/%s)\n", e.CanonicalName, e.Type, e.ClassName)
			default:
				knownSection += fmt.Sprintf("- %s (%s)\n", e.CanonicalName, e.Type)
			}
		}
		knownSection += "\n如果貼文提到的實體不在清單中，才視為新實體。\n"
	}

	prompt := fmt.Sprintf(`【任務背景】
你在一個「品牌輿情監控系統」中負責實體抽取。這個系統的目標是追蹤社群媒體上人們討論了哪些品牌、產品、店家、人物、作品、活動，以及對它們的評價。
抽取出的實體會建成知識圖譜，供品牌方查詢：「消費者怎麼看我的品牌？」「哪個 KOL 提過我的產品？」「競品的評價如何？」

因此，你應該只抽取「有人會想查詢、追蹤、比較」的具名實體。
純地址、泛稱角色（全職媽媽、上班族）、形容詞、情境描述都不是實體。
%s
貼文內容：
"""
%s
"""

請回覆 JSON（嚴格遵守格式，不要加任何其他文字）：
{
  "entities": [
    {
      "name": "實體名稱（如果匹配到已知實體，使用已知實體的名稱）",
      "type": "8 種類型之一（見下方）",
      "class": "ontology 類別（見下方，盡量用最具體的）",
      "sub_type": "細分類型（見下方）",
      "category": "（僅 content_topic 必填）美妝/穿搭/美食/旅遊/3C/生活/健身/寵物/其他",
      "sentiment": "positive 或 negative 或 neutral 或 mixed",
      "sentiment_score": 0.0到1.0,
      "mention_text": "貼文中提及此實體的原文片段",
      "aspects": [
        {
          "aspect": "具體面向（如：服務態度、CP值、口味、包裝設計、持妝度）",
          "sentiment": "positive 或 negative 或 neutral",
          "sentiment_score": 0.0到1.0,
          "mention": "相關原文片段"
        }
      ]
    }
  ],
  "relationships": [
    {
      "source": "來源實體名稱（必須出現在上方 entities 中）",
      "target": "目標實體名稱（必須出現在上方 entities 中）",
      "relation": "關係類型（見下方 ontology relation）"
    }
  ]
}

type 分類（8 種，向後相容）：
brand / product / place / person / work / event / organization / content_topic

content_topic: 可長期追蹤的內容主題。粒度介於行業大類和具體單品之間。
  ✅ 好的 topic: 美妝教程、油痘肌護膚、韓系穿搭、開架粉底液評比
  ❌ 不是 topic: 美妝（太寬，這是 category）、XX牌氣墊粉餅N201色號（太窄，這是 product）

class 細分（ontology 類別，盡量用最具體的）：
- brand: 商業品牌（Apple, SK-II, 麥當勞）
- agency: 行銷/廣告/公關代理商
- institution: 政府、學校、醫院、NGO（台大醫院, 教育部）
- product: 一般產品（分不清時用此）
- physical_product: 實體產品（iPhone, 神仙水）
- service: 服務型產品（訂閱制, SaaS, 課程）
- person: 一般人物（分不清時用此）
- creator: KOL、部落客、YouTuber（理科太太）
- public_figure: 藝人、運動員、政治人物（周杰倫, 大谷翔平）
- place: 一般地點（分不清時用此）
- venue: 具體場所：餐廳、沙龍、飯店、診所（鼎泰豐信義店, 2006hairsalon）
- region: 城市、行政區（不建議抽取，除非有分析價值）
- creative_work: 一般作品
- content: 影視、遊戲、音樂、書籍（黑神話悟空, 魷魚遊戲）
- campaign: 行銷活動、聯名企劃
- event: 活動（周杰倫演唱會, 雙11）
- topic: 內容主題（美妝教程、油痘肌護膚、韓系穿搭）

type 與 class 的對應範例：
- type=brand, class=brand（Apple）
- type=product, class=physical_product（iPhone）
- type=place, class=venue（2006hairsalon）
- type=person, class=creator（Carol凱若）
- type=work, class=content（魷魚遊戲）
- type=organization, class=institution（台大醫院）
- type=event, class=event（周杰倫演唱會）
- type=content_topic, class=topic（美妝教程）

sub_type 細分類型：
- brand: tech / beauty / food / fashion / finance / retail / service / platform
- product: electronics / cosmetics / food / clothing / software
- place: restaurant / cafe / salon / hotel / clinic / gym / attraction
- person: kol / celebrity / athlete / politician / creator
- work: movie / drama / game / song / book / app / podcast
- event: concert / festival / sale / launch / exhibition
- organization: government / school / hospital / ngo

分類判斷原則：
- 「鼎泰豐」討論品牌整體 → type=brand class=brand，討論去某家店 → type=place class=venue
- 平台/服務本身 → type=brand class=brand（Netflix, Uber），上面的內容 → type=work class=content（魷魚遊戲）
- 髮廊、診所、健身房 → type=place class=venue（sub_type 填 salon/clinic/gym）
- 純地名（台北、東京、台中、台南）不要抽取。城市/國家/行政區只是地理背景，沒有輿情分析價值

product 命名原則（重要！）：
- product 必須是具體的、可購買的、有唯一品名的產品。品名通常含品牌+產品線+型號/系列。
  ✅ 好的 product: 「安耐曬金鑽高效防曬露」「理膚寶水安心霜」「B5全面修復霜」「iPhone 15 Pro」
  ❌ 不是 product:
    - 功效/品類描述：「極效防曬」「美白精華」「控油」「保濕」→ 這是 aspect，不是產品
    - 品牌+功效：「理膚寶水極效防曬」→ 拆成 brand「理膚寶水」+ aspect「極效防曬」歸屬到品牌
    - 泛稱品類：「洗面乳」「化妝水」「精華液」→ 太泛，不是具名產品
- 判斷方法：如果同一個名字可以指多個品牌的產品，它就不是 product，而是品類描述或 aspect。
  例如「極效防曬」→ 理膚寶水有、CeraVe 也有 → 不是具名 product
- 「品牌+通用功效」的結構（如「理膚寶水極效防曬」）通常是行銷用語而非正式品名。
  應抽取品牌（理膚寶水）並將功效（極效防曬）作為 aspect。
  除非它確實是官方產品線名稱（如「安耐曬金鑽高效防曬露」是完整品名）。

關係類型（relationships.relation）：
- belongs_to: 產品隸屬品牌（木瓜牛奶 → belongs_to → 鬍子茶）
- has_product: 品牌擁有產品（Apple → has_product → MacBook）
- competes_with: 同類競爭（星巴克 → competes_with → 路易莎）
- founded_by: 品牌創辦人（2006hairsalon → founded_by → Carol凱若）
- founded: 人物創辦品牌（Carol凱若 → founded → 2006hairsalon）
- endorses: 代言推薦（周杰倫 → endorses → Nike）。KOL 正面推薦品牌/產品時用此關係
- reviews: KOL 評測產品（美妝小安 → reviews → B5全面修復霜）。作者評測、開箱、心得分享用此關係
- works_at: 任職（Carol凱若 → works_at → 2006hairsalon）
- located_in: 位於某區域（鼎泰豐信義店 → located_in → 信義區）
- sub_brand_of: 子品牌（Let's Cafe → sub_brand_of → 全家）
- produced_by: 製作者（魷魚遊戲 → produced_by → Netflix）
- discusses: KOL/人物討論某主題（Carol凱若 → discusses → 美妝教程）
- relevant_to: 主題相關品牌（油痘肌護膚 → relevant_to → 理膚寶水）

關係抽取指引：
- 積極抽取關係！只要貼文中能合理推斷出的關係就應該填寫
- 貼文作者（KOL）如果在評測/推薦某產品，請建立 reviews 或 endorses 關係
- 產品提到品牌時，建立 belongs_to 關係
- 對比兩個同類產品/品牌時，建立 competes_with 關係
- 如果只有一個 entity 或確實看不出關係，relationships 才留空陣列

規則：
1. 只抽取「具名實體」— 有人會想搜尋、追蹤的對象。泛稱不算（「手機」不算，「iPhone」才算）
2. 品牌和其下具體產品都要抽取（SK-II + 神仙水 = 兩個 entity）
3. Aspect 必須歸屬到它所描述的 entity
4. sentiment_score: positive=0.7~1.0, neutral=0.4~0.6, negative=0.0~0.3, mixed=0.4~0.6
5. 如果貼文沒有提到任何具名實體，回傳 {"entities": [], "relationships": []}
6. content_topic 抽取原則：
   - 若貼文在討論一個可追蹤的主題概念（如「油痘肌護膚」、「美妝教程」），抽取為 content_topic
   - 必須填寫 category 欄位（美妝/穿搭/美食/旅遊/3C/生活/健身/寵物/其他）
   - 如果文中有 person 在討論 topic，加入 discusses 關係（person → discusses → topic）
   - 如果文中有 brand 與 topic 相關，加入 relevant_to 關係（topic → relevant_to → brand）`, knownSection, content)

	req := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens:   1500,
		Temperature: 0.1,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("empty response")
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
		return nil, fmt.Errorf("no JSON object found in response: %s", responseText)
	}

	jsonStr := responseText[start:end]

	var extraction service.EntityExtractionResult
	if err := json.Unmarshal([]byte(jsonStr), &extraction); err != nil {
		return nil, fmt.Errorf("failed to parse entity extraction (json: %s): %w", jsonStr, err)
	}

	return &extraction, nil
}
