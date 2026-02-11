-- 記錄每篇貼文對所有 Topics 的相似度
-- 用於分析分類品質和找出錯分 pattern

CREATE TABLE IF NOT EXISTS post_topic_scores (
    post_id BIGINT NOT NULL,
    topic_id INT NOT NULL REFERENCES topics(id),
    similarity FLOAT NOT NULL,
    rank INT NOT NULL,  -- 1=最高相似度, 2=次高...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, topic_id)
);

-- 索引：按 post 查詢所有 topic 分數
CREATE INDEX IF NOT EXISTS idx_post_topic_scores_post ON post_topic_scores(post_id);

-- 索引：按 topic 查詢（用於分析每個 topic 的相似度分佈）
CREATE INDEX IF NOT EXISTS idx_post_topic_scores_topic ON post_topic_scores(topic_id);

-- 索引：找出模糊分類（rank=1 和 rank=2 差距小的）
CREATE INDEX IF NOT EXISTS idx_post_topic_scores_rank ON post_topic_scores(post_id, rank) WHERE rank <= 2;

-- View：分析每篇貼文的 top1-top2 gap
CREATE OR REPLACE VIEW post_classification_gaps AS
SELECT
    p.post_id,
    t1.topic_id as top1_topic_id,
    t1_ref.name as top1_topic,
    t1.similarity as top1_sim,
    t2.topic_id as top2_topic_id,
    t2_ref.name as top2_topic,
    t2.similarity as top2_sim,
    (t1.similarity - t2.similarity) as gap,
    CASE
        WHEN (t1.similarity - t2.similarity) < 0.02 THEN 'ambiguous'
        WHEN (t1.similarity - t2.similarity) < 0.05 THEN 'moderate'
        ELSE 'clear'
    END as clarity
FROM posts p
JOIN post_topic_scores t1 ON p.post_id::bigint = t1.post_id AND t1.rank = 1
JOIN post_topic_scores t2 ON p.post_id::bigint = t2.post_id AND t2.rank = 2
JOIN topics t1_ref ON t1.topic_id = t1_ref.id
JOIN topics t2_ref ON t2.topic_id = t2_ref.id;

-- View：每個 Topic 的相似度分佈統計
CREATE OR REPLACE VIEW topic_similarity_stats AS
SELECT
    t.id as topic_id,
    t.name as topic_name,
    COUNT(*) as total_posts,
    ROUND(AVG(pts.similarity)::numeric, 3) as avg_similarity,
    ROUND(STDDEV(pts.similarity)::numeric, 3) as stddev_similarity,
    ROUND(MIN(pts.similarity)::numeric, 3) as min_similarity,
    ROUND(MAX(pts.similarity)::numeric, 3) as max_similarity,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pts.similarity)::numeric, 3) as median_similarity
FROM topics t
JOIN post_topic_scores pts ON t.id = pts.topic_id
WHERE pts.rank = 1  -- 只看被選為 top1 的
GROUP BY t.id, t.name
ORDER BY total_posts DESC;
