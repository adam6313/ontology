# Ontology Architecture - 完整本體論架構設計

> 文檔版本：v1.0
> 日期：2026-02-06
> 狀態：設計階段

## 設計理念

### 從 Document-Centric 到 Object-Centric

```
傳統架構（以文檔為中心）：
  Post → 分析 → 標籤/情感/分類
  查詢：找到符合條件的帖子

Ontology 架構（以物件為中心）：
  Object（Brand/Product/Restaurant）→ 關係 → 派生屬性
  查詢：找到符合條件的實體，以及它們的狀態
```

### 核心價值

1. **統一語義層**：不同數據源映射到同一個 Object
2. **關係建模**：實體之間的關係是一等公民
3. **派生計算**：自動計算聚合指標
4. **語義查詢**：用自然語言問問題

---

## Ontology Schema 定義

### Object Types（物件類型）

```yaml
# ontology/schema/brand.yaml
object_type: Brand
description: 品牌實體，代表一個商業品牌

properties:
  - name: canonical_name
    type: string
    required: true
    description: 標準名稱

  - name: display_name
    type: string
    description: 顯示名稱

  - name: industry
    type: enum
    values: [美妝, 餐飲, 3C, 服飾, 汽車, 金融, 零售, 其他]

  - name: founded_year
    type: integer

  - name: country
    type: string

  - name: logo_url
    type: string

  - name: official_website
    type: string

links:
  - name: parent_company
    target: Brand
    cardinality: one
    description: 母公司

  - name: subsidiaries
    target: Brand
    cardinality: many
    inverse: parent_company

  - name: owns
    target: Product
    cardinality: many
    description: 擁有的產品

  - name: competes_with
    target: Brand
    cardinality: many
    symmetric: true
    description: 競爭對手

derived:
  - name: sentiment_score
    type: float
    formula: |
      AVG(
        SELECT sentiment_value
        FROM this.mentions
        WHERE created_at > NOW() - INTERVAL '7 days'
      )
    description: 7日平均情感分數 (0-100)

  - name: mention_count
    type: integer
    formula: |
      COUNT(
        SELECT * FROM this.mentions
        WHERE created_at > NOW() - INTERVAL '7 days'
      )
    description: 7日提及次數

  - name: mention_trend
    type: float
    formula: |
      (this_week.mention_count - last_week.mention_count)
      / NULLIF(last_week.mention_count, 0) * 100
    description: 週環比增長率 (%)

  - name: trending
    type: boolean
    formula: this.mention_trend > 20
    description: 是否為熱門話題

  - name: top_aspects
    type: array<AspectScore>
    formula: |
      SELECT aspect, AVG(sentiment_value) as score, COUNT(*) as count
      FROM this.aspect_mentions
      GROUP BY aspect
      ORDER BY count DESC
      LIMIT 10
    description: Top 10 討論面向

aliases:
  description: 別名用於識別同一實體的不同寫法
  examples: ["麥當勞", "McDonald's", "麥當當", "金拱門"]
```

```yaml
# ontology/schema/product.yaml
object_type: Product
description: 產品實體

properties:
  - name: canonical_name
    type: string
    required: true

  - name: category
    type: string
    description: 產品類別

  - name: launch_date
    type: date

  - name: price_range
    type: enum
    values: [budget, mid, premium, luxury]

  - name: sku
    type: string
    description: 產品編號

links:
  - name: brand
    target: Brand
    cardinality: one
    required: true
    inverse: owns

  - name: product_line
    target: ProductLine
    cardinality: one

  - name: competes_with
    target: Product
    cardinality: many
    symmetric: true

derived:
  - name: sentiment_score
    type: float
    formula: AVG(this.mentions.sentiment_value)

  - name: aspect_breakdown
    type: map<string, AspectScore>
    formula: |
      SELECT aspect,
             AVG(CASE WHEN sentiment='positive' THEN 1
                      WHEN sentiment='negative' THEN 0
                      ELSE 0.5 END) as score,
             COUNT(*) as count
      FROM this.aspect_mentions
      GROUP BY aspect
```

```yaml
# ontology/schema/restaurant.yaml
object_type: Restaurant
description: 餐廳實體

properties:
  - name: canonical_name
    type: string
    required: true

  - name: cuisine
    type: enum
    values: [中式, 日式, 韓式, 西式, 台式, 港式, 東南亞, 其他]

  - name: price_level
    type: enum
    values: [$, $$, $$$, $$$$]

  - name: address
    type: string

  - name: phone
    type: string

  - name: opening_hours
    type: string

links:
  - name: chain_brand
    target: Brand
    cardinality: one
    description: 連鎖品牌（如果是連鎖店）

  - name: location
    target: Location
    cardinality: one

derived:
  - name: rating
    type: float
    formula: |
      AVG(
        CASE this.mentions.sentiment
          WHEN 'positive' THEN 5
          WHEN 'neutral' THEN 3
          WHEN 'negative' THEN 1
        END
      )

  - name: popular_dishes
    type: array<string>
    formula: |
      SELECT aspect FROM this.aspect_mentions
      WHERE aspect_category = 'dish'
      GROUP BY aspect
      ORDER BY COUNT(*) DESC
      LIMIT 5
```

```yaml
# ontology/schema/post.yaml
object_type: Post
description: 社群帖子

properties:
  - name: post_id
    type: string
    required: true
    unique: true

  - name: content
    type: text
    required: true

  - name: platform
    type: enum
    values: [ig, fb, twitter, threads, tiktok, youtube, ptt, dcard]

  - name: created_at
    type: timestamp

  - name: likes
    type: integer

  - name: comments
    type: integer

  - name: shares
    type: integer

links:
  - name: author
    target: Person
    cardinality: one

  - name: mentions
    target: Entity  # 泛指所有可被提及的 Object
    cardinality: many
    properties:
      - name: mention_text
        type: string
      - name: sentiment
        type: enum
        values: [positive, negative, neutral, mixed]

  - name: topic
    target: Topic
    cardinality: one

  - name: cluster
    target: Cluster
    cardinality: one
```

```yaml
# ontology/schema/person.yaml
object_type: Person
description: 人物實體（作者、KOL、名人）

properties:
  - name: username
    type: string
    required: true

  - name: display_name
    type: string

  - name: platform
    type: enum
    values: [ig, fb, twitter, threads, tiktok, youtube]

  - name: followers
    type: integer

  - name: is_verified
    type: boolean

  - name: category
    type: enum
    values: [kol, celebrity, brand_official, general_user]

links:
  - name: posts
    target: Post
    cardinality: many
    inverse: author

derived:
  - name: influence_score
    type: float
    formula: LOG10(this.followers + 1) * this.avg_engagement_rate

  - name: top_mentioned_brands
    type: array<Brand>
    formula: |
      SELECT brand, COUNT(*) as count
      FROM this.posts.mentions
      WHERE mentions.target_type = 'Brand'
      GROUP BY brand
      ORDER BY count DESC
      LIMIT 10
```

```yaml
# ontology/schema/location.yaml
object_type: Location
description: 地點實體

properties:
  - name: name
    type: string
    required: true

  - name: type
    type: enum
    values: [country, city, district, landmark]

  - name: latitude
    type: float

  - name: longitude
    type: float

links:
  - name: parent
    target: Location
    cardinality: one
    description: 上級地區

  - name: children
    target: Location
    cardinality: many
    inverse: parent
```

---

## Relationship Types（關係類型）

### 關係定義表

| 關係名稱 | Source | Target | 屬性 | 說明 |
|---------|--------|--------|------|------|
| `owns` | Brand | Product | - | 品牌擁有產品 |
| `competes_with` | Brand/Product | Brand/Product | similarity_score | 競爭關係 |
| `subsidiary_of` | Brand | Brand | ownership_percent | 子公司關係 |
| `franchise_of` | Restaurant | Brand | - | 加盟關係 |
| `located_in` | Restaurant/Store | Location | - | 位於 |
| `mentions` | Post | Entity | sentiment, mention_text | 帖子提及實體 |
| `expresses` | Post | AspectSentiment | - | 表達面向情感 |
| `authored_by` | Post | Person | - | 作者 |
| `reviews` | Person | Entity | rating, content | 評論 |

### 關係特性

```yaml
relationship_properties:
  symmetric:
    description: A-R-B 則 B-R-A（如 competes_with）

  transitive:
    description: A-R-B, B-R-C 則 A-R-C（如 subsidiary_of 的傳遞）

  inverse:
    description: 自動維護反向關係（如 owns/owned_by）

  temporal:
    description: 關係有時間範圍（如 works_at 可能有 start_date, end_date）
```

---

## Data Model（數據模型）

### Core Tables

```sql
-- ============================================
-- Ontology Core Tables
-- ============================================

-- 1. Object Types 定義（Schema Registry）
CREATE TABLE object_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,           -- "Brand", "Product"
    description TEXT,
    schema JSONB NOT NULL,                       -- 完整 schema 定義
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Objects 主表（所有實體）
CREATE TABLE objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id INTEGER NOT NULL REFERENCES object_types(id),
    canonical_name VARCHAR(255) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}',
    embedding VECTOR(1536),                      -- 語義向量
    status VARCHAR(16) DEFAULT 'active',         -- active/merged/deleted
    merged_into UUID REFERENCES objects(id),     -- 如果被合併
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_type_name UNIQUE (type_id, canonical_name)
);

-- 3. Object Aliases（別名表）
CREATE TABLE object_aliases (
    id BIGSERIAL PRIMARY KEY,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_type VARCHAR(32) DEFAULT 'common',     -- official/common/slang/typo
    language VARCHAR(8) DEFAULT 'zh-TW',
    confidence REAL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_alias UNIQUE (alias)
);

-- 4. Relationship Types 定義
CREATE TABLE relationship_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,            -- "owns", "competes_with"
    source_type_id INTEGER REFERENCES object_types(id),
    target_type_id INTEGER REFERENCES object_types(id),
    properties_schema JSONB DEFAULT '{}',
    is_symmetric BOOLEAN DEFAULT FALSE,
    inverse_name VARCHAR(64),                    -- 反向關係名稱
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Object Links（關係實例）
CREATE TABLE object_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_type_id INTEGER NOT NULL REFERENCES relationship_types(id),
    source_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    properties JSONB DEFAULT '{}',
    confidence REAL DEFAULT 1.0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,                        -- NULL = 目前有效
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_link UNIQUE (relationship_type_id, source_id, target_id, valid_from)
);

-- 6. Derived Properties Cache（派生屬性快取）
CREATE TABLE derived_properties (
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    property_name VARCHAR(64) NOT NULL,
    value JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                      -- 快取過期時間

    PRIMARY KEY (object_id, property_name)
);

-- 7. Post-Entity Mentions（帖子提及關係的特化表）
CREATE TABLE post_mentions (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    object_id UUID NOT NULL REFERENCES objects(id),
    mention_text VARCHAR(255),
    sentiment VARCHAR(16),                        -- positive/negative/neutral/mixed
    sentiment_score REAL,                         -- 0-1
    confidence REAL DEFAULT 0.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_post_mention UNIQUE (post_id, object_id)
);

-- 8. Aspect Mentions（面向情感）
CREATE TABLE aspect_mentions (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    object_id UUID NOT NULL REFERENCES objects(id),
    aspect VARCHAR(128) NOT NULL,
    aspect_category VARCHAR(64),                  -- service/quality/price/taste/...
    sentiment VARCHAR(16) NOT NULL,
    sentiment_score REAL,
    mention_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_objects_type ON objects(type_id);
CREATE INDEX idx_objects_name ON objects(canonical_name);
CREATE INDEX idx_objects_embedding ON objects USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_objects_properties ON objects USING gin (properties);

CREATE INDEX idx_aliases_alias ON object_aliases(alias);
CREATE INDEX idx_aliases_object ON object_aliases(object_id);

CREATE INDEX idx_links_source ON object_links(source_id);
CREATE INDEX idx_links_target ON object_links(target_id);
CREATE INDEX idx_links_type ON object_links(relationship_type_id);

CREATE INDEX idx_post_mentions_post ON post_mentions(post_id);
CREATE INDEX idx_post_mentions_object ON post_mentions(object_id);
CREATE INDEX idx_post_mentions_created ON post_mentions(created_at);

CREATE INDEX idx_aspect_mentions_object ON aspect_mentions(object_id);
CREATE INDEX idx_aspect_mentions_aspect ON aspect_mentions(aspect);
CREATE INDEX idx_aspect_mentions_created ON aspect_mentions(created_at);
```

### 數據模型 ER 圖

```
┌─────────────────┐         ┌─────────────────┐
│  object_types   │────────<│     objects     │
│  (Schema 定義)  │         │   (所有實體)    │
└─────────────────┘         └────────┬────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ object_aliases  │         │  object_links   │         │derived_properties│
│   (別名消歧)    │         │   (關係實例)    │         │  (派生屬性快取)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │relationship_types│
                            │   (關係定義)     │
                            └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│  post_mentions  │────────>│ aspect_mentions │
│  (帖子提及實體) │         │  (面向情感)     │
└─────────────────┘         └─────────────────┘
```

---

## Query Engine（查詢引擎）

### 查詢語言設計

```
OQL (Ontology Query Language)

基本語法：
  SELECT <ObjectType>
  [WHERE <conditions>]
  [WITH <derived_properties>]
  [TRAVERSE <relationships>]
  [ORDER BY <property>]
  [LIMIT <n>]

範例：

1. 查詢所有美妝品牌
   SELECT Brand
   WHERE industry = "美妝"

2. 查詢負評增加的品牌
   SELECT Brand
   WHERE mention_trend < -10
   WITH sentiment_score, mention_count

3. 查詢 SK-II 的競品比較
   SELECT Brand
   WHERE Brand IN (
     SELECT target
     FROM Link
     WHERE source.canonical_name = "SK-II"
       AND link_type = "competes_with"
   )
   WITH sentiment_score, top_aspects

4. 查詢點點心各分店評價
   SELECT Restaurant
   WHERE chain_brand.canonical_name = "點點心"
   TRAVERSE located_in -> Location
   WITH rating, popular_dishes
   ORDER BY rating ASC

5. 深度遍歷：P&G 所有品牌的所有產品
   SELECT Product
   TRAVERSE Brand <- subsidiary_of* <- owns
   WHERE root.canonical_name = "P&G"
```

### 查詢執行流程

```
┌─────────────────────────────────────────────────────────────┐
│                     Query Pipeline                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Parser                                                   │
│     - 自然語言 → OQL（可選，用 LLM）                         │
│     - OQL → AST                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Planner                                                  │
│     - Schema 驗證                                            │
│     - 查詢優化（索引選擇、JOIN 順序）                        │
│     - 派生屬性展開                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Executor                                                 │
│     - 執行 SQL                                               │
│     - 關係遍歷                                               │
│     - 派生屬性計算（或從快取讀取）                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Formatter                                                │
│     - 組裝 Object View                                       │
│     - 序列化為 JSON                                          │
└─────────────────────────────────────────────────────────────┘
```

### 自然語言查詢（NLQ to OQL）

```
User: "哪些美妝品牌最近負評變多了？"
                    │
                    ▼ LLM
┌─────────────────────────────────────────────────────────────┐
│  SELECT Brand                                                │
│  WHERE industry = "美妝"                                     │
│    AND mention_trend < -10                                   │
│  WITH sentiment_score, mention_trend, top_negative_aspects   │
│  ORDER BY mention_trend ASC                                  │
│  LIMIT 10                                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼ Execute
┌─────────────────────────────────────────────────────────────┐
│  Results:                                                    │
│  [                                                           │
│    {                                                         │
│      "type": "Brand",                                        │
│      "canonical_name": "某品牌",                             │
│      "sentiment_score": 45.2,                                │
│      "mention_trend": -28.5,                                 │
│      "top_negative_aspects": ["價格", "效果", "包裝"]        │
│    },                                                        │
│    ...                                                       │
│  ]                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## API Design

### RESTful API

```yaml
# Object CRUD
GET    /api/v1/objects?type={type}&q={query}
GET    /api/v1/objects/{id}
POST   /api/v1/objects
PUT    /api/v1/objects/{id}
DELETE /api/v1/objects/{id}

# Object by Type (convenience)
GET    /api/v1/brands
GET    /api/v1/brands/{id}
GET    /api/v1/brands/{id}/products
GET    /api/v1/brands/{id}/competitors

GET    /api/v1/products
GET    /api/v1/products/{id}

GET    /api/v1/restaurants
GET    /api/v1/restaurants/{id}

# Relationships
GET    /api/v1/objects/{id}/links?type={relationship_type}
POST   /api/v1/links
DELETE /api/v1/links/{id}

# Query
POST   /api/v1/query
  Body: { "oql": "SELECT Brand WHERE ..." }

POST   /api/v1/query/natural
  Body: { "question": "哪些品牌負評增加了？" }

# Derived Properties
GET    /api/v1/objects/{id}/derived/{property_name}
POST   /api/v1/objects/{id}/derived/refresh

# Analytics
GET    /api/v1/analytics/brand/{id}/sentiment-trend
GET    /api/v1/analytics/brand/{id}/aspect-breakdown
GET    /api/v1/analytics/brand/{id}/competitor-comparison
```

### Response Format

```json
// GET /api/v1/brands/123
{
  "object": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "Brand",
    "canonical_name": "SK-II",
    "properties": {
      "industry": "美妝",
      "country": "日本",
      "founded_year": 1980
    },
    "derived": {
      "sentiment_score": 78.5,
      "mention_count": 1247,
      "mention_trend": 23.5,
      "trending": true,
      "top_aspects": [
        {"aspect": "保濕效果", "score": 85.2, "count": 342},
        {"aspect": "價格", "score": 42.1, "count": 289},
        {"aspect": "質地", "score": 91.0, "count": 198}
      ]
    },
    "aliases": ["SK2", "SKII", "SK-Ⅱ"],
    "links": {
      "parent_company": {"id": "...", "name": "P&G"},
      "owns": [
        {"id": "...", "name": "神仙水"},
        {"id": "...", "name": "大紅瓶"}
      ],
      "competes_with": [
        {"id": "...", "name": "雅詩蘭黛"},
        {"id": "...", "name": "蘭蔻"}
      ]
    }
  },
  "meta": {
    "computed_at": "2026-02-06T09:30:00Z"
  }
}
```

---

## Processing Pipeline

### 帖子處理流程

```
┌─────────────────────────────────────────────────────────────┐
│                    Post Ingestion Pipeline                   │
└─────────────────────────────────────────────────────────────┘

     New Post
         │
         ▼
┌─────────────────┐
│  1. Embedding   │ ──→ post_embeddings
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  2. Entity      │ ──→ │  Entity         │
│     Extraction  │     │  Resolution     │
│     (LLM)       │     │  (消歧+標準化)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  3. Aspect      │     │  Create/Link    │
│     Analysis    │     │  Objects        │
│     (LLM)       │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│  4. Store                                │
│     - post_mentions                      │
│     - aspect_mentions                    │
│     - Update derived properties cache    │
└─────────────────────────────────────────┘
```

### LLM Prompt（Entity + Aspect 提取）

```
分析以下社群貼文，提取結構化資訊。

貼文內容：
{content}

請回傳 JSON：
{
  "entities": [
    {
      "mention_text": "原文中的提及文字",
      "canonical_name": "標準化名稱（如果知道）",
      "type": "brand|product|restaurant|person|location",
      "sentiment": "positive|negative|neutral|mixed",
      "confidence": 0.9,
      "aspects": [
        {
          "aspect": "面向名稱（如：口感、服務、價格）",
          "category": "quality|service|price|taste|atmosphere|other",
          "sentiment": "positive|negative|neutral",
          "mention": "原文摘錄"
        }
      ]
    }
  ],
  "post_sentiment": "positive|negative|neutral|mixed",
  "post_intent": "sharing|recommendation|complaint|question|promotion"
}

規則：
1. entities 必須是具體的品牌/餐廳/產品名稱，不是泛稱
2. 如果同一實體被多次提及，合併為一個 entity
3. canonical_name 儘量標準化（例：麥當勞 → McDonald's）
4. 每個 aspect 必須關聯到特定的 entity
```

---

## Derived Properties Engine

### 計算策略

| 屬性類型 | 計算時機 | TTL | 說明 |
|---------|---------|-----|------|
| Real-time | 每次查詢 | 0 | mention_count（簡單 COUNT） |
| Near-real-time | 每分鐘 | 60s | sentiment_score |
| Periodic | 每小時 | 1h | trending, top_aspects |
| Daily | 每天凌晨 | 24h | competitor_ranking |

### 計算引擎

```go
type DerivedPropertyEngine struct {
    definitions map[string]PropertyDefinition
    cache       DerivedPropertiesCache
    scheduler   *cron.Cron
}

func (e *DerivedPropertyEngine) Compute(objectID uuid.UUID, propertyName string) (interface{}, error) {
    def := e.definitions[propertyName]

    // 1. 檢查快取
    if cached, ok := e.cache.Get(objectID, propertyName); ok {
        if !cached.IsExpired() {
            return cached.Value, nil
        }
    }

    // 2. 執行計算
    value, err := e.executeFormula(objectID, def.Formula)
    if err != nil {
        return nil, err
    }

    // 3. 存入快取
    e.cache.Set(objectID, propertyName, value, def.TTL)

    return value, nil
}
```

---

## Implementation Plan

### Phase 1: Core Ontology（2-3 週）

- [ ] 建立 object_types, objects, object_aliases 表
- [ ] 建立 relationship_types, object_links 表
- [ ] 實作 Object CRUD API
- [ ] 實作基本 Entity 識別（LLM 提取）
- [ ] 實作 Entity Resolution（消歧）

### Phase 2: Aspect & Sentiment（1-2 週）

- [ ] 建立 post_mentions, aspect_mentions 表
- [ ] 修改 LLM Prompt 支援 Entity-Aspect 提取
- [ ] 實作 aspect 分類標準化

### Phase 3: Derived Properties（1-2 週）

- [ ] 實作 Derived Properties Engine
- [ ] 定義常用派生屬性（sentiment_score, mention_count, trending）
- [ ] 實作快取機制
- [ ] 設定定期計算排程

### Phase 4: Query Engine（2-3 週）

- [ ] 設計 OQL 語法
- [ ] 實作 OQL Parser
- [ ] 實作 Query Executor
- [ ] 實作自然語言查詢（NLQ to OQL）

### Phase 5: Analytics API（1-2 週）

- [ ] 品牌 Dashboard API
- [ ] 競品比較 API
- [ ] 趨勢分析 API
- [ ] 面向分析 API

### Phase 6: Knowledge Graph（長期）

- [ ] 擴充關係類型
- [ ] 實作圖遍歷查詢
- [ ] 視覺化 Knowledge Graph

---

## 預估工時

| Phase | 工時 | 說明 |
|-------|------|------|
| Phase 1 | 2-3 週 | 核心 Ontology 架構 |
| Phase 2 | 1-2 週 | Aspect & Sentiment |
| Phase 3 | 1-2 週 | Derived Properties |
| Phase 4 | 2-3 週 | Query Engine |
| Phase 5 | 1-2 週 | Analytics API |
| **Total** | **7-12 週** | 完整 Ontology 系統 |

---

## 參考資料

- [Palantir Foundry Ontology](https://www.palantir.com/docs/foundry/ontology/)
- [Knowledge Graph 設計模式](https://neo4j.com/developer/guide-data-modeling/)
- [OWL (Web Ontology Language)](https://www.w3.org/OWL/)
- [Schema.org](https://schema.org/) - 通用 Ontology 參考
