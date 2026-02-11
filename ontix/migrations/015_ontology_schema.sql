-- ============================================
-- Ontology Schema Layer (Phase 0)
--
-- 從 flat entity 升級為真正的 ontology：
-- 1. ontology_classes     — 概念層級（IS-A hierarchy）
-- 2. ontology_property_defs — 屬性定義（typed, per-class）
-- 3. ontology_relation_types — 關係類型定義（有約束）
-- 4. ontology_rules       — 推理規則
-- 5. entity_observations  — 時間分桶觀測（趨勢/異常偵測基礎）
-- 6. derived_facts        — 推理引擎產出
-- 7. object_relations     — typed relations（取代 object_links）
-- 8. objects.class_id     — 指向 ontology_classes
--
-- 純加法，不刪除任何舊表或欄位
-- ============================================

BEGIN;

-- ============================================
-- 1. ontology_classes — 概念層級
-- ============================================
-- 取代 object_types 的 flat 設計
-- 支援 IS-A 繼承：Brand IS-A Organization

CREATE TABLE ontology_classes (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,               -- 程式用：'brand', 'product'
    name        TEXT NOT NULL,                      -- 顯示用：'品牌', '產品'
    parent_id   INT REFERENCES ontology_classes(id),-- IS-A 層級，NULL = root
    description TEXT,
    icon        TEXT,                               -- Material Symbols icon name
    sort_order  INT DEFAULT 0,                      -- UI 排序
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: class hierarchy
-- Level 0: Entity (abstract root)
INSERT INTO ontology_classes (id, slug, name, parent_id, description, icon, sort_order) VALUES
    (1,  'entity',           'Entity',     NULL, '所有概念的根類別（抽象）', 'category', 0);

-- Level 1: top-level classes
INSERT INTO ontology_classes (id, slug, name, parent_id, description, icon, sort_order) VALUES
    (10, 'organization',     '組織',       1,  '任何組織實體',                       'corporate_fare',  10),
    (20, 'product',          '產品',       1,  '產品或服務',                         'inventory_2',     20),
    (30, 'person',           '人物',       1,  '人物',                               'person',          30),
    (40, 'place',            '地方',       1,  '地理位置或場所',                      'location_on',     40),
    (50, 'creative_work',    '作品',       1,  '創作作品',                           'movie',           50),
    (60, 'event',            '活動',       1,  '時間性活動',                          'event',           60);

-- Level 2: sub-classes
INSERT INTO ontology_classes (id, slug, name, parent_id, description, icon, sort_order) VALUES
    -- Organization 子類
    (11, 'brand',            '品牌',       10, '商業品牌：公司、連鎖、平台',          'storefront',      11),
    (12, 'agency',           '代理商',     10, '行銷/廣告/公關代理商',               'business_center', 12),
    (13, 'institution',      '機構',       10, '政府、學校、醫院、NGO',              'account_balance', 13),
    -- Product 子類
    (21, 'physical_product', '實體產品',   20, '可觸摸的產品：手機、化妝品、食品',     'shopping_bag',    21),
    (22, 'service',          '服務',       20, '無形服務：訂閱、SaaS、課程',          'design_services', 22),
    -- Person 子類
    (31, 'creator',          '創作者',     30, 'KOL、部落客、YouTuber',              'brush',           31),
    (32, 'public_figure',    '公眾人物',   30, '藝人、運動員、政治人物',              'star',            32),
    -- Place 子類
    (41, 'venue',            '場所',       40, '特定地點：餐廳、沙龍、飯店、診所',     'store',           41),
    (42, 'region',           '區域',       40, '城市、行政區、國家',                  'map',             42),
    -- CreativeWork 子類
    (51, 'content',          '內容作品',   50, '電影、影集、遊戲、音樂、書籍',        'library_books',   51),
    (52, 'campaign',         '行銷活動',   50, '品牌行銷活動、聯名企劃',              'campaign',        52);

-- Reset sequence to avoid conflict with future inserts
SELECT setval('ontology_classes_id_seq', 100);

-- ============================================
-- 2. ontology_property_defs — 屬性定義
-- ============================================
-- 定義每個 class 可以擁有的 typed 屬性
-- 子類繼承父類的所有屬性

CREATE TABLE ontology_property_defs (
    id           SERIAL PRIMARY KEY,
    class_id     INT NOT NULL REFERENCES ontology_classes(id),
    name         TEXT NOT NULL,                     -- 程式用：'market_segment'
    display_name TEXT,                              -- 顯示用：'市場區隔'
    data_type    TEXT NOT NULL                      -- string / integer / float / enum / boolean / date
                 CHECK (data_type IN ('string', 'integer', 'float', 'enum', 'boolean', 'date')),
    enum_values  JSONB,                             -- enum 限定值: ["美髮","餐飲","零售"]
    is_required  BOOLEAN DEFAULT FALSE,
    default_value JSONB,
    description  TEXT,
    UNIQUE(class_id, name)
);

-- Seed: property definitions

-- Organization (inherited by Brand, Agency, Institution)
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (10, 'country', '國家', 'string', '發源或所在國家');

-- Brand
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, enum_values, description) VALUES
    (11, 'market_segment', '市場區隔', 'enum', '["美髮","餐飲","零售","美容","時尚","科技","金融","健康","教育","娛樂"]', '品牌所在的主要市場'),
    (11, 'price_position',  '價格定位', 'enum', '["高端","中端","平價"]', '品牌的價格定位'),
    (11, 'founded_year',    '創立年份', 'integer', NULL, '品牌創立年份');

-- Product
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (20, 'category', '類別', 'string', '產品類別：電子、化妝品、食品...'),
    (20, 'price_range', '價格區間', 'string', '價格區間描述');

-- Person
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, enum_values, description) VALUES
    (30, 'role', '角色', 'enum', '["kol","celebrity","athlete","politician","creator","founder","executive"]', '人物的主要角色');
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (30, 'platform', '主要平台', 'string', '主要活躍的社群平台');

-- Place (inherited by Venue, Region)
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (40, 'city', '城市', 'string', '所在城市');

-- Venue
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (41, 'address', '地址', 'string', '詳細地址'),
    (41, 'cuisine', '菜系', 'string', '餐廳菜系（僅適用於餐廳類型）');

-- CreativeWork
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (50, 'release_year', '發行年份', 'integer', '發行或上映年份'),
    (50, 'creator_name', '創作者', 'string', '創作者/導演/開發商名稱');

-- Event
INSERT INTO ontology_property_defs (class_id, name, display_name, data_type, description) VALUES
    (60, 'event_date',  '活動日期', 'date', '活動舉辦日期'),
    (60, 'event_venue', '活動地點', 'string', '活動舉辦場所');

-- ============================================
-- 3. ontology_relation_types — 關係類型定義
-- ============================================
-- 定義哪些 class 之間可以有什麼關係
-- 帶 cardinality 約束 + 反向關係

CREATE TABLE ontology_relation_types (
    id               SERIAL PRIMARY KEY,
    slug             TEXT NOT NULL,                 -- 程式用：'belongs_to'
    name             TEXT NOT NULL,                 -- 顯示用：'BELONGS_TO'
    display_name     TEXT,                          -- 中文：'隸屬於'
    source_class_id  INT NOT NULL REFERENCES ontology_classes(id),
    target_class_id  INT NOT NULL REFERENCES ontology_classes(id),
    cardinality      TEXT NOT NULL DEFAULT 'many_to_many'
                     CHECK (cardinality IN ('one_to_one', 'one_to_many', 'many_to_one', 'many_to_many')),
    inverse_id       INT REFERENCES ontology_relation_types(id),
    description      TEXT,
    UNIQUE(slug, source_class_id, target_class_id)
);

-- Seed: relation types (inserted in pairs for inverse relations)

-- Product → Brand (many_to_one) / Brand → Product (one_to_many)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (1, 'belongs_to',    'BELONGS_TO',    '隸屬於',    20, 11, 'many_to_one',  '產品隸屬於品牌'),
    (2, 'has_product',   'HAS_PRODUCT',   '擁有產品',  11, 20, 'one_to_many',  '品牌擁有產品');
UPDATE ontology_relation_types SET inverse_id = 2 WHERE id = 1;
UPDATE ontology_relation_types SET inverse_id = 1 WHERE id = 2;

-- Brand ↔ Brand (many_to_many, symmetric)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (3, 'competes_with', 'COMPETES_WITH', '競爭對手',  11, 11, 'many_to_many', '品牌之間的競爭關係');
UPDATE ontology_relation_types SET inverse_id = 3 WHERE id = 3;

-- Product ↔ Product (many_to_many, symmetric)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (4, 'competes_with_product', 'COMPETES_WITH', '競品', 20, 20, 'many_to_many', '產品之間的競爭關係');
UPDATE ontology_relation_types SET inverse_id = 4 WHERE id = 4;

-- Brand → Person (many_to_many) — 創辦
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (5, 'founded_by',    'FOUNDED_BY',    '創辦人',    11, 30, 'many_to_many', '品牌的創辦人'),
    (6, 'founded',       'FOUNDED',       '創辦了',    30, 11, 'many_to_many', '人物創辦的品牌');
UPDATE ontology_relation_types SET inverse_id = 6 WHERE id = 5;
UPDATE ontology_relation_types SET inverse_id = 5 WHERE id = 6;

-- Person → Brand (many_to_many) — 代言
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (7, 'endorses',      'ENDORSES',      '代言',      30, 11, 'many_to_many', '人物代言品牌'),
    (8, 'endorsed_by',   'ENDORSED_BY',   '代言人',    11, 30, 'many_to_many', '品牌的代言人');
UPDATE ontology_relation_types SET inverse_id = 8 WHERE id = 7;
UPDATE ontology_relation_types SET inverse_id = 7 WHERE id = 8;

-- Person → Organization (many_to_many) — 任職
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (9,  'works_at',     'WORKS_AT',      '任職於',    30, 10, 'many_to_many', '人物任職的組織'),
    (10, 'employs',      'EMPLOYS',       '僱用',      10, 30, 'many_to_many', '組織僱用的人物');
UPDATE ontology_relation_types SET inverse_id = 10 WHERE id = 9;
UPDATE ontology_relation_types SET inverse_id = 9  WHERE id = 10;

-- Venue → Region (many_to_one)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (11, 'located_in',   'LOCATED_IN',    '位於',      41, 42, 'many_to_one',  '場所位於某區域'),
    (12, 'has_venue',    'HAS_VENUE',     '擁有場所',  42, 41, 'one_to_many',  '區域擁有的場所');
UPDATE ontology_relation_types SET inverse_id = 12 WHERE id = 11;
UPDATE ontology_relation_types SET inverse_id = 11 WHERE id = 12;

-- Brand → Brand (sub-brand)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (13, 'sub_brand_of', 'SUB_BRAND_OF',  '子品牌',    11, 11, 'many_to_one',  '子品牌隸屬於母品牌'),
    (14, 'has_sub_brand', 'HAS_SUB_BRAND', '擁有子品牌', 11, 11, 'one_to_many',  '母品牌擁有的子品牌');
UPDATE ontology_relation_types SET inverse_id = 14 WHERE id = 13;
UPDATE ontology_relation_types SET inverse_id = 13 WHERE id = 14;

-- Product → CreativeWork (produced_by is generic; keep for flexibility)
INSERT INTO ontology_relation_types (id, slug, name, display_name, source_class_id, target_class_id, cardinality, description) VALUES
    (15, 'produced_by',  'PRODUCED_BY',   '製作者',    20, 10, 'many_to_one',  '產品的製造/發行組織');

-- Reset sequence
SELECT setval('ontology_relation_types_id_seq', 100);

-- ============================================
-- 4. ontology_rules — 推理規則
-- ============================================
-- 引擎讀取這些規則，在每次 observation 聚合後評估

CREATE TABLE ontology_rules (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL UNIQUE,
    description    TEXT,
    priority       INT DEFAULT 0,                   -- 高 = 先跑
    is_active      BOOLEAN DEFAULT TRUE,

    -- 何時觸發
    trigger_type   TEXT NOT NULL                     -- observation_change / schedule / relation_change
                   CHECK (trigger_type IN ('observation_change', 'schedule', 'relation_change')),

    -- 條件（JSON DSL）
    condition      JSONB NOT NULL,

    -- 動作
    action_type    TEXT NOT NULL                     -- create_alert / derive_fact / propagate
                   CHECK (action_type IN ('create_alert', 'derive_fact', 'propagate')),
    action_config  JSONB NOT NULL,

    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: 預設推理規則

-- Rule 1: 產品情感拖累品牌
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'product_drags_brand',
    '當產品情感週降幅超過 15%，沿 BELONGS_TO 警告品牌',
    10,
    'observation_change',
    '{
        "entity_class": "product",
        "metric": "avg_sentiment",
        "compare": "prev_period",
        "operator": "decrease_pct",
        "threshold": 15,
        "min_mentions": 3
    }',
    'create_alert',
    '{
        "severity": "warning",
        "traverse": {
            "relation": "belongs_to",
            "direction": "outgoing"
        },
        "title_template": "產品「{{source.name}}」情感下降 {{delta_pct}}%",
        "body_template": "隸屬品牌「{{target.name}}」可能受影響。主要變化面向：{{top_changed_aspects}}。"
    }'
);

-- Rule 2: 競品聲量暴增
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'competitor_surge',
    '當競爭品牌提及量週增幅超過 200%，警告相關競品',
    8,
    'observation_change',
    '{
        "entity_class": "brand",
        "metric": "mention_count",
        "compare": "prev_period",
        "operator": "increase_pct",
        "threshold": 200,
        "min_mentions": 3
    }',
    'create_alert',
    '{
        "severity": "info",
        "traverse": {
            "relation": "competes_with",
            "direction": "outgoing"
        },
        "title_template": "競品「{{source.name}}」聲量暴增 {{delta_pct}}%",
        "body_template": "你的品牌「{{target.name}}」可能需要關注。{{source.name}} 本週 {{current_value}} 則提及（上週 {{prev_value}} 則）。"
    }'
);

-- Rule 3: 創辦人聲譽連動品牌
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'founder_reputation_risk',
    '當創辦人情感週降幅超過 20%，沿 FOUNDED 警告品牌',
    9,
    'observation_change',
    '{
        "entity_class": "person",
        "metric": "avg_sentiment",
        "compare": "prev_period",
        "operator": "decrease_pct",
        "threshold": 20,
        "min_mentions": 2
    }',
    'create_alert',
    '{
        "severity": "warning",
        "traverse": {
            "relation": "founded",
            "direction": "outgoing"
        },
        "title_template": "創辦人「{{source.name}}」聲譽下降 {{delta_pct}}%",
        "body_template": "可能影響品牌「{{target.name}}」。主要負面面向：{{top_changed_aspects}}。"
    }'
);

-- Rule 4: 新面向出現
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'new_aspect_detected',
    '當某 entity 出現上期完全不存在的面向（且本期 ≥2 則提及）',
    5,
    'observation_change',
    '{
        "entity_class": "entity",
        "metric": "new_aspects",
        "compare": "prev_period",
        "operator": "exists",
        "min_aspect_mentions": 2
    }',
    'derive_fact',
    '{
        "fact_type": "trend",
        "severity": "info",
        "title_template": "「{{entity.name}}」出現新的討論面向：{{new_aspects}}",
        "body_template": "本週新出現 {{new_aspect_count}} 個面向，值得關注。"
    }'
);

-- Rule 5: 面向情感翻轉（正→負 或 負→正）
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'aspect_sentiment_flip',
    '當某面向的情感從正面翻轉為負面（或反之）',
    7,
    'observation_change',
    '{
        "entity_class": "entity",
        "metric": "aspect_sentiment",
        "compare": "prev_period",
        "operator": "sign_flip",
        "min_aspect_mentions": 2
    }',
    'create_alert',
    '{
        "severity": "warning",
        "title_template": "「{{entity.name}}」的面向「{{aspect}}」情感翻轉",
        "body_template": "「{{aspect}}」從 {{prev_sentiment_label}} 翻轉為 {{current_sentiment_label}}（{{prev_value}} → {{current_value}}）。"
    }'
);

-- Rule 6: 沉默警報（兩週無提及）
INSERT INTO ontology_rules (name, description, priority, trigger_type, condition, action_type, action_config) VALUES
(
    'silence_alert',
    '當 entity 連續兩個週期無人提及',
    3,
    'observation_change',
    '{
        "entity_class": "entity",
        "metric": "mention_count",
        "compare": "prev_period",
        "operator": "equals",
        "threshold": 0,
        "consecutive_periods": 2
    }',
    'derive_fact',
    '{
        "fact_type": "trend",
        "severity": "info",
        "title_template": "「{{entity.name}}」已兩週無人提及",
        "body_template": "上一次被提及是在 {{last_mention_date}}。可能需要重新評估追蹤必要性。"
    }'
);

-- ============================================
-- 5. entity_observations — 時間分桶觀測
-- ============================================
-- 趨勢分析和異常偵測的基礎
-- 每個 entity 每個時間週期一筆彙總

CREATE TABLE entity_observations (
    id             BIGSERIAL PRIMARY KEY,
    object_id      UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    period_start   DATE NOT NULL,
    period_type    TEXT NOT NULL                     -- 'day' / 'week'
                   CHECK (period_type IN ('day', 'week')),

    mention_count  INT NOT NULL DEFAULT 0,
    positive_count INT NOT NULL DEFAULT 0,
    negative_count INT NOT NULL DEFAULT 0,
    neutral_count  INT NOT NULL DEFAULT 0,
    mixed_count    INT NOT NULL DEFAULT 0,
    avg_sentiment  REAL,

    -- 面向層級的觀測（本期 top aspects 快照）
    -- [{"aspect":"價格","count":5,"avg_sentiment":0.35}, ...]
    aspect_data    JSONB DEFAULT '[]',

    created_at     TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(object_id, period_start, period_type)
);

CREATE INDEX idx_observations_lookup
    ON entity_observations(object_id, period_type, period_start DESC);

CREATE INDEX idx_observations_period
    ON entity_observations(period_type, period_start);

-- ============================================
-- 6. derived_facts — 推理引擎產出
-- ============================================
-- 推理引擎評估規則後產生的事實/警報/洞察

CREATE TABLE derived_facts (
    id                 BIGSERIAL PRIMARY KEY,
    object_id          UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    fact_type          TEXT NOT NULL               -- alert / risk_signal / trend / insight
                       CHECK (fact_type IN ('alert', 'risk_signal', 'trend', 'insight')),
    fact_key           TEXT NOT NULL,              -- 去重 key（同一 entity + 同一事件不重複）
    severity           TEXT NOT NULL DEFAULT 'info'
                       CHECK (severity IN ('info', 'warning', 'critical')),
    title              TEXT NOT NULL,
    description        TEXT,
    evidence           JSONB DEFAULT '{}',         -- 源數據引用：rule_id, observations, mentions

    derived_from_rule  INT REFERENCES ontology_rules(id),
    period_start       DATE,                       -- 這筆 fact 對應的時間週期
    period_type        TEXT,

    is_read            BOOLEAN DEFAULT FALSE,
    is_dismissed       BOOLEAN DEFAULT FALSE,      -- 使用者手動忽略

    created_at         TIMESTAMPTZ DEFAULT NOW(),
    expires_at         TIMESTAMPTZ,                -- 自動過期（可選）

    UNIQUE(object_id, fact_key)
);

CREATE INDEX idx_facts_inbox
    ON derived_facts(is_read, is_dismissed, created_at DESC)
    WHERE NOT is_dismissed;

CREATE INDEX idx_facts_by_object
    ON derived_facts(object_id, created_at DESC);

CREATE INDEX idx_facts_by_type
    ON derived_facts(fact_type, severity, created_at DESC);

-- ============================================
-- 7. object_relations — typed relations
-- ============================================
-- 取代 object_links：有 schema 約束的關係表
-- 保留 object_links 不刪，新 code 寫 object_relations

CREATE TABLE object_relations (
    id               BIGSERIAL PRIMARY KEY,
    source_id        UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    target_id        UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    relation_type_id INT NOT NULL REFERENCES ontology_relation_types(id),
    confidence       REAL DEFAULT 1.0,             -- LLM=0.8, manual=1.0, inferred=0.6
    source           TEXT NOT NULL DEFAULT 'llm',  -- llm / manual / inferred
    properties       JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(source_id, target_id, relation_type_id)
);

CREATE INDEX idx_object_relations_source ON object_relations(source_id);
CREATE INDEX idx_object_relations_target ON object_relations(target_id);
CREATE INDEX idx_object_relations_type   ON object_relations(relation_type_id);

-- ============================================
-- 8. objects 表加 class_id
-- ============================================
-- 新增 class_id 欄位指向 ontology_classes
-- 舊的 type_id 保留不動，漸進遷移

ALTER TABLE objects ADD COLUMN IF NOT EXISTS class_id INT REFERENCES ontology_classes(id);

-- 遷移：把現有 type_id 映射到 class_id
-- object_types.name → ontology_classes.slug 的映射
UPDATE objects o
SET class_id = c.id
FROM object_types ot, ontology_classes c
WHERE o.type_id = ot.id
  AND ot.name = c.slug
  AND o.class_id IS NULL;

-- 特殊處理：舊 type 'work' 映射到 'creative_work'（slug 不同）
-- 但我們的 ontology_classes 沒有 slug='work'，需要處理
-- 先看看有沒有 type_name='work' 的 objects 沒被映射到
-- work → creative_work (id=50)
UPDATE objects o
SET class_id = 50
FROM object_types ot
WHERE o.type_id = ot.id
  AND ot.name = 'work'
  AND o.class_id IS NULL;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_objects_class_id ON objects(class_id);

-- ============================================
-- 9. 從 object_links 遷移到 object_relations
-- ============================================
-- 把現有的 link_type string 映射到 relation_type_id
-- 映射表：
--   has_product     → id=2  (Brand → Product)
--   belongs_to_brand → id=1  (Product → Brand)
--   located_in      → id=11 (Venue → Region)
--   endorses        → id=7  (Person → Brand)
--   sub_brand       → id=13 (Brand → Brand)
--   produced_by     → id=15 (Product → Organization)
--   competes_with   → id=3  (Brand → Brand)

INSERT INTO object_relations (source_id, target_id, relation_type_id, confidence, source, properties, created_at)
SELECT
    ol.source_id,
    ol.target_id,
    CASE ol.link_type
        WHEN 'has_product'      THEN 2
        WHEN 'belongs_to_brand' THEN 1
        WHEN 'located_in'       THEN 11
        WHEN 'endorses'         THEN 7
        WHEN 'sub_brand'        THEN 13
        WHEN 'produced_by'      THEN 15
        WHEN 'competes_with'    THEN 3
        WHEN 'works_at'         THEN 9
    END,
    1.0,
    'llm',
    ol.properties,
    ol.created_at
FROM object_links ol
WHERE ol.link_type IN ('has_product', 'belongs_to_brand', 'located_in', 'endorses', 'sub_brand', 'produced_by', 'competes_with', 'works_at')
ON CONFLICT (source_id, target_id, relation_type_id) DO NOTHING;

-- ============================================
-- 10. 回填 entity_observations 歷史資料
-- ============================================
-- 從現有 post_entity_mentions 聚合出週級觀測
-- 分兩步：先聚合 mentions，再用 aspect 資料更新

-- Step 1: 聚合 mention 統計
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data)
SELECT
    m.object_id,
    date_trunc('week', m.created_at)::DATE AS period_start,
    'week' AS period_type,
    COUNT(*),
    COUNT(*) FILTER (WHERE m.sentiment = 'positive'),
    COUNT(*) FILTER (WHERE m.sentiment = 'negative'),
    COUNT(*) FILTER (WHERE m.sentiment = 'neutral'),
    COUNT(*) FILTER (WHERE m.sentiment = 'mixed'),
    AVG(m.sentiment_score),
    '[]'::jsonb
FROM post_entity_mentions m
GROUP BY m.object_id, date_trunc('week', m.created_at)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- Step 2: 回填 aspect_data（從 entity_aspects 聚合）
UPDATE entity_observations eo
SET aspect_data = COALESCE(asp_agg.data, '[]'::jsonb)
FROM (
    SELECT
        per_aspect.object_id,
        per_aspect.week_start AS period_start,
        jsonb_agg(
            jsonb_build_object(
                'aspect', per_aspect.aspect,
                'count', per_aspect.cnt,
                'avg_sentiment', per_aspect.avg_s
            ) ORDER BY per_aspect.cnt DESC
        ) AS data
    FROM (
        SELECT
            object_id,
            date_trunc('week', created_at)::DATE AS week_start,
            aspect,
            COUNT(*) AS cnt,
            ROUND(AVG(sentiment_score)::NUMERIC, 3) AS avg_s
        FROM entity_aspects
        GROUP BY object_id, date_trunc('week', created_at), aspect
    ) per_aspect
    GROUP BY per_aspect.object_id, per_aspect.week_start
) asp_agg
WHERE eo.object_id = asp_agg.object_id
  AND eo.period_start = asp_agg.period_start
  AND eo.period_type = 'week';

COMMIT;
