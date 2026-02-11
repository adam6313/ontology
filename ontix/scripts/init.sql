-- Ontix Database Schema
-- Dynamic Tagging & Topic Discovery System

-- ============================================
-- Posts Table
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    author_id VARCHAR(50),
    author_username VARCHAR(100),
    author_followers INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    views INT DEFAULT 0,
    risk_score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    indexed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_risk_score ON posts(risk_score);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);

-- ============================================
-- Tags Table (Hard Tags - 278 predefined)
-- ============================================
CREATE TABLE IF NOT EXISTS hard_tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Soft Tags Table (Dynamic, LLM-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS soft_tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cluster_id VARCHAR(50),
    keywords JSONB DEFAULT '[]',
    confidence FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soft_tags_cluster ON soft_tags(cluster_id);

-- ============================================
-- Post-Tag Relations
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    tag_id VARCHAR(50) NOT NULL,
    tag_type VARCHAR(10) NOT NULL,  -- 'hard' or 'soft'
    confidence FLOAT DEFAULT 1.0,
    source VARCHAR(20) NOT NULL,    -- 'llm', 'cluster', 'manual', 'feedback'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, tag_id, tag_type)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_type ON post_tags(tag_type);

-- ============================================
-- Clusters Table
-- ============================================
CREATE TABLE IF NOT EXISTS clusters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    keywords JSONB DEFAULT '[]',
    size INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'emerging',  -- emerging, active, trending, stable, declining, archived
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clusters_status ON clusters(status);

-- ============================================
-- Cluster Assignments (Post-Cluster)
-- ============================================
CREATE TABLE IF NOT EXISTS cluster_assignments (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    cluster_id VARCHAR(50) NOT NULL,
    similarity FLOAT NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, cluster_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_cluster ON cluster_assignments(cluster_id);
CREATE INDEX IF NOT EXISTS idx_assignments_similarity ON cluster_assignments(similarity);

-- ============================================
-- Cluster History (Lifecycle tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS cluster_history (
    id SERIAL PRIMARY KEY,
    cluster_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL,  -- created, merged, split, status_change, archived
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cluster_history_cluster ON cluster_history(cluster_id);

-- ============================================
-- Updated At Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER soft_tags_updated
    BEFORE UPDATE ON soft_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clusters_updated
    BEFORE UPDATE ON clusters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Initialization
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Ontix database schema initialized successfully!';
END $$;
