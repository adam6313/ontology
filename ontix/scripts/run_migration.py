#!/usr/bin/env python3
"""Run SQL migrations"""
import psycopg2

conn = psycopg2.connect(
    host="localhost", port=5432, dbname="ontix_dev",
    user="ontix", password="ontix_dev"
)

migration_sql = """
-- LLM 分類結果表

-- 儲存 LLM 分類結果
CREATE TABLE IF NOT EXISTS post_llm_classifications (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,

    -- 主要分類
    primary_topic_id INT REFERENCES topics(id),
    primary_topic_name VARCHAR(100),

    -- 次要分類（可選）
    secondary_topic_id INT REFERENCES topics(id),
    secondary_topic_name VARCHAR(100),

    -- LLM 判斷
    confidence VARCHAR(20) NOT NULL,
    reason TEXT,
    is_multi_topic BOOLEAN DEFAULT FALSE,

    -- 元數據
    model_used VARCHAR(50) NOT NULL,
    input_tokens INT,
    output_tokens INT,
    cost_usd DECIMAL(10, 6),
    latency_ms INT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(post_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_llm_class_post_id ON post_llm_classifications(post_id);
CREATE INDEX IF NOT EXISTS idx_llm_class_primary_topic ON post_llm_classifications(primary_topic_id);
CREATE INDEX IF NOT EXISTS idx_llm_class_confidence ON post_llm_classifications(confidence);
CREATE INDEX IF NOT EXISTS idx_llm_class_created ON post_llm_classifications(created_at);

-- 分類統計視圖
CREATE OR REPLACE VIEW llm_classification_stats AS
SELECT
    t.name as topic_name,
    COUNT(*) as post_count,
    COUNT(CASE WHEN lc.confidence = 'high' THEN 1 END) as high_confidence,
    COUNT(CASE WHEN lc.confidence = 'medium' THEN 1 END) as medium_confidence,
    COUNT(CASE WHEN lc.confidence = 'low' THEN 1 END) as low_confidence,
    COUNT(CASE WHEN lc.is_multi_topic THEN 1 END) as multi_topic,
    AVG(lc.cost_usd) as avg_cost_per_post,
    AVG(lc.latency_ms) as avg_latency_ms
FROM post_llm_classifications lc
JOIN topics t ON lc.primary_topic_id = t.id
GROUP BY t.id, t.name
ORDER BY post_count DESC;

-- 成本追蹤視圖
CREATE OR REPLACE VIEW llm_daily_costs AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as posts_classified,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(cost_usd) as total_cost_usd,
    AVG(latency_ms) as avg_latency_ms
FROM post_llm_classifications
GROUP BY DATE(created_at)
ORDER BY date DESC;
"""

with conn.cursor() as cur:
    cur.execute(migration_sql)
    conn.commit()
    print("✅ Migration completed!")

conn.close()
