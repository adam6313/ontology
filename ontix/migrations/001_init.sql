-- 啟用 pgvector 擴展
CREATE EXTENSION IF NOT EXISTS vector;

-- 貼文表
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    content TEXT NOT NULL,
    platform VARCHAR(32) NOT NULL,
    author_id VARCHAR(64),
    author_username VARCHAR(128),
    author_followers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 貼文索引
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_embedding ON posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 軟標籤表
CREATE TABLE IF NOT EXISTS soft_tags (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    cluster_id VARCHAR(64),
    keywords TEXT[],
    confidence FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soft_tags_name ON soft_tags(name);
CREATE INDEX IF NOT EXISTS idx_soft_tags_cluster_id ON soft_tags(cluster_id);

-- 貼文標籤關聯表
CREATE TABLE IF NOT EXISTS post_tags (
    post_id VARCHAR(64) NOT NULL,
    tag_id VARCHAR(64) NOT NULL,
    tag_type VARCHAR(16) NOT NULL,  -- 'hard' or 'soft'
    confidence FLOAT DEFAULT 0,
    source VARCHAR(32) NOT NULL,     -- 'llm', 'cluster', 'manual', 'feedback'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_type ON post_tags(tag_type);

-- 聚類表
CREATE TABLE IF NOT EXISTS clusters (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    centroid vector(768),
    size INTEGER DEFAULT 0,
    keywords TEXT[],
    status VARCHAR(32) DEFAULT 'emerging',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clusters_status ON clusters(status);
CREATE INDEX IF NOT EXISTS idx_clusters_size ON clusters(size DESC);

-- 聚類分配表
CREATE TABLE IF NOT EXISTS cluster_assignments (
    post_id VARCHAR(64) PRIMARY KEY,
    cluster_id VARCHAR(64) NOT NULL,
    similarity FLOAT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cluster_assignments_cluster_id ON cluster_assignments(cluster_id);
