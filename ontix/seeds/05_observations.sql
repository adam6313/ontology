-- ============================================================
-- ENTITY OBSERVATIONS (12 weeks x 49 entities = 588 rows)
-- W1 = 12 weeks ago (oldest), W12 = this week (newest)
-- Uses relative dates: date_trunc('week', NOW()) - interval 'X weeks'
--
-- Key narrative trends:
--   1. 理膚寶水: Strong W1-W9, crisis W10-W12 (sentiment crash)
--   2. B5全面修復霜: Stable W1-W9, allergy crisis W10-W12
--   3. CeraVe: Gradual growth, explosion W9-W12 (competitor surge)
--   4. innisfree: Active W1-W8, silence W9-W12
--   5. Carol凱若: Strong W1-W8, gradual decline W9-W12
--   6. 油痘肌護膚: Low W1-W8, explosion W10-W12
--   7. 茶湯會: Low W1-W9, surge W10-W12
--   8. 韓系穿搭: Steady growth W1-W12
--   9. 健身穿搭: Active W1-W8, decay W9-W12
--  10. Bonsoy: Some activity W1-W8, silence W10-W12
-- ============================================================

BEGIN;

-- ============================================================
-- BRANDS
-- ============================================================

-- 理膚寶水 (10000000...001): Strong W1-W9, crisis W10-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 8, 6, 0, 1, 1, 0.78, '[{"aspect": "修復效果", "count": 2, "avg_sentiment": 0.83}, {"aspect": "控油", "count": 2, "avg_sentiment": 0.8}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 9, 8, 0, 0, 1, 0.80, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.85}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.82}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 10, 9, 0, 0, 1, 0.82, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.87}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.84}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.77}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 9, 7, 0, 1, 1, 0.79, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.84}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.81}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.74}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 11, 9, 1, 0, 1, 0.80, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.85}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.82}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 10, 8, 1, 0, 1, 0.78, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.83}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.8}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 8, 6, 1, 0, 1, 0.75, '[{"aspect": "修復效果", "count": 2, "avg_sentiment": 0.8}, {"aspect": "控油", "count": 2, "avg_sentiment": 0.77}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 12, 10, 0, 1, 1, 0.82, '[{"aspect": "修復效果", "count": 4, "avg_sentiment": 0.87}, {"aspect": "控油", "count": 4, "avg_sentiment": 0.84}, {"aspect": "性價比", "count": 3, "avg_sentiment": 0.77}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 10, 8, 1, 0, 1, 0.78, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.83}, {"aspect": "控油", "count": 3, "avg_sentiment": 0.8}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 15, 6, 3, 4, 2, 0.52, '[{"aspect": "修復效果", "count": 4, "avg_sentiment": 0.55}, {"aspect": "控油", "count": 4, "avg_sentiment": 0.5}, {"aspect": "成分安全", "count": 3, "avg_sentiment": 0.35}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.48}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 18, 5, 4, 7, 2, 0.48, '[{"aspect": "修復效果", "count": 5, "avg_sentiment": 0.48}, {"aspect": "控油", "count": 5, "avg_sentiment": 0.3}, {"aspect": "成分安全", "count": 4, "avg_sentiment": 0.32}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.42}]'::jsonb),
('10000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 20, 5, 4, 9, 2, 0.45, '[{"aspect": "修復效果", "count": 6, "avg_sentiment": 0.42}, {"aspect": "控油", "count": 6, "avg_sentiment": 0.25}, {"aspect": "成分安全", "count": 5, "avg_sentiment": 0.28}, {"aspect": "性價比", "count": 3, "avg_sentiment": 0.4}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 薇姿 (10000000...002): stable gentle wave
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.72}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.67}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- CeraVe (10000000...003): gradual growth W1-W8, explosion W9-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.8}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.80, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.84}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.79, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.81}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.83}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.84}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.82, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.84}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.86}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 5, 4, 0, 1, 0, 0.80, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.84}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 4, 0, 1, 0, 0.82, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.84}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.86}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 5, 4, 0, 1, 0, 0.83, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.85}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.87}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 8, 7, 0, 0, 1, 0.85, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.87}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.89}, {"aspect": "致敏性對比", "count": 2, "avg_sentiment": 0.83}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 14, 13, 0, 0, 1, 0.87, '[{"aspect": "保濕力", "count": 4, "avg_sentiment": 0.89}, {"aspect": "性價比", "count": 4, "avg_sentiment": 0.91}, {"aspect": "致敏性對比", "count": 3, "avg_sentiment": 0.85}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.82}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 18, 17, 0, 0, 1, 0.88, '[{"aspect": "保濕力", "count": 6, "avg_sentiment": 0.9}, {"aspect": "性價比", "count": 6, "avg_sentiment": 0.92}, {"aspect": "致敏性對比", "count": 4, "avg_sentiment": 0.86}, {"aspect": "質地", "count": 3, "avg_sentiment": 0.83}]'::jsonb),
('10000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 22, 22, 0, 0, 0, 0.90, '[{"aspect": "保濕力", "count": 7, "avg_sentiment": 0.92}, {"aspect": "性價比", "count": 7, "avg_sentiment": 0.94}, {"aspect": "致敏性對比", "count": 5, "avg_sentiment": 0.88}, {"aspect": "質地", "count": 4, "avg_sentiment": 0.85}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- COSRX (10000000...004): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.59}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.67, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.57}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.7}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.56}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.7}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.56}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.7}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.56}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.72}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.58}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.59}]'::jsonb),
('10000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.67, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.57}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- innisfree (10000000...005): active W1-W8, silence W9-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.74}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '9 weeks', 'week', 5, 4, 0, 1, 0, 0.73, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.75}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.73}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.74}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.76}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.62, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.64}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '2 weeks', 'week', 1, 0, 0, 1, 0, 0.55, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.57}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '1 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb),
('10000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '0 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 鬍子茶 (10000000...006): gentle decline
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '11 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "口感", "count": 3, "avg_sentiment": 0.82}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '10 weeks', 'week', 7, 6, 0, 0, 1, 0.80, '[{"aspect": "口感", "count": 3, "avg_sentiment": 0.84}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.77}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '9 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "口感", "count": 3, "avg_sentiment": 0.82}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '8 weeks', 'week', 5, 4, 0, 1, 0, 0.76, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.8}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.73}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '7 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "口感", "count": 3, "avg_sentiment": 0.82}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '6 weeks', 'week', 5, 4, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.79}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.72}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.78}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.71}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.76}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.69}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.74}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.67}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.72}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.65}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.63}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.58}]'::jsonb),
('10000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.69}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.62}, {"aspect": "服務", "count": 1, "avg_sentiment": 0.57}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 茶湯會 (10000000...007): low W1-W9, surge W10-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.77}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 2, "avg_sentiment": 0.77}, {"aspect": "新品", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '2 weeks', 'week', 8, 7, 0, 0, 1, 0.80, '[{"aspect": "口感", "count": 4, "avg_sentiment": 0.83}, {"aspect": "新品", "count": 2, "avg_sentiment": 0.8}, {"aspect": "門市環境", "count": 2, "avg_sentiment": 0.76}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '1 weeks', 'week', 11, 10, 0, 0, 1, 0.82, '[{"aspect": "口感", "count": 5, "avg_sentiment": 0.85}, {"aspect": "新品", "count": 3, "avg_sentiment": 0.82}, {"aspect": "門市環境", "count": 2, "avg_sentiment": 0.78}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.77}]'::jsonb),
('10000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '0 weeks', 'week', 14, 13, 0, 0, 1, 0.85, '[{"aspect": "口感", "count": 7, "avg_sentiment": 0.88}, {"aspect": "新品", "count": 4, "avg_sentiment": 0.85}, {"aspect": "門市環境", "count": 3, "avg_sentiment": 0.81}, {"aspect": "價格", "count": 2, "avg_sentiment": 0.8}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 寶雅 (10000000...008): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.73}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.71}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.72}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.74}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.74}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.74}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.73}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.71}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('10000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "商品種類", "count": 2, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 屈臣氏 (10000000...009): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.68}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.64, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.67}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.64, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.67}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.64, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.67}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.69}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.71}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.71}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.71}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.67, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.7}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.68}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.64, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.67}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('10000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.64, '[{"aspect": "促銷活動", "count": 1, "avg_sentiment": 0.67}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.61}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================

-- B5全面修復霜 (20000000...001): stable W1-W9, allergy crisis W10-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 5, 4, 0, 1, 0, 0.82, '[{"aspect": "修復效果", "count": 2, "avg_sentiment": 0.85}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.74}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 6, 5, 0, 0, 1, 0.80, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.83}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.72}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 5, 4, 0, 1, 0, 0.83, '[{"aspect": "修復效果", "count": 2, "avg_sentiment": 0.86}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.75}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.83}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 7, 6, 0, 0, 1, 0.82, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.85}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.74}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 6, 6, 0, 0, 0, 0.85, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.88}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.77}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.85}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 5, 4, 0, 1, 0, 0.80, '[{"aspect": "修復效果", "count": 2, "avg_sentiment": 0.83}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.72}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 6, 5, 0, 0, 1, 0.82, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.85}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.74}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 7, 6, 0, 0, 1, 0.83, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.86}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.75}, {"aspect": "保濕力", "count": 1, "avg_sentiment": 0.83}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 8, 6, 0, 1, 1, 0.78, '[{"aspect": "修復效果", "count": 4, "avg_sentiment": 0.81}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.7}, {"aspect": "保濕力", "count": 2, "avg_sentiment": 0.78}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 12, 5, 2, 4, 1, 0.55, '[{"aspect": "修復效果", "count": 3, "avg_sentiment": 0.55}, {"aspect": "致敏性", "count": 4, "avg_sentiment": 0.3}, {"aspect": "成分安全", "count": 3, "avg_sentiment": 0.35}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.5}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 15, 1, 4, 8, 2, 0.35, '[{"aspect": "致敏性", "count": 6, "avg_sentiment": 0.2}, {"aspect": "成分安全", "count": 4, "avg_sentiment": 0.22}, {"aspect": "修復效果", "count": 3, "avg_sentiment": 0.42}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.38}]'::jsonb),
('20000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 18, 0, 5, 11, 2, 0.22, '[{"aspect": "致敏性", "count": 8, "avg_sentiment": 0.12}, {"aspect": "成分安全", "count": 5, "avg_sentiment": 0.18}, {"aspect": "修復效果", "count": 3, "avg_sentiment": 0.35}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.3}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 89火山能量瓶 (20000000...002): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('20000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.65}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 保濕修護乳 (20000000...003): riding CeraVe wave
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.76}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.74}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.77}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.75}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.77}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.76, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.78}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "保濕力", "count": 2, "avg_sentiment": 0.8}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 6, 5, 0, 0, 1, 0.82, '[{"aspect": "保濕力", "count": 3, "avg_sentiment": 0.84}, {"aspect": "質地", "count": 2, "avg_sentiment": 0.77}, {"aspect": "性價比", "count": 2, "avg_sentiment": 0.84}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 9, 8, 0, 0, 1, 0.85, '[{"aspect": "保濕力", "count": 4, "avg_sentiment": 0.87}, {"aspect": "質地", "count": 3, "avg_sentiment": 0.8}, {"aspect": "性價比", "count": 3, "avg_sentiment": 0.87}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 12, 12, 0, 0, 0, 0.88, '[{"aspect": "保濕力", "count": 6, "avg_sentiment": 0.9}, {"aspect": "質地", "count": 4, "avg_sentiment": 0.83}, {"aspect": "性價比", "count": 4, "avg_sentiment": 0.9}]'::jsonb),
('20000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 15, 15, 0, 0, 0, 0.90, '[{"aspect": "保濕力", "count": 7, "avg_sentiment": 0.92}, {"aspect": "質地", "count": 5, "avg_sentiment": 0.85}, {"aspect": "性價比", "count": 5, "avg_sentiment": 0.92}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 蝸牛精華 (20000000...004): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.69}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.69}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.67, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.55}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.57}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.57}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.73}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.57}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.72}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.56}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.7}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.54}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.69}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.69}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.66, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.7}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.54}]'::jsonb),
('20000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.67, '[{"aspect": "痘疤修復", "count": 1, "avg_sentiment": 0.71}, {"aspect": "質地", "count": 1, "avg_sentiment": 0.55}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 綠茶籽保濕精華 (20000000...005): follows innisfree silence
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.7}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.74}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.7}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.72}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.7}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.74}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.65, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.67}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '3 weeks', 'week', 1, 0, 0, 1, 0, 0.58, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.6}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '2 weeks', 'week', 1, 0, 0, 1, 0, 0.52, '[{"aspect": "保濕力", "count": 1, "avg_sentiment": 0.54}, {"aspect": "味道", "count": 1, "avg_sentiment": 0.47}]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '1 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb),
('20000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '0 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 木瓜牛奶 (20000000...006): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.79}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.77}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.77}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "價格", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 珍珠奶茶 (20000000...007): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.76, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.76}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.77, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.79}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.77}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.77}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.76, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.76}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('20000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口感", "count": 1, "avg_sentiment": 0.8}, {"aspect": "珍珠Q彈度", "count": 1, "avg_sentiment": 0.78}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 淨膚控油潔面乳 (20000000...008): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.76}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.74}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.73}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.73}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.74}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.75}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('20000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "控油效果", "count": 1, "avg_sentiment": 0.77}, {"aspect": "清潔力", "count": 1, "avg_sentiment": 0.71}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- PERSONS / KOLs
-- ============================================================

-- Carol凱若 (30000000...001): strong W1-W8, gradual decline W9-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 7, 6, 0, 0, 1, 0.78, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.82}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.78}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.8}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.76}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 8, 7, 0, 0, 1, 0.80, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.84}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.8}, {"aspect": "內容品質", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 7, 6, 0, 0, 1, 0.78, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.82}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.78}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 8, 7, 0, 0, 1, 0.80, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.84}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.8}, {"aspect": "內容品質", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 7, 6, 0, 0, 1, 0.78, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.82}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.78}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 6, 4, 0, 1, 1, 0.75, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.79}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.75}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 8, 7, 0, 0, 1, 0.80, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.84}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.8}, {"aspect": "內容品質", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 7, 5, 1, 0, 1, 0.72, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.76}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.72}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 6, 4, 1, 0, 1, 0.65, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.69}, {"aspect": "互動性", "count": 2, "avg_sentiment": 0.65}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.6}, {"aspect": "業配爭議", "count": 1, "avg_sentiment": 0.4}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 5, 2, 1, 2, 0, 0.58, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.62}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.58}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.53}, {"aspect": "業配爭議", "count": 1, "avg_sentiment": 0.33}]'::jsonb),
('30000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 5, 2, 1, 2, 0, 0.52, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.56}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.52}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.47}, {"aspect": "業配爭議", "count": 1, "avg_sentiment": 0.27}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 美妝小安 (30000000...002): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.72}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.72}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 5, 4, 0, 1, 0, 0.73, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.76}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.71}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 5, 3, 0, 2, 0, 0.71, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.69}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 5, 3, 1, 1, 0, 0.70, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.73}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.68}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 5, 3, 1, 1, 0, 0.70, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.73}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.68}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 3, 0, 2, 0, 0.71, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.69}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 5, 4, 0, 1, 0, 0.72, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.7}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.72}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.72}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.72}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 5, 4, 0, 1, 0, 0.73, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.76}, {"aspect": "內容品質", "count": 1, "avg_sentiment": 0.71}, {"aspect": "互動性", "count": 1, "avg_sentiment": 0.68}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 保養日記 (30000000...003): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.74}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.73}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.71}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.7}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.7}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.71}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.72}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.74}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.74}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.74}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.73}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.69, '[{"aspect": "實用性", "count": 2, "avg_sentiment": 0.71}, {"aspect": "分享風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 痘痘肌研究所 (30000000...004): gentle growth
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.72}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.68, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.72}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "專業度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.76}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.74}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 4, 0, 1, 0, 0.72, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.76}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.76}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '3 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.78}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '2 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "專業度", "count": 2, "avg_sentiment": 0.78}, {"aspect": "實用性", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '1 weeks', 'week', 6, 4, 0, 1, 1, 0.75, '[{"aspect": "專業度", "count": 3, "avg_sentiment": 0.79}, {"aspect": "實用性", "count": 2, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '0 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "專業度", "count": 3, "avg_sentiment": 0.8}, {"aspect": "實用性", "count": 2, "avg_sentiment": 0.74}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 穿搭日誌Mia (30000000...005): growing
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '11 weeks', 'week', 5, 4, 0, 1, 0, 0.76, '[{"aspect": "穿搭風格", "count": 2, "avg_sentiment": 0.8}, {"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '10 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "穿搭風格", "count": 3, "avg_sentiment": 0.82}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.8}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '9 weeks', 'week', 5, 4, 0, 1, 0, 0.76, '[{"aspect": "穿搭風格", "count": 2, "avg_sentiment": 0.8}, {"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '8 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "穿搭風格", "count": 3, "avg_sentiment": 0.82}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.8}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '7 weeks', 'week', 7, 6, 0, 0, 1, 0.80, '[{"aspect": "穿搭風格", "count": 3, "avg_sentiment": 0.84}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.82}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '6 weeks', 'week', 6, 5, 0, 0, 1, 0.78, '[{"aspect": "穿搭風格", "count": 3, "avg_sentiment": 0.82}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.8}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '5 weeks', 'week', 7, 6, 0, 0, 1, 0.80, '[{"aspect": "穿搭風格", "count": 3, "avg_sentiment": 0.84}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.82}, {"aspect": "實穿性", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '4 weeks', 'week', 8, 7, 0, 0, 1, 0.82, '[{"aspect": "穿搭風格", "count": 4, "avg_sentiment": 0.86}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.84}, {"aspect": "實穿性", "count": 2, "avg_sentiment": 0.77}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '3 weeks', 'week', 8, 7, 0, 0, 1, 0.80, '[{"aspect": "穿搭風格", "count": 4, "avg_sentiment": 0.84}, {"aspect": "時尚感", "count": 2, "avg_sentiment": 0.82}, {"aspect": "實穿性", "count": 2, "avg_sentiment": 0.75}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '2 weeks', 'week', 9, 8, 0, 0, 1, 0.82, '[{"aspect": "穿搭風格", "count": 4, "avg_sentiment": 0.86}, {"aspect": "時尚感", "count": 3, "avg_sentiment": 0.84}, {"aspect": "實穿性", "count": 2, "avg_sentiment": 0.77}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '1 weeks', 'week', 10, 9, 0, 0, 1, 0.82, '[{"aspect": "穿搭風格", "count": 5, "avg_sentiment": 0.86}, {"aspect": "時尚感", "count": 3, "avg_sentiment": 0.84}, {"aspect": "實穿性", "count": 2, "avg_sentiment": 0.77}]'::jsonb),
('30000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '0 weeks', 'week', 12, 11, 0, 0, 1, 0.84, '[{"aspect": "穿搭風格", "count": 6, "avg_sentiment": 0.88}, {"aspect": "時尚感", "count": 4, "avg_sentiment": 0.86}, {"aspect": "實穿性", "count": 3, "avg_sentiment": 0.79}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 吃貨阿明 (30000000...006): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '11 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.8}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.74}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '10 weeks', 'week', 6, 4, 0, 1, 1, 0.74, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.78}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.72}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '9 weeks', 'week', 6, 4, 1, 0, 1, 0.73, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.71}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '8 weeks', 'week', 5, 4, 0, 1, 0, 0.73, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.71}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '7 weeks', 'week', 6, 4, 0, 1, 1, 0.74, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.78}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.72}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '6 weeks', 'week', 6, 4, 0, 1, 1, 0.75, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.79}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.73}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '5 weeks', 'week', 6, 5, 0, 0, 1, 0.77, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.81}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '4 weeks', 'week', 7, 5, 0, 1, 1, 0.77, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.81}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '3 weeks', 'week', 6, 5, 0, 0, 1, 0.77, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.81}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.75}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '2 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.8}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.74}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '1 weeks', 'week', 6, 4, 0, 1, 1, 0.74, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.78}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.72}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '0 weeks', 'week', 6, 4, 1, 0, 1, 0.73, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.71}, {"aspect": "真實感", "count": 1, "avg_sentiment": 0.69}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 台灣美食王 (30000000...007): gentle growth
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '9 weeks', 'week', 5, 4, 0, 1, 0, 0.72, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '7 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '5 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '4 weeks', 'week', 5, 4, 0, 1, 0, 0.76, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.79}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '3 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.79}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.74}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '2 weeks', 'week', 5, 4, 0, 1, 0, 0.74, '[{"aspect": "美食推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "影片風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '1 weeks', 'week', 6, 5, 0, 0, 1, 0.76, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.79}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.74}]'::jsonb),
('30000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '0 weeks', 'week', 7, 6, 0, 0, 1, 0.78, '[{"aspect": "美食推薦", "count": 3, "avg_sentiment": 0.81}, {"aspect": "影片風格", "count": 2, "avg_sentiment": 0.76}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 科技宅男 (30000000...008): stable low
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.65, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.68}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.64, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.67}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.64, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.67}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.65, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.68}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.66, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.69}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.71}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.71}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.71}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.7}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.65, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.68}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.64, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.67}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('30000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.64, '[{"aspect": "科技評測", "count": 1, "avg_sentiment": 0.67}, {"aspect": "知識含量", "count": 1, "avg_sentiment": 0.61}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 旅行日記Luna (30000000...009): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.74}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.74}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.73, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.76}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.78}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.78}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.78}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.77}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.74}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.71, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.74}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "旅遊推薦", "count": 2, "avg_sentiment": 0.75}, {"aspect": "攝影風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 健身教練Sam (30000000...010): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.7}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.71}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.72}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.74}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.74}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.74}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.73}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.71}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.7}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.7}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.71}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('30000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "健身知識", "count": 1, "avg_sentiment": 0.72}, {"aspect": "教學風格", "count": 1, "avg_sentiment": 0.68}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- PLACES
-- ============================================================

-- 台北信義區 (40000000...001): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.75}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.76}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.78}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.78}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.78}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.77}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.75}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.74}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.74}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.75}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.76}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('40000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "逛街", "count": 1, "avg_sentiment": 0.78}, {"aspect": "交通", "count": 1, "avg_sentiment": 0.68}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 西門町 (40000000...002): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.72}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.74}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.74}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.74}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.73}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.71}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.7}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.7}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.69, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.71}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.72}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.74}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "美食", "count": 1, "avg_sentiment": 0.74}, {"aspect": "潮流", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 台中逢甲夜市 (40000000...003): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 4, 3, 0, 1, 0, 0.77, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.8}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.78}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.77}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.74, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.77}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.78}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.76, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.79}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "小吃", "count": 2, "avg_sentiment": 0.81}, {"aspect": "氣氛", "count": 1, "avg_sentiment": 0.73}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 新竹巨城 (40000000...004): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.75}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.75}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.74}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.72}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.71}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.71}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.72}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.73}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.75}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.75}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.75}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "購物", "count": 1, "avg_sentiment": 0.74}, {"aspect": "餐飲", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 高雄駁二 (40000000...005): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.78}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.77}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.75}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.74}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.74}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.75}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.76}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.78}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.78}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.78}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.77}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('40000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "文創", "count": 1, "avg_sentiment": 0.75}, {"aspect": "展覽", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- CONTENT TOPICS
-- ============================================================

-- 油痘肌護膚 (50000000...001): low W1-W8, explosion W10-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.7}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.72}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.7}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.72}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "控油方法", "count": 2, "avg_sentiment": 0.74}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.72}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "控油方法", "count": 1, "avg_sentiment": 0.7}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "控油方法", "count": 2, "avg_sentiment": 0.74}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.70, '[{"aspect": "控油方法", "count": 2, "avg_sentiment": 0.72}, {"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 8, 5, 1, 1, 1, 0.68, '[{"aspect": "控油方法", "count": 4, "avg_sentiment": 0.7}, {"aspect": "產品推薦", "count": 2, "avg_sentiment": 0.65}, {"aspect": "致敏性討論", "count": 2, "avg_sentiment": 0.43}, {"aspect": "成分討論", "count": 2, "avg_sentiment": 0.58}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 14, 8, 2, 3, 1, 0.65, '[{"aspect": "控油方法", "count": 7, "avg_sentiment": 0.67}, {"aspect": "產品推薦", "count": 4, "avg_sentiment": 0.62}, {"aspect": "致敏性討論", "count": 4, "avg_sentiment": 0.4}, {"aspect": "成分討論", "count": 3, "avg_sentiment": 0.55}]'::jsonb),
('50000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 20, 11, 3, 4, 2, 0.62, '[{"aspect": "控油方法", "count": 10, "avg_sentiment": 0.64}, {"aspect": "產品推薦", "count": 6, "avg_sentiment": 0.59}, {"aspect": "致敏性討論", "count": 6, "avg_sentiment": 0.37}, {"aspect": "成分討論", "count": 5, "avg_sentiment": 0.52}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 美妝教程 (50000000...002): gentle growth
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 2, 0, 0, 0, 0.78, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.8}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.8}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 2, 0, 0, 0, 0.80, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.82}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.8}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.80, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.82}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "底妝技巧", "count": 2, "avg_sentiment": 0.82}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "底妝技巧", "count": 1, "avg_sentiment": 0.8}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "底妝技巧", "count": 2, "avg_sentiment": 0.82}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.82, '[{"aspect": "底妝技巧", "count": 2, "avg_sentiment": 0.84}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.79}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 5, 4, 0, 1, 0, 0.82, '[{"aspect": "底妝技巧", "count": 2, "avg_sentiment": 0.84}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.79}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.82}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 5, 5, 0, 0, 0, 0.84, '[{"aspect": "底妝技巧", "count": 2, "avg_sentiment": 0.86}, {"aspect": "工具推薦", "count": 1, "avg_sentiment": 0.81}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.84}]'::jsonb),
('50000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 6, 5, 0, 0, 1, 0.84, '[{"aspect": "底妝技巧", "count": 3, "avg_sentiment": 0.86}, {"aspect": "工具推薦", "count": 2, "avg_sentiment": 0.81}, {"aspect": "眼妝", "count": 1, "avg_sentiment": 0.84}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 韓系穿搭 (50000000...003): steady growth W1-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "風格搭配", "count": 1, "avg_sentiment": 0.81}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.80, '[{"aspect": "風格搭配", "count": 1, "avg_sentiment": 0.83}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "風格搭配", "count": 2, "avg_sentiment": 0.81}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 5, 4, 0, 1, 0, 0.80, '[{"aspect": "風格搭配", "count": 2, "avg_sentiment": 0.83}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 5, 4, 0, 1, 0, 0.80, '[{"aspect": "風格搭配", "count": 2, "avg_sentiment": 0.83}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 6, 5, 0, 0, 1, 0.82, '[{"aspect": "風格搭配", "count": 3, "avg_sentiment": 0.85}, {"aspect": "品牌推薦", "count": 2, "avg_sentiment": 0.82}, {"aspect": "季節穿搭", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 6, 5, 0, 0, 1, 0.82, '[{"aspect": "風格搭配", "count": 3, "avg_sentiment": 0.85}, {"aspect": "品牌推薦", "count": 2, "avg_sentiment": 0.82}, {"aspect": "季節穿搭", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 7, 6, 0, 0, 1, 0.82, '[{"aspect": "風格搭配", "count": 3, "avg_sentiment": 0.85}, {"aspect": "品牌推薦", "count": 2, "avg_sentiment": 0.82}, {"aspect": "季節穿搭", "count": 1, "avg_sentiment": 0.78}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 8, 7, 0, 0, 1, 0.84, '[{"aspect": "風格搭配", "count": 4, "avg_sentiment": 0.87}, {"aspect": "品牌推薦", "count": 2, "avg_sentiment": 0.84}, {"aspect": "季節穿搭", "count": 2, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 9, 8, 0, 0, 1, 0.84, '[{"aspect": "風格搭配", "count": 4, "avg_sentiment": 0.87}, {"aspect": "品牌推薦", "count": 3, "avg_sentiment": 0.84}, {"aspect": "季節穿搭", "count": 2, "avg_sentiment": 0.8}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 10, 9, 0, 0, 1, 0.85, '[{"aspect": "風格搭配", "count": 5, "avg_sentiment": 0.88}, {"aspect": "品牌推薦", "count": 3, "avg_sentiment": 0.85}, {"aspect": "季節穿搭", "count": 2, "avg_sentiment": 0.81}]'::jsonb),
('50000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 12, 11, 0, 0, 1, 0.86, '[{"aspect": "風格搭配", "count": 6, "avg_sentiment": 0.89}, {"aspect": "品牌推薦", "count": 4, "avg_sentiment": 0.86}, {"aspect": "季節穿搭", "count": 3, "avg_sentiment": 0.82}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 開架粉底評比 (50000000...004): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.72}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.72}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.73}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.72}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000004', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "持妝度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "遮瑕力", "count": 1, "avg_sentiment": 0.67}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 好物推薦 (50000000...005): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.76}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.78}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.78}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.78}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.77}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.75}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000005', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.71, '[{"aspect": "實用度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "CP值", "count": 1, "avg_sentiment": 0.67}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 台中美食探店 (50000000...006): stable growing
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.82}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.82}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.78, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '5 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.82}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.82}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '3 weeks', 'week', 5, 4, 0, 1, 0, 0.82, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.84}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.79}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '2 weeks', 'week', 4, 3, 0, 1, 0, 0.80, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.82}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '1 weeks', 'week', 5, 4, 0, 1, 0, 0.82, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.84}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.79}]'::jsonb),
('50000000-0000-4000-a000-000000000006', date_trunc('week', NOW()) - interval '0 weeks', 'week', 5, 4, 0, 1, 0, 0.83, '[{"aspect": "口味", "count": 2, "avg_sentiment": 0.85}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.8}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 防曬攻略 (50000000...007): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.74}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.75}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.76}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.74}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000007', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.74}, {"aspect": "使用方法", "count": 1, "avg_sentiment": 0.69}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 平價保養 (50000000...008): stable growing
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.75}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.73}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.75}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.75}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.72, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.75}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '3 weeks', 'week', 4, 3, 0, 1, 0, 0.75, '[{"aspect": "產品推薦", "count": 2, "avg_sentiment": 0.78}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "產品推薦", "count": 1, "avg_sentiment": 0.77}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '1 weeks', 'week', 4, 3, 0, 1, 0, 0.76, '[{"aspect": "產品推薦", "count": 2, "avg_sentiment": 0.79}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('50000000-0000-4000-a000-000000000008', date_trunc('week', NOW()) - interval '0 weeks', 'week', 4, 3, 0, 1, 0, 0.78, '[{"aspect": "產品推薦", "count": 2, "avg_sentiment": 0.81}, {"aspect": "性價比", "count": 1, "avg_sentiment": 0.76}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 夏日飲品推薦 (50000000...009): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.76}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '10 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.77}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '9 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.78}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.77, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '7 weeks', 'week', 3, 2, 0, 1, 0, 0.77, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.77, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.8}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.76, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.79}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.77}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.76}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '2 weeks', 'week', 3, 2, 0, 1, 0, 0.73, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.76}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '1 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.77}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('50000000-0000-4000-a000-000000000009', date_trunc('week', NOW()) - interval '0 weeks', 'week', 3, 2, 0, 1, 0, 0.75, '[{"aspect": "口味", "count": 1, "avg_sentiment": 0.78}, {"aspect": "推薦店家", "count": 1, "avg_sentiment": 0.72}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 健身穿搭 (50000000...010): active W1-W8, decay W9-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '11 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.72}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.7}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '9 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "運動穿搭", "count": 2, "avg_sentiment": 0.74}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.72}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '7 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "運動穿搭", "count": 2, "avg_sentiment": 0.74}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '6 weeks', 'week', 3, 2, 0, 1, 0, 0.70, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.72}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '5 weeks', 'week', 3, 2, 0, 1, 0, 0.68, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.7}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '4 weeks', 'week', 4, 3, 0, 1, 0, 0.72, '[{"aspect": "運動穿搭", "count": 2, "avg_sentiment": 0.74}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '3 weeks', 'week', 3, 2, 0, 1, 0, 0.65, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.67}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.60, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.62}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.57}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '1 weeks', 'week', 1, 0, 0, 1, 0, 0.55, '[{"aspect": "運動穿搭", "count": 1, "avg_sentiment": 0.57}, {"aspect": "品牌推薦", "count": 1, "avg_sentiment": 0.52}]'::jsonb),
('50000000-0000-4000-a000-000000000010', date_trunc('week', NOW()) - interval '0 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- WORKS
-- ============================================================

-- 美妝大賞2025 (60000000...001): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.69}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.7}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.72}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.72}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.72}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.77}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.71}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.76}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.69}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.68}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.68}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.69}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.7}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.75}]'::jsonb),
('60000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "評選公正性", "count": 1, "avg_sentiment": 0.72}, {"aspect": "入圍名單", "count": 1, "avg_sentiment": 0.77}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 痘痘肌保養全攻略 (60000000...002): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.71}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.73}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.73}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.73}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.72}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.7}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.69}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.69}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.7}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.71}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.73}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('60000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "實用性", "count": 1, "avg_sentiment": 0.73}, {"aspect": "完整度", "count": 1, "avg_sentiment": 0.69}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 韓劇穿搭指南 (60000000...003): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 2, 0, 0, 0, 0.75, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.77}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.73}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.74}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.74}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.75}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.74, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.76}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb),
('60000000-0000-4000-a000-000000000003', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 2, 0, 0, 0, 0.76, '[{"aspect": "時尚感", "count": 1, "avg_sentiment": 0.78}, {"aspect": "搭配參考", "count": 1, "avg_sentiment": 0.74}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- EVENTS
-- ============================================================

-- 台北美妝博覽會 (70000000...001): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.75}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.75}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.74}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.72}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.71}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.71}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.72}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.73}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.75}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.75}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.73, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.75}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.71}]'::jsonb),
('70000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "活動規模", "count": 1, "avg_sentiment": 0.74}, {"aspect": "參展品牌", "count": 1, "avg_sentiment": 0.7}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- 寶雅週年慶 (70000000...002): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.73}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.7}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.7}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.67}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.72}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.74}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.71, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.73}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.69}]'::jsonb),
('70000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "折扣力度", "count": 1, "avg_sentiment": 0.71}, {"aspect": "商品種類", "count": 1, "avg_sentiment": 0.67}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

-- 歐萊雅集團 (80000000...001): stable
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.69}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '10 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.67}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.66, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.66}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '8 weeks', 'week', 2, 1, 0, 1, 0, 0.66, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.66}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.61}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.67}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '6 weeks', 'week', 2, 1, 0, 1, 0, 0.68, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.68}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.63}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.7}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '4 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.7}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '3 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.7}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.65}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '2 weeks', 'week', 2, 1, 0, 1, 0, 0.69, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.69}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.64}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '1 weeks', 'week', 2, 1, 0, 1, 0, 0.67, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.67}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.62}]'::jsonb),
('80000000-0000-4000-a000-000000000001', date_trunc('week', NOW()) - interval '0 weeks', 'week', 2, 1, 0, 1, 0, 0.66, '[{"aspect": "品牌組合", "count": 1, "avg_sentiment": 0.66}, {"aspect": "市場策略", "count": 1, "avg_sentiment": 0.61}]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

-- Bonsoy (80000000...002): some activity W1-W8, silence W10-W12
INSERT INTO entity_observations (object_id, period_start, period_type, mention_count, positive_count, negative_count, neutral_count, mixed_count, avg_sentiment, aspect_data) VALUES
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '11 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.73}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '10 weeks', 'week', 1, 1, 0, 0, 0, 0.68, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.71}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '9 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.75}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '8 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.77}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '7 weeks', 'week', 2, 1, 0, 1, 0, 0.70, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.73}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.68}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '6 weeks', 'week', 1, 1, 0, 0, 0, 0.68, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.71}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.66}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '5 weeks', 'week', 2, 1, 0, 1, 0, 0.72, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.75}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.7}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '4 weeks', 'week', 3, 2, 0, 1, 0, 0.74, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.77}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.72}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '3 weeks', 'week', 1, 1, 0, 0, 0, 0.62, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.65}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.6}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '2 weeks', 'week', 1, 0, 0, 1, 0, 0.55, '[{"aspect": "服務品質", "count": 1, "avg_sentiment": 0.58}, {"aspect": "環境", "count": 1, "avg_sentiment": 0.53}]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '1 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb),
('80000000-0000-4000-a000-000000000002', date_trunc('week', NOW()) - interval '0 weeks', 'week', 0, 0, 0, 0, 0, NULL, '[]'::jsonb)
ON CONFLICT (object_id, period_start, period_type) DO NOTHING;

COMMIT;
