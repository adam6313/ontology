-- 大規模優化：分區表 + Embedding 分離 + HNSW 索引
-- 適用於 100萬+/月 貼文量

-- ============================================
-- 1. 建立新的分區表結構
-- ============================================

-- 1.1 新的 posts 表 (分區)
CREATE TABLE posts_new (
    id BIGSERIAL,
    external_id VARCHAR(64) NOT NULL,  -- 原始平台 ID
    content TEXT NOT NULL,
    platform VARCHAR(32) NOT NULL,
    author_id VARCHAR(64),
    author_username VARCHAR(128),
    author_followers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 1.2 建立分區 (當前月份 + 未來 3 個月)
CREATE TABLE posts_2024_01 PARTITION OF posts_new
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE posts_2024_02 PARTITION OF posts_new
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE posts_2024_03 PARTITION OF posts_new
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE posts_2024_04 PARTITION OF posts_new
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE posts_2024_05 PARTITION OF posts_new
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE posts_2024_06 PARTITION OF posts_new
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE posts_2024_07 PARTITION OF posts_new
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE posts_2024_08 PARTITION OF posts_new
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE posts_2024_09 PARTITION OF posts_new
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE posts_2024_10 PARTITION OF posts_new
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE posts_2024_11 PARTITION OF posts_new
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE posts_2024_12 PARTITION OF posts_new
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 年分區
CREATE TABLE posts_2025_01 PARTITION OF posts_new
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE posts_2025_02 PARTITION OF posts_new
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE posts_2025_03 PARTITION OF posts_new
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE posts_2025_04 PARTITION OF posts_new
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE posts_2025_05 PARTITION OF posts_new
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE posts_2025_06 PARTITION OF posts_new
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE posts_2025_07 PARTITION OF posts_new
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE posts_2025_08 PARTITION OF posts_new
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE posts_2025_09 PARTITION OF posts_new
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE posts_2025_10 PARTITION OF posts_new
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE posts_2025_11 PARTITION OF posts_new
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE posts_2025_12 PARTITION OF posts_new
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- 2026 年分區
CREATE TABLE posts_2026_01 PARTITION OF posts_new
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE posts_2026_02 PARTITION OF posts_new
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE posts_2026_03 PARTITION OF posts_new
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE posts_2026_04 PARTITION OF posts_new
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE posts_2026_05 PARTITION OF posts_new
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE posts_2026_06 PARTITION OF posts_new
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- 預設分區 (處理超出範圍的資料)
CREATE TABLE posts_default PARTITION OF posts_new DEFAULT;

-- 1.3 posts 索引
CREATE INDEX idx_posts_new_external_id ON posts_new(external_id);
CREATE INDEX idx_posts_new_platform ON posts_new(platform);
CREATE INDEX idx_posts_new_created_at ON posts_new(created_at DESC);
CREATE INDEX idx_posts_new_platform_created ON posts_new(platform, created_at DESC);

-- ============================================
-- 2. Embedding 獨立表 (HNSW 索引)
-- ============================================

CREATE TABLE post_embeddings (
    post_id BIGINT PRIMARY KEY,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW 索引 (比 ivfflat 更快，適合大規模)
-- m: 每層連接數，ef_construction: 建構時搜尋寬度
CREATE INDEX idx_post_embeddings_hnsw ON post_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================
-- 3. post_tags 分區表
-- ============================================

CREATE TABLE post_tags_new (
    id BIGSERIAL,
    post_id BIGINT NOT NULL,
    tag_id VARCHAR(128) NOT NULL,
    tag_type VARCHAR(16) NOT NULL,  -- 'hard' or 'soft'
    confidence FLOAT DEFAULT 0,
    source VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2024 分區
CREATE TABLE post_tags_2024_01 PARTITION OF post_tags_new FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE post_tags_2024_02 PARTITION OF post_tags_new FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE post_tags_2024_03 PARTITION OF post_tags_new FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE post_tags_2024_04 PARTITION OF post_tags_new FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE post_tags_2024_05 PARTITION OF post_tags_new FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE post_tags_2024_06 PARTITION OF post_tags_new FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE post_tags_2024_07 PARTITION OF post_tags_new FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE post_tags_2024_08 PARTITION OF post_tags_new FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE post_tags_2024_09 PARTITION OF post_tags_new FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE post_tags_2024_10 PARTITION OF post_tags_new FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE post_tags_2024_11 PARTITION OF post_tags_new FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE post_tags_2024_12 PARTITION OF post_tags_new FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 分區
CREATE TABLE post_tags_2025_01 PARTITION OF post_tags_new FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE post_tags_2025_02 PARTITION OF post_tags_new FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE post_tags_2025_03 PARTITION OF post_tags_new FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE post_tags_2025_04 PARTITION OF post_tags_new FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE post_tags_2025_05 PARTITION OF post_tags_new FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE post_tags_2025_06 PARTITION OF post_tags_new FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE post_tags_2025_07 PARTITION OF post_tags_new FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE post_tags_2025_08 PARTITION OF post_tags_new FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE post_tags_2025_09 PARTITION OF post_tags_new FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE post_tags_2025_10 PARTITION OF post_tags_new FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE post_tags_2025_11 PARTITION OF post_tags_new FOR VALUES FROM ('2025-11-11') TO ('2025-12-01');
CREATE TABLE post_tags_2025_12 PARTITION OF post_tags_new FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- 2026 分區
CREATE TABLE post_tags_2026_01 PARTITION OF post_tags_new FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE post_tags_2026_02 PARTITION OF post_tags_new FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE post_tags_2026_03 PARTITION OF post_tags_new FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE post_tags_2026_04 PARTITION OF post_tags_new FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE post_tags_2026_05 PARTITION OF post_tags_new FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE post_tags_2026_06 PARTITION OF post_tags_new FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- 預設分區
CREATE TABLE post_tags_default PARTITION OF post_tags_new DEFAULT;

-- post_tags 索引
CREATE INDEX idx_post_tags_new_post_id ON post_tags_new(post_id);
CREATE INDEX idx_post_tags_new_tag_id ON post_tags_new(tag_id);
CREATE INDEX idx_post_tags_new_tag_type ON post_tags_new(tag_type);

-- ============================================
-- 4. clusters 表優化 (HNSW for centroid)
-- ============================================

CREATE TABLE clusters_new (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    centroid vector(1536),
    size INTEGER DEFAULT 0,
    keywords TEXT[],
    status VARCHAR(32) DEFAULT 'emerging',  -- emerging, stable, declining
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clusters_new_status ON clusters_new(status);
CREATE INDEX idx_clusters_new_size ON clusters_new(size DESC);
CREATE INDEX idx_clusters_new_centroid_hnsw ON clusters_new
    USING hnsw (centroid vector_cosine_ops);

-- ============================================
-- 5. cluster_assignments 分區表
-- ============================================

CREATE TABLE cluster_assignments_new (
    id BIGSERIAL,
    post_id BIGINT NOT NULL,
    cluster_id BIGINT NOT NULL,
    similarity FLOAT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, assigned_at)
) PARTITION BY RANGE (assigned_at);

-- 2024-2026 分區
CREATE TABLE cluster_assignments_2024 PARTITION OF cluster_assignments_new FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE cluster_assignments_2025 PARTITION OF cluster_assignments_new FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE cluster_assignments_2026 PARTITION OF cluster_assignments_new FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE cluster_assignments_default PARTITION OF cluster_assignments_new DEFAULT;

CREATE INDEX idx_cluster_assignments_new_post ON cluster_assignments_new(post_id);
CREATE INDEX idx_cluster_assignments_new_cluster ON cluster_assignments_new(cluster_id);

-- ============================================
-- 6. 自動建立分區的函數 (未來擴展用)
-- ============================================

CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    year INT,
    month INT
) RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || year || '_' || LPAD(month::TEXT, 2, '0');
    start_date := make_date(year, month, 1);
    end_date := start_date + INTERVAL '1 month';

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 資料遷移 (從舊表到新表)
-- ============================================

-- 注意：實際執行時請根據資料量決定是否分批遷移

-- 7.1 遷移 posts
INSERT INTO posts_new (external_id, content, platform, author_id, author_username,
                       author_followers, likes, comments, shares, views, created_at)
SELECT id, content, platform, author_id, author_username,
       author_followers, likes, comments, shares, views, created_at
FROM posts
WHERE content IS NOT NULL;

-- 7.2 遷移 embeddings
INSERT INTO post_embeddings (post_id, embedding, created_at)
SELECT pn.id, p.embedding, p.created_at
FROM posts p
JOIN posts_new pn ON p.id = pn.external_id
WHERE p.embedding IS NOT NULL;

-- 7.3 遷移 post_tags
INSERT INTO post_tags_new (post_id, tag_id, tag_type, confidence, source, created_at)
SELECT pn.id, pt.tag_id, pt.tag_type, pt.confidence, pt.source, pt.created_at
FROM post_tags pt
JOIN posts_new pn ON pt.post_id = pn.external_id;

-- 7.4 遷移 clusters
INSERT INTO clusters_new (name, centroid, size, keywords, status, created_at, updated_at)
SELECT name, centroid, size, keywords, status, created_at, updated_at
FROM clusters;

-- 7.5 遷移 cluster_assignments
INSERT INTO cluster_assignments_new (post_id, cluster_id, similarity, assigned_at)
SELECT pn.id, cn.id, ca.similarity, ca.assigned_at
FROM cluster_assignments ca
JOIN posts_new pn ON ca.post_id = pn.external_id
JOIN clusters_new cn ON ca.cluster_id::TEXT = (SELECT id FROM clusters WHERE clusters.id = ca.cluster_id)::TEXT;

-- ============================================
-- 8. 重命名表 (切換到新結構)
-- ============================================

-- 備份舊表
ALTER TABLE posts RENAME TO posts_old;
ALTER TABLE post_tags RENAME TO post_tags_old;
ALTER TABLE clusters RENAME TO clusters_old;
ALTER TABLE cluster_assignments RENAME TO cluster_assignments_old;

-- 啟用新表
ALTER TABLE posts_new RENAME TO posts;
ALTER TABLE post_tags_new RENAME TO post_tags;
ALTER TABLE clusters_new RENAME TO clusters;
ALTER TABLE cluster_assignments_new RENAME TO cluster_assignments;

-- ============================================
-- 9. 清理 (確認無誤後執行)
-- ============================================

-- DROP TABLE posts_old CASCADE;
-- DROP TABLE post_tags_old CASCADE;
-- DROP TABLE clusters_old CASCADE;
-- DROP TABLE cluster_assignments_old CASCADE;
-- DROP TABLE soft_tags CASCADE;  -- 如果不再需要
