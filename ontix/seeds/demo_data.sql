-- ============================================================
-- ONTIX DEMO SEED DATA
-- 49 entities · 500+ posts · 12 weeks · ontology relations · inference facts
-- Run: psql $DATABASE_URL -f seeds/demo_data.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 0. CLEANUP
-- ============================================================
TRUNCATE derived_facts CASCADE;
TRUNCATE entity_observations CASCADE;
TRUNCATE object_relations CASCADE;
TRUNCATE object_links CASCADE;
TRUNCATE entity_aspects CASCADE;
TRUNCATE post_entity_mentions CASCADE;
TRUNCATE object_aliases CASCADE;
DELETE FROM objects;
DELETE FROM posts WHERE post_id LIKE 'demo_%';

-- ============================================================
-- 1. ENTITIES (49 objects)
-- UUID pattern: {type_prefix}0000-0000-4000-a000-00000000000{N}
-- ============================================================

-- === Brands (9) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('10000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='brand'), '理膚寶水', 11, '{"sub_type":"beauty","market_segment":"美容","price_position":"中端","country":"法國"}', 'active'),
('10000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='brand'), '薇姿', 11, '{"sub_type":"beauty","market_segment":"美容","price_position":"中端","country":"法國"}', 'active'),
('10000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='brand'), 'CeraVe', 11, '{"sub_type":"beauty","market_segment":"美容","price_position":"平價","country":"美國"}', 'active'),
('10000000-0000-4000-a000-000000000004', (SELECT id FROM object_types WHERE name='brand'), 'COSRX', 11, '{"sub_type":"beauty","market_segment":"美容","price_position":"平價","country":"韓國"}', 'active'),
('10000000-0000-4000-a000-000000000005', (SELECT id FROM object_types WHERE name='brand'), 'innisfree', 11, '{"sub_type":"beauty","market_segment":"美容","price_position":"平價","country":"韓國"}', 'active'),
('10000000-0000-4000-a000-000000000006', (SELECT id FROM object_types WHERE name='brand'), '鬍子茶', 11, '{"sub_type":"food","market_segment":"餐飲","price_position":"平價","country":"台灣"}', 'active'),
('10000000-0000-4000-a000-000000000007', (SELECT id FROM object_types WHERE name='brand'), '茶湯會', 11, '{"sub_type":"food","market_segment":"餐飲","price_position":"平價","country":"台灣"}', 'active'),
('10000000-0000-4000-a000-000000000008', (SELECT id FROM object_types WHERE name='brand'), '寶雅', 11, '{"sub_type":"retail","market_segment":"零售","price_position":"平價","country":"台灣"}', 'active'),
('10000000-0000-4000-a000-000000000009', (SELECT id FROM object_types WHERE name='brand'), '屈臣氏', 11, '{"sub_type":"retail","market_segment":"零售","price_position":"平價","country":"香港"}', 'active');

-- === Products (8) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('20000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='product'), 'B5全面修復霜', 21, '{"category":"護膚","brand":"理膚寶水"}', 'active'),
('20000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='product'), '89火山能量瓶', 21, '{"category":"護膚","brand":"薇姿"}', 'active'),
('20000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='product'), '保濕修護乳', 21, '{"category":"護膚","brand":"CeraVe"}', 'active'),
('20000000-0000-4000-a000-000000000004', (SELECT id FROM object_types WHERE name='product'), '蝸牛精華', 21, '{"category":"護膚","brand":"COSRX"}', 'active'),
('20000000-0000-4000-a000-000000000005', (SELECT id FROM object_types WHERE name='product'), '綠茶籽保濕精華', 21, '{"category":"護膚","brand":"innisfree"}', 'active'),
('20000000-0000-4000-a000-000000000006', (SELECT id FROM object_types WHERE name='product'), '木瓜牛奶', 21, '{"category":"飲品","brand":"鬍子茶"}', 'active'),
('20000000-0000-4000-a000-000000000007', (SELECT id FROM object_types WHERE name='product'), '珍珠奶茶', 21, '{"category":"飲品","brand":"茶湯會"}', 'active'),
('20000000-0000-4000-a000-000000000008', (SELECT id FROM object_types WHERE name='product'), '淨膚控油潔面乳', 21, '{"category":"護膚","brand":"理膚寶水"}', 'active');

-- === Persons / KOLs (10) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('30000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='person'), 'Carol凱若', 31, '{"sub_type":"kol","role":"creator","platform":"instagram"}', 'active'),
('30000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='person'), '美妝小安', 31, '{"sub_type":"kol","role":"creator","platform":"youtube"}', 'active'),
('30000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='person'), '保養日記', 31, '{"sub_type":"kol","role":"creator","platform":"instagram"}', 'active'),
('30000000-0000-4000-a000-000000000004', (SELECT id FROM object_types WHERE name='person'), '痘痘肌研究所', 31, '{"sub_type":"kol","role":"creator","platform":"youtube"}', 'active'),
('30000000-0000-4000-a000-000000000005', (SELECT id FROM object_types WHERE name='person'), '穿搭日誌Mia', 31, '{"sub_type":"kol","role":"creator","platform":"instagram"}', 'active'),
('30000000-0000-4000-a000-000000000006', (SELECT id FROM object_types WHERE name='person'), '吃貨阿明', 31, '{"sub_type":"kol","role":"creator","platform":"tiktok"}', 'active'),
('30000000-0000-4000-a000-000000000007', (SELECT id FROM object_types WHERE name='person'), '台灣美食王', 31, '{"sub_type":"kol","role":"creator","platform":"youtube"}', 'active'),
('30000000-0000-4000-a000-000000000008', (SELECT id FROM object_types WHERE name='person'), '科技宅男', 31, '{"sub_type":"kol","role":"creator","platform":"youtube"}', 'active'),
('30000000-0000-4000-a000-000000000009', (SELECT id FROM object_types WHERE name='person'), '旅行日記Luna', 31, '{"sub_type":"kol","role":"creator","platform":"instagram"}', 'active'),
('30000000-0000-4000-a000-000000000010', (SELECT id FROM object_types WHERE name='person'), '健身教練Sam', 31, '{"sub_type":"kol","role":"creator","platform":"instagram"}', 'active');

-- === Places (5) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('40000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='place'), '台北信義區', 42, '{"city":"台北"}', 'active'),
('40000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='place'), '西門町', 42, '{"city":"台北"}', 'active'),
('40000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='place'), '台中逢甲夜市', 41, '{"city":"台中"}', 'active'),
('40000000-0000-4000-a000-000000000004', (SELECT id FROM object_types WHERE name='place'), '新竹巨城', 41, '{"city":"新竹"}', 'active'),
('40000000-0000-4000-a000-000000000005', (SELECT id FROM object_types WHERE name='place'), '高雄駁二', 41, '{"city":"高雄"}', 'active');

-- === Content Topics (10) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('50000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='content_topic'), '油痘肌護膚', 70, '{"category":"美妝","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='content_topic'), '美妝教程', 70, '{"category":"美妝","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='content_topic'), '韓系穿搭', 70, '{"category":"穿搭","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000004', (SELECT id FROM object_types WHERE name='content_topic'), '開架粉底評比', 70, '{"category":"美妝","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000005', (SELECT id FROM object_types WHERE name='content_topic'), '好物推薦', 70, '{"category":"生活","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000006', (SELECT id FROM object_types WHERE name='content_topic'), '台中美食探店', 70, '{"category":"美食","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000007', (SELECT id FROM object_types WHERE name='content_topic'), '防曬攻略', 70, '{"category":"美妝","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000008', (SELECT id FROM object_types WHERE name='content_topic'), '平價保養', 70, '{"category":"美妝","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000009', (SELECT id FROM object_types WHERE name='content_topic'), '夏日飲品推薦', 70, '{"category":"美食","topic_status":"active"}', 'active'),
('50000000-0000-4000-a000-000000000010', (SELECT id FROM object_types WHERE name='content_topic'), '健身穿搭', 70, '{"category":"健身","topic_status":"emerging"}', 'active');

-- === Works (3) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('60000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='work'), '美妝大賞2025', 51, '{"release_year":2025}', 'active'),
('60000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='work'), '痘痘肌保養全攻略', 51, '{}', 'active'),
('60000000-0000-4000-a000-000000000003', (SELECT id FROM object_types WHERE name='work'), '韓劇穿搭指南', 51, '{}', 'active');

-- === Events (2) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('70000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='event'), '台北美妝博覽會', 60, '{"event_date":"2025-03-15","event_venue":"台北世貿"}', 'active'),
('70000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='event'), '寶雅週年慶', 60, '{"event_date":"2025-02-01","event_venue":"全台門市"}', 'active');

-- === Organizations (2) ===
INSERT INTO objects (id, type_id, canonical_name, class_id, properties, status) VALUES
('80000000-0000-4000-a000-000000000001', (SELECT id FROM object_types WHERE name='organization'), '歐萊雅集團', 10, '{"country":"法國"}', 'active'),
('80000000-0000-4000-a000-000000000002', (SELECT id FROM object_types WHERE name='organization'), '2006hairsalon', 10, '{"country":"台灣"}', 'active');

-- ============================================================
-- 2. ALIASES
-- ============================================================
INSERT INTO object_aliases (object_id, alias, source, confidence) VALUES
('10000000-0000-4000-a000-000000000001', 'La Roche-Posay', 'system', 1.0),
('10000000-0000-4000-a000-000000000001', 'LRP', 'llm_discovered', 0.9),
('10000000-0000-4000-a000-000000000002', 'Vichy', 'system', 1.0),
('10000000-0000-4000-a000-000000000003', '適樂膚', 'llm_discovered', 0.85),
('10000000-0000-4000-a000-000000000004', '珂絲艾絲', 'llm_discovered', 0.8),
('10000000-0000-4000-a000-000000000006', '鬍子茶飲', 'llm_discovered', 0.9),
('10000000-0000-4000-a000-000000000007', 'TP TEA', 'system', 1.0),
('10000000-0000-4000-a000-000000000008', 'Poya', 'system', 1.0),
('10000000-0000-4000-a000-000000000009', 'Watsons', 'system', 1.0),
('30000000-0000-4000-a000-000000000001', 'Carol', 'llm_discovered', 0.9),
('30000000-0000-4000-a000-000000000001', '凱若', 'llm_discovered', 0.85),
('80000000-0000-4000-a000-000000000001', 'L''Oréal', 'system', 1.0),
('50000000-0000-4000-a000-000000000001', '痘痘肌保養', 'llm_discovered', 0.88),
('50000000-0000-4000-a000-000000000001', '油肌護膚', 'llm_discovered', 0.85);

COMMIT;
