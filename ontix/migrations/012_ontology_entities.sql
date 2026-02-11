-- ============================================
-- Ontology Entity Layer
-- 建立 Entity 核心資料模型
-- 純加法，不影響現有系統
-- ============================================

-- ============================================
-- 1. object_types - Entity 類型定義
-- ============================================
-- 為什麼放 DB 而不是寫死在程式裡？
-- 未來要加「地點」「活動」「影片」等新類型時，不用改程式碼

CREATE TABLE IF NOT EXISTS object_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,          -- 程式用：brand, product, restaurant, person
    display_name VARCHAR(128) NOT NULL,         -- 顯示用：品牌, 產品, 餐廳, 人物/KOL
    description TEXT,
    properties_schema JSONB DEFAULT '{}',       -- 該類型可擁有哪些 properties
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 預設類型
INSERT INTO object_types (name, display_name, description, properties_schema) VALUES
('brand', '品牌', '商業品牌，如 SK-II、麥當勞、Apple', '{
    "industry": {"type": "string", "description": "所屬產業"},
    "founded": {"type": "integer", "description": "創立年份"},
    "country": {"type": "string", "description": "發源國家"}
}'),
('product', '產品', '具體產品，如神仙水、iPhone 17、大麥克', '{
    "category": {"type": "string", "description": "產品類別"},
    "price_range": {"type": "string", "description": "價格區間：low/mid/high/premium"},
    "release_date": {"type": "string", "description": "上市日期"}
}'),
('restaurant', '餐廳', '餐飲店家，如鼎泰豐信義店、點點心', '{
    "cuisine": {"type": "string", "description": "菜系類型"},
    "price_range": {"type": "string", "description": "價格區間"},
    "area": {"type": "string", "description": "所在區域"}
}'),
('person', '人物/KOL', 'KOL、公眾人物、品牌代言人', '{
    "platform": {"type": "string", "description": "主要平台"},
    "category": {"type": "string", "description": "內容類別：美妝/科技/美食..."},
    "follower_tier": {"type": "string", "description": "粉絲量級：nano/micro/mid/macro/mega"}
}'),
('location', '地點', '地理位置，如台北信義區、東京表參道', '{
    "city": {"type": "string", "description": "所在城市"},
    "district": {"type": "string", "description": "所在行政區"},
    "country": {"type": "string", "description": "所在國家"}
}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. objects - 核心 Entity 表
-- ============================================
-- 每一列就是一個「實體」：一個品牌、一個產品、一個人

CREATE TABLE IF NOT EXISTS objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id INTEGER NOT NULL REFERENCES object_types(id),
    canonical_name VARCHAR(255) NOT NULL,          -- 正規名稱：麥當勞、iPhone 17
    properties JSONB NOT NULL DEFAULT '{}',        -- 該 Entity 的屬性
    embedding vector(1536),                        -- 語意向量（用於相似 Entity 搜尋）
    status VARCHAR(16) DEFAULT 'active',           -- active / merged / archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_objects_type_id ON objects(type_id);
CREATE INDEX IF NOT EXISTS idx_objects_canonical_name ON objects(canonical_name);
CREATE INDEX IF NOT EXISTS idx_objects_status ON objects(status);

-- 同類型下名稱不重複
CREATE UNIQUE INDEX IF NOT EXISTS idx_objects_type_name_unique
    ON objects(type_id, canonical_name) WHERE status = 'active';

-- ============================================
-- 3. object_aliases - 別名表（Entity Resolution 核心）
-- ============================================
-- 讓「麥當當」「McDonald's」「金拱門」都指向同一個 Entity
-- source 記錄這個別名怎麼來的：系統預設 / LLM 發現 / 人工維護

CREATE TABLE IF NOT EXISTS object_aliases (
    id BIGSERIAL PRIMARY KEY,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'system',  -- system / llm_discovered / manual
    confidence REAL DEFAULT 1.0,                    -- LLM 發現的別名可能信心較低
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 別名全域唯一（避免兩個 Entity 搶同一個別名）
CREATE UNIQUE INDEX IF NOT EXISTS idx_object_aliases_alias_unique
    ON object_aliases(alias);

CREATE INDEX IF NOT EXISTS idx_object_aliases_object_id ON object_aliases(object_id);

-- ============================================
-- 4. object_links - Entity 關係表
-- ============================================
-- 品牌 → 擁有 → 產品
-- KOL → 代言 → 品牌
-- 餐廳 → 位於 → 地點

CREATE TABLE IF NOT EXISTS object_links (
    id BIGSERIAL PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    link_type VARCHAR(64) NOT NULL,                -- has_product, belongs_to_brand, located_in, endorses...
    properties JSONB DEFAULT '{}',                 -- 關係的額外資訊
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 同一對 Entity 同一種關係只能有一條
    UNIQUE(source_id, target_id, link_type)
);

CREATE INDEX IF NOT EXISTS idx_object_links_source ON object_links(source_id);
CREATE INDEX IF NOT EXISTS idx_object_links_target ON object_links(target_id);
CREATE INDEX IF NOT EXISTS idx_object_links_type ON object_links(link_type);

-- ============================================
-- 5. post_entity_mentions - 貼文提及了哪些 Entity
-- ============================================
-- 一篇貼文可能同時提到 麥當勞(brand) + 大麥克(product) + 薯條(product)
-- 這張表記錄「誰提了誰」以及情緒

CREATE TABLE IF NOT EXISTS post_entity_mentions (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    sentiment VARCHAR(16),                         -- positive / negative / neutral / mixed
    sentiment_score REAL,                          -- 0.0 ~ 1.0
    mention_text TEXT,                             -- 原文中提到該 Entity 的片段
    source VARCHAR(32) NOT NULL DEFAULT 'llm',     -- llm / manual / rule
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 同一篇貼文對同一個 Entity 只記錄一次
    UNIQUE(post_id, object_id)
);

CREATE INDEX IF NOT EXISTS idx_post_entity_mentions_post ON post_entity_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_entity_mentions_object ON post_entity_mentions(object_id);
CREATE INDEX IF NOT EXISTS idx_post_entity_mentions_sentiment ON post_entity_mentions(sentiment);

-- ============================================
-- 6. entity_aspects - Aspect 歸屬到特定 Entity
-- ============================================
-- 核心差異：現有 post_aspects 只知道「這篇貼文提到薯條是正面的」
-- entity_aspects 知道「這篇貼文提到【麥當勞的】薯條是正面的」

CREATE TABLE IF NOT EXISTS entity_aspects (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    aspect VARCHAR(128) NOT NULL,                  -- 面向：薯條、服務、價格、電池、相機...
    sentiment VARCHAR(16) NOT NULL,                -- positive / negative / neutral
    sentiment_score REAL,                          -- 0.0 ~ 1.0
    mention_text TEXT,                             -- 原文片段
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_aspects_post ON entity_aspects(post_id);
CREATE INDEX IF NOT EXISTS idx_entity_aspects_object ON entity_aspects(object_id);
CREATE INDEX IF NOT EXISTS idx_entity_aspects_aspect ON entity_aspects(aspect);
CREATE INDEX IF NOT EXISTS idx_entity_aspects_sentiment ON entity_aspects(sentiment);

-- 複合索引：查詢「某 Entity 的所有 Aspect 評價」
CREATE INDEX IF NOT EXISTS idx_entity_aspects_object_aspect
    ON entity_aspects(object_id, aspect);

-- ============================================
-- 7. Materialized Views - 聚合統計
-- ============================================

-- Entity 聲量統計（Brand Intelligence Dashboard 的資料來源）
CREATE MATERIALIZED VIEW IF NOT EXISTS entity_stats AS
SELECT
    o.id AS object_id,
    o.canonical_name,
    ot.name AS object_type,
    ot.display_name AS type_display_name,
    COUNT(pem.id) AS mention_count,
    COUNT(DISTINCT pem.post_id) AS post_count,
    COUNT(*) FILTER (WHERE pem.sentiment = 'positive') AS positive_count,
    COUNT(*) FILTER (WHERE pem.sentiment = 'negative') AS negative_count,
    COUNT(*) FILTER (WHERE pem.sentiment = 'neutral') AS neutral_count,
    ROUND(AVG(pem.sentiment_score)::NUMERIC, 3) AS avg_sentiment_score,
    ROUND(
        COUNT(*) FILTER (WHERE pem.sentiment = 'positive')::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1
    ) AS positive_ratio
FROM objects o
JOIN object_types ot ON o.type_id = ot.id
LEFT JOIN post_entity_mentions pem ON o.id = pem.object_id
WHERE o.status = 'active'
GROUP BY o.id, o.canonical_name, ot.name, ot.display_name;

-- 用於快速查詢的唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_stats_object_id ON entity_stats(object_id);
CREATE INDEX IF NOT EXISTS idx_entity_stats_type ON entity_stats(object_type);
CREATE INDEX IF NOT EXISTS idx_entity_stats_mentions ON entity_stats(mention_count DESC);

-- Entity Aspect 聚合統計
CREATE MATERIALIZED VIEW IF NOT EXISTS entity_aspect_stats AS
SELECT
    ea.object_id,
    o.canonical_name,
    ea.aspect,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE ea.sentiment = 'positive') AS positive_count,
    COUNT(*) FILTER (WHERE ea.sentiment = 'negative') AS negative_count,
    COUNT(*) FILTER (WHERE ea.sentiment = 'neutral') AS neutral_count,
    ROUND(AVG(ea.sentiment_score)::NUMERIC, 3) AS avg_sentiment_score,
    ROUND(
        COUNT(*) FILTER (WHERE ea.sentiment = 'positive')::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1
    ) AS positive_ratio
FROM entity_aspects ea
JOIN objects o ON ea.object_id = o.id
GROUP BY ea.object_id, o.canonical_name, ea.aspect;

CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_aspect_stats_pk
    ON entity_aspect_stats(object_id, aspect);
CREATE INDEX IF NOT EXISTS idx_entity_aspect_stats_object
    ON entity_aspect_stats(object_id);
