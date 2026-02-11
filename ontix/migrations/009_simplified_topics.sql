-- 精簡版 Topic 結構（6 大類）

-- 建立精簡 Topic 表
CREATE TABLE IF NOT EXISTS topic_groups (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立原 Topic 到精簡 Topic 的映射
ALTER TABLE topics ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES topic_groups(id);

-- 插入 6 個精簡 Topic
INSERT INTO topic_groups (code, name, description) VALUES
('beauty_fashion', '美妝時尚', '化妝品、服飾、髮型、美甲等時尚美容相關'),
('food', '美食', '餐廳、食譜、料理、飲料、甜點等飲食相關'),
('travel_life', '旅遊生活', '旅遊景點、日常生活、生活風格、家庭關係等'),
('health_sports', '健康運動', '健身、運動、保健、醫療、養生等'),
('tech_entertainment', '科技娛樂', '3C科技、遊戲、音樂、影視、藝術等'),
('others', '其他', '其他難以分類的內容')
ON CONFLICT (code) DO NOTHING;

-- 建立映射關係
UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'beauty_fashion')
WHERE code = 'beauty_and_fashion';

UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'food')
WHERE code = 'food';

UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'travel_life')
WHERE code IN ('travel', 'lifestyle', 'daily_conversation_topics', 'family_and_relationships');

UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'health_sports')
WHERE code IN ('health', 'sports');

UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'tech_entertainment')
WHERE code IN ('technology', 'gaming', 'art_and_entertainment');

UPDATE topics SET group_id = (SELECT id FROM topic_groups WHERE code = 'others')
WHERE code IN ('pets', 'vehicles', 'adult', 'religion_and_fortunetelling',
               'business_and_economics', 'climate_and_environment',
               'education_work_and_learning', 'law_politics_and_society');

-- 索引
CREATE INDEX IF NOT EXISTS idx_topics_group_id ON topics(group_id);
