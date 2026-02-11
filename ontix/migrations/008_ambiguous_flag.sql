-- 加入模糊分類標記和關鍵字加權欄位

-- post_topics 加入 is_ambiguous 和 keyword_boost 欄位
ALTER TABLE post_topics ADD COLUMN IF NOT EXISTS is_ambiguous BOOLEAN DEFAULT FALSE;
ALTER TABLE post_topics ADD COLUMN IF NOT EXISTS keyword_boost FLOAT DEFAULT 0;

-- 索引：快速找出模糊分類的貼文
CREATE INDEX IF NOT EXISTS idx_post_topics_ambiguous ON post_topics(is_ambiguous) WHERE is_ambiguous = TRUE;

-- 更新現有資料的 is_ambiguous 標記（根據 post_topic_scores）
UPDATE post_topics pt
SET is_ambiguous = TRUE
WHERE EXISTS (
    SELECT 1 FROM post_classification_gaps g
    WHERE g.post_id = pt.post_id AND g.clarity = 'ambiguous'
);
