-- 分層置信度：為 cluster_assignments 加入 confidence 和 tag_matched 欄位
-- 支援產品層面的精確度/召回率權衡

-- ============================================
-- 1. 為 cluster_assignments 加入新欄位
-- ============================================

-- confidence: 置信度等級 (high, medium, low)
-- - high: similarity >= 0.75，直接分配
-- - medium: 0.50 <= similarity < 0.75，tag 驗證通過
-- - low: tag 驗證失敗但仍分配（供人工審核）

ALTER TABLE cluster_assignments
ADD COLUMN IF NOT EXISTS confidence VARCHAR(16) DEFAULT 'medium';

-- tag_matched: tag 驗證是否通過
ALTER TABLE cluster_assignments
ADD COLUMN IF NOT EXISTS tag_matched BOOLEAN DEFAULT true;

-- ============================================
-- 2. 建立索引（支援按置信度篩選）
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cluster_assignments_confidence
ON cluster_assignments(confidence);

CREATE INDEX IF NOT EXISTS idx_cluster_assignments_tag_matched
ON cluster_assignments(tag_matched);

-- 複合索引：查詢特定 cluster 的高信心分配
CREATE INDEX IF NOT EXISTS idx_cluster_assignments_cluster_confidence
ON cluster_assignments(cluster_id, confidence);

-- ============================================
-- 3. 更新現有資料的預設值
-- ============================================

-- 將現有的分配標記為 medium confidence（因為無法追溯當時的判斷）
UPDATE cluster_assignments
SET confidence = 'medium', tag_matched = true
WHERE confidence IS NULL OR confidence = '';

-- ============================================
-- 4. 有用的查詢範例
-- ============================================

-- 查詢高信心分配：
-- SELECT * FROM cluster_assignments WHERE confidence = 'high';

-- 查詢需要人工審核的分配：
-- SELECT * FROM cluster_assignments WHERE confidence = 'low' AND tag_matched = false;

-- 統計各信心等級分佈：
-- SELECT confidence, COUNT(*) FROM cluster_assignments GROUP BY confidence;
