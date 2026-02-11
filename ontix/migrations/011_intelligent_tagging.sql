-- 全量 LLM 智能標註系統
-- 支援 sentiment, soft_tags, aspects 的即時分析

-- ============================================
-- 1. 擴展 posts 表，加入 LLM 分析欄位
-- ============================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS sentiment VARCHAR(16);  -- positive/negative/neutral/mixed
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sentiment_score REAL;    -- 0.0 ~ 1.0
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sentiment_reason TEXT;   -- LLM 解釋
ALTER TABLE posts ADD COLUMN IF NOT EXISTS intent VARCHAR(32);      -- review/question/sharing/complaint/recommendation
ALTER TABLE posts ADD COLUMN IF NOT EXISTS product_type VARCHAR(128); -- 產品類型

CREATE INDEX IF NOT EXISTS idx_posts_sentiment ON posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_posts_intent ON posts(intent);

-- ============================================
-- 2. post_soft_tags - LLM 生成的軟標籤
-- ============================================

CREATE TABLE IF NOT EXISTS post_soft_tags (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    tag VARCHAR(128) NOT NULL,
    confidence REAL NOT NULL DEFAULT 0.0,  -- 0.0 ~ 1.0
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_post_soft_tags_post_id ON post_soft_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_soft_tags_tag ON post_soft_tags(tag);
CREATE INDEX IF NOT EXISTS idx_post_soft_tags_confidence ON post_soft_tags(confidence DESC);

-- ============================================
-- 3. post_aspects - 細粒度情感分析
-- ============================================

CREATE TABLE IF NOT EXISTS post_aspects (
    id BIGSERIAL PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL,
    aspect VARCHAR(128) NOT NULL,          -- 面向名稱 (持妝度、控油、遮瑕...)
    sentiment VARCHAR(16) NOT NULL,        -- positive/negative/neutral
    mention TEXT,                          -- 原文片段
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_aspects_post_id ON post_aspects(post_id);
CREATE INDEX IF NOT EXISTS idx_post_aspects_aspect ON post_aspects(aspect);
CREATE INDEX IF NOT EXISTS idx_post_aspects_sentiment ON post_aspects(sentiment);

-- ============================================
-- 4. post_clusters - 貼文與 Cluster 關聯
-- ============================================

CREATE TABLE IF NOT EXISTS post_clusters (
    post_id VARCHAR(64) NOT NULL,
    cluster_id BIGINT NOT NULL,
    similarity REAL NOT NULL,              -- 0.0 ~ 1.0
    confidence VARCHAR(16),                -- high/medium/low
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, cluster_id)
);

CREATE INDEX IF NOT EXISTS idx_post_clusters_cluster_id ON post_clusters(cluster_id);
CREATE INDEX IF NOT EXISTS idx_post_clusters_similarity ON post_clusters(similarity DESC);
CREATE INDEX IF NOT EXISTS idx_post_clusters_assigned_at ON post_clusters(assigned_at);

-- ============================================
-- 5. 統計用 Views
-- ============================================

-- Soft Tag 統計
CREATE OR REPLACE VIEW soft_tag_stats AS
SELECT
    tag,
    COUNT(*) as post_count,
    AVG(confidence) as avg_confidence
FROM post_soft_tags
GROUP BY tag
ORDER BY post_count DESC;

-- Aspect 情感統計
CREATE OR REPLACE VIEW aspect_sentiment_stats AS
SELECT
    aspect,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
    COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
    ROUND(COUNT(*) FILTER (WHERE sentiment = 'positive')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as positive_ratio
FROM post_aspects
GROUP BY aspect
ORDER BY total DESC;

-- Cluster 貼文統計 (支援 Trends 計算)
CREATE OR REPLACE VIEW cluster_post_stats AS
SELECT
    pc.cluster_id,
    c.name as cluster_name,
    c.keywords,
    c.topic_id,
    t.name as topic_name,
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '24 hours') as posts_24h,
    COUNT(*) FILTER (WHERE pc.assigned_at > NOW() - INTERVAL '7 days') as posts_7d,
    AVG(pc.similarity) as avg_similarity
FROM post_clusters pc
JOIN clusters c ON pc.cluster_id = c.id
LEFT JOIN topics t ON c.topic_id = t.id
GROUP BY pc.cluster_id, c.name, c.keywords, c.topic_id, t.name
ORDER BY posts_24h DESC;
