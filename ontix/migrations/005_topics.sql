-- 預定義主題分類系統
-- 取代動態聚類，使用固定的大類進行分類

-- ============================================
-- 1. Topics 表（預定義主題）
-- ============================================

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,      -- 英文代碼 (e.g., "gaming")
    name VARCHAR(128) NOT NULL,            -- 中文名稱 (e.g., "遊戲")
    description TEXT,                       -- 主題描述（用於生成更好的 embedding）
    embedding vector(1536),                 -- 主題的 embedding
    post_count INTEGER DEFAULT 0,           -- 該主題的貼文數量
    is_active BOOLEAN DEFAULT true,         -- 是否啟用
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_topics_code ON topics(code);
CREATE INDEX IF NOT EXISTS idx_topics_embedding_hnsw ON topics
    USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- 2. Post-Topic 關聯表
-- ============================================

CREATE TABLE IF NOT EXISTS post_topics (
    id BIGSERIAL,
    post_id BIGINT NOT NULL,
    topic_id INTEGER NOT NULL REFERENCES topics(id),
    similarity FLOAT NOT NULL,              -- 與主題的相似度
    confidence VARCHAR(16) DEFAULT 'medium', -- high/medium/low
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, assigned_at)
) PARTITION BY RANGE (assigned_at);

-- 分區
CREATE TABLE IF NOT EXISTS post_topics_2025 PARTITION OF post_topics
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS post_topics_2026 PARTITION OF post_topics
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS post_topics_default PARTITION OF post_topics DEFAULT;

-- 索引
CREATE INDEX IF NOT EXISTS idx_post_topics_post ON post_topics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_topic ON post_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_confidence ON post_topics(confidence);

-- ============================================
-- 3. 插入預定義主題
-- ============================================

INSERT INTO topics (code, name, description) VALUES
    ('gaming', '遊戲', '電子遊戲、手遊、電競、遊戲實況、遊戲攻略'),
    ('beauty_and_fashion', '美妝時尚', '化妝品、護膚、髮型、穿搭、時尚潮流、美甲'),
    ('health', '健康', '健身、養生、醫療保健、心理健康、減肥'),
    ('food', '美食', '餐廳推薦、料理食譜、美食探店、咖啡廳、甜點'),
    ('art_and_entertainment', '藝術和娛樂', '音樂、電影、戲劇、展覽、演唱會、藝術創作'),
    ('sports', '運動', '籃球、足球、棒球、健身運動、戶外運動、極限運動'),
    ('business_and_economics', '商業和經濟', '投資理財、創業、職場、股票、加密貨幣'),
    ('family_and_relationships', '家庭和關係', '親子、育兒、感情、婚姻、家庭生活'),
    ('technology', '科技', '3C產品、手機、電腦、AI、科技新知、軟體應用'),
    ('law_politics_and_society', '法律、政治和社會', '時事、社會議題、政治、法律知識'),
    ('travel', '旅遊', '國內旅遊、出國旅行、景點推薦、旅遊攻略、住宿'),
    ('education_work_and_learning', '教育、工作和學習', '學習方法、職場技能、考試、進修、職涯發展'),
    ('pets', '寵物', '貓、狗、寵物照護、寵物用品、寵物日常'),
    ('lifestyle', '生活風格', '居家佈置、生活小物、日常紀錄、興趣嗜好'),
    ('religion_and_fortunetelling', '宗教命理', '星座、塔羅、宗教信仰、命理占卜、風水'),
    ('adult', '成人', '成人內容、情趣用品'),
    ('vehicles', '交通工具', '汽車、機車、單車、交通工具評測、改裝'),
    ('daily_conversation_topics', '日常話題', '閒聊、心情抒發、生活瑣事、迷因'),
    ('climate_and_environment', '氣候和環境', '環保、氣候變遷、永續發展、自然生態')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 4. 更新 post_count 的 trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_topic_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE topics SET post_count = post_count + 1, updated_at = NOW()
        WHERE id = NEW.topic_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE topics SET post_count = post_count - 1, updated_at = NOW()
        WHERE id = OLD.topic_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_topic_post_count ON post_topics;
CREATE TRIGGER trigger_update_topic_post_count
AFTER INSERT OR DELETE ON post_topics
FOR EACH ROW EXECUTE FUNCTION update_topic_post_count();
