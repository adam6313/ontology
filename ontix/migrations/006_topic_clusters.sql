-- Topic + Sub-Cluster 兩層結構
-- Clusters 成為 Topics 下的動態子群

-- ============================================
-- 1. 修改 clusters 表，加入 topic_id 和趨勢欄位
-- ============================================

-- 加入 topic_id 外鍵
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS topic_id INTEGER REFERENCES topics(id);

-- 加入趨勢相關欄位
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS prev_week_size INTEGER DEFAULT 0;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS growth_rate FLOAT DEFAULT 0;  -- (本週-上週)/上週
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS trend VARCHAR(16) DEFAULT 'stable';  -- emerging, hot, stable, declining

-- 加入時間範圍欄位（這個 cluster 是基於哪段時間的資料）
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ;

-- ============================================
-- 2. 建立索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clusters_topic_id ON clusters(topic_id);
CREATE INDEX IF NOT EXISTS idx_clusters_trend ON clusters(trend);
CREATE INDEX IF NOT EXISTS idx_clusters_growth_rate ON clusters(growth_rate DESC);

-- ============================================
-- 3. 修改 cluster_assignments，加入 topic 關聯
-- ============================================

-- 加入 topic_id（冗餘但方便查詢）
ALTER TABLE cluster_assignments ADD COLUMN IF NOT EXISTS topic_id INTEGER REFERENCES topics(id);

CREATE INDEX IF NOT EXISTS idx_cluster_assignments_topic ON cluster_assignments(topic_id);

-- ============================================
-- 4. 建立趨勢計算的 View
-- ============================================

CREATE OR REPLACE VIEW cluster_trends AS
SELECT
    c.id,
    c.name,
    c.topic_id,
    t.name as topic_name,
    t.code as topic_code,
    c.size as current_size,
    c.prev_week_size,
    c.growth_rate,
    c.trend,
    c.keywords,
    c.period_start,
    c.period_end,
    c.created_at
FROM clusters c
LEFT JOIN topics t ON c.topic_id = t.id
WHERE c.status != 'archived'
ORDER BY c.growth_rate DESC;

-- ============================================
-- 5. 趨勢判斷函數
-- ============================================

CREATE OR REPLACE FUNCTION calculate_trend(current_size INT, prev_size INT)
RETURNS VARCHAR(16) AS $$
BEGIN
    IF prev_size = 0 THEN
        RETURN 'emerging';  -- 新發現
    END IF;

    DECLARE
        rate FLOAT := (current_size - prev_size)::FLOAT / prev_size;
    BEGIN
        IF rate >= 0.5 THEN
            RETURN 'hot';       -- 熱門（成長 50%+）
        ELSIF rate >= 0.1 THEN
            RETURN 'growing';   -- 成長中（10-50%）
        ELSIF rate >= -0.1 THEN
            RETURN 'stable';    -- 穩定（-10% ~ +10%）
        ELSE
            RETURN 'declining'; -- 衰退（-10% 以下）
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;
