-- ============================================================
-- ENTITY ASPECTS (~450 rows across 12 weeks)
-- Drives ontology engine rules: new_aspect_detected,
-- aspect_sentiment_flip, silence_alert, etc.
-- W1: demo_001-030, W2: demo_031-060, W3: demo_061-090
-- W4: demo_091-120, W5: demo_121-150, W6: demo_151-180
-- W7: demo_181-210, W8: demo_211-240, W9: demo_241-290
-- W10: demo_291-340, W11: demo_341-420, W12: demo_421-500
-- ============================================================

BEGIN;

-- ============================================================
-- WEEK 1 (demo_001-030) — baseline positive
-- ============================================================

-- 理膚寶水 (brand 1): 控油 positive, 品牌信任 positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_001', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.82, '理膚寶水控油超好，油肌夏天必備'),
('demo_003', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.80, '油痘肌護膚重點先控油再保濕'),
('demo_005', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.85, '理膚寶水用了三年一直都很穩定'),
('demo_008', '10000000-0000-4000-a000-000000000001', '性價比', 'positive', 0.72, '理膚寶水週年慶特價值得囤貨'),
('demo_010', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.80, '皮膚科醫師推薦理膚寶水很放心'),
('demo_014', '10000000-0000-4000-a000-000000000001', '產品線', 'positive', 0.78, '理膚寶水全系列產品線很完整'),
('demo_016', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.85, '理膚寶水的控油系列真的是油肌救星'),
('demo_020', '10000000-0000-4000-a000-000000000001', '品牌形象', 'positive', 0.78, '美妝大賞入圍理膚寶水品牌形象佳')
ON CONFLICT DO NOTHING;

-- B5修復霜 (product 1): W1 NO 致敏性, only positive aspects
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_001', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.90, 'B5修復霜搭配精華修復效果超好'),
('demo_006', '20000000-0000-4000-a000-000000000001', '質地', 'positive', 0.70, 'B5質地偏厚但吸收還可以'),
('demo_008', '20000000-0000-4000-a000-000000000001', '成分', 'positive', 0.75, 'B5成分單純不刺激平價好選擇'),
('demo_014', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.82, 'B5搭配蝸牛精華修復痘痘肌黃金組合'),
('demo_022', '20000000-0000-4000-a000-000000000001', '價格', 'positive', 0.78, 'B5價格親民效果好回購率超高')
ON CONFLICT DO NOTHING;

-- CeraVe (brand 3): W1 敏感肌友善 positive baseline
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_002', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.80, '敏感肌推薦CeraVe保濕修護乳'),
('demo_002', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.85, '開架保養也能有感CeraVe便宜又好用'),
('demo_011', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.78, '美妝大賞入圍CeraVe也有上榜'),
('demo_019', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.90, '一整套CeraVe只要800元CP值超高')
ON CONFLICT DO NOTHING;

-- CeraVe乳 (product 3)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_002', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.82, 'CeraVe保濕修護乳便宜又好用'),
('demo_011', '20000000-0000-4000-a000-000000000003', '質地', 'neutral', 0.50, '保濕力很好但有點厚重'),
('demo_019', '20000000-0000-4000-a000-000000000003', '價格', 'positive', 0.92, '一整套只要800元CP值爆表')
ON CONFLICT DO NOTHING;

-- COSRX (brand 4) + 蝸牛精華 (product 4)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_004', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.75, 'COSRX痘疤淡化系列好評'),
('demo_004', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.78, '蝸牛精華用了一個月痘疤有淡化'),
('demo_004', '20000000-0000-4000-a000-000000000004', '質地', 'negative', 0.30, '蝸牛精華質地有點黏膩感'),
('demo_014', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.82, '搭配B5修復痘痘肌黃金組合')
ON CONFLICT DO NOTHING;

-- innisfree (brand 5) + 綠茶籽 (product 5)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_007', '10000000-0000-4000-a000-000000000005', '品牌形象', 'positive', 0.70, 'innisfree保濕力還是很夠'),
('demo_007', '20000000-0000-4000-a000-000000000005', '保濕效果', 'positive', 0.72, '綠茶籽精華保濕力還是很夠')
ON CONFLICT DO NOTHING;

-- 鬍子茶 (brand 6) + 木瓜牛奶 (product 6)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_012', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.88, '鬍子茶的木瓜牛奶真的超好喝'),
('demo_018', '10000000-0000-4000-a000-000000000006', '性價比', 'positive', 0.75, '鬍子茶飲料價格親民學生最愛'),
('demo_012', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.90, '木瓜牛奶真的超好喝濃郁'),
('demo_018', '20000000-0000-4000-a000-000000000006', '價格', 'positive', 0.82, '木瓜牛奶大杯只要50元超划算')
ON CONFLICT DO NOTHING;

-- 茶湯會 (brand 7) + 珍珠奶茶 (product 7)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_009', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '茶湯會珍珠奶茶甜度剛好'),
('demo_015', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.72, '茶湯會手搖飲口味穩定'),
('demo_009', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.78, '珍珠奶茶珍珠QQ的口感很好'),
('demo_015', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.72, '珍珠煮得還行偶爾偏硬')
ON CONFLICT DO NOTHING;

-- 寶雅 (brand 8) + 屈臣氏 (brand 9)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_013', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.75, '寶雅買得到的五款粉底液'),
('demo_015', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.82, '屈臣氏週年慶必買清單超值得囤貨'),
('demo_025', '10000000-0000-4000-a000-000000000008', '品牌形象', 'positive', 0.78, '寶雅美妝區越來越完整了'),
('demo_028', '10000000-0000-4000-a000-000000000009', '性價比', 'positive', 0.80, '屈臣氏買一送一活動超划算')
ON CONFLICT DO NOTHING;

-- 薇姿 (brand 2) + 89瓶 (product 2)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_001', '10000000-0000-4000-a000-000000000002', '品牌信任', 'positive', 0.82, '薇姿89精華修復效果搭配很好'),
('demo_020', '10000000-0000-4000-a000-000000000002', '品牌信任', 'positive', 0.80, '薇姿的礦泉水系列越來越受歡迎'),
('demo_001', '20000000-0000-4000-a000-000000000002', '保濕效果', 'positive', 0.85, '薇姿89精華搭配B5修復效果超好'),
('demo_006', '20000000-0000-4000-a000-000000000002', '質地', 'positive', 0.75, '89火山能量瓶質地清爽好吸收')
ON CONFLICT DO NOTHING;

-- Persons W1
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_003', '30000000-0000-4000-a000-000000000001', '內容品質', 'positive', 0.82, '分享的護膚知識很專業又好懂'),
('demo_017', '30000000-0000-4000-a000-000000000002', '真實性', 'positive', 0.78, '開箱影片很真實沒有過度修圖'),
('demo_021', '30000000-0000-4000-a000-000000000003', '互動', 'positive', 0.75, '會認真回覆粉絲問題很用心')
ON CONFLICT DO NOTHING;

-- Works W1
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_023', '60000000-0000-4000-a000-000000000001', '效果', 'positive', 0.80, '這款精華液效果真的很明顯'),
('demo_026', '60000000-0000-4000-a000-000000000002', '成分', 'positive', 0.75, '成分天然溫和適合敏感肌使用')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 2 (demo_031-060) — stable with slight variations
-- ============================================================

-- 理膚寶水: 控油 still positive, 品牌信任 still positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_031', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.78, '理膚寶水控油潔面乳洗完清爽不緊繃'),
('demo_035', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.82, '理膚寶水參加美妝博覽會品牌值得信賴'),
('demo_042', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.80, '控油系列換季也好用推薦油肌人'),
('demo_048', '10000000-0000-4000-a000-000000000001', '品牌形象', 'positive', 0.76, '理膚寶水包裝設計越來越好看'),
('demo_055', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.80, '皮膚科開的處方常搭理膚寶水'),
('demo_058', '10000000-0000-4000-a000-000000000001', '性價比', 'positive', 0.74, '理膚寶水大容量版更划算')
ON CONFLICT DO NOTHING;

-- B5: W2 still positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_033', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.85, 'B5修復霜換季脫皮救星推薦'),
('demo_040', '20000000-0000-4000-a000-000000000001', '質地', 'positive', 0.72, 'B5質地雖厚但很保濕冬天適合'),
('demo_050', '20000000-0000-4000-a000-000000000001', '價格', 'positive', 0.78, 'B5價格合理回購率很高'),
('demo_056', '20000000-0000-4000-a000-000000000001', '成分', 'positive', 0.76, 'B5成分簡單敏感肌也適用')
ON CONFLICT DO NOTHING;

-- CeraVe W2: 敏感肌友善 growing
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_034', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.82, '換了CeraVe保濕乳後痘痘明顯減少'),
('demo_038', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.85, 'CeraVe大容量版更划算敏感肌福音'),
('demo_045', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.78, 'CeraVe在美國也是皮膚科首推'),
('demo_052', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.83, 'CeraVe溫和不刺激敏感肌首選')
ON CONFLICT DO NOTHING;

-- CeraVe乳 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_034', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.82, '換了保濕乳後痘痘明顯減少'),
('demo_045', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.72, 'CeraVe乳液質地溫和不刺激'),
('demo_052', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.80, '保濕修護乳冬天也很夠力')
ON CONFLICT DO NOTHING;

-- COSRX + 蝸牛精華 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_037', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.78, 'COSRX敏感肌首選韓系品牌'),
('demo_037', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.72, '蝸牛精華修復效果穩定'),
('demo_049', '20000000-0000-4000-a000-000000000004', '質地', 'positive', 0.68, '新款精華液質地清爽不黏膩')
ON CONFLICT DO NOTHING;

-- 鬍子茶 + 木瓜牛奶 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_032', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.80, '鬍子茶夏日飲品推薦上榜'),
('demo_036', '10000000-0000-4000-a000-000000000006', '客服', 'positive', 0.72, '鬍子茶店員態度很好'),
('demo_042', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.82, '鬍子茶芒果冰沙也很好喝'),
('demo_032', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.85, '木瓜牛奶濃郁又不會太甜'),
('demo_036', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.78, '木瓜牛奶口感濃郁勝過其他家')
ON CONFLICT DO NOTHING;

-- 茶湯會 + 珍珠奶茶 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_033', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '茶湯會鐵觀音拿鐵是daily drink'),
('demo_040', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.72, '茶湯會手搖飲口味穩定品質好'),
('demo_033', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.80, '珍珠奶茶甜度剛好口感滑順'),
('demo_043', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.75, '珍珠煮得QQ的配甜度剛好')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_039', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.85, '寶雅週年慶第一天去掃貨了'),
('demo_046', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.88, 'CeraVe在屈臣氏有買一送一'),
('demo_053', '10000000-0000-4000-a000-000000000008', '性價比', 'positive', 0.82, '寶雅只要99元超好用')
ON CONFLICT DO NOTHING;

-- Persons W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_041', '30000000-0000-4000-a000-000000000004', '專業度', 'positive', 0.80, '護膚知識講解非常專業'),
('demo_047', '30000000-0000-4000-a000-000000000005', '業配', 'neutral', 0.50, '最近業配有點多但內容還行'),
('demo_054', '30000000-0000-4000-a000-000000000001', '表達力', 'positive', 0.85, '影片剪輯很流暢表達清晰')
ON CONFLICT DO NOTHING;

-- 薇姿 + 89瓶 W2
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_044', '10000000-0000-4000-a000-000000000002', '品牌信任', 'positive', 0.75, '薇姿礦泉水系列持續好評'),
('demo_044', '20000000-0000-4000-a000-000000000002', '保濕效果', 'positive', 0.78, '89能量瓶真的是明星產品')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 3 (demo_061-090) — still baseline, slight wobble
-- ============================================================

-- 理膚寶水: 控油 positive, 品牌信任 starts slight wobble
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_063', '10000000-0000-4000-a000-000000000001', '品牌信任', 'neutral', 0.50, '理膚寶水B5好像有人反映問題來看看'),
('demo_066', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.76, '油痘肌保養順序理膚寶水控油排第一'),
('demo_072', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.75, '理膚寶水全系列產品評測品質穩定'),
('demo_078', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.78, '理膚寶水淨膚控油潔面乳用完了想回購'),
('demo_085', '10000000-0000-4000-a000-000000000001', '品牌形象', 'positive', 0.72, '理膚寶水包裝新改版挺好看')
ON CONFLICT DO NOTHING;

-- B5: W3 still positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_063', '20000000-0000-4000-a000-000000000001', '保濕效果', 'neutral', 0.55, '最近好像有人反映B5問題但我用還好'),
('demo_072', '20000000-0000-4000-a000-000000000001', '質地', 'positive', 0.70, 'B5質地偏厚用量不用太多'),
('demo_085', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.78, 'B5修復霜秋冬回購清單必備')
ON CONFLICT DO NOTHING;

-- CeraVe W3
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_061', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.82, '換了CeraVe後痘痘明顯減少'),
('demo_070', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.85, 'CeraVe vs COSRX誰是敏感肌首選'),
('demo_080', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.80, 'CeraVe連皮膚科都推薦很安心'),
('demo_061', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.82, '保濕修護乳換了後痘痘減少了'),
('demo_070', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.72, '質地溫和不刺激夏天也OK')
ON CONFLICT DO NOTHING;

-- COSRX W3
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_070', '10000000-0000-4000-a000-000000000004', '性價比', 'positive', 0.78, 'COSRX敏感肌PK中性價比不錯'),
('demo_077', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.72, 'COSRX韓國新品價格親民'),
('demo_070', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.72, '蝸牛精華修復效果穩定'),
('demo_077', '20000000-0000-4000-a000-000000000004', '質地', 'neutral', 0.55, '精華替代品質地也OK不算太黏')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W3
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_068', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.72, '鬍子茶新品限定口味木瓜芒果'),
('demo_081', '10000000-0000-4000-a000-000000000006', '品牌形象', 'negative', 0.25, '木瓜牛奶突然變味了配方換了嗎'),
('demo_068', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.70, '限定口味木瓜芒果還不錯'),
('demo_081', '20000000-0000-4000-a000-000000000006', '質地', 'negative', 0.28, '木瓜牛奶濃郁度明顯下降了')
ON CONFLICT DO NOTHING;

-- 茶湯會 W3 growing
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_073', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '茶湯會新品讓大家排隊值得'),
('demo_075', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.72, '手搖飲推薦茶湯會性價比高'),
('demo_073', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.72, '新品珍珠奶茶值得排隊品質好')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W3
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_084', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.85, '寶雅週年慶掃貨戰利品開箱'),
('demo_076', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.80, '屈臣氏開架保養品選擇很多')
ON CONFLICT DO NOTHING;

-- Persons W3
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_065', '30000000-0000-4000-a000-000000000002', '內容品質', 'positive', 0.80, '護膚影片製作精美內容豐富'),
('demo_082', '30000000-0000-4000-a000-000000000006', '真實性', 'positive', 0.75, '分享的穿搭很日常不做作'),
('demo_088', '30000000-0000-4000-a000-000000000003', '專業度', 'positive', 0.82, '成分分析影片非常專業')
ON CONFLICT DO NOTHING;

-- innisfree W3 (少量)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_070', '10000000-0000-4000-a000-000000000005', '性價比', 'positive', 0.72, '平價保養PK中innisfree也算平價')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 4 (demo_091-120) — stable continuation
-- ============================================================

-- 理膚寶水: 控油 positive, 品牌信任 positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_093', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.75, '油痘肌護膚三大誤區推薦理膚寶水控油'),
('demo_098', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.78, '理膚寶水品質一直很穩定值得信賴'),
('demo_105', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.82, '夏天控油首選還是理膚寶水'),
('demo_112', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.80, '醫師推薦品牌中理膚寶水排名前三'),
('demo_118', '10000000-0000-4000-a000-000000000001', '產品線', 'positive', 0.74, '理膚寶水防曬系列也很好用')
ON CONFLICT DO NOTHING;

-- B5: W4 positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_095', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.80, 'B5修復霜一直是我的愛用品'),
('demo_100', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.72, '平價保養品年度回購清單B5上榜'),
('demo_110', '20000000-0000-4000-a000-000000000001', '成分', 'positive', 0.75, 'B5成分溫和適合日常使用')
ON CONFLICT DO NOTHING;

-- CeraVe W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_096', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.90, 'CeraVe在屈臣氏有買一送一快衝'),
('demo_096', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.82, 'CeraVe保濕系列持續獲好評'),
('demo_108', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.80, 'CeraVe全球銷量第一敏感肌品牌'),
('demo_096', '20000000-0000-4000-a000-000000000003', '價格', 'positive', 0.90, '買一送一活動保濕乳超划算'),
('demo_108', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.82, '保濕修護乳全球銷量證明實力')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_098', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.75, '鬍子茶珍珠煮得剛好QQ的'),
('demo_103', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.80, '鬍子茶逢甲分店開幕半價活動'),
('demo_103', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.72, '逢甲分店半價嚐鮮口感不錯')
ON CONFLICT DO NOTHING;

-- 茶湯會 W4 growing
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_092', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '茶湯會烏龍拿鐵越來越好喝'),
('demo_112', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.75, '台中美食大集合茶湯會也上榜'),
('demo_119', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '飲品盲測茶湯會表現亮眼'),
('demo_119', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.75, '盲測中茶湯會珍珠奶茶表現最佳')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_097', '10000000-0000-4000-a000-000000000008', '性價比', 'positive', 0.82, '寶雅特價只要99元超好用'),
('demo_109', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.72, '開架粉底液在屈臣氏就能買到'),
('demo_113', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.80, '寶雅週年慶戰利品第二波')
ON CONFLICT DO NOTHING;

-- Persons W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_101', '30000000-0000-4000-a000-000000000004', '內容品質', 'positive', 0.78, '保養品比較影片很有參考價值'),
('demo_115', '30000000-0000-4000-a000-000000000007', '互動', 'positive', 0.80, '直播互動很熱絡粉絲很多'),
('demo_117', '30000000-0000-4000-a000-000000000001', '專業度', 'positive', 0.85, '理膚寶水全系列評測非常專業')
ON CONFLICT DO NOTHING;

-- Works W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_102', '60000000-0000-4000-a000-000000000001', '持久度', 'positive', 0.78, '這款用了一個月效果持續很好'),
('demo_111', '60000000-0000-4000-a000-000000000003', '價格', 'positive', 0.82, '價格親民效果也不差CP值高')
ON CONFLICT DO NOTHING;

-- 薇姿 W4
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_102', '10000000-0000-4000-a000-000000000002', '品牌信任', 'positive', 0.72, '89能量瓶用完一瓶值得回購'),
('demo_102', '20000000-0000-4000-a000-000000000002', '保濕效果', 'positive', 0.75, '89能量瓶真心推薦保濕好')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 5 (demo_121-150) — 理膚寶水 控油 still positive, trust holding
-- ============================================================

-- 理膚寶水: still positive baseline
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_121', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.78, '理膚寶水限定組合品牌很有誠意'),
('demo_128', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.80, '理膚寶水控油系列夏天不能少'),
('demo_135', '10000000-0000-4000-a000-000000000001', '品牌形象', 'positive', 0.75, '理膚寶水新品發表會產品線豐富'),
('demo_142', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.77, '控油潔面乳一直是我的第一選擇')
ON CONFLICT DO NOTHING;

-- B5: W5 positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_125', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.82, 'B5修復霜秋冬保濕好幫手'),
('demo_138', '20000000-0000-4000-a000-000000000001', '質地', 'positive', 0.70, 'B5厚度適中搭配精華剛好'),
('demo_145', '20000000-0000-4000-a000-000000000001', '價格', 'positive', 0.76, 'B5特價中趕快囤貨')
ON CONFLICT DO NOTHING;

-- CeraVe W5: growing positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_130', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.85, 'CeraVe溫和修護敏感肌大推'),
('demo_137', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.88, 'CeraVe開架價格專櫃效果'),
('demo_143', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.80, '全球皮膚科推薦品牌CeraVe'),
('demo_130', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.85, '保濕修護乳敏感肌也能安心用'),
('demo_143', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.78, '乳液質地清爽好吸收')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W5
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_126', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.78, '鬍子茶季節限定草莓牛奶好喝'),
('demo_140', '10000000-0000-4000-a000-000000000006', '客服', 'positive', 0.72, '新分店服務態度很好')
ON CONFLICT DO NOTHING;

-- 茶湯會 W5
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_124', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.80, '茶湯會低糖選擇越來越多了'),
('demo_132', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.75, '茶湯會配合活動價格更實惠'),
('demo_148', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '茶湯會外送服務上線太方便了')
ON CONFLICT DO NOTHING;

-- Persons W5
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_129', '30000000-0000-4000-a000-000000000005', '內容品質', 'positive', 0.78, '開箱影片品質越來越好了'),
('demo_136', '30000000-0000-4000-a000-000000000008', '真實性', 'positive', 0.82, '素顏護膚分享很真實'),
('demo_144', '30000000-0000-4000-a000-000000000006', '互動', 'positive', 0.75, '留言都會認真回覆')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W5
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_125', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.75, '屈臣氏買到理膚寶水獨家組'),
('demo_127', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.80, '寶雅美妝區連韓系品牌都有')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 6 (demo_151-180) — still stable
-- ============================================================

-- 理膚寶水: still mostly positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_155', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.78, '夏天到了理膚寶水控油系列又開始熱賣'),
('demo_160', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.76, '理膚寶水品牌穩定老顧客放心'),
('demo_170', '10000000-0000-4000-a000-000000000001', '品牌形象', 'positive', 0.72, '理膚寶水參加美妝展品牌形象好')
ON CONFLICT DO NOTHING;

-- B5: W6 positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_158', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.78, 'B5修復霜持續好評穩定回購'),
('demo_165', '20000000-0000-4000-a000-000000000001', '成分', 'positive', 0.75, 'B5成分分析結果還是很安全的')
ON CONFLICT DO NOTHING;

-- CeraVe W6
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_153', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.85, 'CeraVe夏天也適合敏感肌用'),
('demo_162', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.87, 'CeraVe夏季特賣CP值更高了'),
('demo_175', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.83, '換季敏感推薦CeraVe最安心'),
('demo_162', '20000000-0000-4000-a000-000000000003', '價格', 'positive', 0.87, '夏季特賣保濕乳超划算')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W6
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_167', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.72, '茶湯會vs鬍子茶對決鬍子茶回穩'),
('demo_168', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.80, '木瓜牛奶配方問題似乎解決了'),
('demo_174', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.78, '新竹巨城新分店開幕品質不錯'),
('demo_168', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.82, '木瓜牛奶配方問題解決了口感回來'),
('demo_174', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.80, '新分店木瓜牛奶品質穩定')
ON CONFLICT DO NOTHING;

-- 茶湯會 W6 surging
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_166', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.92, '茶湯會新品爆紅一天賣5000杯'),
('demo_169', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.88, '新品真的好喝到不行連喝五天'),
('demo_173', '10000000-0000-4000-a000-000000000007', '包裝設計', 'positive', 0.80, '推出聯名款包裝設計超可愛'),
('demo_176', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.85, '排隊也要喝代表口感真的好'),
('demo_178', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.80, '珍珠煮得越來越好了'),
('demo_166', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.88, '新品珍珠奶茶一天賣5000杯'),
('demo_178', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.82, '珍珠煮得越來越好QQ的')
ON CONFLICT DO NOTHING;

-- Persons W6
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_152', '30000000-0000-4000-a000-000000000009', '業配', 'negative', 0.35, '業配太明顯了失去可信度'),
('demo_163', '30000000-0000-4000-a000-000000000002', '表達力', 'positive', 0.82, '講解護膚步驟很清楚易懂'),
('demo_171', '30000000-0000-4000-a000-000000000010', '內容品質', 'positive', 0.78, '料理影片拍攝品質很好')
ON CONFLICT DO NOTHING;

-- 寶雅 W6
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_157', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.78, '寶雅新開的美妝專區很好逛'),
('demo_172', '10000000-0000-4000-a000-000000000009', '性價比', 'positive', 0.82, '屈臣氏會員日折扣很有感')
ON CONFLICT DO NOTHING;

-- innisfree W6 (少量)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_152', '10000000-0000-4000-a000-000000000005', '品牌形象', 'neutral', 0.55, '韓系穿搭搭配innisfree但討論不多')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 7 (demo_181-210) — still stable pre-crisis
-- ============================================================

-- 理膚寶水: still positive, last week before trust erodes
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_185', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.76, '控油潔面乳夏天回購第三罐了'),
('demo_192', '10000000-0000-4000-a000-000000000001', '品牌信任', 'positive', 0.74, '理膚寶水一直是我的愛牌沒換過'),
('demo_200', '10000000-0000-4000-a000-000000000001', '性價比', 'positive', 0.72, '週年慶特價理膚寶水值得囤')
ON CONFLICT DO NOTHING;

-- B5: W7 positive, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_188', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.78, 'B5修復霜夏天用薄塗也很保濕'),
('demo_198', '20000000-0000-4000-a000-000000000001', '質地', 'neutral', 0.55, 'B5質地夏天有點厚重考慮換用')
ON CONFLICT DO NOTHING;

-- CeraVe W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_186', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.85, 'CeraVe敏感肌社群口碑越來越好'),
('demo_195', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.85, 'CeraVe回購率超高性價比王'),
('demo_205', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.82, 'CeraVe國際口碑品牌值得信賴'),
('demo_186', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.85, '保濕修護乳敏感肌社群推薦'),
('demo_195', '20000000-0000-4000-a000-000000000003', '價格', 'positive', 0.82, '回購率超高代表價格夠實惠')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_183', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.82, '季節限定草莓牛奶也好喝'),
('demo_183', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.78, '草莓牛奶甜度適中很清爽')
ON CONFLICT DO NOTHING;

-- 茶湯會 W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_182', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '茶湯會外送服務終於上線了'),
('demo_190', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.80, '茶湯會加入外送平台更方便'),
('demo_209', '10000000-0000-4000-a000-000000000007', '包裝設計', 'positive', 0.78, '跟美妝品牌聯名杯身設計超美')
ON CONFLICT DO NOTHING;

-- Persons W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_189', '30000000-0000-4000-a000-000000000001', '內容品質', 'positive', 0.80, '年度愛用品清單影片很實用'),
('demo_196', '30000000-0000-4000-a000-000000000003', '真實性', 'positive', 0.78, '不修圖的護膚日記很真實'),
('demo_203', '30000000-0000-4000-a000-000000000007', '專業度', 'positive', 0.82, '成分講解越來越專業了')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_187', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.85, '寶雅週年慶必買的十樣東西'),
('demo_195', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.75, '屈臣氏獨家旅行收納組超實用'),
('demo_199', '10000000-0000-4000-a000-000000000008', '品牌形象', 'positive', 0.78, '寶雅美妝專區重新裝潢了好漂亮')
ON CONFLICT DO NOTHING;

-- 薇姿 W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_194', '10000000-0000-4000-a000-000000000002', '品牌信任', 'neutral', 0.55, '薇姿搭配B5效果存疑有些猶豫'),
('demo_194', '20000000-0000-4000-a000-000000000002', '保濕效果', 'neutral', 0.55, '89瓶搭配B5最近效果不如以前')
ON CONFLICT DO NOTHING;

-- Works W7
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_191', '60000000-0000-4000-a000-000000000002', '效果', 'positive', 0.78, '持續使用效果越來越明顯'),
('demo_207', '60000000-0000-4000-a000-000000000003', '安全性', 'positive', 0.80, '成分天然使用起來很安心')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 8 (demo_211-240) — 理膚寶水 品牌信任 starts dropping
-- ============================================================

-- 理膚寶水: 控油 still positive, 品牌信任 starts to waver
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_215', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.75, '理膚寶水控油系列還是不錯但有點猶豫'),
('demo_220', '10000000-0000-4000-a000-000000000001', '品牌信任', 'neutral', 0.50, '最近看到一些理膚寶水負面消息觀望中'),
('demo_228', '10000000-0000-4000-a000-000000000001', '品牌信任', 'neutral', 0.48, '理膚寶水評價兩極到底怎麼了'),
('demo_235', '10000000-0000-4000-a000-000000000001', '品牌形象', 'neutral', 0.52, '理膚寶水最近風波不斷品牌形象受影響')
ON CONFLICT DO NOTHING;

-- B5: W8 still positive but wobbling, NO 致敏性
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_218', '20000000-0000-4000-a000-000000000001', '保濕效果', 'positive', 0.72, 'B5還是有人推但開始有疑慮了'),
('demo_230', '20000000-0000-4000-a000-000000000001', '成分', 'neutral', 0.50, 'B5成分到底安不安全看法分歧'),
('demo_238', '20000000-0000-4000-a000-000000000001', '質地', 'neutral', 0.55, 'B5質地沒變但信心動搖了')
ON CONFLICT DO NOTHING;

-- CeraVe W8
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_214', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.86, 'CeraVe持續獲敏感肌社群推薦'),
('demo_222', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.88, 'CeraVe大瓶裝更划算家庭必備'),
('demo_232', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.82, '美國皮膚科推薦品牌台灣也買得到'),
('demo_214', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.86, '保濕乳敏感肌社群口碑第一'),
('demo_232', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.78, '乳液質地四季都適用')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W8
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_216', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.75, '鬍子茶秋季限定飲品上市'),
('demo_216', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.75, '秋季限定口味木瓜牛奶還是最愛')
ON CONFLICT DO NOTHING;

-- 茶湯會 W8
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_219', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.80, '茶湯會秋冬新品暖飲系列好喝'),
('demo_227', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.78, '茶湯會會員制度回饋很有感')
ON CONFLICT DO NOTHING;

-- Persons W8
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_221', '30000000-0000-4000-a000-000000000004', '業配', 'neutral', 0.45, '最近業配增加但還算有質量'),
('demo_229', '30000000-0000-4000-a000-000000000005', '內容品質', 'positive', 0.80, '換季保養影片很實用')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W8
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_224', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.78, '寶雅秋季特賣戰利品超多'),
('demo_233', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.80, '屈臣氏秋季護膚品上架齊全')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 9 (demo_241-290) — 品牌信任 turns negative
-- ============================================================

-- 理膚寶水: 品牌信任 DROPS to negative, 控油 still positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_245', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.38, '理膚寶水好像出事了有人過敏'),
('demo_252', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.35, '理膚寶水過敏事件開始被討論'),
('demo_260', '10000000-0000-4000-a000-000000000001', '控油', 'positive', 0.75, '控油系列本身沒問題但品牌形象受損'),
('demo_268', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.30, '理膚寶水官方遲遲沒有回應令人失望'),
('demo_275', '10000000-0000-4000-a000-000000000001', '品牌形象', 'negative', 0.35, '品牌形象因過敏事件大幅下滑'),
('demo_282', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.32, '身邊朋友也說不敢用理膚寶水了')
ON CONFLICT DO NOTHING;

-- B5: W9 NO 致敏性 yet, but sentiment wobbling
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_248', '20000000-0000-4000-a000-000000000001', '保濕效果', 'neutral', 0.50, 'B5到底還能不能用大家在觀望'),
('demo_258', '20000000-0000-4000-a000-000000000001', '成分', 'neutral', 0.45, 'B5成分安全性開始受到質疑'),
('demo_270', '20000000-0000-4000-a000-000000000001', '質地', 'neutral', 0.50, 'B5質地沒問題但心理障礙了'),
('demo_285', '20000000-0000-4000-a000-000000000001', '保濕效果', 'neutral', 0.48, '用了三年的B5現在有點怕怕的')
ON CONFLICT DO NOTHING;

-- CeraVe W9: accelerating positive
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_244', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.87, '理膚寶水事件後更多人轉向CeraVe'),
('demo_255', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.88, 'CeraVe趁勢推出優惠組合超划算'),
('demo_265', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.85, 'CeraVe敏感肌安全替代方案'),
('demo_278', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.82, 'CeraVe品牌口碑持續攀升'),
('demo_244', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.87, '保濕修護乳成為B5替代首選'),
('demo_265', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.80, '乳液質地溫和敏感肌安心用')
ON CONFLICT DO NOTHING;

-- COSRX W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_250', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.78, 'COSRX也受惠於理膚寶水事件銷量成長'),
('demo_250', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.80, '蝸牛精華搭配CeraVe新組合推薦')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_256', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.78, '鬍子茶冬季暖飲系列推出了'),
('demo_256', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.75, '冬季限定熱木瓜牛奶好溫暖')
ON CONFLICT DO NOTHING;

-- 茶湯會 W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_249', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '茶湯會冬季新品薑茶系列好喝'),
('demo_262', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.78, '冬季限定組合價格實惠')
ON CONFLICT DO NOTHING;

-- Persons W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_253', '30000000-0000-4000-a000-000000000001', '內容品質', 'positive', 0.82, '理膚寶水事件分析影片很專業'),
('demo_267', '30000000-0000-4000-a000-000000000006', '真實性', 'positive', 0.78, '分享真實過敏經驗很有參考價值'),
('demo_280', '30000000-0000-4000-a000-000000000008', '專業度', 'positive', 0.80, '成分安全性分析非常專業')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_254', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.80, '寶雅冬季護膚品齊全好逛'),
('demo_272', '10000000-0000-4000-a000-000000000009', '性價比', 'positive', 0.82, '屈臣氏年終特賣CeraVe搶購一空')
ON CONFLICT DO NOTHING;

-- 薇姿 W9
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_260', '10000000-0000-4000-a000-000000000002', '品牌信任', 'neutral', 0.50, '薇姿搭配理膚寶水的組合現在沒人推了'),
('demo_260', '20000000-0000-4000-a000-000000000002', '保濕效果', 'neutral', 0.55, '89瓶單獨用還行但搭配B5不建議')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 10 (demo_291-340) — B5致敏性 FIRST APPEARS, 控油 flips
-- ============================================================

-- 理膚寶水: 控油 FLIPS TO NEGATIVE, 品牌信任 very negative
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_295', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.30, '理膚寶水控油系列也讓人不敢用了'),
('demo_302', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.25, '過敏事件持續延燒官方聲明太慢'),
('demo_308', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.32, '控油效果變差了越用越油'),
('demo_315', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.20, '理膚寶水品牌信任崩壞中'),
('demo_322', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.28, '不再推薦理膚寶水控油系列了'),
('demo_330', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.22, '我也是受害者對品牌很失望'),
('demo_338', '10000000-0000-4000-a000-000000000001', '品牌形象', 'negative', 0.30, '品牌形象一落千丈')
ON CONFLICT DO NOTHING;

-- B5: W10 致敏性 FIRST APPEARS (2 rows, negative)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_298', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.18, '用了B5之後臉過敏紅腫了兩天'),
('demo_312', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.15, 'B5成分可能致敏不知道是不是批次問題'),
('demo_305', '20000000-0000-4000-a000-000000000001', '保濕效果', 'negative', 0.35, 'B5修復效果存疑不敢再用了'),
('demo_320', '20000000-0000-4000-a000-000000000001', '成分', 'negative', 0.30, 'B5成分分析顯示可能有刺激性'),
('demo_335', '20000000-0000-4000-a000-000000000001', '質地', 'neutral', 0.45, 'B5質地沒變但誰敢繼續用')
ON CONFLICT DO NOTHING;

-- CeraVe W10: very positive, competitor advantage
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_296', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.88, 'CeraVe成為理膚寶水替代首選'),
('demo_303', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.90, 'CeraVe銷量因事件暴增CP值高'),
('demo_310', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.90, '敏感肌專屬修護組溫和不刺激'),
('demo_325', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.85, 'CeraVe品牌信任度逆勢上升'),
('demo_296', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.88, '保濕修護乳成為B5替代方案'),
('demo_310', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.82, '乳液質地溫和不刺激好吸收'),
('demo_325', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.85, '保濕效果穩定品質可靠')
ON CONFLICT DO NOTHING;

-- COSRX W10
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_300', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.80, 'COSRX搭配CeraVe新修復組合推薦'),
('demo_318', '10000000-0000-4000-a000-000000000004', '性價比', 'positive', 0.78, 'COSRX價格親民效果穩定'),
('demo_300', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.82, '蝸牛精華搭配CeraVe修復組合'),
('demo_318', '20000000-0000-4000-a000-000000000004', '質地', 'positive', 0.75, '新款質地更清爽好吸收')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W10
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_299', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.78, '鬍子茶年末感恩回饋活動'),
('demo_328', '10000000-0000-4000-a000-000000000006', '客服', 'positive', 0.75, '外送速度快服務態度好')
ON CONFLICT DO NOTHING;

-- 茶湯會 W10
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_304', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '茶湯會年度飲品回顧榜單出爐'),
('demo_317', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.80, '會員專屬飲品限定口味好喝'),
('demo_336', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.78, '年末優惠組合很划算')
ON CONFLICT DO NOTHING;

-- Persons W10
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_301', '30000000-0000-4000-a000-000000000001', '專業度', 'positive', 0.85, 'B5過敏事件專業分析非常到位'),
('demo_314', '30000000-0000-4000-a000-000000000004', '內容品質', 'positive', 0.80, '年度愛用品清單影片很有參考價值'),
('demo_326', '30000000-0000-4000-a000-000000000009', '互動', 'positive', 0.75, '粉絲問答直播互動超好')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W10
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_307', '10000000-0000-4000-a000-000000000008', '性價比', 'positive', 0.82, '寶雅年終特賣戰利品超多'),
('demo_333', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.80, '屈臣氏CeraVe又補貨了快去搶')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 11 (demo_341-420) — B5致敏性 EXPLODES, 成分安全 appears
-- ============================================================

-- 理膚寶水: 控油 ALL negative, 品牌信任 crashes
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_345', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.25, 'B5事件後連控油系列都讓人不敢用了'),
('demo_352', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.18, '出現大量過敏案例品牌還沒回應'),
('demo_358', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.30, '越用越油理膚寶水控油名不副實'),
('demo_365', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.15, '過敏事件持續延燒信任崩壞'),
('demo_372', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.28, '溫和修護比強效控油更重要理膚太刺激'),
('demo_380', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.20, '道歉聲明出來了但粉絲不買單'),
('demo_388', '10000000-0000-4000-a000-000000000001', '品牌形象', 'negative', 0.22, '品牌信任危機到底該相信誰'),
('demo_395', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.32, '換掉理膚寶水控油系列不再回購'),
('demo_405', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.25, '理膚寶水粉底還能用嗎信任受損'),
('demo_415', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.35, 'CeraVe vs理膚寶水控油太激進')
ON CONFLICT DO NOTHING;

-- B5: 致敏性 EXPLODES (8+ rows very negative), 成分安全 appears
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_345', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.08, 'B5讓我爆痘臉紅腫緊急停用'),
('demo_352', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.10, '出現大量過敏案例緊急警告B5'),
('demo_358', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.12, '過敏事件持續延燒B5是元凶'),
('demo_365', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.08, '我也是B5過敏受害者之一'),
('demo_372', '20000000-0000-4000-a000-000000000001', '成分安全', 'negative', 0.15, 'B5成分安全堪慮專家分析有問題'),
('demo_380', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.10, '道歉聲明出了但致敏問題沒解決'),
('demo_388', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.12, 'B5致敏成分專業解讀確認有問題'),
('demo_395', '20000000-0000-4000-a000-000000000001', '成分安全', 'negative', 0.18, '成分表有爭議不建議繼續使用'),
('demo_405', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.08, '過敏後該怎麼處理B5確定是禍首'),
('demo_405', '20000000-0000-4000-a000-000000000001', '保濕效果', 'negative', 0.25, 'B5修復效果被全面質疑'),
('demo_415', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.15, 'B5事件後護膚routine完全改了')
ON CONFLICT DO NOTHING;

-- CeraVe W11: very positive competitor surge
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_346', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.92, 'CeraVe成為B5替代首選銷量暴增'),
('demo_353', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.90, 'CeraVe價格超佛心大家都在搶'),
('demo_360', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.90, '敏感肌專屬修護組溫和不刺激'),
('demo_370', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.85, 'CeraVe品牌信任度持續上升'),
('demo_378', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.88, 'CeraVe在屈臣氏賣到缺貨大家搶'),
('demo_390', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.88, 'CeraVe全系列CP值都很高'),
('demo_400', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.90, '過敏急救指南推薦CeraVe安全替代'),
('demo_410', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.85, 'CeraVe快閃店免費試用品牌有誠意'),
('demo_346', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.90, '保濕修護乳成為B5替代首選'),
('demo_360', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.82, '乳液質地清爽好吸收'),
('demo_400', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.88, '急救推薦保濕修護乳效果佳')
ON CONFLICT DO NOTHING;

-- COSRX W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_355', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.80, 'COSRX搭配CeraVe成為新標配'),
('demo_385', '10000000-0000-4000-a000-000000000004', '性價比', 'positive', 0.78, 'COSRX皮膚科推薦清單上榜'),
('demo_355', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.82, '蝸牛精華搭配CeraVe效果更好'),
('demo_385', '20000000-0000-4000-a000-000000000004', '質地', 'positive', 0.78, '蝸牛精華皮膚科也推薦')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_350', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.80, '鬍子茶冬季草莓系列限定回歸'),
('demo_375', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.75, '鬍子茶新年限定包裝超可愛'),
('demo_350', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.80, '草莓牛奶限定回歸口感不變'),
('demo_375', '20000000-0000-4000-a000-000000000006', '價格', 'positive', 0.78, '新年限定木瓜牛奶買一送一')
ON CONFLICT DO NOTHING;

-- 茶湯會 W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_348', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.85, '茶湯會年度十大飲品排行出爐'),
('demo_362', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '新年限定飲品超有節日感'),
('demo_398', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.80, '新年組合價格實惠送禮也適合'),
('demo_362', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.82, '限定珍珠奶茶加紅豆超好喝')
ON CONFLICT DO NOTHING;

-- Persons W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_347', '30000000-0000-4000-a000-000000000001', '專業度', 'positive', 0.88, 'B5事件深度分析影片被大量轉發'),
('demo_368', '30000000-0000-4000-a000-000000000002', '內容品質', 'positive', 0.82, '年度保養品回顧影片製作精美'),
('demo_393', '30000000-0000-4000-a000-000000000003', '真實性', 'positive', 0.80, '分享過敏經驗很真實有同理心'),
('demo_408', '30000000-0000-4000-a000-000000000010', '業配', 'negative', 0.30, '業配比例太高失去公信力')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_356', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.82, '寶雅年終特賣好多CeraVe搶手貨'),
('demo_383', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.85, '屈臣氏CeraVe又賣到缺貨了'),
('demo_402', '10000000-0000-4000-a000-000000000008', '品牌形象', 'positive', 0.78, '寶雅開始主推CeraVe專區')
ON CONFLICT DO NOTHING;

-- 薇姿 W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_370', '10000000-0000-4000-a000-000000000002', '品牌信任', 'negative', 0.40, '薇姿跟理膚寶水同集團也受牽連'),
('demo_370', '20000000-0000-4000-a000-000000000002', '保濕效果', 'neutral', 0.50, '89瓶本身沒問題但品牌被牽連')
ON CONFLICT DO NOTHING;

-- Works W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_382', '60000000-0000-4000-a000-000000000001', '安全性', 'positive', 0.82, '這款成分安全經過多方認證'),
('demo_397', '60000000-0000-4000-a000-000000000002', '效果', 'positive', 0.78, '持續使用兩個月效果更明顯了')
ON CONFLICT DO NOTHING;

-- innisfree W11 (少量)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_403', '10000000-0000-4000-a000-000000000005', '品牌形象', 'neutral', 0.52, 'innisfree最近討論度很低存在感薄弱')
ON CONFLICT DO NOTHING;

-- 控油潔面乳 (product 8) W11
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_345', '20000000-0000-4000-a000-000000000008', '控油', 'negative', 0.35, 'B5事件後連控油潔面乳都讓人猶豫'),
('demo_395', '20000000-0000-4000-a000-000000000008', '控油', 'negative', 0.30, '換掉了理膚寶水控油潔面乳')
ON CONFLICT DO NOTHING;

-- ============================================================
-- WEEK 12 (demo_421-500) — crisis peak, CeraVe dominance
-- ============================================================

-- 理膚寶水: 控油 negative, 品牌信任 very negative
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_425', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.20, '理膚寶水控油根本沒用還會刺激'),
('demo_432', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.15, '理膚寶水品牌信任徹底崩盤'),
('demo_440', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.25, '越用越油理膚寶水控油是騙人的'),
('demo_448', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.18, '理膚寶水年度最失望品牌沒有之一'),
('demo_455', '10000000-0000-4000-a000-000000000001', '品牌形象', 'negative', 0.22, '理膚寶水從推薦變成避雷'),
('demo_465', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.30, '不再推薦理膚寶水給任何人'),
('demo_475', '10000000-0000-4000-a000-000000000001', '品牌信任', 'negative', 0.12, '這是我最後一次買理膚寶水了'),
('demo_485', '10000000-0000-4000-a000-000000000001', '控油', 'negative', 0.28, '控油系列全部換成CeraVe了')
ON CONFLICT DO NOTHING;

-- B5: 致敏性 continues exploding, 成分安全 continues
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_425', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.08, 'B5致敏事件受害者聯合聲明'),
('demo_432', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.10, 'B5讓我爆痘臉過敏嚴重'),
('demo_440', '20000000-0000-4000-a000-000000000001', '成分安全', 'negative', 0.12, 'B5成分安全性被專業機構質疑'),
('demo_448', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.10, '第三方檢測B5確實有致敏成分'),
('demo_455', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.08, 'B5是年度最糟保養品沒有之一'),
('demo_465', '20000000-0000-4000-a000-000000000001', '成分安全', 'negative', 0.15, '成分表有爭議建議停用B5'),
('demo_475', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.12, '過敏三個月了B5傷害還在持續'),
('demo_475', '20000000-0000-4000-a000-000000000001', '保濕效果', 'negative', 0.20, 'B5修復效果完全是假的'),
('demo_485', '20000000-0000-4000-a000-000000000001', '致敏性', 'negative', 0.10, 'B5致敏後改用CeraVe終於好了'),
('demo_495', '20000000-0000-4000-a000-000000000001', '成分安全', 'negative', 0.18, 'B5成分安全問題至今沒有解決')
ON CONFLICT DO NOTHING;

-- CeraVe W12: very positive peak, 敏感肌友善 dominant
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_422', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.93, 'CeraVe年度敏感肌最佳品牌當之無愧'),
('demo_430', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.90, 'CeraVe年終回顧CP值之王'),
('demo_438', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.91, 'CeraVe從替代品變成首選品牌'),
('demo_445', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.88, 'CeraVe全年品牌信任度第一'),
('demo_452', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.90, '敏感肌年度推薦CeraVe穩居榜首'),
('demo_460', '10000000-0000-4000-a000-000000000003', '性價比', 'positive', 0.88, 'CeraVe大容量新春組合超划算'),
('demo_470', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.92, '皮膚科年度推薦CeraVe排名第一'),
('demo_480', '10000000-0000-4000-a000-000000000003', '品牌信任', 'positive', 0.87, 'CeraVe用實力說話品牌口碑最佳'),
('demo_490', '10000000-0000-4000-a000-000000000003', '敏感肌友善', 'positive', 0.90, '新的一年繼續用CeraVe最安心'),
('demo_422', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.90, '保濕修護乳年度最佳保濕產品'),
('demo_438', '20000000-0000-4000-a000-000000000003', '質地', 'positive', 0.85, '乳液質地四季皆宜好吸收'),
('demo_460', '20000000-0000-4000-a000-000000000003', '價格', 'positive', 0.88, '新春組合保濕乳超划算'),
('demo_480', '20000000-0000-4000-a000-000000000003', '保濕效果', 'positive', 0.88, '保濕效果穩定全年無敗筆')
ON CONFLICT DO NOTHING;

-- COSRX W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_435', '10000000-0000-4000-a000-000000000004', '品牌形象', 'positive', 0.82, 'COSRX年度回顧痘疤護理首選'),
('demo_468', '10000000-0000-4000-a000-000000000004', '性價比', 'positive', 0.80, 'COSRX新春特價入手好時機'),
('demo_435', '20000000-0000-4000-a000-000000000004', '保濕效果', 'positive', 0.85, '蝸牛精華年度回顧持續好評'),
('demo_468', '20000000-0000-4000-a000-000000000004', '質地', 'positive', 0.78, '新款清爽精華質地升級了')
ON CONFLICT DO NOTHING;

-- 鬍子茶 W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_428', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.80, '鬍子茶新春限定紅包飲品超可愛'),
('demo_458', '10000000-0000-4000-a000-000000000006', '客服', 'positive', 0.78, '新年期間服務依然很好'),
('demo_488', '10000000-0000-4000-a000-000000000006', '品牌形象', 'positive', 0.82, '鬍子茶年度十大飲品回顧'),
('demo_428', '20000000-0000-4000-a000-000000000006', '質地', 'positive', 0.82, '新春限定木瓜牛奶加了紅豆'),
('demo_488', '20000000-0000-4000-a000-000000000006', '吸收速度', 'positive', 0.80, '木瓜牛奶穩居年度最愛飲品')
ON CONFLICT DO NOTHING;

-- 茶湯會 W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_426', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.85, '茶湯會新年限定飲品超受歡迎'),
('demo_442', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.82, '茶湯會年度回顧最受歡迎品牌'),
('demo_472', '10000000-0000-4000-a000-000000000007', '性價比', 'positive', 0.80, '新春優惠組合送禮自用都划算'),
('demo_492', '10000000-0000-4000-a000-000000000007', '品牌形象', 'positive', 0.85, '茶湯會持續成長年度表現最佳'),
('demo_442', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.85, '珍珠奶茶年度回顧口感最佳'),
('demo_472', '20000000-0000-4000-a000-000000000007', '質地', 'positive', 0.80, '新春限定珍珠加湯圓超好喝')
ON CONFLICT DO NOTHING;

-- Persons W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_427', '30000000-0000-4000-a000-000000000001', '內容品質', 'positive', 0.85, '年度總結影片非常有深度'),
('demo_443', '30000000-0000-4000-a000-000000000005', '專業度', 'positive', 0.82, '年度保養品評比非常專業'),
('demo_462', '30000000-0000-4000-a000-000000000002', '真實性', 'positive', 0.80, '年度使用心得很真實不業配'),
('demo_478', '30000000-0000-4000-a000-000000000006', '互動', 'positive', 0.78, '新年直播送禮粉絲互動超好'),
('demo_498', '30000000-0000-4000-a000-000000000004', '表達力', 'positive', 0.82, '年度回顧影片表達流暢有感染力')
ON CONFLICT DO NOTHING;

-- 寶雅 + 屈臣氏 W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_433', '10000000-0000-4000-a000-000000000008', '通路方便', 'positive', 0.85, '寶雅新年特賣CeraVe專區好買'),
('demo_450', '10000000-0000-4000-a000-000000000009', '性價比', 'positive', 0.82, '屈臣氏新春優惠超多好划算'),
('demo_473', '10000000-0000-4000-a000-000000000008', '品牌形象', 'positive', 0.80, '寶雅年度最佳通路美妝專區完整'),
('demo_493', '10000000-0000-4000-a000-000000000009', '通路方便', 'positive', 0.82, '屈臣氏新年補貨保養品齊全')
ON CONFLICT DO NOTHING;

-- 薇姿 W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_456', '10000000-0000-4000-a000-000000000002', '品牌信任', 'negative', 0.38, '薇姿因同集團也被波及銷量下滑'),
('demo_456', '20000000-0000-4000-a000-000000000002', '保濕效果', 'neutral', 0.50, '89瓶效果還行但品牌被牽連')
ON CONFLICT DO NOTHING;

-- innisfree W12 (少量)
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_487', '10000000-0000-4000-a000-000000000005', '品牌形象', 'neutral', 0.50, 'innisfree年度回顧存在感依然很低')
ON CONFLICT DO NOTHING;

-- 控油潔面乳 (product 8) W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_425', '20000000-0000-4000-a000-000000000008', '控油', 'negative', 0.30, '控油潔面乳也被牽連不敢用了'),
('demo_465', '20000000-0000-4000-a000-000000000008', '控油', 'negative', 0.28, '換掉理膚寶水控油潔面乳永不回購')
ON CONFLICT DO NOTHING;

-- 綠茶籽 (product 5) W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_487', '20000000-0000-4000-a000-000000000005', '保濕效果', 'neutral', 0.52, '綠茶籽精華保濕OK但沒什麼驚喜')
ON CONFLICT DO NOTHING;

-- Works W12
INSERT INTO entity_aspects (post_id, object_id, aspect, sentiment, sentiment_score, mention_text) VALUES
('demo_446', '60000000-0000-4000-a000-000000000001', '效果', 'positive', 0.82, '年度回顧這款效果最令人滿意'),
('demo_476', '60000000-0000-4000-a000-000000000003', '成分', 'positive', 0.80, '成分天然全年使用沒有不適')
ON CONFLICT DO NOTHING;

COMMIT;
