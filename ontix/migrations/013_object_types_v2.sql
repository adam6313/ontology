-- ============================================
-- Object Types v2：語意分層型（7 types + sub_type）
--
-- 變更：
-- - restaurant → place（擴大為「所有可以去的地方」）
-- - location 合併進 place
-- - 新增 work（創作作品）、event（活動）、organization（組織）
-- ============================================

BEGIN;

-- ============================================
-- 1. 把 restaurant 改名為 place
-- ============================================
UPDATE object_types
SET name = 'place',
    display_name = '地方/店家',
    description = '可以去的實體地方：餐廳、咖啡廳、髮廊、飯店、診所、健身房、景點、城市、行政區',
    properties_schema = '{
        "sub_type": {"type": "string", "description": "restaurant/cafe/salon/hotel/clinic/gym/attraction/city/district"},
        "area": {"type": "string", "description": "所在區域"},
        "price_range": {"type": "string", "description": "價格區間"}
    }'
WHERE name = 'restaurant';

-- ============================================
-- 2. 把 location 類型的 Entity 搬到 place
-- ============================================
-- 先拿到 place 和 location 的 type_id
-- place = 原 restaurant 的 id (3)
-- location = id (5)

UPDATE objects
SET type_id = (SELECT id FROM object_types WHERE name = 'place'),
    properties = properties || '{"sub_type": "city"}'
WHERE type_id = (SELECT id FROM object_types WHERE name = 'location')
  AND status = 'active';

-- 也更新 merged 狀態的（如果有的話）
UPDATE objects
SET type_id = (SELECT id FROM object_types WHERE name = 'place')
WHERE type_id = (SELECT id FROM object_types WHERE name = 'location');

-- ============================================
-- 3. 刪除 location type（已合併）
-- ============================================
DELETE FROM object_types WHERE name = 'location';

-- ============================================
-- 4. 新增 work, event, organization
-- ============================================
INSERT INTO object_types (name, display_name, description, properties_schema) VALUES
('work', '作品', '創作作品：電影、影集、遊戲、音樂、書籍、App、Podcast', '{
    "sub_type": {"type": "string", "description": "movie/drama/game/song/book/app/podcast"},
    "creator": {"type": "string", "description": "創作者/開發商"},
    "release_year": {"type": "integer", "description": "發行年份"}
}'),
('event', '活動', '時間性活動：演唱會、展覽、週年慶、產品發表會、節慶', '{
    "sub_type": {"type": "string", "description": "concert/festival/sale/launch/exhibition"},
    "date": {"type": "string", "description": "活動日期"},
    "venue": {"type": "string", "description": "活動地點"}
}'),
('organization', '組織', '非商業組織：政府機關、學校、醫院、NGO', '{
    "sub_type": {"type": "string", "description": "government/school/hospital/ngo"},
    "sector": {"type": "string", "description": "領域"}
}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. 更新 brand 的描述（加上 sub_type）
-- ============================================
UPDATE object_types
SET description = '商業實體：公司、品牌、連鎖、平台、服務',
    properties_schema = '{
        "sub_type": {"type": "string", "description": "tech/beauty/food/fashion/finance/retail/service/platform"},
        "industry": {"type": "string", "description": "所屬產業"},
        "country": {"type": "string", "description": "發源國家"}
    }'
WHERE name = 'brand';

-- ============================================
-- 6. 更新 product 的描述
-- ============================================
UPDATE object_types
SET description = '具體產品或商品：手機、化妝品、食品、軟體',
    properties_schema = '{
        "sub_type": {"type": "string", "description": "electronics/cosmetics/food/clothing/software"},
        "category": {"type": "string", "description": "產品類別"},
        "price_range": {"type": "string", "description": "價格區間"}
    }'
WHERE name = 'product';

-- ============================================
-- 7. 更新 person 的描述
-- ============================================
UPDATE object_types
SET description = '人物：KOL、藝人、運動員、政治人物、創作者',
    properties_schema = '{
        "sub_type": {"type": "string", "description": "kol/celebrity/athlete/politician/creator"},
        "platform": {"type": "string", "description": "主要平台"},
        "category": {"type": "string", "description": "內容類別"}
    }'
WHERE name = 'person';

-- ============================================
-- 8. 幫現有 place Entity 補上 sub_type
-- ============================================
-- 原本是 restaurant 的，sub_type 設為對應值
UPDATE objects
SET properties = properties || '{"sub_type": "salon"}'
WHERE canonical_name = '2006hairsalon'
  AND properties->>'sub_type' IS NULL;

UPDATE objects
SET properties = properties || '{"sub_type": "restaurant"}'
WHERE canonical_name IN ('點點心', '桃米坑桑心豆花', '桑心實驗室', '酉')
  AND properties->>'sub_type' IS NULL;

UPDATE objects
SET properties = properties || '{"sub_type": "cafe"}'
WHERE canonical_name = '路易莎'
  AND properties->>'sub_type' IS NULL;

COMMIT;
