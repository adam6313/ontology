# Entity Layer Design - 實體識別層設計

> 文檔版本：v1.0
> 日期：2026-02-06
> 狀態：設計階段

## 背景

### 現有架構問題

目前系統架構：`Post → Topic → Cluster → Aspects`

**問題**：無法區分是哪個品牌/餐廳/產品的評價

```
現狀：
Cluster: 美食推薦（混在一起）
  ├─ 炎香樓（粵菜）
  ├─ 好個來重慶酸辣粉
  ├─ 點點心
  └─ 藍海饌（料理包）

Aspects 全部混在一起 → 無法區分是哪家餐廳的評價
```

### 品牌方真正想要的

```
Cluster: 美食推薦
  │
  ├─ Entity: 炎香樓
  │    └─ Aspect: 餐廳推薦 → positive
  │
  ├─ Entity: 點點心
  │    ├─ Aspect: 食物口感 → positive ("豬仔流沙包超療癒")
  │    └─ Aspect: 餐廳環境 → positive
  │
  └─ Entity: 藍海饌
       ├─ Aspect: 方便性 → positive ("6分鐘上桌")
       └─ Aspect: 使用場景 → positive ("適合露營")
```

---

## 使用場景分析

### 核心使用場景

| 優先級 | 場景 | 用戶故事 | 數據需求 |
|--------|------|---------|---------|
| **P0** | 品牌聲量監控 | 品牌方想知道「SK-II 這週被討論了多少次」 | Entity mention count + trend |
| **P0** | 品牌情感分析 | 品牌方想知道「顧客對我們產品的評價是正面還是負面」 | Entity → Aspects → Sentiment |
| **P0** | 競品比較 | 品牌方想知道「SK-II vs 雅詩蘭黛 的口碑差異」 | 多 Entity 的 Aspect 對比 |
| **P1** | 產品問題追蹤 | 品牌方想知道「哪個產品最近負評變多了」 | Entity → Aspect(negative) trend |
| **P1** | 新品上市監控 | 品牌方想知道「新品 iPhone 17 的市場反應」 | Entity(新) → Aspects 聚合 |
| **P1** | 門店評價 | 連鎖店想知道「哪家分店評價最差」 | Entity(店) → Location → Aspects |
| **P2** | KOL 提及追蹤 | 品牌方想知道「哪些 KOL 在討論我們」 | Entity → Author → Influence |
| **P2** | 產品線分析 | 品牌方想知道「護膚線 vs 彩妝線 的口碑」 | Entity hierarchy aggregation |

### 查詢路徑範例

```
品牌方查詢路徑：
  Brand("SK-II")
    → Products(["神仙水", "大紅瓶", "小燈泡"])
    → Posts mentioning these
    → Aspects per product
    → Sentiment distribution
```

---

## 技術方案：Entity 識別

### 方案對比

| 方案 | 準確度 | 延遲 | 成本 | 消歧能力 | 推薦度 |
|------|--------|------|------|---------|--------|
| **LLM 直接提取** | 高 (90%+) | 中 (~500ms) | 高 ($0.001/post) | 強 | ⭐⭐⭐⭐ |
| **專用 NER 模型** | 中 (75%) | 低 (~10ms) | 低 | 弱 | ⭐⭐ |
| **混合方案** | 高 (92%+) | 中 (~200ms) | 中 | 強 | ⭐⭐⭐⭐⭐ |

### 推薦：混合方案

```
階段 1: 規則 + 字典快速匹配 (10ms)
  ├─ 已知品牌字典匹配 ("SK-II", "麥當勞")
  ├─ 正則匹配模式 (店名 pattern: "XX店", "XX門市")
  └─ 命中 → 直接返回 Entity

階段 2: LLM 深度提取 (500ms，僅未命中時)
  ├─ 提取未知 Entity
  ├─ 消歧處理
  └─ 補充 Entity 字典（學習新品牌）
```

### Entity 消歧方案

```python
class EntityResolver:
    def resolve(self, mention: str) -> Entity:
        # 1. 精確匹配
        if mention in self.alias_map:
            return self.alias_map[mention]

        # 2. Embedding 相似度
        mention_emb = embed(mention)
        candidates = self.find_similar(mention_emb, threshold=0.85)

        # 3. LLM 確認（僅模糊情況）
        if len(candidates) > 1:
            return self.llm_disambiguate(mention, candidates)

        # 4. 新 Entity
        return self.create_new_entity(mention)
```

**消歧範例：**

| 原始提及 | 標準化 Entity | 方法 |
|---------|--------------|------|
| 麥當勞 | McDonald's | 字典匹配 |
| 麥當當 | McDonald's | Embedding 相似度 |
| 老麥 | McDonald's | LLM 消歧 |
| 金拱門 | McDonald's | LLM 消歧 |

---

## 數據模型設計

### 新增表結構

```sql
-- 1. Entity 主表（標準化實體）
CREATE TABLE entities (
    id BIGSERIAL PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,      -- 標準名稱 "McDonald's"
    entity_type VARCHAR(32) NOT NULL,          -- brand/restaurant/product/person/location
    parent_id BIGINT REFERENCES entities(id),  -- 層級關係：品牌→產品線→產品
    embedding VECTOR(1536),                    -- 用於相似搜索
    metadata JSONB DEFAULT '{}',               -- 額外資訊（官網、Logo URL 等）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Entity 別名表（消歧用）
CREATE TABLE entity_aliases (
    id BIGSERIAL PRIMARY KEY,
    entity_id BIGINT NOT NULL REFERENCES entities(id),
    alias VARCHAR(255) NOT NULL,               -- "麥當勞", "麥當當", "老麥"
    alias_type VARCHAR(32) DEFAULT 'common',   -- official/common/slang/typo
    confidence REAL DEFAULT 1.0,
    UNIQUE(alias)
);

-- 3. Post-Entity 關聯（一篇帖子可提及多個 Entity）
CREATE TABLE post_entities (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    entity_id BIGINT NOT NULL REFERENCES entities(id),
    mention_text VARCHAR(255),                 -- 原始提及文字
    sentiment VARCHAR(16),                     -- 對該 Entity 的情感
    confidence REAL DEFAULT 0.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, entity_id)
);

-- 4. Entity-Aspect 關聯（核心！Aspect 關聯到 Entity）
CREATE TABLE entity_aspects (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    entity_id BIGINT NOT NULL REFERENCES entities(id),
    aspect VARCHAR(128) NOT NULL,              -- "口感", "服務", "價格"
    sentiment VARCHAR(16) NOT NULL,            -- positive/negative/neutral
    mention TEXT,                              -- 原文摘錄
    confidence REAL DEFAULT 0.8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_parent ON entities(parent_id);
CREATE INDEX idx_entities_embedding ON entities USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_entity_aliases_alias ON entity_aliases(alias);
CREATE INDEX idx_post_entities_post ON post_entities(post_id);
CREATE INDEX idx_post_entities_entity ON post_entities(entity_id);
CREATE INDEX idx_entity_aspects_entity ON entity_aspects(entity_id);
CREATE INDEX idx_entity_aspects_aspect ON entity_aspects(aspect);
```

### ER 關係圖

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   posts     │────<│  post_entities  │>────│  entities   │
└─────────────┘     └─────────────────┘     └──────┬──────┘
                                                   │
                           ┌───────────────────────┼───────────────────────┐
                           │                       │                       │
                    ┌──────┴──────┐         ┌──────┴──────┐         ┌──────┴──────┐
                    │entity_aliases│         │entity_aspects│         │  (self-ref) │
                    │  (消歧別名)  │         │ (Entity情感) │         │   parent    │
                    └─────────────┘         └─────────────┘         └─────────────┘
```

### 範例查詢

#### 查詢特定品牌的 Aspect 情感

```sql
SELECT
    e.canonical_name,
    ea.aspect,
    ea.sentiment,
    COUNT(*) as count,
    ARRAY_AGG(DISTINCT LEFT(ea.mention, 50)) as samples
FROM entities e
JOIN entity_aspects ea ON e.id = ea.entity_id
WHERE e.canonical_name = '點點心'
   OR e.id IN (SELECT entity_id FROM entity_aliases WHERE alias = '點點心')
GROUP BY e.canonical_name, ea.aspect, ea.sentiment
ORDER BY count DESC;
```

#### 競品比較

```sql
SELECT
    e.canonical_name as brand,
    ea.aspect,
    SUM(CASE WHEN ea.sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
    SUM(CASE WHEN ea.sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
    ROUND(100.0 * SUM(CASE WHEN ea.sentiment = 'positive' THEN 1 ELSE 0 END) / COUNT(*), 1) as positive_rate
FROM entities e
JOIN entity_aspects ea ON e.id = ea.entity_id
WHERE e.canonical_name IN ('SK-II', '雅詩蘭黛')
GROUP BY e.canonical_name, ea.aspect
ORDER BY e.canonical_name, (positive + negative) DESC;
```

#### 品牌層級聚合

```sql
WITH RECURSIVE brand_tree AS (
    SELECT id, canonical_name, parent_id, 0 as level
    FROM entities WHERE canonical_name = 'Apple'
    UNION ALL
    SELECT e.id, e.canonical_name, e.parent_id, bt.level + 1
    FROM entities e
    JOIN brand_tree bt ON e.parent_id = bt.id
)
SELECT
    bt.canonical_name as product,
    bt.level,
    COUNT(ea.id) as mention_count,
    ROUND(AVG(CASE WHEN ea.sentiment = 'positive' THEN 1
                   WHEN ea.sentiment = 'negative' THEN 0
                   ELSE 0.5 END) * 100, 1) as sentiment_score
FROM brand_tree bt
LEFT JOIN entity_aspects ea ON bt.id = ea.entity_id
GROUP BY bt.id, bt.canonical_name, bt.level
ORDER BY bt.level, mention_count DESC;
```

---

## 架構設計

### Entity 層位置

```
新架構：

Post ──┬── Topic (主題分類：美食、旅遊...)
       │
       ├── Entity (實體：點點心、SK-II...) ◄── 新增
       │      │
       │      └── Entity Aspects (該實體的評價)
       │
       └── Cluster (語義聚類：美食推薦、髮型變化...)
              │
              └── Cluster Aspects (舊，可保留或遷移)
```

### Entity 與 Cluster 的關係

| 維度 | Entity | Cluster |
|------|--------|---------|
| **定義方式** | 提取識別（NER） | 自動聚類（HDBSCAN） |
| **穩定性** | 穩定（麥當勞永遠是麥當勞） | 動態（隨數據變化） |
| **粒度** | 精確到品牌/產品 | 語義主題 |
| **用途** | 品牌監控、競品分析 | 趨勢發現、熱點識別 |
| **關係** | 一個 Entity 可出現在多個 Cluster | 一個 Cluster 包含多個 Entity |

**協同價值：**

```
Cluster "美食推薦"
  → 包含 Entities: [點點心, 炎香樓, 藍海饌, ...]
  → 品牌方可以：
     1. 先看 Cluster 趨勢（美食推薦 cluster 在增長）
     2. 再看自己品牌在該 Cluster 的佔比
     3. 對比競品在同 Cluster 的表現
```

### 是否需要 Knowledge Graph？

| 階段 | 建議 | 說明 |
|------|------|------|
| **短期 MVP** | 不需要 | 簡單的 parent_id 層級關係已足夠 |
| **中期 Scale** | 輕量 KG | 增加關係類型：owns, competes_with, located_in |
| **長期 Enterprise** | Full KG | Neo4j 或 PostgreSQL + Apache AGE |

**中期 Entity 關係類型：**
- `owns` (品牌 → 產品)
- `competes_with` (競品關係)
- `located_in` (門店 → 地區)
- `subsidiary_of` (子品牌 → 母公司)

### 系統架構圖

```
                     ┌─────────────────────────────────────┐
                     │         Entity Service              │
                     │  ┌─────────┐  ┌─────────────────┐  │
                     │  │ NER     │  │ Entity Resolver │  │
Write Path:          │  │ Extract │→ │ (消歧 + 標準化) │  │
Post → Queue →       │  └─────────┘  └────────┬────────┘  │
                     │                        ↓           │
                     │              ┌─────────────────┐   │
                     │              │ Entity Store    │   │
                     │              │ (PostgreSQL)    │   │
                     │              └─────────────────┘   │
                     └─────────────────────────────────────┘

Read Path:           ┌─────────────────────────────────────┐
                     │         Query Service               │
Brand Dashboard →    │  ┌─────────────────────────────┐   │
                     │  │ Entity Aggregation Engine   │   │
                     │  │ - Aspect 統計               │   │
                     │  │ - 趨勢計算                  │   │
                     │  │ - 競品對比                  │   │
                     │  └─────────────────────────────┘   │
                     └─────────────────────────────────────┘
```

---

## LLM Prompt 設計

### 修改後的 AnalyzePost Prompt

```
分析以下社群貼文，提取結構化資訊。

貼文內容：
{content}

請回傳 JSON：
{
  "sentiment": "positive|negative|neutral|mixed",
  "intent": "sharing|recommendation|complaint|question|promotion",
  "product_type": "產品類別（如：餐廳、護膚品、手機）",

  "entities": [
    {
      "name": "實體名稱（品牌/餐廳/產品）",
      "type": "brand|restaurant|product|person|location",
      "sentiment": "對該實體的情感",
      "aspects": [
        {
          "aspect": "評價面向（如：口感、服務、價格）",
          "sentiment": "positive|negative|neutral",
          "mention": "原文相關描述"
        }
      ]
    }
  ],

  "soft_tags": [
    {"tag": "標籤", "confidence": 0.9}
  ]
}

規則：
1. entities 必須是具體的品牌、餐廳、產品名稱，不是泛稱
2. 每個 entity 可以有多個 aspects
3. aspect 的 mention 要摘錄原文
```

---

## 實作計劃

### Phase 1: MVP（1-2 週）

- [ ] 新增資料表：`entities`, `entity_aliases`, `post_entities`, `entity_aspects`
- [ ] 修改 LLM Prompt 增加 Entity 提取
- [ ] 簡單字典消歧（常見品牌）
- [ ] 基礎查詢 API：`GET /api/entities/{name}/aspects`

### Phase 2: 優化（2-4 週）

- [ ] Embedding-based 消歧
- [ ] Entity 層級關係（parent_id）
- [ ] 品牌 Dashboard API
- [ ] 競品對比功能
- [ ] Entity 趨勢 API

### Phase 3: 擴展（長期）

- [ ] Knowledge Graph（關係類型擴充）
- [ ] 自動品牌發現（從 Cluster 中識別新品牌）
- [ ] Entity 趨勢預測
- [ ] 多語言 Entity 對齊

---

## 成本估算

### LLM 成本（GPT-4o-mini）

| 項目 | 計算 | 成本 |
|------|------|------|
| Entity 提取 | 已包含在現有 AnalyzePost | +$0 |
| Entity 消歧（LLM 輔助） | ~5% 帖子需要 × $0.0005 | +$12.5/天 |
| **總計** | 500K posts/day | **~$45/天** |

### 存儲成本

| 項目 | 估算 | 成本 |
|------|------|------|
| entities 表 | ~100K entities | 可忽略 |
| entity_aspects 表 | ~2M rows/month | ~$5/month |
| Embedding 存儲 | 100K × 1536 × 4 bytes | ~600MB |

---

## 風險與緩解

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| Entity 識別不準確 | 錯誤的品牌關聯 | 人工審核 + 用戶反饋機制 |
| 消歧錯誤 | 不同品牌混淆 | Embedding threshold 調優 + LLM 確認 |
| 新品牌漏識別 | 遺漏重要品牌 | 定期從 Cluster 挖掘新 Entity |
| 層級關係維護成本 | 需要人工建立品牌-產品關係 | 先從大品牌開始，逐步擴展 |

---

## 參考資料

- [Named Entity Recognition (NER) 最佳實踐](https://huggingface.co/tasks/token-classification)
- [Knowledge Graph 設計模式](https://neo4j.com/developer/guide-data-modeling/)
- [Aspect-Based Sentiment Analysis](https://paperswithcode.com/task/aspect-based-sentiment-analysis)
