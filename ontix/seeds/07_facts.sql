-- ============================================================
-- DERIVED FACTS (~35 facts across 5 weekly periods)
-- Uses relative dates so the demo always looks fresh
--
-- Period mapping:
--   W12 = NOW() - interval '0 weeks'  (current week)
--   W11 = NOW() - interval '1 week'
--   W10 = NOW() - interval '2 weeks'
--   W9  = NOW() - interval '3 weeks'
--   W8  = NOW() - interval '4 weeks'
--
-- Rule ID reference (from migration 015):
--   1: product_drags_brand
--   2: competitor_surge
--   3: founder_reputation_risk
--   4: new_aspect_detected
--   5: aspect_sentiment_flip
--   6: silence_alert
--   7: topic_surge
--   8: topic_decay
-- ============================================================

BEGIN;

-- ============================================================
-- W12 (current week) — 15 facts
-- ============================================================

-- 1. product_drags_brand: B5修復霜 sentiment -72% → alert on 理膚寶水
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'alert',
 'product_drags_brand:20000001:w12',
 'warning',
 '產品「B5修復霜」情感驟降 -72%',
 '旗下產品「B5修復霜」本週情感從 0.78 跌至 0.22，跌幅達 72%。主要由致敏性、成分安全兩大負面面向驅動，品牌「理膚寶水」需立即關注。',
 '{"source_entity":"B5修復霜","source_id":"20000000-0000-4000-a000-000000000001","target_entity":"理膚寶水","delta_pct":-72,"prev_sentiment":0.78,"current_sentiment":0.22,"top_changed_aspects":["致敏性","成分安全"]}'::jsonb,
 1,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 2. competitor_surge: CeraVe +175% → alert on 理膚寶水
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'alert',
 'competitor_surge:10000003:w12',
 'warning',
 '競品「CeraVe」聲量暴增 +175%',
 '你的品牌「理膚寶水」需要高度關注。CeraVe 本週 22 則提及（上週 8 則），且多數提及以「更安全替代品」為切入點。',
 '{"source_entity":"CeraVe","source_id":"10000000-0000-4000-a000-000000000003","target_entity":"理膚寶水","delta_pct":175,"prev_mentions":8,"current_mentions":22}'::jsonb,
 2,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 3. competitor_surge: 茶湯會 +150% → alert on 鬍子茶
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000006',
 'alert',
 'competitor_surge:10000007:w12',
 'warning',
 '競品「茶湯會」聲量暴增 +150%',
 '你的品牌「鬍子茶」需要關注。茶湯會本週 15 則提及（上週 6 則），新品與口感討論為主。',
 '{"source_entity":"茶湯會","source_id":"10000000-0000-4000-a000-000000000007","target_entity":"鬍子茶","delta_pct":150,"prev_mentions":6,"current_mentions":15}'::jsonb,
 2,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 4. founder_reputation_risk: Carol凱若 -34% → alert on 2006hairsalon
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('80000000-0000-4000-a000-000000000001',
 'risk_signal',
 'founder_risk:30000001:w12',
 'warning',
 '創辦人「Carol凱若」聲譽下降 -34%',
 '創辦人 Carol凱若 本週情感從 0.72 降至 0.48，跌幅 34%。主要由業配爭議、服務態度兩大負面面向驅動，品牌「2006hairsalon」需留意。',
 '{"source_entity":"Carol凱若","source_id":"30000000-0000-4000-a000-000000000001","target_entity":"2006hairsalon","delta_pct":-34,"prev_sentiment":0.72,"current_sentiment":0.48,"top_changed_aspects":["業配爭議","服務態度"]}'::jsonb,
 3,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 5. new_aspect_detected: B5修復霜 → 致敏性
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('20000000-0000-4000-a000-000000000001',
 'trend',
 'new_aspect:20000001:致敏性:w12',
 'info',
 '「B5修復霜」出現新面向：致敏性',
 '本週新出現討論面向「致敏性」，共 8 則提及，平均情感 0.15（極度負面）。多位使用者反映使用後出現紅腫過敏。',
 '{"entity":"B5修復霜","new_aspects":["致敏性"],"aspect_details":[{"aspect":"致敏性","count":8,"avg_sentiment":0.15}]}'::jsonb,
 4,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 6. new_aspect_detected: B5修復霜 → 成分安全
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('20000000-0000-4000-a000-000000000001',
 'trend',
 'new_aspect:20000001:成分安全:w12',
 'info',
 '「B5修復霜」出現新面向：成分安全',
 '本週新出現討論面向「成分安全」，共 4 則提及，平均情感 0.22（負面）。消費者開始質疑成分標示透明度。',
 '{"entity":"B5修復霜","new_aspects":["成分安全"],"aspect_details":[{"aspect":"成分安全","count":4,"avg_sentiment":0.22}]}'::jsonb,
 4,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 7. new_aspect_detected: CeraVe → 致敏性對比
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000003',
 'trend',
 'new_aspect:10000003:致敏性對比:w12',
 'info',
 '「CeraVe」出現新面向：致敏性對比',
 '本週新出現討論面向「致敏性對比」，共 6 則提及，平均情感 0.88。消費者將 CeraVe 定位為更安全的替代選擇。',
 '{"entity":"CeraVe","new_aspects":["致敏性對比"],"aspect_details":[{"aspect":"致敏性對比","count":6,"avg_sentiment":0.88}]}'::jsonb,
 4,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 8. new_aspect_detected: 油痘肌護膚 → 致敏性討論
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000001',
 'trend',
 'new_aspect:50000001:致敏性討論:w12',
 'info',
 '「油痘肌護膚」出現新面向：致敏性討論',
 '本週新出現「致敏性討論」面向，共 7 則提及，由 B5修復霜事件帶動油痘肌族群的護膚品安全討論。',
 '{"entity":"油痘肌護膚","new_aspects":["致敏性討論"],"aspect_details":[{"aspect":"致敏性討論","count":7,"avg_sentiment":0.40}]}'::jsonb,
 4,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 9. aspect_sentiment_flip: 理膚寶水/控油 0.82→0.28
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'risk_signal',
 'aspect_flip:10000001:控油:w12',
 'warning',
 '「理膚寶水」面向「控油」情感翻轉',
 '「控油」從正面翻轉為負面（0.82 → 0.28）。這是理膚寶水的核心賣點面向，翻轉代表品牌定位受到嚴重挑戰。',
 '{"entity":"理膚寶水","aspect":"控油","prev_sentiment":0.82,"current_sentiment":0.28,"prev_label":"正面","current_label":"負面"}'::jsonb,
 5,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 10. silence_alert: innisfree 4 weeks
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000005',
 'alert',
 'silence:10000005:w12',
 'info',
 '「innisfree」已連續四週無人提及',
 'innisfree 已連續 4 週無任何提及。可能需要重新評估追蹤必要性，或確認品牌是否已退出相關社群話題。',
 '{"entity":"innisfree","consecutive_zero_periods":4,"last_mention_date":"NOW() - 28 days"}'::jsonb,
 6,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 11. silence_alert: Bonsoy 3 weeks
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('80000000-0000-4000-a000-000000000002',
 'alert',
 'silence:80000002:w12',
 'info',
 '「Bonsoy」已連續三週無人提及',
 'Bonsoy 已連續 3 週無任何提及。建議確認品牌是否仍在目標追蹤範圍內。',
 '{"entity":"Bonsoy","consecutive_zero_periods":3,"last_mention_date":"NOW() - 21 days"}'::jsonb,
 6,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 12. topic_surge: 油痘肌護膚 +250%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000001',
 'trend',
 'topic_surge:50000001:w12',
 'warning',
 '「油痘肌護膚」話題急升 +250%',
 '本週聲量從 6 則飆升至 21 則，成長 250%。主要受 B5修復霜致敏事件帶動，消費者大量討論替代護膚方案。',
 '{"entity":"油痘肌護膚","delta_pct":250,"prev_mentions":6,"current_mentions":21}'::jsonb,
 7,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 13. topic_surge: 韓系穿搭 +140%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000003',
 'trend',
 'topic_surge:50000003:w12',
 'info',
 '「韓系穿搭」話題急升 +140%',
 '本週聲量從 5 則上升至 12 則，成長 140%。穿搭類 KOL 帶動春季韓系穿搭討論熱度。',
 '{"entity":"韓系穿搭","delta_pct":140,"prev_mentions":5,"current_mentions":12}'::jsonb,
 7,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 14. narrative insight: 理膚寶水品牌危機
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'insight',
 'narrative:10000001:w12',
 'warning',
 '理膚寶水本週陷入品牌信任危機',
 '本週理膚寶水面臨多重壓力。旗下明星產品 B5修復霜情感驟降 72%，致敏性與成分安全成為全新負面議題。核心面向「控油」口碑翻轉為負面，品牌定位受到根本性挑戰。同時競品 CeraVe 聲量暴增 175%，以「更安全替代品」姿態搶佔心智。建議立即啟動危機應對：調查致敏批次、主動回應社群、監控競品動態。',
 '{"related_facts":["product_drags_brand:20000001:w12","competitor_surge:10000003:w12","aspect_flip:10000001:控油:w12"],"fact_count":3,"generated_by":"gpt-4o-mini"}'::jsonb,
 NULL,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 15. narrative insight: 油痘肌護膚話題爆紅
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000001',
 'insight',
 'narrative:50000001:w12',
 'info',
 '油痘肌護膚話題因致敏事件爆紅',
 '「油痘肌護膚」話題本週聲量暴增 250%，成為成長最快的話題。B5修復霜致敏爭議引發大量替代品討論，CeraVe 趁勢崛起成為推薦首選。新出現的「致敏性討論」面向顯示消費者對護膚品安全的關注度正在升高，品牌可考慮強調低敏特性作為行銷切入點。',
 '{"related_facts":["topic_surge:50000001:w12","new_aspect:50000001:致敏性討論:w12"],"fact_count":2,"generated_by":"gpt-4o-mini"}'::jsonb,
 NULL,
 date_trunc('week', NOW()), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '1 day')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- ============================================================
-- W11 (previous week) — 8 facts
-- ============================================================

-- 16. competitor_surge: CeraVe +80% (early signal)
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'alert',
 'competitor_surge:10000003:w11',
 'info',
 '競品「CeraVe」聲量上升 +80%',
 'CeraVe 本週 8 則提及（上週 4 則），成長 80%。尚未達到警戒線但值得持續觀察。',
 '{"source_entity":"CeraVe","source_id":"10000000-0000-4000-a000-000000000003","target_entity":"理膚寶水","delta_pct":80,"prev_mentions":4,"current_mentions":8}'::jsonb,
 2,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '8 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 17. new_aspect_detected: B5修復霜 致敏性 first appearance
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('20000000-0000-4000-a000-000000000001',
 'trend',
 'new_aspect:20000001:致敏性:w11',
 'info',
 '「B5修復霜」出現新面向：致敏性',
 '首次出現「致敏性」討論面向，共 2 則提及，平均情感 0.30。初步信號，建議持續追蹤。',
 '{"entity":"B5修復霜","new_aspects":["致敏性"],"aspect_details":[{"aspect":"致敏性","count":2,"avg_sentiment":0.30}]}'::jsonb,
 4,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '8 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 18. topic_surge: 油痘肌護膚 +120%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000001',
 'trend',
 'topic_surge:50000001:w11',
 'info',
 '「油痘肌護膚」話題成長 +120%',
 '本週聲量從 3 則上升至 6 則，成長 120%。開始出現護膚品安全相關討論。',
 '{"entity":"油痘肌護膚","delta_pct":120,"prev_mentions":3,"current_mentions":6}'::jsonb,
 7,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '9 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 19. founder_reputation_risk: Carol凱若 -18%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('80000000-0000-4000-a000-000000000001',
 'risk_signal',
 'founder_risk:30000001:w11',
 'info',
 '創辦人「Carol凱若」聲譽微降 -18%',
 'Carol凱若 本週情感從 0.75 降至 0.62，跌幅 18%。初步出現業配爭議相關討論。',
 '{"source_entity":"Carol凱若","source_id":"30000000-0000-4000-a000-000000000001","target_entity":"2006hairsalon","delta_pct":-18,"prev_sentiment":0.75,"current_sentiment":0.62}'::jsonb,
 3,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '9 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 20. silence_alert: innisfree 3 weeks
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000005',
 'alert',
 'silence:10000005:w11',
 'info',
 '「innisfree」已連續三週無人提及',
 'innisfree 已連續 3 週無任何提及。品牌在社群中的能見度持續偏低。',
 '{"entity":"innisfree","consecutive_zero_periods":3,"last_mention_date":"NOW() - 21 days"}'::jsonb,
 6,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '8 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 21. aspect_sentiment_flip: 理膚寶水/品牌信任 0.78→0.42
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000001',
 'risk_signal',
 'aspect_flip:10000001:品牌信任:w11',
 'warning',
 '「理膚寶水」面向「品牌信任」情感翻轉',
 '「品牌信任」從正面翻轉為負面（0.78 → 0.42）。消費者對品牌的信任感開始動搖，可能是致敏事件的前兆。',
 '{"entity":"理膚寶水","aspect":"品牌信任","prev_sentiment":0.78,"current_sentiment":0.42,"prev_label":"正面","current_label":"負面"}'::jsonb,
 5,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '9 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 22. narrative insight: 鬍子茶競爭壓力升高
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000006',
 'insight',
 'narrative:10000006:w11',
 'info',
 '鬍子茶面臨茶湯會競爭壓力',
 '茶湯會聲量持續上升，本週新品討論活躍。鬍子茶聲量相對平穩但缺乏新話題。建議加強新品宣傳與社群互動，以維持品牌能見度。',
 '{"related_facts":["competitor_surge:10000007:w11"],"fact_count":1,"generated_by":"gpt-4o-mini"}'::jsonb,
 NULL,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '8 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 23. topic_decay: 健身穿搭 3 weeks zero
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000010',
 'trend',
 'topic_decay:50000010:w11',
 'info',
 '「健身穿搭」話題已沉寂三週',
 '「健身穿搭」連續 3 週無新提及。話題可能已退出當前社群關注範圍。',
 '{"entity":"健身穿搭","consecutive_zero_periods":3,"last_mention_date":"NOW() - 21 days"}'::jsonb,
 8,
 date_trunc('week', NOW() - interval '1 week'), 'week',
 false, false,
 NOW() + interval '30 days',
 NOW() - interval '9 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- ============================================================
-- W10 (two weeks ago) — 7 facts
-- ============================================================

-- 24. new_aspect_detected: 茶湯會 → 季節限定
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000007',
 'trend',
 'new_aspect:10000007:季節限定:w10',
 'info',
 '「茶湯會」出現新面向：季節限定',
 '本週新出現「季節限定」面向，共 3 則提及，平均情感 0.85。消費者對季節限定飲品反應正面。',
 '{"entity":"茶湯會","new_aspects":["季節限定"],"aspect_details":[{"aspect":"季節限定","count":3,"avg_sentiment":0.85}]}'::jsonb,
 4,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '15 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 25. competitor_surge: 茶湯會 +60% (early signal)
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000006',
 'alert',
 'competitor_surge:10000007:w10',
 'info',
 '競品「茶湯會」聲量上升 +60%',
 '茶湯會本週 8 則提及（上週 5 則），成長 60%。季節限定新品帶動討論熱度。',
 '{"source_entity":"茶湯會","source_id":"10000000-0000-4000-a000-000000000007","target_entity":"鬍子茶","delta_pct":60,"prev_mentions":5,"current_mentions":8}'::jsonb,
 2,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '15 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 26. topic_surge: 韓系穿搭 +80%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000003',
 'trend',
 'topic_surge:50000003:w10',
 'info',
 '「韓系穿搭」話題成長 +80%',
 '本週聲量從 3 則上升至 5 則，成長 80%。冬季韓風外套討論為主要驅動。',
 '{"entity":"韓系穿搭","delta_pct":80,"prev_mentions":3,"current_mentions":5}'::jsonb,
 7,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '16 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 27. silence_alert: Bonsoy 2 weeks
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('80000000-0000-4000-a000-000000000002',
 'alert',
 'silence:80000002:w10',
 'info',
 '「Bonsoy」已連續兩週無人提及',
 'Bonsoy 已連續 2 週無任何提及。品牌在社群中的能見度偏低。',
 '{"entity":"Bonsoy","consecutive_zero_periods":2,"last_mention_date":"NOW() - 14 days"}'::jsonb,
 6,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '15 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 28. silence_alert: innisfree 2 weeks
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000005',
 'alert',
 'silence:10000005:w10',
 'info',
 '「innisfree」已連續兩週無人提及',
 'innisfree 已連續 2 週無任何提及。品牌討論熱度持續偏低。',
 '{"entity":"innisfree","consecutive_zero_periods":2,"last_mention_date":"NOW() - 14 days"}'::jsonb,
 6,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '16 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 29. topic_decay: 健身穿搭 2 weeks zero
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000010',
 'trend',
 'topic_decay:50000010:w10',
 'info',
 '「健身穿搭」話題已沉寂兩週',
 '「健身穿搭」連續 2 週無新提及。可能因季節因素導致討論減少。',
 '{"entity":"健身穿搭","consecutive_zero_periods":2,"last_mention_date":"NOW() - 14 days"}'::jsonb,
 8,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '16 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 30. narrative insight: CeraVe崛起觀察
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000003',
 'insight',
 'narrative:10000003:w10',
 'info',
 'CeraVe 品牌聲量穩步攀升',
 'CeraVe 近兩週聲量持續成長，從 2 則提及增至 4 則。雖然絕對數量不高，但成長趨勢明確。其保濕與修護相關討論以正面情感為主，品牌口碑持續累積中。',
 '{"related_facts":["competitor_surge:10000003:w10"],"fact_count":1,"generated_by":"gpt-4o-mini"}'::jsonb,
 NULL,
 date_trunc('week', NOW() - interval '2 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '15 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- ============================================================
-- W9 (three weeks ago) — 3 facts (is_read=true, older history)
-- ============================================================

-- 31. silence_alert: Bonsoy 1 week
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('80000000-0000-4000-a000-000000000002',
 'alert',
 'silence:80000002:w9',
 'info',
 '「Bonsoy」本週無人提及',
 'Bonsoy 本週無任何提及。首次出現零提及的週期。',
 '{"entity":"Bonsoy","consecutive_zero_periods":1}'::jsonb,
 6,
 date_trunc('week', NOW() - interval '3 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '22 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 32. silence_alert: innisfree 1 week
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000005',
 'alert',
 'silence:10000005:w9',
 'info',
 '「innisfree」本週無人提及',
 'innisfree 本週無任何提及。品牌社群能見度開始下滑。',
 '{"entity":"innisfree","consecutive_zero_periods":1}'::jsonb,
 6,
 date_trunc('week', NOW() - interval '3 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '22 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 33. topic_decay: 健身穿搭 1 week zero
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000010',
 'trend',
 'topic_decay:50000010:w9',
 'info',
 '「健身穿搭」話題本週無新提及',
 '「健身穿搭」首次出現零提及。可能進入話題冷卻期。',
 '{"entity":"健身穿搭","consecutive_zero_periods":1}'::jsonb,
 8,
 date_trunc('week', NOW() - interval '3 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '23 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- ============================================================
-- W8 (four weeks ago) — 2 facts (is_read=true, oldest history)
-- ============================================================

-- 34. new_aspect_detected: 寶雅 → 店面體驗
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('10000000-0000-4000-a000-000000000008',
 'trend',
 'new_aspect:10000008:店面體驗:w8',
 'info',
 '「寶雅」出現新面向：店面體驗',
 '首次出現「店面體驗」面向，共 2 則提及，平均情感 0.65。消費者開始關注實體通路的購物體驗。',
 '{"entity":"寶雅","new_aspects":["店面體驗"],"aspect_details":[{"aspect":"店面體驗","count":2,"avg_sentiment":0.65}]}'::jsonb,
 4,
 date_trunc('week', NOW() - interval '4 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '29 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

-- 35. topic_surge: 美妝教程 +110%
INSERT INTO derived_facts (object_id, fact_type, fact_key, severity, title, description, evidence, derived_from_rule, period_start, period_type, is_read, is_dismissed, expires_at, created_at) VALUES
('50000000-0000-4000-a000-000000000002',
 'trend',
 'topic_surge:50000002:w8',
 'info',
 '「美妝教程」話題成長 +110%',
 '本週聲量從 3 則上升至 6 則，成長 110%。新年前夕妝容教學需求帶動。',
 '{"entity":"美妝教程","delta_pct":110,"prev_mentions":3,"current_mentions":6}'::jsonb,
 7,
 date_trunc('week', NOW() - interval '4 weeks'), 'week',
 true, false,
 NOW() + interval '30 days',
 NOW() - interval '30 days')
ON CONFLICT (object_id, fact_key) DO NOTHING;

COMMIT;
