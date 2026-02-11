-- 更新 embedding 維度從 768 (Gemini) 到 1536 (OpenAI)

-- 先刪除舊索引
DROP INDEX IF EXISTS idx_posts_embedding;
DROP INDEX IF EXISTS idx_clusters_centroid;

-- 清空現有 embedding（因為維度不同，無法轉換）
UPDATE posts SET embedding = NULL;
UPDATE clusters SET centroid = NULL;

-- 修改 posts 表的 embedding 維度
ALTER TABLE posts ALTER COLUMN embedding TYPE vector(1536);

-- 修改 clusters 表的 centroid 維度
ALTER TABLE clusters ALTER COLUMN centroid TYPE vector(1536);

-- 重建索引（需要有足夠資料後才能建立 ivfflat 索引）
-- CREATE INDEX IF NOT EXISTS idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
