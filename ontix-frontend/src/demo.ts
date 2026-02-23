/**
 * Demo Mode — intercepts all /api/* fetch calls with rich mock data.
 * Import this file in main.tsx to activate: import './demo'
 * Delete the import to disable.
 *
 * Domain: Taiwan Mobile (台灣大哥大) IMC telecom scenario explorer
 */

import type {
  EntitySummary,
  EntityDetail,
  EntityDetailStats,
  EntityObservation,
  AspectSummary,
  MentionItem,
  LinkItem,
  InboxFact,
  DashboardResponse,
} from './types'

// ────────────────────────────────────────────
// 1. Entities (68 items across 8 types)
// ────────────────────────────────────────────

const ENTITIES: EntitySummary[] = [
  // ── Brands (9) ──
  // 2023/12 台灣之星併入台灣大、亞太併入遠傳，形成電信新三雄
  // 市佔率：中華電信 39.42%、台灣大 31.97%、遠傳 28.61%（2025Q3 NCC 統計）
  // 台灣大用戶數 929 萬、5G 用戶 344 萬（滲透率 37%）、2024 EPS $4.57（六年新高）
  { id: 'b001', canonical_name: '台灣大哥大', type: 'brand', sub_type: 'telecom', mention_count: 284, aspect_count: 16, avg_sentiment: 0.69 },
  // 中華電信市佔 39.42%、5G滲透率 46.4%、月租型ARPU $582（最高）、啟動 5G SA、Nokia 5G NR CA 2.34Gbps、2025全年營收 $2,361億（歷史新高）
  { id: 'b002', canonical_name: '中華電信', type: 'brand', sub_type: 'telecom', mention_count: 168, aspect_count: 10, avg_sentiment: 0.74 },
  // 遠傳 5G滲透率 47.8%（三雄最高）、5G availability 36.1%（最高）、與 Ericsson/OPPO 展示 5G SA、「優雅樂活服務」跨界搶客
  { id: 'b003', canonical_name: '遠傳電信', type: 'brand', sub_type: 'telecom', mention_count: 195, aspect_count: 12, avg_sentiment: 0.64 },
  { id: 'b004', canonical_name: '台灣之星（已併入台灣大）', type: 'brand', sub_type: 'telecom_legacy', mention_count: 92, aspect_count: 7, avg_sentiment: 0.44 },
  // 亞太電信網路 2025/12/31 正式關閉
  { id: 'b005', canonical_name: '亞太電信（已併入遠傳）', type: 'brand', sub_type: 'telecom_legacy', mention_count: 74, aspect_count: 6, avg_sentiment: 0.42 },
  { id: 'b006', canonical_name: 'LINE MOBILE', type: 'brand', sub_type: 'mvno', mention_count: 48, aspect_count: 6, avg_sentiment: 0.72 },
  { id: 'b007', canonical_name: 'Apple Taiwan', type: 'brand', sub_type: 'device', mention_count: 68, aspect_count: 6, avg_sentiment: 0.84 },
  { id: 'b008', canonical_name: 'Samsung Taiwan', type: 'brand', sub_type: 'device', mention_count: 52, aspect_count: 5, avg_sentiment: 0.77 },
  // Perplexity AI 為台灣大新合作夥伴，$599 以上方案免費 Perplexity Pro 一年（價值 $8,280）
  { id: 'b009', canonical_name: 'Perplexity AI', type: 'brand', sub_type: 'tech_partner', mention_count: 42, aspect_count: 4, avg_sentiment: 0.88 },

  // ── Products (20) ──
  // 實際資費：5G $599(12Mbps)/$799(21Mbps)/$999(50Mbps)/$1199/$1399(不限速)
  // 4G 吃到飽不降速 $588；漫遊日租 $219/日、計量 $499/3GB~$999/10GB
  { id: 'p001', canonical_name: '5G $1399 不限速吃到飽', type: 'product', sub_type: 'plan', mention_count: 192, aspect_count: 10, avg_sentiment: 0.73 },
  { id: 'p002', canonical_name: '出國漫遊日租 $219/日', type: 'product', sub_type: 'roaming', mention_count: 148, aspect_count: 9, avg_sentiment: 0.42 },
  { id: 'p003', canonical_name: 'myVideo 影音隨看', type: 'product', sub_type: 'ott', mention_count: 115, aspect_count: 8, avg_sentiment: 0.76 },
  { id: 'p004', canonical_name: '光纖寬頻 1G', type: 'product', sub_type: 'broadband', mention_count: 88, aspect_count: 6, avg_sentiment: 0.69 },
  { id: 'p005', canonical_name: '家庭共享方案', type: 'product', sub_type: 'plan', mention_count: 78, aspect_count: 5, avg_sentiment: 0.74 },
  { id: 'p006', canonical_name: '國際通話加值包', type: 'product', sub_type: 'addon', mention_count: 44, aspect_count: 4, avg_sentiment: 0.61 },
  { id: 'p007', canonical_name: 'mo 幣多專案', type: 'product', sub_type: 'rewards', mention_count: 65, aspect_count: 5, avg_sentiment: 0.62 },
  { id: 'p008', canonical_name: 'IoT 居家監控方案', type: 'product', sub_type: 'iot', mention_count: 18, aspect_count: 2, avg_sentiment: 0.72 },
  { id: 'p009', canonical_name: '4G $499 輕速吃到飽', type: 'product', sub_type: 'plan', mention_count: 72, aspect_count: 6, avg_sentiment: 0.68 },
  // 影音多享組升級為 5 平台：Netflix + Disney+ + Max + myVideo + KKBOX
  { id: 'p010', canonical_name: '影音多享組（5平台）', type: 'product', sub_type: 'ott_bundle', mention_count: 86, aspect_count: 6, avg_sentiment: 0.81 },
  { id: 'p011', canonical_name: '企業行動方案', type: 'product', sub_type: 'enterprise', mention_count: 34, aspect_count: 4, avg_sentiment: 0.64 },
  { id: 'p012', canonical_name: 'eSIM 漫遊卡', type: 'product', sub_type: 'roaming', mention_count: 56, aspect_count: 5, avg_sentiment: 0.66 },
  { id: 'p013', canonical_name: '5G $599 輕速吃到飽', type: 'product', sub_type: 'plan', mention_count: 82, aspect_count: 4, avg_sentiment: 0.65 },
  { id: 'p014', canonical_name: 'myfone 購物', type: 'product', sub_type: 'ecommerce', mention_count: 42, aspect_count: 4, avg_sentiment: 0.71 },
  { id: 'p015', canonical_name: '5G $999 中速吃到飽', type: 'product', sub_type: 'plan', mention_count: 55, aspect_count: 4, avg_sentiment: 0.72 },
  { id: 'p016', canonical_name: '4G $588 不降速吃到飽', type: 'product', sub_type: 'plan', mention_count: 95, aspect_count: 6, avg_sentiment: 0.74 },
  // 2025/9 上線：$599 以上方案免費 Perplexity Pro 一年（市價 $8,280）
  { id: 'p017', canonical_name: 'Perplexity Pro 方案', type: 'product', sub_type: 'ai_addon', mention_count: 58, aspect_count: 5, avg_sentiment: 0.86 },
  // 2025/10 上線：車聯網方案，BMW 車主專屬 $299/月 獨立門號
  { id: 'p018', canonical_name: 'BMW One Number 車聯網', type: 'product', sub_type: 'iot', mention_count: 32, aspect_count: 4, avg_sentiment: 0.82 },
  // 2026/1 上線：Amazon Prime Video 月租 $120，搭配 5G 方案折 $60
  { id: 'p019', canonical_name: 'Prime Video 月租方案', type: 'product', sub_type: 'ott', mention_count: 45, aspect_count: 5, avg_sentiment: 0.79 },
  // Opensignal 評測台灣大整體影音體驗 73.2 分（三雄最高）、5G 影音體驗蟬聯冠軍
  { id: 'p020', canonical_name: '5G 影音優化服務', type: 'product', sub_type: 'network', mention_count: 28, aspect_count: 3, avg_sentiment: 0.84 },

  // ── Scenarios (10) ──
  { id: 's001', canonical_name: '出國旅遊', type: 'scenario', sub_type: 'travel', mention_count: 214, aspect_count: 8, avg_sentiment: 0.64 },
  { id: 's002', canonical_name: '居家追劇', type: 'scenario', sub_type: 'entertainment', mention_count: 165, aspect_count: 6, avg_sentiment: 0.78 },
  { id: 's003', canonical_name: '通勤娛樂', type: 'scenario', sub_type: 'commute', mention_count: 132, aspect_count: 5, avg_sentiment: 0.66 },
  { id: 's004', canonical_name: '遠距辦公', type: 'scenario', sub_type: 'remote_work', mention_count: 108, aspect_count: 5, avg_sentiment: 0.62 },
  { id: 's005', canonical_name: '寵物在家監控', type: 'scenario', sub_type: 'iot_home', mention_count: 82, aspect_count: 4, avg_sentiment: 0.81 },
  { id: 's006', canonical_name: '校園學生上網', type: 'scenario', sub_type: 'student', mention_count: 76, aspect_count: 4, avg_sentiment: 0.70 },
  { id: 's007', canonical_name: '親子數位學習', type: 'scenario', sub_type: 'education', mention_count: 58, aspect_count: 4, avg_sentiment: 0.73 },
  { id: 's008', canonical_name: '直播帶貨', type: 'scenario', sub_type: 'livestream', mention_count: 45, aspect_count: 3, avg_sentiment: 0.69 },
  { id: 's009', canonical_name: '長輩智慧手機', type: 'scenario', sub_type: 'senior', mention_count: 52, aspect_count: 4, avg_sentiment: 0.56 },
  { id: 's010', canonical_name: '露營戶外上網', type: 'scenario', sub_type: 'outdoor', mention_count: 38, aspect_count: 3, avg_sentiment: 0.67 },

  // ── Persons / KOL (8) ──
  // 李珠珢：2025 年度代言人「AI 女神」，韓國啦啦隊員，三振舞 YouTube 破億觀看
  { id: 'k001', canonical_name: '李珠珢', type: 'person', sub_type: 'brand_ambassador', mention_count: 88, aspect_count: 5, avg_sentiment: 0.86 },
  { id: 'k002', canonical_name: '3cTim 哥', type: 'person', sub_type: 'kol', mention_count: 62, aspect_count: 5, avg_sentiment: 0.75 },
  { id: 'k003', canonical_name: '蔡阿嘎', type: 'person', sub_type: 'kol', mention_count: 68, aspect_count: 3, avg_sentiment: 0.52 },
  { id: 'k004', canonical_name: '志祺七七', type: 'person', sub_type: 'kol', mention_count: 42, aspect_count: 3, avg_sentiment: 0.88 },
  { id: 'k005', canonical_name: '電獺少女', type: 'person', sub_type: 'kol', mention_count: 38, aspect_count: 4, avg_sentiment: 0.81 },
  { id: 'k006', canonical_name: 'Joeman', type: 'person', sub_type: 'kol', mention_count: 48, aspect_count: 4, avg_sentiment: 0.70 },
  { id: 'k007', canonical_name: '束褲3C團', type: 'person', sub_type: 'kol', mention_count: 35, aspect_count: 3, avg_sentiment: 0.77 },
  { id: 'k008', canonical_name: '阿滴英文', type: 'person', sub_type: 'kol', mention_count: 52, aspect_count: 4, avg_sentiment: 0.82 },

  // ── Places (8) ──
  // myfone 為台灣大直營門市品牌；松山文創為 iPhone 17 首賣會場
  { id: 'l001', canonical_name: 'myfone 松山文創旗艦店', type: 'place', sub_type: 'store', mention_count: 58, aspect_count: 5, avg_sentiment: 0.78 },
  { id: 'l002', canonical_name: '桃園機場電信櫃台', type: 'place', sub_type: 'counter', mention_count: 45, aspect_count: 4, avg_sentiment: 0.52 },
  { id: 'l003', canonical_name: 'myfone 台北車站門市', type: 'place', sub_type: 'store', mention_count: 39, aspect_count: 3, avg_sentiment: 0.66 },
  { id: 'l004', canonical_name: 'myfone 高雄夢時代門市', type: 'place', sub_type: 'store', mention_count: 24, aspect_count: 3, avg_sentiment: 0.71 },
  { id: 'l005', canonical_name: 'myfone 台中大遠百門市', type: 'place', sub_type: 'store', mention_count: 28, aspect_count: 4, avg_sentiment: 0.74 },
  { id: 'l006', canonical_name: 'myfone 新竹巨城門市', type: 'place', sub_type: 'store', mention_count: 18, aspect_count: 3, avg_sentiment: 0.69 },
  { id: 'l007', canonical_name: 'myfone 信義威秀門市', type: 'place', sub_type: 'store', mention_count: 32, aspect_count: 4, avg_sentiment: 0.72 },
  { id: 'l008', canonical_name: 'myfone 板橋環球門市', type: 'place', sub_type: 'store', mention_count: 20, aspect_count: 3, avg_sentiment: 0.72 },

  // ── Events (12) ──
  // 台台併：NCC 統計客訴 97 件，合併後第二期帳單未繳即斷網政策引發爭議
  { id: 'e001', canonical_name: '台台併網路整合', type: 'event', sub_type: 'merger', mention_count: 92, aspect_count: 7, avg_sentiment: 0.44 },
  // iPhone 17 於 2025/9/19 在台首賣，台灣大在松山文創辦 F1 主題首賣會
  { id: 'e002', canonical_name: 'iPhone 17 首賣會', type: 'event', sub_type: 'launch', mention_count: 92, aspect_count: 6, avg_sentiment: 0.83 },
  // MWC 2026（2/24-27）：遠傳+Ericsson+OPPO 展示 5G SA 台北大巨蛋 4 萬人實測
  { id: 'e003', canonical_name: 'MWC 2026', type: 'event', sub_type: 'conference', mention_count: 45, aspect_count: 4, avg_sentiment: 0.76 },
  { id: 'e004', canonical_name: '雙 11 電信節', type: 'event', sub_type: 'campaign', mention_count: 68, aspect_count: 5, avg_sentiment: 0.72 },
  // Galaxy S26 Unpacked 預定 2026/2/26，Galaxy AI 2.0 為賣點
  { id: 'e005', canonical_name: 'Galaxy S26 Unpacked', type: 'event', sub_type: 'launch', mention_count: 62, aspect_count: 5, avg_sentiment: 0.82 },
  { id: 'e006', canonical_name: '春節漫遊促銷', type: 'event', sub_type: 'campaign', mention_count: 42, aspect_count: 4, avg_sentiment: 0.65 },
  { id: 'e007', canonical_name: '李珠珢代言發表會', type: 'event', sub_type: 'campaign', mention_count: 48, aspect_count: 4, avg_sentiment: 0.82 },
  // iPhone Air（2026 春季）：6.6mm 超薄、eSIM-only 無實體 SIM 卡槽，衝擊電信門市實體 SIM 業務
  { id: 'e008', canonical_name: 'iPhone Air 發表（eSIM-only）', type: 'event', sub_type: 'launch', mention_count: 78, aspect_count: 6, avg_sentiment: 0.75 },
  // 亞太電信網路 2025/12/31 正式關閉，用戶全面轉遠傳
  { id: 'e009', canonical_name: '亞太電信網路關閉', type: 'event', sub_type: 'merger', mention_count: 55, aspect_count: 5, avg_sentiment: 0.38 },
  // 台灣大 2025 獲 CSEA 卓越客服大獎
  { id: 'e010', canonical_name: '2025 CSEA 卓越客服大獎', type: 'event', sub_type: 'award', mention_count: 22, aspect_count: 3, avg_sentiment: 0.90 },
  // 台灣大 x Perplexity AI 合作發表會（2025/9）
  { id: 'e011', canonical_name: 'Perplexity AI 合作發表', type: 'event', sub_type: 'launch', mention_count: 38, aspect_count: 4, avg_sentiment: 0.87 },
  // 2026/1 台灣大 EPS $0.46，超越中華電信成為電信獲利王
  { id: 'e012', canonical_name: '2026Q1 電信獲利王', type: 'event', sub_type: 'financial', mention_count: 35, aspect_count: 3, avg_sentiment: 0.82 },

  // ── Organizations (8) ──
  // NCC：5G 用戶滿意度從 7.49 降至 7.34；全國 5G 基地台 64,106 座（佔 52.1%）
  { id: 'o001', canonical_name: 'NCC 通訊傳播委員會', type: 'organization', sub_type: 'regulator', mention_count: 48, aspect_count: 4, avg_sentiment: 0.46 },
  { id: 'o002', canonical_name: '公平交易委員會', type: 'organization', sub_type: 'regulator', mention_count: 28, aspect_count: 2, avg_sentiment: 0.50 },
  { id: 'o003', canonical_name: '消費者保護協會', type: 'organization', sub_type: 'ngo', mention_count: 28, aspect_count: 3, avg_sentiment: 0.45 },
  { id: 'o004', canonical_name: 'Google Taiwan', type: 'organization', sub_type: 'tech', mention_count: 22, aspect_count: 2, avg_sentiment: 0.82 },
  { id: 'o005', canonical_name: '電信工會', type: 'organization', sub_type: 'union', mention_count: 15, aspect_count: 2, avg_sentiment: 0.50 },
  { id: 'o006', canonical_name: '數位發展部', type: 'organization', sub_type: 'regulator', mention_count: 18, aspect_count: 3, avg_sentiment: 0.55 },
  // Opensignal：國際電信網路體驗評測機構，台灣大 5G 影音體驗蟬聯冠軍
  { id: 'o007', canonical_name: 'Opensignal', type: 'organization', sub_type: 'research', mention_count: 18, aspect_count: 2, avg_sentiment: 0.78 },
  // Ericsson：遠傳 5G SA 合作夥伴
  { id: 'o008', canonical_name: 'Ericsson', type: 'organization', sub_type: 'tech', mention_count: 15, aspect_count: 2, avg_sentiment: 0.80 },
]

// ────────────────────────────────────────────
// 2. Signals / Inbox Facts (48 items)
// ────────────────────────────────────────────

function isoDate(daysAgo: number): string {
  const d = new Date('2026-02-07T08:00:00Z')
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

const SIGNALS: InboxFact[] = [
  // ── Critical (6) ──
  { id: 1, object_id: 'p002', entity_name: '出國漫遊日租 $219/日', entity_type: 'product', fact_type: 'alert', severity: 'critical', title: '出國漫遊負評激增 +180%', description: '出國漫遊方案近一週負面提及從 12 增至 34，多則負評指出日本漫遊斷線、速度不穩、費用計算不透明等問題。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 2, object_id: 'b002', entity_name: '中華電信', entity_type: 'brand', fact_type: 'alert', severity: 'critical', title: '競品中華電信推出 $499 吃到飽', description: '中華電信本週推出限時 5G $499 吃到飽方案，社群討論量暴增 320%，大量消費者表示考慮攜碼轉出台灣大。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 3, object_id: 'l002', entity_name: '桃園機場電信櫃台', entity_type: 'place', fact_type: 'risk_signal', severity: 'critical', title: '機場櫃台服務滿意度驟降 -42%', description: '春節出國潮期間，桃園機場電信櫃台排隊時間過長、臨時卡供貨不足，旅客抱怨激增。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 4, object_id: 'b001', entity_name: '台灣大哥大', entity_type: 'brand', fact_type: 'alert', severity: 'critical', title: '合併後斷網政策引發客訴風暴', description: '原台灣之星用戶反映合併後帳單政策改變：第二期帳單未繳即直接停話，相較原台灣之星較寬鬆的催繳機制差異大。PTT/Dcard 爆文觀看數破 10 萬，NCC 已收到 97 件客訴。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 5, object_id: 'p007', entity_name: 'mo 幣多專案', entity_type: 'product', fact_type: 'risk_signal', severity: 'critical', title: 'mo 幣多點數系統疑遭盜用', description: '多名用戶反映 mo 幣多帳戶點數（等值 momo 購物金）遭不明消費扣除，社群討論已被主流媒體轉載，消費者對台灣大會員系統信任度下降。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 51, object_id: 'b003', entity_name: '遠傳電信', entity_type: 'brand', fact_type: 'alert', severity: 'critical', title: '遠傳 5G SA 實測領先，台灣大技術差距擴大', description: '遠傳攜手 Ericsson 與 OPPO 於台北大巨蛋 4 萬人演唱會成功實測 5G SA 獨立組網，並將在 MWC 2026 展示成果。台灣大尚無公開 5G SA 進展，技術形象落後風險升高。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },

  // ── Warning (10) ──
  { id: 6, object_id: 'p007', entity_name: 'mo 幣多專案', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '「台灣大哥大」APP 閃退投訴增加 +65%', description: '台灣大哥大 APP 近期 Android 更新後閃退頻繁、mo 幣多專案入口消失，Google Play 評分從 4.2 降至 3.5，用戶抱怨無法正常查帳單與使用 mo 幣。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 7, object_id: 'b001', entity_name: '台灣大哥大', entity_type: 'brand', fact_type: 'trend', severity: 'warning', title: '品牌 NPS 連續 3 月下滑', description: '台灣大哥大淨推薦值從 42 降至 35，主要受費率爭議與客服體驗不佳影響。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 8, object_id: 'k003', entity_name: '蔡阿嘎', entity_type: 'person', fact_type: 'risk_signal', severity: 'warning', title: 'KOL 蔡阿嘎對台灣大負面評價', description: '蔡阿嘎在最新影片中抱怨台灣大網速不穩，影片觀看數已達 80 萬，負面留言持續增加。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 9, object_id: 's003', entity_name: '通勤娛樂', entity_type: 'scenario', fact_type: 'trend', severity: 'warning', title: '捷運地下段網路斷線抱怨 +85%', description: '通勤族反映台北捷運地下段 5G 訊號頻繁中斷，影響串流影音體驗，競品中華電信表現更穩定。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 10, object_id: 'p004', entity_name: '光纖寬頻 1G', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '實測速度未達標投訴 +30%', description: '多位用戶反映光纖 1G 方案實測下載僅 300-400Mbps，與宣傳不符。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 11, object_id: 'b003', entity_name: '遠傳電信', entity_type: 'brand', fact_type: 'alert', severity: 'warning', title: '遠傳 ARPU $527.7 三雄最高，價值策略奏效', description: '遠傳電信 ARPU 達 $527.7 為三雄最高，5G availability 36.1% 也居冠。亞太電信網路 2025/12/31 正式關閉後用戶全面轉遠傳。遠傳攜 Ericsson 於台北大巨蛋 4 萬人演唱會實測 5G SA，技術形象領先。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 12, object_id: 'p009', entity_name: '4G $499 輕速吃到飽', entity_type: 'product', fact_type: 'risk_signal', severity: 'warning', title: '4G 輕速方案限速引發不滿 +40%', description: '4G $499 輕速吃到飽用戶反映最高速率限制 21Mbps 實際上只有 5-10Mbps，尖峰時段更低，無法正常觀看高畫質串流影音。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 13, object_id: 's009', entity_name: '長輩智慧手機', entity_type: 'scenario', fact_type: 'trend', severity: 'warning', title: '長輩被詐騙 APP 投訴 +120%', description: '長輩族群因不熟悉手機操作，誤點詐騙 APP 導致小額付款扣款，家屬投訴台灣大未設防護機制。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 14, object_id: 'o003', entity_name: '消費者保護協會', entity_type: 'organization', fact_type: 'alert', severity: 'warning', title: '消保會點名電信合約陷阱', description: '消費者保護協會公開點名三大電信合約條款不透明，台灣大被列為申訴案件數第二多的電信商。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 15, object_id: 'k006', entity_name: 'Joeman', entity_type: 'person', fact_type: 'risk_signal', severity: 'warning', title: 'Joeman 實測 5G 速度影片引議論', description: 'Joeman 在最新影片中實測各家 5G 速度，台灣大在 3 個測試點中排名最後，影片觀看數 120 萬。豪宅實測系列觀眾信任度高，對品牌衝擊顯著。', is_read: false, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 63, object_id: 'b003', entity_name: '遠傳電信', entity_type: 'brand', fact_type: 'risk_signal', severity: 'warning', title: '遠傳「優雅樂活服務」跨界搶客', description: '遠傳推出「優雅樂活服務」月付 $666/30 個月，結合 5G + 健身房課程 + 線上學習 + 美食餐飲 + 博物館門票 + 機場接送。打破傳統電信框架，以生活方案搶年輕/中產客群，對台灣大影音差異化形成競爭。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 64, object_id: 'o001', entity_name: 'NCC 通訊傳播委員會', entity_type: 'organization', fact_type: 'risk_signal', severity: 'warning', title: '4G 基地台銳減 17.5% 引發爭議', description: 'NCC 統計 4G 基地台執照數一個月內從 7 萬多張降至 5.8 萬張（-17.5%），5G 基地台 64,106 座首度超越 4G（52.1%）。引發「電信業者強迫 4G 用戶升級 5G」質疑，輿論關注度持續升高。電信協會澄清部分為統計口徑調整。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },

  // ── Info (22) ──
  { id: 16, object_id: 's002', entity_name: '居家追劇', entity_type: 'scenario', fact_type: 'trend', severity: 'info', title: '居家追劇情境聲量穩定成長 +18%', description: '消費者持續討論居家影音需求，myVideo 與寬頻綁定方案獲得正面評價。影音多享組升級為 5 平台（Netflix+Disney++Max+myVideo+KKBOX）後滿意度進一步提升。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 17, object_id: 'p001', entity_name: '5G $1399 不限速吃到飽', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '5G 用戶突破 344 萬，滲透率 37%', description: '台灣大 5G 用戶達 344 萬（佔總用戶 929 萬的 37%），$1399 不限速方案為主力。但 74% 的 4G 用戶仍表示「4G 已足夠」而拒絕升級，連續三年為未升級主因。全國 5G 基地台已達 64,106 座（佔 52.1%）。', is_read: true, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 18, object_id: 'e002', entity_name: 'iPhone 17 首賣會', entity_type: 'event', fact_type: 'trend', severity: 'info', title: 'iPhone 17 首賣帶動綁約討論', description: 'iPhone 17 首賣活動台灣大在松山文創辦 F1 主題首賣會，帶動各家電信綁約方案比較討論，台灣大佔比 35%。$1399 方案搭 iPhone 17(256GB) 可 $0 入手。', is_read: true, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 19, object_id: 'p003', entity_name: 'myVideo', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'myVideo 獨家內容獲好評', description: 'myVideo 獨家上架韓劇引發討論熱潮，帶動新訂閱數成長 25%。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 20, object_id: 'k001', entity_name: '李珠珢', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '代言人李珠珢形象廣告反應熱烈', description: '台灣大年度代言人李珠珢「AI 神展開、台灣大可能」品牌形象影片上線，線上數位廣告累積逾 2,000 萬次瀏覽，品牌好感度提升顯著。「三振舞」話題持續帶動年輕族群關注。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 21, object_id: 's004', entity_name: '遠距辦公', entity_type: 'scenario', fact_type: 'trend', severity: 'info', title: '遠距辦公穩定需求', description: '遠距辦公情境討論穩定，消費者關注網路穩定度與視訊會議品質。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 22, object_id: 'k004', entity_name: '志祺七七', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '志祺七七 5G 科普影片正面', description: '志祺七七製作 5G 科普影片，間接提升台灣大品牌好感度。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },
  { id: 23, object_id: 's006', entity_name: '校園學生上網', entity_type: 'scenario', fact_type: 'trend', severity: 'info', title: '學生族群討論低價吃到飽方案', description: '開學季學生族群密集討論 4G $499 以下的吃到飽方案，價格與限速門檻為首要考量，LINE MOBILE 的低月租方案也引發比較。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },
  { id: 24, object_id: 'e004', entity_name: '雙 11 電信節', entity_type: 'event', fact_type: 'trend', severity: 'info', title: '雙 11 檔期預熱討論量 +55%', description: '雙 11 電信促銷活動預告引發大量比價討論，消費者期待更大優惠力度。', is_read: true, created_at: isoDate(7), period_start: '2026-01-27', period_type: 'week' },
  { id: 25, object_id: 'p010', entity_name: '影音多享組（5平台）', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '影音多享組升級 5 平台，訂閱成長 +35%', description: '台灣大「影音多享組」升級為 5 平台（Netflix+Disney++Max+myVideo+KKBOX），一站訂閱大受歡迎。搭配 5G 方案優惠帶動訂閱成長，Opensignal 評測台灣大整體影音體驗 73.2 分為三雄最高。', is_read: true, created_at: isoDate(7), period_start: '2026-01-27', period_type: 'week' },
  { id: 26, object_id: 'k002', entity_name: '3cTim 哥', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '3cTim 哥推薦家庭方案', description: '3cTim 哥在 YouTube 詳細比較各家家庭方案，推薦台灣大家庭共享方案 CP 值最高。', is_read: true, created_at: isoDate(7), period_start: '2026-01-27', period_type: 'week' },
  { id: 27, object_id: 's007', entity_name: '親子數位學習', entity_type: 'scenario', fact_type: 'trend', severity: 'info', title: '線上教育平台流量需求 +22%', description: '寒假期間家長討論兒童線上課程平台使用，對穩定且安全的上網環境需求增加。', is_read: true, created_at: isoDate(8), period_start: '2026-01-20', period_type: 'week' },
  { id: 28, object_id: 'b006', entity_name: 'LINE MOBILE', entity_type: 'brand', fact_type: 'trend', severity: 'info', title: 'LINE MOBILE 價格優勢受關注', description: 'LINE MOBILE 低月租方案在 Dcard 討論度上升，消費者比較其與台灣大學生方案的差異。', is_read: true, created_at: isoDate(8), period_start: '2026-01-20', period_type: 'week' },
  { id: 29, object_id: 'e005', entity_name: 'Galaxy S26 Unpacked', entity_type: 'event', fact_type: 'trend', severity: 'info', title: 'Galaxy S26 Unpacked 2/26 引爆期待', description: 'Samsung Galaxy S26 Unpacked 預定 2026/2/26 發表，Galaxy AI 2.0 成最大賣點。各家電信綁約方案比價討論量已開始攀升 +180%，台灣大預購頁面提前上線。', is_read: true, created_at: isoDate(8), period_start: '2026-01-20', period_type: 'week' },
  { id: 30, object_id: 'l005', entity_name: 'myfone 台中大遠百門市', entity_type: 'place', fact_type: 'trend', severity: 'info', title: '台中門市服務評價上升', description: '台中大遠百門市服務流程改善，Google 評分從 3.8 升至 4.3，顧客好評增加。', is_read: true, created_at: isoDate(9), period_start: '2026-01-20', period_type: 'week' },
  // ── New real-data signals ──
  { id: 52, object_id: 'p017', entity_name: 'Perplexity Pro 方案', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'Perplexity Pro 免費送引爆社群話題', description: '台灣大與 Perplexity AI 合作，$599 以上方案免費贈送 Perplexity Pro 一年（市價 $8,280）。PTT/Dcard 討論量 +450%，被評為「2025 最有感電信加值服務」，帶動 5G $599 方案新申辦成長。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 53, object_id: 'p018', entity_name: 'BMW One Number 車聯網', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'BMW One Number 車聯網方案上市', description: '台灣大推出全台首個車聯網方案 BMW One Number，$299/月車內獨立門號，可通話/上網/緊急救援。汽車論壇討論熱烈，BMW 車主好評率 92%，開啟車聯網商機。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 54, object_id: 'p019', entity_name: 'Prime Video 月租方案', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'Prime Video 月租 $120 吸引歐美劇迷', description: '台灣大獨家推出 Amazon Prime Video 月租方案 $120（搭 5G 方案折 $60），補強歐美劇/原創內容缺口。搭配影音多享組形成全球最完整 OTT 訂閱生態系。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },
  { id: 55, object_id: 'e008', entity_name: 'iPhone Air 發表（eSIM-only）', entity_type: 'event', fact_type: 'trend', severity: 'info', title: 'iPhone Air eSIM-only 衝擊電信門市', description: '蘋果預計 2026 春季推出 iPhone Air，6.6mm 超薄機身、完全取消實體 SIM 卡槽（eSIM-only）。電信業須加速 eSIM 開通流程優化，台灣 eSIM 普及率僅 12% 將面臨考驗。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 56, object_id: 'e012', entity_name: '2026Q1 電信獲利王', entity_type: 'event', fact_type: 'trend', severity: 'info', title: '台灣大 2026/1 月 EPS $0.46 超越中華', description: '台灣大 2026 年 1 月單月 EPS $0.46，超越中華電信成為電信獲利王。2024 全年 EPS $4.57 為六年新高，合併綜效持續發酵。林之晨獲 Twimbit CEO of the Year 肯定。', is_read: true, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },
  { id: 57, object_id: 'o001', entity_name: 'NCC 通訊傳播委員會', entity_type: 'organization', fact_type: 'trend', severity: 'info', title: 'NCC：5G 滿意度下滑 7.49→7.34', description: 'NCC 最新調查顯示 5G 用戶整體滿意度從 7.49 降至 7.34，4G 從 7.89 降至 7.34。消費者對 5G 網速提升「無感」是主因。全國 5G 基地台已達 64,106 座佔整體 52.1%。', is_read: true, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 58, object_id: 'e009', entity_name: '亞太電信網路關閉', entity_type: 'event', fact_type: 'risk_signal', severity: 'info', title: '亞太電信網路 2025/12/31 正式關閉', description: '亞太電信網路已於 2025 年底完全關閉，原用戶全面轉移至遠傳網路。部分用戶反映轉網後訊號品質變化，社群出現比較遠傳與台灣大收訊的討論。', is_read: true, created_at: isoDate(8), period_start: '2026-01-20', period_type: 'week' },
  { id: 59, object_id: 'p020', entity_name: '5G 影音優化服務', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'Opensignal：台灣大 5G 影音體驗蟬聯冠軍', description: 'Opensignal 評測台灣大整體影音體驗 73.2 分為三雄最高，5G 影音體驗連續兩期蟬聯冠軍。此數據可作為對抗遠傳 5G availability（36.1% vs 台灣大 31.8%）的行銷利器。', is_read: true, created_at: isoDate(6), period_start: '2026-01-27', period_type: 'week' },

  // ── Insights (6) ──
  { id: 31, object_id: 'b001', entity_name: '台灣大哥大', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: '電信新三雄格局：台灣大以 AI + 影音差異化突圍', description: '市佔格局：中華電信 39.4%（ARPU $525.3）、台灣大 32.0%（929 萬用戶/5G 344 萬/ARPU $460.9）、遠傳 28.6%（ARPU $527.7 最高）。台灣大 ARPU 最低但以差異化服務突圍：Perplexity AI 合作（$599+ 免費一年 Pro 版/市價 $8,280）、影音多享組 5 平台、Opensignal 影音冠軍 73.2 分。2024 EPS $4.57 六年新高，2026/1 月超越中華成電信獲利王。建議以「AI 電信 + 影音生態系」雙引擎持續拉開差異化距離。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 32, object_id: 's001', entity_name: '出國旅遊', entity_type: 'scenario', fact_type: 'insight', severity: 'info', title: '出國旅遊情境：eSIM-only iPhone Air 將加速市場變革', description: '出國旅遊情境中消費者最關注「上網穩定度」「費用透明」「即開即用」。台灣大漫遊日租 $219/日 含 2GB 後降至 512kbps，而第三方 eSIM（Airalo 190 國）競爭加劇。更關鍵的是 iPhone Air（2026 春季）將為 eSIM-only 設計，台灣 eSIM 普及率僅 12%，電信業須加速 eSIM 開通流程優化。建議搶先佈局成為「eSIM 漫遊首選」。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 33, object_id: 'p003', entity_name: 'myVideo', entity_type: 'product', fact_type: 'insight', severity: 'info', title: 'myVideo 成為居家情境差異化關鍵', description: 'myVideo 獨家內容帶動正面聲量，且與寬頻綁定方案的滿意度高達 4.5/5。建議將 myVideo 作為「居家追劇」情境的核心產品，推出「寬頻 + myVideo + 智慧音箱」組合方案。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 34, object_id: 's009', entity_name: '長輩智慧手機', entity_type: 'scenario', fact_type: 'insight', severity: 'info', title: '長輩族群是被忽略的藍海市場', description: '60 歲以上用戶平均 ARPU 為 $380，低於市場均值 $520，但流失率僅 8%（市場均值 15%）。問題在於缺乏專屬方案與客服支援，導致家屬代為處理的不滿聲量增加。建議推出「樂齡安心方案」含簡化帳單、防詐預設、門市優先服務。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 35, object_id: 'b001', entity_name: '台灣大哥大', entity_type: 'brand', fact_type: 'insight', severity: 'info', title: 'KOL 策略需轉向 AI + 科技垂直', description: 'Perplexity Pro 合作為 KOL 行銷帶來新題材。目前蔡阿嘎(52%)與 Joeman(70%)情感偏低，3cTim 哥(75%)與電獺少女(81%)正面帶動效果更佳。建議：1) 以「Perplexity Pro 實測」為新 KOL 合作主題 2) 強化李珠珢(86%)與 5G 影音體驗連結 3) 預算轉向科技垂直 KOL（束褲3C團、電獺少女）搭配 Opensignal 評測數據背書。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 36, object_id: 'e004', entity_name: '雙 11 電信節', entity_type: 'event', fact_type: 'insight', severity: 'info', title: '雙 11 促銷需差異化定位', description: '過去三年雙 11 電信促銷的 ROI 持續下降（2024: 3.2x → 2025: 2.1x），原因是三大電信促銷內容高度同質化。建議今年改以「情境綁定」方式包裝：旅遊包、追劇包、親子包，避開純價格競爭。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },

  // ── Opportunities (7) ──
  { id: 37, object_id: 's005', entity_name: '寵物在家監控', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '「寵物在家監控」情境討論量 ↑320%', description: '寵物飼主社群中「離家看毛孩」「寵物攝影機」「遠端餵食」相關討論暴增 320%，但台灣大目前無對應 IoT 居家監控方案。建議推出「智慧寵物居家包」：IoT 攝影機 + 大流量 SIM + 雲端儲存，搶佔新興需求。', is_read: false, created_at: isoDate(0), period_start: '2026-02-03', period_type: 'week' },
  { id: 38, object_id: 's004', entity_name: '遠距辦公', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '企業遠距辦公方案需求缺口', description: '中小企業主討論「公司配發門號」「團體方案」「VPN 穩定度」聲量 ↑150%，但市場上缺乏針對 5-20 人小型企業的彈性方案。建議推出「企業輕量包」切入此藍海市場。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 39, object_id: 's003', entity_name: '通勤娛樂', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '通勤族 Podcast 收聽需求 ↑200%', description: 'Podcast 收聽在通勤族群中快速成長，消費者反映希望有「低流量 Podcast 專用方案」或「離線下載優惠」，可結合影音多享組或 KKBOX 推出差異化方案。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 40, object_id: 's001', entity_name: '出國旅遊', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '旅遊 eSIM 需求快速成長 ↑250%', description: '「eSIM 漫遊」搜尋量 ↑250%，年輕消費者偏好線上購買即開即用的 eSIM 方案，但台灣大的 eSIM 漫遊方案僅覆蓋 15 國，遠低於競品 Airalo 的 190 國。建議擴大 eSIM 漫遊覆蓋範圍。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 41, object_id: 's007', entity_name: '親子數位學習', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '兒童安全上網方案需求 ↑180%', description: '家長社群中「兒童上網過濾」「螢幕時間管理」「教育內容白名單」討論量暴增，目前僅中華電信有「色情守門員」服務。建議推出「親子安心上網包」含 DNS 過濾、使用時間控制、學習內容推薦。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 42, object_id: 's008', entity_name: '直播帶貨', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '直播帶貨上行頻寬需求 ↑290%', description: '社群電商直播主反映需要穩定高速上行頻寬，現有 5G 方案上行僅 30-50Mbps 不足以支撐 4K 直播。建議推出「直播專用 5G 方案」保證上行 100Mbps + 固定 IP。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },
  { id: 43, object_id: 's010', entity_name: '露營戶外上網', entity_type: 'scenario', fact_type: 'opportunity', severity: 'info', title: '露營族行動網路需求 ↑160%', description: '戶外露營族群討論「山區收訊」「行動 WiFi 分享器」「衛星通訊」聲量持續攀升。建議推出「戶外冒險包」含 4G 行動 WiFi + 緊急衛星通訊 + 保險加值。', is_read: false, created_at: isoDate(4), period_start: '2026-02-03', period_type: 'week' },

  // ── New Opportunities based on real data ──
  { id: 60, object_id: 'p017', entity_name: 'Perplexity Pro 方案', entity_type: 'product', fact_type: 'opportunity', severity: 'info', title: 'AI 電信定位可帶動 $599→$999 升級', description: 'Perplexity Pro 免費送讓 $599 方案成為最有感選擇，但 $999/$1399 方案尚未有對應 AI 差異化。建議推出「AI Plus 方案」：$999+ 享 Perplexity Pro + ChatGPT Plus 雙 AI 服務，帶動 ARPU 向上升級。', is_read: false, created_at: isoDate(1), period_start: '2026-02-03', period_type: 'week' },
  { id: 61, object_id: 'e008', entity_name: 'iPhone Air 發表（eSIM-only）', entity_type: 'event', fact_type: 'opportunity', severity: 'info', title: 'iPhone Air eSIM-only 是電信轉型契機', description: 'iPhone Air 取消實體 SIM 卡槽，台灣 eSIM 普及率僅 12%。搶先優化 eSIM 開通流程（目標 3 分鐘內完成）、推出 eSIM 專屬優惠，可建立「eSIM 首選電信」心智佔位。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 62, object_id: 'p018', entity_name: 'BMW One Number 車聯網', entity_type: 'product', fact_type: 'opportunity', severity: 'info', title: '車聯網可擴展至 Tesla/Toyota 等品牌', description: 'BMW One Number 好評率 92%，驗證車聯網市場需求。台灣 Tesla 車主超過 5 萬、Toyota 車聯網滲透率快速成長。建議以 BMW 成功案例擴展至其他車廠，目標車聯網用戶 5 萬+。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },

  // ── 台台併 & 合併相關 (2) ──
  { id: 49, object_id: 'e001', entity_name: '台台併網路整合', entity_type: 'event', fact_type: 'risk_signal', severity: 'warning', title: '台灣之星用戶合併後客訴持續', description: 'NCC 統計台台併後客訴 97 件、較平日增 43%，主因「通訊連線品質」投訴，原台灣之星用戶反映合併後訊號反而變差。基地台整併作業仍在進行中。', is_read: false, created_at: isoDate(2), period_start: '2026-02-03', period_type: 'week' },
  { id: 50, object_id: 'b004', entity_name: '台灣之星（已併入台灣大）', entity_type: 'brand', fact_type: 'trend', severity: 'warning', title: '原台灣之星用戶攜碼轉出率 +35%', description: '合併後原台灣之星低價方案被整合為台灣大方案，部分用戶反映資費調漲，攜碼至中華電信或遠傳的意願增加。', is_read: false, created_at: isoDate(3), period_start: '2026-02-03', period_type: 'week' },

  // ── Additional trends & risk signals (5) ──
  { id: 44, object_id: 'p012', entity_name: 'eSIM 漫遊卡', entity_type: 'product', fact_type: 'trend', severity: 'info', title: 'eSIM 開通量月增 +45%', description: 'eSIM 漫遊卡開通量持續攀升，以 25-35 歲自由行旅客為主要客群。', is_read: true, created_at: isoDate(9), period_start: '2026-01-20', period_type: 'week' },
  { id: 45, object_id: 'p013', entity_name: '5G $599 輕速吃到飽', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '5G $599 方案新申辦數成長 +18%', description: '5G $599 輕速吃到飽（12Mbps 限速）新申辦數持續成長，主要來自 4G 用戶升級，為入門 5G 最熱門方案。', is_read: true, created_at: isoDate(10), period_start: '2026-01-20', period_type: 'week' },
  { id: 46, object_id: 'k005', entity_name: '電獺少女', entity_type: 'person', fact_type: 'trend', severity: 'info', title: '電獺少女開箱影片轉換率高', description: '電獺少女近期台灣大 5G 方案開箱影片，附連結轉換率達 8.5%，為所有 KOL 合作中最高。', is_read: true, created_at: isoDate(10), period_start: '2026-01-20', period_type: 'week' },
  { id: 47, object_id: 'l001', entity_name: 'myfone 松山文創旗艦店', entity_type: 'place', fact_type: 'risk_signal', severity: 'warning', title: '松山文創旗艦店假日等候時間過長', description: 'myfone 松山文創旗艦店假日平均等候時間達 45 分鐘，Google 評論中「等太久」相關負評增加 35%。', is_read: false, created_at: isoDate(5), period_start: '2026-01-27', period_type: 'week' },
  { id: 48, object_id: 'p005', entity_name: '家庭共享方案', entity_type: 'product', fact_type: 'trend', severity: 'info', title: '家庭方案續約率高達 92%', description: '家庭共享方案用戶續約率為所有方案中最高，平均每戶綁定 3.2 個門號，黏著度極佳。', is_read: true, created_at: isoDate(10), period_start: '2026-01-20', period_type: 'week' },
]

// ────────────────────────────────────────────
// 3. Dashboard
// ────────────────────────────────────────────

const DASHBOARD: DashboardResponse = {
  stats: { total_posts: 5420, avg_sentiment: 0.66, total_sources: 28, period_label: 'Last 7 days' },
  entity_highlights: {
    most_mentioned: ENTITIES.slice().sort((a, b) => b.mention_count - a.mention_count).slice(0, 5),
    most_positive: ENTITIES.slice().sort((a, b) => b.avg_sentiment - a.avg_sentiment).slice(0, 5),
    most_negative: ENTITIES.slice().sort((a, b) => a.avg_sentiment - b.avg_sentiment).slice(0, 5),
  },
}

// ────────────────────────────────────────────
// 4. Observations (12 weeks per entity)
// ────────────────────────────────────────────

function weekDate(weeksAgo: number): string {
  const d = new Date('2026-02-03')
  d.setDate(d.getDate() - weeksAgo * 7)
  return d.toISOString().split('T')[0]
}

const OBS_PATTERNS: Record<string, number[][]> = {
  // brand patterns (24 weeks = 6 months, index 0 = most recent)
  b001: [[38,69],[36,70],[34,71],[32,72],[35,71],[33,72],[31,73],[30,72],[28,73],[26,74],[24,73],[22,72],[25,71],[23,72],[21,73],[20,74],[22,73],[20,72],[18,71],[16,70],[15,69],[14,68],[13,67],[12,66]],
  // 中華電信：聲量平穩偏低（龍頭不需太多聲量），情感穩定偏高（品質口碑好）
  b002: [[22,74],[20,75],[18,74],[16,73],[18,74],[16,75],[14,74],[12,73],[14,74],[12,75],[10,74],[12,75],[10,74],[10,73],[8,74],[8,73],[8,74],[7,73],[6,74],[6,73],[5,74],[5,73],[4,74],[4,73]],
  b003: [[35,64],[30,64],[28,63],[26,62],[24,62],[22,61],[20,62],[18,63],[16,64],[14,63],[12,62],[10,61],[12,60],[10,60],[9,59],[8,58],[8,58],[7,57],[6,56],[6,56],[5,55],[5,55],[4,54],[4,53]],
  b004: [[14,44],[16,45],[18,46],[20,46],[18,47],[15,46],[12,45],[10,44],[8,43],[8,42],[6,41],[6,40],[5,39],[5,38],[4,38],[4,37],[3,36],[3,36],[3,35],[2,35],[2,35],[2,34],[1,34],[1,33]],
  // product patterns (24 weeks)
  p001: [[35,73],[34,74],[36,72],[33,75],[35,73],[37,71],[34,74],[36,72],[33,75],[35,73],[32,74],[30,72],[32,71],[30,72],[28,73],[27,74],[26,73],[25,72],[24,71],[23,70],[22,69],[21,68],[20,68],[19,67]],
  p002: [[48,42],[42,45],[36,48],[30,52],[24,55],[26,58],[28,60],[26,62],[22,65],[20,68],[18,70],[15,72],[16,73],[14,74],[12,75],[10,76],[8,77],[7,78],[6,78],[5,79],[5,80],[4,80],[3,80],[3,80]],
  p003: [[22,76],[20,75],[21,74],[19,75],[18,76],[20,77],[19,78],[17,76],[16,75],[15,74],[14,73],[12,72],[14,72],[12,72],[10,71],[10,71],[8,70],[8,70],[7,70],[6,69],[6,69],[5,69],[5,68],[4,68]],
  p007: [[18,58],[16,60],[15,62],[14,64],[13,66],[12,68],[11,70],[10,72],[9,74],[8,75],[7,76],[6,77],[7,76],[6,76],[6,75],[5,75],[5,74],[4,74],[4,73],[4,73],[3,72],[3,72],[3,71],[2,71]],
  p017: [[18,86],[15,87],[12,88],[10,86],[8,85],[6,84],[4,82],[3,80],[2,78],[1,76],[0,75],[0,74],[0,73],[0,72],[0,71],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70]],
  // scenario patterns (24 weeks)
  s001: [[52,64],[46,66],[40,68],[34,70],[28,72],[30,74],[32,75],[28,76],[24,78],[22,79],[20,80],[18,78],[20,77],[18,76],[16,75],[14,74],[12,73],[12,72],[10,72],[10,71],[8,71],[8,70],[6,70],[6,69]],
  s002: [[30,78],[28,77],[26,76],[24,77],[22,78],[20,79],[18,80],[16,78],[14,77],[12,76],[10,75],[8,74],[10,74],[8,73],[8,73],[6,72],[6,72],[5,71],[5,71],[4,70],[4,70],[4,70],[3,69],[3,69]],
  s005: [[28,81],[22,80],[16,79],[10,78],[6,77],[3,76],[2,75],[1,74],[1,73],[0,72],[0,71],[0,70],[0,70],[0,69],[0,68],[0,68],[0,67],[0,66],[0,66],[0,65],[0,65],[0,64],[0,64],[0,63]],
  s009: [[18,56],[15,58],[12,60],[10,62],[8,64],[6,66],[5,68],[4,70],[3,72],[2,74],[2,76],[1,78],[2,77],[2,76],[2,75],[1,74],[1,74],[1,73],[1,72],[1,72],[1,71],[0,70],[0,70],[0,69]],
  // person patterns (24 weeks)
  k003: [[22,52],[18,56],[16,60],[14,64],[12,68],[14,72],[13,76],[12,78],[11,80],[10,82],[9,84],[8,86],[8,85],[7,84],[7,83],[6,82],[6,82],[5,81],[5,80],[4,80],[4,79],[4,78],[3,78],[3,77]],
  k005: [[15,75],[14,74],[13,75],[12,76],[11,77],[10,78],[9,79],[8,78],[7,77],[6,76],[5,75],[4,74],[5,74],[4,73],[4,73],[3,72],[3,72],[3,71],[2,71],[2,70],[2,70],[2,70],[1,69],[1,69]],
  // place patterns (24 weeks)
  l002: [[20,52],[16,55],[14,58],[12,62],[10,65],[12,68],[14,70],[12,72],[10,74],[8,76],[6,78],[4,80],[5,79],[4,78],[4,78],[3,77],[3,76],[2,76],[2,75],[2,75],[2,74],[1,74],[1,73],[1,73]],
  l001: [[12,73],[11,72],[10,71],[10,72],[9,73],[8,74],[8,75],[7,74],[6,73],[6,72],[5,71],[4,70],[5,70],[4,69],[4,69],[3,68],[3,68],[3,67],[2,67],[2,66],[2,66],[2,66],[1,65],[1,65]],
  // event patterns (24 weeks)
  e002: [[28,83],[24,82],[20,81],[16,80],[12,79],[8,78],[4,77],[2,76],[1,75],[0,74],[0,73],[0,72],[0,72],[0,71],[0,71],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70]],
  e004: [[18,72],[14,71],[10,70],[8,69],[6,68],[4,67],[2,66],[1,65],[0,64],[0,63],[0,62],[0,61],[0,60],[0,60],[0,59],[0,59],[0,58],[0,58],[0,58],[0,58],[0,58],[0,58],[0,58],[0,58]],
  e008: [[22,75],[18,76],[14,77],[10,76],[6,75],[3,74],[1,73],[0,72],[0,71],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70]],
  e011: [[12,87],[10,88],[8,86],[6,85],[4,84],[3,82],[2,80],[1,78],[0,76],[0,75],[0,74],[0,73],[0,72],[0,72],[0,71],[0,71],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70],[0,70]],
}

function generateObservations(entityId: string, baseMentions: number, baseSentiment: number): EntityObservation[] {
  const pattern = OBS_PATTERNS[entityId]
  if (pattern) {
    return pattern.map((p, i) => {
      const mentions = p[0]
      const sentiment = p[1] / 100
      const pos = Math.round(mentions * sentiment)
      const neg = Math.round(mentions * (1 - sentiment) * 0.6)
      const neu = Math.max(0, mentions - pos - neg - Math.round(mentions * 0.05))
      const mix = Math.max(0, mentions - pos - neg - neu)
      return {
        period_start: weekDate(i),
        period_type: 'week',
        mention_count: mentions,
        avg_sentiment: sentiment,
        positive_count: pos,
        negative_count: neg,
        neutral_count: neu,
        mixed_count: mix,
      }
    })
  }

  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(i * 0.6) * 0.15
    const mentions = Math.max(1, Math.round(baseMentions / 12 * (1 + wave + (11 - i) * 0.02)))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + wave * 0.3))
    const pos = Math.round(mentions * sentiment)
    const neg = Math.round(mentions * (1 - sentiment) * 0.6)
    const neu = Math.max(0, mentions - pos - neg - 1)
    return {
      period_start: weekDate(i),
      period_type: 'week',
      mention_count: mentions,
      avg_sentiment: Math.round(sentiment * 100) / 100,
      positive_count: pos,
      negative_count: neg,
      neutral_count: Math.max(0, neu),
      mixed_count: Math.max(0, mentions - pos - neg - Math.max(0, neu)),
    }
  })
}

// ────────────────────────────────────────────
// 5. Entity Detail Generators
// ────────────────────────────────────────────

const ASPECT_POOL: Record<string, string[]> = {
  brand:        ['資費價格', '網速品質', '客服態度', '門市服務', '信號覆蓋', '品牌形象', '促銷活動', '合約條款', '帳單透明', '5G 體驗', 'APP 體驗', '攜碼優惠', '企業形象', '社會責任'],
  product:      ['價格', '網速', '穩定度', '覆蓋範圍', '方案彈性', 'CP值', '合約期限', '附加服務', '開通便利', '客服支援', '流量限制', '數據漫遊'],
  scenario:     ['上網需求', '通話需求', '影音娛樂', '導航翻譯', '視訊通話', '社群分享', '工作效率', '價格敏感度'],
  place:        ['等候時間', '服務態度', '位置便利', '環境', '備貨充足', '專業度', '營業時間', '停車', '無障礙'],
  person:       ['內容品質', '真實性', '影響力', '業配揭露', '互動', '專業度', '追蹤數', '合作效益'],
  event:        ['優惠力度', '活動內容', '排隊等候', '贈品', '方案多樣性', '現場體驗', '宣傳到位'],
  organization: ['政策影響', '監管力度', '公平性', '透明度', '效率', '產品品質'],
}

// Per-entity aspect overrides: [aspect_name, sentiment_modifier]
// sentiment_modifier: positive = this aspect is above average, negative = below average
const ENTITY_ASPECTS: Record<string, [string, number][]> = {
  // ── Brands ──
  b001: [['合併整合', -0.22], ['5G 體驗', -0.08], ['資費 CP 值', 0.05], ['品牌形象', 0.15], ['影音生態系', 0.18], ['客服回應', -0.15], ['門市服務', 0.02], ['APP 體驗', -0.12], ['Perplexity AI', 0.25], ['帳單透明', -0.18], ['攜碼優惠', 0.06], ['代言人話題', 0.22], ['mo 幣多回饋', -0.05], ['企業獲利', 0.20], ['信號覆蓋', -0.06], ['社會責任', 0.08]],
  b002: [['網路品質', 0.18], ['5G 覆蓋', 0.15], ['品牌信任度', 0.12], ['資費價格', -0.10], ['客服專業', 0.08], ['技術領先', 0.20], ['門市密度', 0.10], ['企業方案', 0.12], ['5G SA 進展', 0.22], ['ARPU 表現', 0.15]],
  b003: [['5G availability', 0.20], ['ARPU 表現', 0.22], ['合併整合', -0.15], ['頻譜優勢', 0.18], ['5G SA 技術', 0.25], ['優雅樂活', 0.12], ['Spotify 整合', 0.10], ['門市服務', 0.05], ['品牌年輕化', -0.02], ['資費透明', 0.06], ['網路穩定度', 0.08], ['企業形象', 0.10]],
  b004: [['合併後資費', -0.25], ['斷網政策', -0.30], ['攜碼意願', -0.20], ['原方案保障', -0.15], ['客服轉接', -0.18], ['信號品質', -0.10], ['用戶權益', -0.22]],
  b005: [['網路關閉', -0.28], ['轉網體驗', -0.20], ['資費調整', -0.15], ['用戶權益', -0.18], ['換卡流程', -0.12], ['客服品質', -0.08]],
  b006: [['月租價格', 0.22], ['社群免計費', 0.18], ['網速體驗', -0.05], ['方案簡單', 0.15], ['客服管道', -0.08], ['品牌認知', -0.03]],
  b007: [['產品設計', 0.25], ['eSIM 體驗', 0.15], ['iPhone Air 話題', 0.20], ['價格', -0.15], ['生態系', 0.22], ['品牌忠誠度', 0.18]],
  b008: [['Galaxy AI', 0.20], ['CP 值', 0.15], ['規格', 0.18], ['摺疊手機', 0.12], ['S26 期待度', 0.22]],
  b009: [['AI 搜尋品質', 0.25], ['回答準確度', 0.20], ['使用體驗', 0.18], ['與電信結合', 0.22]],
  // ── Products ──
  p001: [['不限速體驗', 0.15], ['月租價格', -0.12], ['5G 覆蓋', -0.05], ['綁約搭機', 0.18], ['影音串流', 0.12], ['尖峰時段', -0.08], ['Perplexity 加值', 0.22], ['與中華比較', -0.05], ['熱區表現', -0.10], ['續約優惠', 0.03]],
  p002: [['漫遊穩定度', -0.28], ['費用透明', -0.22], ['日本漫遊', -0.25], ['韓國漫遊', -0.18], ['開通便利', -0.10], ['速度限制', -0.20], ['費率比較', -0.15], ['eSIM 替代', -0.12], ['客服處理', -0.08]],
  p003: [['獨家韓劇', 0.22], ['台劇內容', 0.15], ['介面體驗', 0.05], ['與 Netflix 比較', -0.08], ['寬頻綁定', 0.18], ['內容更新速度', 0.10], ['畫質表現', 0.12], ['價格', 0.08]],
  p004: [['實測速度', -0.12], ['穩定度', 0.08], ['價格', -0.05], ['安裝服務', 0.10], ['客服報修', -0.08], ['與競品比較', -0.03]],
  p005: [['多門號共享', 0.18], ['月租合算', 0.15], ['續約率', 0.22], ['方案彈性', 0.10], ['門號數上限', -0.02]],
  p007: [['點數安全', -0.30], ['APP 體驗', -0.18], ['回饋比例', 0.05], ['使用通路', 0.08], ['momo 整合', 0.10]],
  p009: [['限速體驗', -0.18], ['價格', 0.15], ['尖峰降速', -0.22], ['串流影音', -0.15], ['社群使用', 0.05], ['學生適用', 0.12]],
  p010: [['平台數量', 0.25], ['一站管理', 0.22], ['價格優惠', 0.15], ['內容豐富度', 0.20], ['與直購比較', -0.05], ['KKBOX 音樂', 0.12]],
  p012: [['覆蓋國家數', -0.15], ['開通便利', 0.10], ['穩定度', -0.08], ['價格', -0.05], ['與 Airalo 比較', -0.20]],
  p013: [['入門門檻低', 0.15], ['12Mbps 限速', -0.12], ['升級 5G', 0.18], ['Perplexity 加值', 0.25], ['與 4G 比較', 0.05]],
  p016: [['不降速體驗', 0.18], ['價格', 0.12], ['4G 足夠', 0.15], ['與 5G 比較', -0.03], ['長輩適用', 0.10], ['學生適用', 0.12]],
  p017: [['AI 搜尋實用', 0.28], ['市價 CP 值', 0.30], ['與 ChatGPT 比較', 0.10], ['使用教學', -0.05], ['日常應用', 0.22]],
  p018: [['車內通話', 0.20], ['Netflix 車上看', 0.18], ['BMW 限定', -0.10], ['月租價格', 0.12]],
  p019: [['歐美劇內容', 0.20], ['價格', 0.15], ['搭 5G 折扣', 0.18], ['與 Netflix 互補', 0.12], ['介面中文化', -0.05]],
  // ── Scenarios ──
  s001: [['上網穩定度', -0.20], ['費用透明', -0.18], ['即開即用', -0.12], ['導航翻譯', 0.05], ['打卡分享', 0.10], ['eSIM 便利', 0.08], ['緊急通訊', 0.02], ['費率比較', -0.15]],
  s002: [['影音串流', 0.22], ['寬頻速度', 0.15], ['多裝置共享', 0.12], ['內容豐富度', 0.20], ['價格合算', 0.10], ['OTT 管理便利', 0.18]],
  s003: [['地下段訊號', -0.22], ['串流順暢度', -0.08], ['5G 覆蓋', -0.12], ['Podcast 聽感', 0.10], ['遊戲延遲', -0.15]],
  s004: [['視訊穩定度', 0.10], ['VPN 相容', 0.05], ['寬頻備援', 0.12], ['企業方案', -0.08], ['雲端存取', 0.08]],
  s005: [['攝影機連線', 0.15], ['即時推播', 0.12], ['雲端儲存', 0.08], ['IoT 方案缺口', -0.20]],
  s006: [['月租價格', 0.18], ['社群免費', 0.15], ['限速可接受', -0.05], ['校園收訊', 0.08]],
  s007: [['內容過濾', -0.18], ['使用時間管理', -0.15], ['寬頻穩定', 0.12], ['多裝置', 0.10]],
  s008: [['上行頻寬', -0.22], ['低延遲', -0.15], ['固定 IP', -0.20]],
  s009: [['操作簡易', -0.15], ['詐騙防護', -0.25], ['月租低廉', 0.12], ['門市教學', 0.08]],
  s010: [['山區收訊', -0.25], ['緊急通訊', -0.18], ['電池續航', -0.10]],
  // ── Persons ──
  k001: [['話題性', 0.28], ['品牌連結度', 0.22], ['年輕族群吸引', 0.25], ['三振舞', 0.30], ['廣告表現', 0.22]],
  k002: [['評測專業度', 0.18], ['比較公正性', 0.15], ['家庭方案推薦', 0.20], ['觀眾信任', 0.12], ['業配比例', -0.05]],
  k003: [['影片娛樂性', 0.10], ['負面評價', -0.28], ['觀看數', 0.15]],
  k004: [['科普品質', 0.25], ['客觀分析', 0.22], ['社會議題', 0.18]],
  k005: [['開箱質感', 0.20], ['轉換率', 0.25], ['女性受眾', 0.18], ['科技生活', 0.15]],
  k006: [['實測可信度', 0.12], ['豪宅系列', 0.15], ['負面測評', -0.18], ['觀看數', 0.20]],
  k007: [['3C 評測', 0.18], ['長輩教學', 0.15], ['平價推薦', 0.12]],
  k008: [['旅遊內容', 0.20], ['英語教學', 0.15], ['漫遊評測', 0.18], ['出國實用', 0.22]],
  // ── Events ──
  e001: [['網路整合進度', -0.18], ['客訴處理', -0.25], ['基地台覆蓋', -0.12], ['用戶保障', -0.15], ['NCC 監管', -0.08], ['攜碼流失', -0.20], ['頻譜整合', 0.10]],
  e002: [['首賣排隊', 0.15], ['方案優惠', 0.20], ['$0 入手', 0.25], ['F1 主題', 0.18], ['現場體驗', 0.22], ['搶購速度', 0.10]],
  e005: [['Galaxy AI 2.0', 0.22], ['規格升級', 0.18], ['綁約優惠', 0.15], ['預購踴躍', 0.20], ['與 iPhone 比較', 0.05]],
  e008: [['eSIM-only 衝擊', -0.10], ['超薄設計', 0.22], ['電信轉型', 0.05], ['門市影響', -0.15], ['開通流程', -0.12], ['價格猜測', -0.05]],
  e011: [['AI 合作創新', 0.25], ['CP 值感受', 0.28], ['品牌差異化', 0.22], ['使用教學', 0.10]],
}

function generateAspects(type: string, count: number, baseSentiment: number, entityId?: string): AspectSummary[] {
  const entityAspects = entityId ? ENTITY_ASPECTS[entityId] : undefined
  if (entityAspects) {
    return entityAspects.slice(0, count).map(([aspect, mod], i) => {
      const total = Math.max(2, Math.round(20 - i * 1.8 + Math.sin(i * 1.7) * 4))
      const sentiment = Math.min(0.98, Math.max(0.05, baseSentiment + mod))
      const pos = Math.round(total * sentiment)
      const neg = Math.round(total * (1 - sentiment) * 0.7)
      return { aspect, total, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, total - pos - neg) }
    })
  }
  const pool = ASPECT_POOL[type] ?? ASPECT_POOL.brand
  return pool.slice(0, count).map((aspect, i) => {
    const total = Math.max(2, Math.round(20 - i * 2.5 + Math.sin(i) * 3))
    const sentiment = Math.min(0.98, Math.max(0.1, baseSentiment + (Math.cos(i * 1.3) * 0.25)))
    const pos = Math.round(total * sentiment)
    const neg = Math.round(total * (1 - sentiment) * 0.7)
    return { aspect, total, avg_sentiment: Math.round(sentiment * 100) / 100, positive_count: pos, negative_count: neg, neutral_count: Math.max(0, total - pos - neg) }
  })
}

const MENTION_POOL: Record<string, string[]> = {
  brand: [
    '剛從{name}門市辦完 5G 方案，速度真的有感提升！',
    '{name}最近推的家庭方案 CP 值很高，推薦給大家',
    '覺得{name}的客服越來越難打通了...等了 30 分鐘才接通',
    '比較了三家電信，{name}的涵蓋率在我家附近最好',
    '{name}又漲價了...考慮攜碼到別家',
    '用了{name}三年了，網速一直很穩定，推',
    '{name}的帳單越來越看不懂，一堆額外費用',
    '朋友從中華電信跳槽到{name}說差很多耶',
    '今天去{name}換新機，店員超專業，全程解說',
    '{name}的線上客服 chatbot 完全沒用，根本答非所問',
    '打去{name}客服想降月租，竟然被推銷更貴的方案 🙄',
    '聽說{name}今年要推 AI 客服，希望體驗能改善',
  ],
  product: [
    '{name}真的很適合重度使用者，不用擔心流量',
    '辦了{name}出國結果網路超慢...很失望',
    '{name}的價格偏高但品質穩定，看你怎麼取捨',
    '推薦{name}，家人一起用很划算',
    '公司團購{name}，同事都說讚！',
    '{name}的合約綁太長了，兩年真的太久',
    '剛開通{name}，設定很方便，幾分鐘就搞定',
    '{name}續約優惠比新辦少很多，老客戶被當盤子',
    '試用了{name}一個月，決定長期用下去了',
    '{name}偶爾會有限速但不影響一般使用',
  ],
  scenario: [
    '出國最怕{name}情境沒網路，還好有先買漫遊',
    '{name}最重要的就是網路穩定，追劇追到一半斷線超崩潰',
    '每天通勤{name}都在聽 Podcast，流量用好兇',
    '在家{name}用光纖真的比手機 5G 穩太多了',
    '為了{name}特別辦了一張 IoT SIM 卡',
    '小孩線上上課{name}中斷好幾次，快崩潰了',
    '{name}時最需要穩定的上行速度，直播不能卡',
    '帶爸媽一起{name}，他們連 LINE 都不太會用',
  ],
  person: [
    '{name}推薦的方案我去辦了，真的不錯！',
    '覺得{name}最近業配電信有點多耶...少了客觀性',
    '{name}的科技評測很專業，看完立刻做功課',
    '追蹤{name}好幾年了，推薦的東西品質都不錯',
    '{name}那支漫遊開箱影片超實用，出國前必看',
    '{name}的實測比較影片超中肯，看了省好多時間',
    '雖然{name}是業配但講得很真實，不像有些人硬吹',
    '{name}說這家 CP 值最高，我就信了直接辦',
  ],
  place: [
    '{name}的服務人員很專業，解釋方案很清楚',
    '去{name}人好多...等了一個小時才輪到我',
    '{name}假日幾乎都要排隊，建議平日去',
    '{name}的展示機很齊全，可以實際體驗 5G 速度',
    '推薦{name}的 VIP 服務，不用排隊直接辦理',
    '{name}附近有停車場，開車去比較方便',
    '{name}的店員推銷壓力很大，想自己看看都不行',
    '難得去{name}一趟，結果要辦的業務說要預約 😑',
  ],
  event: [
    '{name}搶到超優惠方案！排隊值得了',
    '剛從{name}回來，送的贈品很不錯',
    '{name}的優惠方案其實沒有宣傳的那麼好...',
    '{name}綁約送的手機殼質感不錯，比想像中好',
    '趁{name}辦了家庭方案，省了快 $500/月',
    '今年{name}的優惠比去年縮水很多，失望',
  ],
  organization: [
    '{name}應該要好好管一下電信業者的資費亂象',
    '希望{name}能推動更透明的費率標準',
    '{name}的新規定對消費者是好事',
    '看到{name}公布的數據，才知道投訴這麼多',
    '{name}終於出手了，電信業者不能再亂搞',
  ],
}

function generateMentions(name: string, type: string, count: number): MentionItem[] {
  const pool = MENTION_POOL[type] ?? MENTION_POOL.brand
  const platforms = ['PTT', 'Dcard', 'Facebook', 'YouTube', 'Mobile01', 'Twitter', 'Instagram', 'LINE社群']
  const authors = ['小明', '科技阿宅', '通訊迷', '3C達人', '路人甲', '上班族小陳', '學生阿花', '媽媽社團', '電信業務小王', '退休教師老李', '工程師阿偉', '旅遊達人Amy']
  const sentiments: Array<{ label: string; score: number }> = [
    { label: 'positive', score: 0.85 },
    { label: 'positive', score: 0.78 },
    { label: 'neutral', score: 0.52 },
    { label: 'negative', score: 0.22 },
    { label: 'positive', score: 0.91 },
    { label: 'neutral', score: 0.48 },
    { label: 'negative', score: 0.15 },
    { label: 'positive', score: 0.82 },
    { label: 'negative', score: 0.28 },
    { label: 'positive', score: 0.88 },
    { label: 'neutral', score: 0.55 },
    { label: 'positive', score: 0.72 },
  ]
  return pool.slice(0, count).map((tpl, i) => ({
    post_id: 1000 + i,
    content: tpl.replace('{name}', name),
    sentiment: sentiments[i % sentiments.length].label,
    sentiment_score: sentiments[i % sentiments.length].score,
    mention_text: name,
    author_name: authors[i % authors.length],
    platform: platforms[i % platforms.length],
    created_at: isoDate(i),
  }))
}

// ── Relationships between entities ──
const LINK_MAP: Record<string, LinkItem[]> = {
  b001: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '5G $1399 不限速吃到飽', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p002', linked_name: '出國漫遊日租 $219/日', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p003', linked_name: 'myVideo', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p004', linked_name: '光纖寬頻 1G', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家庭共享方案', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p007', linked_name: 'mo 幣多專案', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p009', linked_name: '4G $499 輕速吃到飽', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p010', linked_name: '影音多享組（5平台）', linked_type: 'product', link_type: 'produces', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'p012', linked_name: 'eSIM 漫遊卡', linked_type: 'product', link_type: 'produces', created_at: isoDate(45) },
    { direction: 'outgoing', linked_id: 'p013', linked_name: '5G $599 輕速吃到飽', linked_type: 'product', link_type: 'produces', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'p017', linked_name: 'Perplexity Pro 方案', linked_type: 'product', link_type: 'produces', created_at: isoDate(20) },
    { direction: 'outgoing', linked_id: 'p018', linked_name: 'BMW One Number 車聯網', linked_type: 'product', link_type: 'produces', created_at: isoDate(15) },
    { direction: 'outgoing', linked_id: 'p019', linked_name: 'Prime Video 月租方案', linked_type: 'product', link_type: 'produces', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'l001', linked_name: 'myfone 松山文創旗艦店', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'l003', linked_name: '台北車站門市', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'l004', linked_name: '高雄夢時代門市', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'outgoing', linked_id: 'l005', linked_name: 'myfone 台中大遠百門市', linked_type: 'place', link_type: 'located_at', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
  ],
  b002: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
  ],
  b003: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b005', linked_name: '亞太電信', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(20) },
  ],
  b006: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'competes_with', created_at: isoDate(15) },
  ],
  s001: [
    { direction: 'outgoing', linked_id: 'p002', linked_name: '出國漫遊日租 $219/日', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p006', linked_name: '國際通話加值包', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p012', linked_name: 'eSIM 漫遊卡', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s002: [
    { direction: 'outgoing', linked_id: 'p003', linked_name: 'myVideo', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p004', linked_name: '光纖寬頻 1G', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家庭共享方案', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p014', linked_name: '智慧音箱組合包', linked_type: 'product', link_type: 'needs', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 'p019', linked_name: 'Prime Video 月租方案', linked_type: 'product', link_type: 'needs', created_at: isoDate(3) },
  ],
  s003: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '5G $1399 不限速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p010', linked_name: '影音多享組（5平台）', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s004: [
    { direction: 'outgoing', linked_id: 'p004', linked_name: '光纖寬頻 1G', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p001', linked_name: '5G $1399 不限速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p011', linked_name: '企業行動方案', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s005: [
    { direction: 'outgoing', linked_id: 'p008', linked_name: 'IoT 居家監控方案', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
  ],
  s006: [
    { direction: 'outgoing', linked_id: 'p009', linked_name: '4G $499 輕速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
  ],
  s007: [
    { direction: 'outgoing', linked_id: 'p004', linked_name: '光纖寬頻 1G', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家庭共享方案', linked_type: 'product', link_type: 'needs', created_at: isoDate(8) },
  ],
  s008: [
    { direction: 'outgoing', linked_id: 'p013', linked_name: '5G $599 輕速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(5) },
  ],
  s009: [
    { direction: 'outgoing', linked_id: 'p009', linked_name: '4G $499 輕速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(10) },
  ],
  s010: [
    { direction: 'outgoing', linked_id: 'p001', linked_name: '5G $1399 不限速吃到飽', linked_type: 'product', link_type: 'needs', created_at: isoDate(5) },
  ],
  p002: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 's001', linked_name: '出國旅遊', linked_type: 'scenario', link_type: 'needed_by', created_at: isoDate(10) },
  ],
  p003: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(60) },
    { direction: 'incoming', linked_id: 's002', linked_name: '居家追劇', linked_type: 'scenario', link_type: 'needed_by', created_at: isoDate(10) },
  ],
  k001: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'endorses', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 'e007', linked_name: '李珠珢代言發表會', linked_type: 'event', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's003', linked_name: '通勤娛樂', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(3) },
  ],
  k002: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'endorses', created_at: isoDate(12) },
    { direction: 'outgoing', linked_id: 'p005', linked_name: '家庭共享方案', linked_type: 'product', link_type: 'endorses', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's002', linked_name: '居家追劇', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 's007', linked_name: '親子數位學習', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(5) },
  ],
  k003: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 's001', linked_name: '出國旅遊', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(4) },
  ],
  k005: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'endorses', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'p001', linked_name: '5G $1399 不限速吃到飽', linked_type: 'product', link_type: 'endorses', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 's003', linked_name: '通勤娛樂', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(6) },
    { direction: 'outgoing', linked_id: 's004', linked_name: '遠距辦公', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(5) },
  ],
  k006: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 's002', linked_name: '居家追劇', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(3) },
    { direction: 'outgoing', linked_id: 's010', linked_name: '露營戶外上網', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(2) },
  ],
  k007: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'discusses', created_at: isoDate(6) },
    { direction: 'outgoing', linked_id: 's009', linked_name: '長輩智慧手機', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(4) },
    { direction: 'outgoing', linked_id: 's006', linked_name: '低資費上網', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(3) },
  ],
  k008: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'endorses', created_at: isoDate(15) },
    { direction: 'outgoing', linked_id: 'p002', linked_name: '出國漫遊日租 $219/日', linked_type: 'product', link_type: 'endorses', created_at: isoDate(12) },
    { direction: 'outgoing', linked_id: 's001', linked_name: '出國旅遊', linked_type: 'scenario', link_type: 'discusses', created_at: isoDate(10) },
  ],
  e001: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b004', linked_name: '台灣之星', linked_type: 'brand', link_type: 'involves', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 's006', linked_name: '低資費上網', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(20) },
  ],
  e002: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b007', linked_name: 'Apple Taiwan', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's003', linked_name: '通勤娛樂', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(8) },
  ],
  e003: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(15) },
    { direction: 'outgoing', linked_id: 's004', linked_name: '遠距辦公', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's002', linked_name: '居家追劇', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(10) },
  ],
  e004: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's006', linked_name: '低資費上網', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 's008', linked_name: '直播帶貨', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(5) },
  ],
  e005: [
    { direction: 'outgoing', linked_id: 'b008', linked_name: 'Samsung Taiwan', linked_type: 'brand', link_type: 'involves', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'involves', created_at: isoDate(8) },
    { direction: 'outgoing', linked_id: 's003', linked_name: '通勤娛樂', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(6) },
  ],
  e007: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'k001', linked_name: '李珠珢', linked_type: 'person', link_type: 'involves', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 's003', linked_name: '通勤娛樂', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(5) },
  ],
  e006: [
    { direction: 'outgoing', linked_id: 's001', linked_name: '出國旅遊', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 'p002', linked_name: '出國漫遊日租 $219/日', linked_type: 'product', link_type: 'involves', created_at: isoDate(5) },
  ],
  o001: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'regulates', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'regulates', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'regulates', created_at: isoDate(30) },
  ],
  o003: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'monitors', created_at: isoDate(20) },
  ],
  // New products
  p017: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'b009', linked_name: 'Perplexity AI', linked_type: 'brand', link_type: 'partnered_with', created_at: isoDate(30) },
    { direction: 'incoming', linked_id: 'e011', linked_name: 'Perplexity AI 合作發表', linked_type: 'event', link_type: 'launched_at', created_at: isoDate(30) },
  ],
  p018: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(20) },
  ],
  p019: [
    { direction: 'incoming', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'produced_by', created_at: isoDate(10) },
    { direction: 'incoming', linked_id: 's002', linked_name: '居家追劇', linked_type: 'scenario', link_type: 'needed_by', created_at: isoDate(8) },
  ],
  // New events
  e008: [
    { direction: 'outgoing', linked_id: 'b007', linked_name: 'Apple Taiwan', linked_type: 'brand', link_type: 'involves', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 'p012', linked_name: 'eSIM 漫遊卡', linked_type: 'product', link_type: 'involves', created_at: isoDate(5) },
    { direction: 'outgoing', linked_id: 's001', linked_name: '出國旅遊', linked_type: 'scenario', link_type: 'involves', created_at: isoDate(3) },
  ],
  e009: [
    { direction: 'outgoing', linked_id: 'b005', linked_name: '亞太電信', linked_type: 'brand', link_type: 'involves', created_at: isoDate(15) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'involves', created_at: isoDate(15) },
  ],
  e011: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'b009', linked_name: 'Perplexity AI', linked_type: 'brand', link_type: 'involves', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'p017', linked_name: 'Perplexity Pro 方案', linked_type: 'product', link_type: 'involves', created_at: isoDate(30) },
  ],
  e012: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'involves', created_at: isoDate(5) },
  ],
  b009: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'partnered_with', created_at: isoDate(30) },
    { direction: 'outgoing', linked_id: 'p017', linked_name: 'Perplexity Pro 方案', linked_type: 'product', link_type: 'produces', created_at: isoDate(30) },
  ],
  o007: [
    { direction: 'outgoing', linked_id: 'b001', linked_name: '台灣大哥大', linked_type: 'brand', link_type: 'evaluates', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b002', linked_name: '中華電信', linked_type: 'brand', link_type: 'evaluates', created_at: isoDate(10) },
    { direction: 'outgoing', linked_id: 'b003', linked_name: '遠傳電信', linked_type: 'brand', link_type: 'evaluates', created_at: isoDate(10) },
  ],
}

const ALIAS_MAP: Record<string, string[]> = {
  b001: ['TWM', '台哥大', 'Taiwan Mobile', '台灣大', 'Open Possible', '能所不能'],
  b002: ['CHT', '中華', 'Chunghwa Telecom'],
  b003: ['FET', '遠傳', 'Far EasTone'],
  b004: ['T Star', '台星', '台灣之星'],
  b005: ['APT', '亞太', '亞太電信'],
  b006: ['LINE Mobile'],
  b007: ['Apple', '蘋果'],
  p001: ['5G unlimited', '5G吃到飽', '5G 不限速', '$1399方案'],
  p002: ['roaming', '漫遊', '日租漫遊', '出國上網'],
  p003: ['my Video', 'myVideo', '影音隨看'],
  p007: ['mo幣', 'mo幣多', 'momo購物金'],
  p009: ['4G 吃到飽', '$499方案', '輕速方案'],
  p010: ['OTT bundle', '影音多享', 'Netflix方案', '5平台OTT', 'Netflix+Disney++Max+myVideo+KKBOX'],
  p012: ['eSIM', 'eSIM漫遊'],
  p013: ['$599方案', '5G入門'],
  p014: ['myfone購物', 'myfone online'],
  p016: ['$588方案', '4G不降速'],
  k001: ['珠珢', 'AI女神', '三振舞', '李珠珢'],
  k002: ['Tim哥', '3cTim', '3C Tim哥'],
  k003: ['阿嘎', '蔡阿嘎'],
  k005: ['電獺', 'aotter'],
  k006: ['九妹', 'Joeman'],
  k007: ['束褲', '束褲3C'],
  k008: ['Ray Du', '阿滴'],
  e001: ['台台併', '台灣之星合併', '電信合併'],
  e002: ['iPhone首賣', 'iPhone 17'],
  b009: ['Perplexity', 'AI搜尋'],
  p017: ['Perplexity Pro', 'AI方案', 'AI搜尋引擎'],
  p018: ['BMW車聯網', 'One Number', '車用門號'],
  p019: ['Prime Video', 'Amazon影音', 'PV方案'],
  p020: ['影音優化', '5G影音冠軍', 'Opensignal冠軍'],
  e008: ['iPhone Air', 'eSIM only', '超薄iPhone'],
  e009: ['亞太關網', '亞太電信結束'],
  e011: ['Perplexity發表', 'AI合作'],
  e012: ['獲利王', 'EPS超越中華'],
}

function buildEntityDetail(entityId: string): EntityDetail | null {
  const entity = ENTITIES.find(e => e.id === entityId)
  if (!entity) return null

  const aspects = generateAspects(entity.type, entity.aspect_count, entity.avg_sentiment, entityId)
  const mentions = generateMentions(entity.canonical_name, entity.type, Math.min(10, entity.mention_count))
  const links = LINK_MAP[entityId] ?? []

  const totalMentions = entity.mention_count
  const pos = Math.round(totalMentions * entity.avg_sentiment)
  const neg = Math.round(totalMentions * (1 - entity.avg_sentiment) * 0.6)
  const neu = Math.round(totalMentions * (1 - entity.avg_sentiment) * 0.3)
  const mix = Math.max(0, totalMentions - pos - neg - neu)

  const stats: EntityDetailStats = {
    mention_count: totalMentions,
    aspect_count: entity.aspect_count,
    avg_sentiment: entity.avg_sentiment,
    positive_count: pos,
    negative_count: neg,
    neutral_count: neu,
    mixed_count: mix,
  }

  return {
    id: entity.id,
    canonical_name: entity.canonical_name,
    type: entity.type,
    sub_type: entity.sub_type ?? '',
    status: 'active',
    created_at: isoDate(90),
    aliases: ALIAS_MAP[entityId] ?? [],
    stats,
    top_aspects: aspects,
    links,
    recent_mentions: mentions,
  }
}

// ────────────────────────────────────────────
// 6. AI Summary & Chat Generators
// ────────────────────────────────────────────

import type { EntityAISummary } from './types'

const AI_SUMMARY_MAP: Record<string, { headline: string; body: string; reasoning: { signal: string; reasoning: string; conclusion: string }[]; actions: { trigger: string; action: string; target: string }[] }> = {
  b001: {
    headline: '台灣大品牌聲量穩健，AI+影音生態系成差異化引擎',
    body: '台灣大哥大用戶數 929 萬、5G 用戶 344 萬（滲透率 37%），市佔 32.0% 位居第二。2024 EPS $4.57 為六年新高，2026/1 單月 EPS $0.46 超越中華電信成為電信獲利王。品牌以「Open Possible 能所不能」搭配李珠珢代言、Perplexity AI 合作（$599+ 免費一年 Pro 版價值 $8,280）、影音多享組 5 平台打造差異化。Opensignal 評測整體影音體驗 73.2 分為三雄最高。但合併後帳單斷網政策引發客訴（NCC 收到 97 件），ARPU $460.9 低於遠傳 $527.7 與中華 $525.3，5G availability 31.8% 落後遠傳 36.1%。',
    reasoning: [
      { signal: '合併後斷網政策客訴 +97 件', reasoning: '原台灣之星用戶第二期帳單未繳即停話，與原先寬鬆催繳機制差異大，PTT 爆文破 10 萬觀看', conclusion: '需立即調整催繳政策並主動溝通受影響用戶' },
      { signal: 'Perplexity Pro 免費送引爆社群 +450%', reasoning: '$599 方案即享市價 $8,280 的 AI 服務，被評為最有感加值', conclusion: '持續深化 AI 合作，將「AI 電信」定位為品牌核心' },
      { signal: '遠傳 5G SA 實測領先', reasoning: '遠傳攜 Ericsson 於大巨蛋 4 萬人成功實測 5G SA，台灣大尚無公開進展', conclusion: '加速 5G SA 佈署規劃，避免技術形象落後' },
    ],
    actions: [
      { trigger: '帳單政策客訴', action: '調整原台星用戶催繳機制為 3 期緩衝，並主動發送安心簡訊', target: '客服中心/2 週內' },
      { trigger: 'AI 差異化', action: '製作「Perplexity Pro 實用教學」系列社群內容，強化 AI 電信形象', target: 'IMC 團隊' },
      { trigger: 'ARPU 提升', action: '推動影音多享組 + Prime Video 交叉銷售，目標 ARPU 提升至 $500+', target: '產品/IMC 團隊' },
    ],
  },
  b002: {
    headline: '中華電信市佔龍頭，5G SA 與價格雙線施壓',
    body: '中華電信以 39.4% 市佔率穩居龍頭，ARPU $525.3 僅次遠傳。近期推出限時 $499 吃到飽方案引發攜碼潮。技術面已啟動 5G SA 獨立組網，與 Nokia 合作實現 5G NR CA 2.34Gbps 下載紀錄。是台灣大最大競爭威脅。',
    reasoning: [
      { signal: '$499 方案引發攜碼潮', reasoning: '社群中「攜碼」「跳槽」關鍵字增加 200%，三雄已宣示不再價格競爭但中華仍試探市場', conclusion: '以 AI（Perplexity Pro）+ 影音生態系差異化回應，不跟進降價' },
      { signal: 'Nokia 5G NR CA 2.34Gbps', reasoning: '中華電信技術投資持續領先，形象鞏固', conclusion: '台灣大需加速 5G SA 佈署以縮小技術認知差距' },
    ],
    actions: [
      { trigger: '攜碼威脅', action: '針對中華 $499 方案推出「5G+Perplexity Pro」留客對案', target: 'IMC 團隊' },
    ],
  },
  p002: {
    headline: '出國漫遊方案負評激增，體驗缺口擴大',
    body: '出國漫遊日租 $219/日（含 2GB 後降 512kbps）面臨嚴重體驗危機。日本/韓國漫遊斷線問題、費用計算不透明、以及第三方 eSIM（Airalo 覆蓋 190 國）的競爭加劇。消費者最關注「上網穩定度」「費用透明」「即開即用」三大面向。',
    reasoning: [
      { signal: '負評 +180%', reasoning: '春節出國潮放大了漫遊品質問題的聲量', conclusion: '當務之急是修復日韓漫遊穩定度' },
      { signal: 'eSIM 搜尋量 +250%', reasoning: '年輕自由行旅客偏好線上即開即用方案', conclusion: '擴大 eSIM 漫遊覆蓋範圍是必要投資' },
    ],
    actions: [
      { trigger: '漫遊品質問題', action: '與日韓電信商重新協商漫遊 SLA', target: '國際業務部' },
      { trigger: 'eSIM 競爭', action: '擴大 eSIM 漫遊覆蓋至 50+ 國', target: '產品團隊' },
      { trigger: '費用透明度', action: '在 My 台灣大 APP 加入即時用量/費用提醒', target: 'APP 團隊' },
    ],
  },
  p003: {
    headline: 'myVideo + 影音多享組 5 平台 + Prime Video 構成最完整 OTT 生態',
    body: 'myVideo 獨家韓劇帶動訂閱成長 25%，搭配影音多享組 5 平台（Netflix+Disney++Max+myVideo+KKBOX）與 Prime Video 月租 $120，形成全球電信業少見的完整 OTT 生態系。Opensignal 評測台灣大整體影音體驗 73.2 分為三雄最高、5G 影音蟬聯冠軍。',
    reasoning: [
      { signal: '影音多享組升級 5 平台 + Prime Video', reasoning: '覆蓋影視+音樂全場景，一站管理建立用戶切換成本', conclusion: '以「一帳號 6 平台」便利性作為核心行銷訊息' },
      { signal: 'Opensignal 影音體驗 73.2 分冠軍', reasoning: '第三方評測數據是最有說服力的行銷背書', conclusion: '在所有影音相關廣告中標註 Opensignal 冠軍' },
    ],
    actions: [
      { trigger: '生態系行銷', action: '製作「一個帳號 6 個影音平台」廣告素材', target: 'IMC 團隊' },
      { trigger: 'ARPU 提升', action: '推出「影音全餐」含影音多享組 + Prime Video 優惠組合', target: '產品團隊' },
    ],
  },
  s001: {
    headline: '出國旅遊情境：eSIM-only 趨勢加速，漫遊體驗亟需升級',
    body: '出國旅遊是聲量最高的消費情境，但台灣大在「上網穩定度」與「即開即用」兩大面向落後競品。eSIM 漫遊覆蓋僅 15 國遠低於 Airalo 190 國。更關鍵的是 iPhone Air（2026 春季）將為 eSIM-only，台灣 eSIM 普及率僅 12%，電信業須加速 eSIM 開通流程優化。搭配 Perplexity AI 翻譯/導航功能可創造「出國 AI 旅伴」新定位。',
    reasoning: [
      { signal: '漫遊負評 +180%', reasoning: '春節出國潮放大品質問題聲量，日韓漫遊斷線/費用不透明是核心', conclusion: '修復漫遊品質是當務之急' },
      { signal: 'iPhone Air eSIM-only 即將上市', reasoning: 'eSIM 將從選配變為唯一選項，電信門市實體 SIM 業務受衝擊', conclusion: '搶先優化 eSIM 開通流程，目標 3 分鐘完成' },
      { signal: 'Perplexity AI 可結合旅遊場景', reasoning: '出國導航/翻譯/查詢是高頻需求，Perplexity Pro 可作為「AI 旅伴」', conclusion: '推出「出國 AI 旅伴包」含漫遊 + Perplexity Pro + 旅平險' },
    ],
    actions: [
      { trigger: 'eSIM 佈局', action: '優化 eSIM 開通流程至 3 分鐘內，推出 eSIM 漫遊專屬優惠', target: '產品/APP 團隊' },
      { trigger: '行銷素材建議', action: '製作「出國 AI 旅伴」系列內容，展示 Perplexity + 漫遊的實用場景', target: 'IMC 團隊' },
    ],
  },
  k001: {
    headline: '李珠珢代言效果顯著帶動品牌年輕化',
    body: '台灣大 2025 年度代言人李珠珢（AI 女神）以韓國啦啦隊三振舞走紅全球，YouTube 觀看數破億。「AI 神展開、台灣大可能」品牌形象影片上線後觀看數破百萬，帶動 18-30 歲族群品牌好感度顯著提升。建議強化其與 5G 體驗、myfone 購物的連結。',
    reasoning: [
      { signal: '形象影片破百萬觀看', reasoning: '年輕族群對代言人認同度高', conclusion: '加大代言人行銷預算投入' },
    ],
    actions: [
      { trigger: '品牌年輕化', action: '推出李珠珢聯名 5G 方案或 myfone 限定商品', target: 'IMC 團隊' },
    ],
  },
  s002: {
    headline: '居家追劇情境黏著度高，5 平台影音生態系成形',
    body: '居家追劇是台灣大覆蓋最完整的消費情境。影音多享組已升級為 5 平台（Netflix+Disney++Max+myVideo+KKBOX），搭配 Prime Video 月租 $120 形成全球最完整 OTT 訂閱生態系。Opensignal 評測台灣大整體影音體驗 73.2 分為三雄最高、5G 影音體驗蟬聯冠軍。獨家韓劇帶動訂閱成長 25%，寬頻綁定滿意度 4.5/5。挑戰：Netflix/Disney+ 直售價格更低，需持續以「一站管理」便利性留客。',
    reasoning: [
      { signal: '影音多享組升級 5 平台 +35% 訂閱成長', reasoning: '一站式管理 5 個 OTT 平台的便利性是核心競爭力', conclusion: '持續擴充平台數，鎖定「影音管家」定位' },
      { signal: 'Opensignal 影音體驗 73.2 分冠軍', reasoning: '有數據佐證的網路品質優勢可轉化為行銷素材', conclusion: '以第三方評測背書打造「追劇首選電信」形象' },
      { signal: 'Prime Video $120 補強歐美劇', reasoning: 'myVideo 以韓劇/台劇為主，Prime Video 填補歐美內容缺口', conclusion: '以「亞洲劇看 myVideo、歐美劇看 Prime Video」差異化定位' },
    ],
    actions: [
      { trigger: '影音生態行銷', action: '製作「一個帳號 6 個影音平台」社群企劃，強調便利性與 CP 值', target: 'IMC 團隊' },
      { trigger: '交叉銷售', action: '寬頻續約時主動推薦影音多享組 + Prime Video 升級', target: '門市/客服' },
      { trigger: 'Opensignal 背書', action: '以「5G 影音冠軍」為主軸投放追劇場景廣告', target: 'IMC 團隊' },
    ],
  },
  s003: {
    headline: '通勤娛樂情境 5G 體驗是關鍵決勝點',
    body: '通勤族每日花 60-90 分鐘在交通工具上，高度依賴行動網路進行影音串流、社群瀏覽與遊戲。5G 不限速吃到飽搭配影音多享組是核心產品組合，但台北捷運/高鐵部分路段 5G 覆蓋不足影響體驗，中華電信在捷運站點覆蓋率較高。',
    reasoning: [
      { signal: '5G 捷運體驗討論聲量 +150%', reasoning: '通勤族對「地下室斷線」極度敏感', conclusion: '優先改善捷運沿線 5G 覆蓋' },
      { signal: '影音多享組在通勤場景使用率高', reasoning: '短程通勤看 YouTube，長程通勤看 Netflix/Disney+', conclusion: '強化通勤場景的影音行銷' },
    ],
    actions: [
      { trigger: '體驗改善', action: '與台北捷運/高鐵合作加密小型基地台部署', target: '網路工程部' },
      { trigger: '行銷素材建議', action: '製作「通勤不無聊」社群企劃，邀 KOL 分享通勤追劇清單', target: 'IMC 團隊' },
    ],
  },
  s004: {
    headline: '遠距辦公需求穩定，企業方案是成長引擎',
    body: '後疫情時代混合辦公已成常態，消費者需要穩定的家用寬頻搭配行動 5G 做備援。台灣大光纖 1G + 企業行動方案的組合在 SOHO 族與中小企業中口碑良好。但企業方案知名度不足，多數消費者僅知個人方案。',
    reasoning: [
      { signal: '「在家工作」關鍵字搜尋量穩定高位', reasoning: '混合辦公是長期趨勢非短期現象', conclusion: '將遠距辦公定位為常態性行銷主題' },
      { signal: '企業行動方案 NPS 偏低', reasoning: '方案內容好但行銷曝光度不足', conclusion: '針對 SOHO/中小企業加大數位廣告投放' },
    ],
    actions: [
      { trigger: '行銷素材建議', action: '製作「辦公室在哪裡都行」品牌影片，強調寬頻+5G 雙保險', target: 'IMC 團隊' },
      { trigger: '產品推廣', action: '推出「在家創業包」含寬頻+5G+雲端空間', target: '企業業務部' },
    ],
  },
  s005: {
    headline: '寵物監控是 IoT 藍海，台灣大尚未布局',
    body: '「寵物在家監控」情境討論量暴增 320%，全台寵物數已超過 350 萬隻，逼近 15 歲以下兒童數量。消費者需要穩定的家用網路 + IoT 攝影機 + 手機即時推播方案。台灣大目前僅有企業 IoT 方案，尚無面向一般消費者的居家 IoT 產品線。中華電信已推出智慧家庭方案搶先布局。',
    reasoning: [
      { signal: '寵物監控討論量 +320%', reasoning: '毛小孩經濟是台灣消費新主力', conclusion: '立即啟動居家 IoT 產品線規劃' },
      { signal: '中華電信智慧家庭方案已上市', reasoning: '競品搶先布局將建立用戶心智壁壘', conclusion: '加速推出對應方案避免落後' },
    ],
    actions: [
      { trigger: '新產品開發', action: '與 IoT 攝影機品牌合作推出「毛孩守護包」含寬頻+攝影機+APP', target: '產品團隊' },
      { trigger: '行銷素材建議', action: '製作寵物主人 UGC 企劃「我家毛孩日常」帶動社群話題', target: 'IMC 團隊' },
      { trigger: '通路合作', action: '在 myfone 購物設立寵物智慧家電專區', target: 'myfone 購物團隊' },
    ],
  },
  s006: {
    headline: '低資費需求以學生與銀髮族為主力',
    body: '4G $499 輕速吃到飽鎖定價格敏感客群（學生、銀髮族、輕度使用者）。此情境聲量穩定但 ARPU 貢獻低，重點在於降低攜碼流失率。中華電信 $499 限時方案直接衝擊此客群，LINE Mobile 以社群免計費吸引年輕族群。',
    reasoning: [
      { signal: '中華電信 $499 方案引發攜碼潮', reasoning: '低資費客群價格敏感度最高', conclusion: '以附加價值（mo 幣多回饋）留客而非降價' },
      { signal: '學生族群偏好社群免計費', reasoning: 'LINE/IG 使用量占學生總流量 60%+', conclusion: '考慮推出社群流量優惠方案' },
    ],
    actions: [
      { trigger: '留客策略', action: '4G 方案搭配 mo 幣多回饋提升用戶黏著度', target: '產品團隊' },
      { trigger: '行銷素材建議', action: '製作「小資族省錢攻略」社群圖文，強調 4G+mo 幣多的 CP 值', target: 'IMC 團隊' },
    ],
  },
  s007: {
    headline: '親子數位學習需求明確但產品缺口大',
    body: '家長對兒童上網安全與數位學習的需求持續增加，主要需要：穩定寬頻、兒童內容過濾、家長監控功能、多裝置共享。台灣大光纖寬頻與 myVideo 兒童頻道可部分滿足，但缺少兒童內容過濾與家長監控 APP，形成明顯產品缺口。',
    reasoning: [
      { signal: '兒童上網安全討論聲量 +200%', reasoning: '教育部推動數位學習政策加速家庭聯網需求', conclusion: '兒童數位安全是差異化機會點' },
      { signal: '缺少家長監控功能', reasoning: '競品已有類似功能（中華電信色情守門員）', conclusion: '開發或引入家長監控 APP' },
    ],
    actions: [
      { trigger: '產品缺口', action: '開發「親子安心上網」功能，含內容過濾 + 使用時間管理 + 位置追蹤', target: '產品團隊' },
      { trigger: '行銷素材建議', action: '製作「數位時代好爸媽」教育型內容，置入寬頻 + 親子方案', target: 'IMC 團隊' },
      { trigger: '通路合作', action: '與教育平台（均一、PaGamO）合作推出聯名方案', target: '合作夥伴部' },
    ],
  },
  s008: {
    headline: '直播帶貨情境成長快速但上行頻寬不足',
    body: '直播電商在台灣快速成長，直播主需要穩定的上行頻寬、低延遲、固定 IP。台灣大 5G 方案的上行速度表現中等，缺少固定 IP 選項。蝦皮直播、Facebook Live、TikTok Shop 等平台帶動大量個人直播主對行動上網的高要求。',
    reasoning: [
      { signal: '直播帶貨搜尋量 +180%', reasoning: '個人直播主多使用手機直播，對行動網路依賴度高', conclusion: '針對直播主推出專屬方案' },
      { signal: '上行頻寬需求未被滿足', reasoning: '現有 5G 方案上行速度不足以支撐 1080p 直播', conclusion: '推出高上行速度加值包' },
    ],
    actions: [
      { trigger: '新產品', action: '推出「直播主專案」含高上行 5G + 固定 IP + 雲端存儲', target: '產品團隊' },
      { trigger: '行銷素材建議', action: '邀請知名直播主開箱台灣大 5G 直播體驗，以直播形式行銷', target: 'IMC 團隊' },
    ],
  },
  s009: {
    headline: '銀髮族智慧手機情境需求明確但方案空白',
    body: '台灣 65 歲以上人口突破 400 萬，銀髮族智慧手機使用率快速提升。主要需求為：大字體介面、簡化操作、詐騙防護、低月租。台灣大目前僅有家庭共享方案可間接服務此族群，缺少銀髮專屬方案。遠傳已推出「樂齡方案」搶先布局。',
    reasoning: [
      { signal: '銀髮族智慧手機討論量 +160%', reasoning: '高齡化社會趨勢不可逆', conclusion: '銀髮市場是長期成長機會' },
      { signal: '詐騙防護需求強烈', reasoning: '電話詐騙受害者以 60 歲以上為最大宗', conclusion: '詐騙防護可成為差異化賣點' },
      { signal: '遠傳樂齡方案搶先布局', reasoning: '第一個進入市場者將建立品牌認知', conclusion: '加速推出銀髮專屬方案' },
    ],
    actions: [
      { trigger: '新產品', action: '推出「樂活方案」含低月租 + 大字體 APP + AI 詐騙過濾 + 子女監控', target: '產品團隊' },
      { trigger: '行銷素材建議', action: '製作「教爸媽用手機」系列短影音，溫馨感性切入', target: 'IMC 團隊' },
      { trigger: '通路', action: '門市設立銀髮服務專區，提供一對一教學', target: '門市營運部' },
    ],
  },
  p017: {
    headline: 'Perplexity Pro 免費送是 2025 最有感電信加值',
    body: '台灣大與 Perplexity AI 合作，$599 以上方案免費贈送 Perplexity Pro 一年（市價 $8,280）。PTT/Dcard 討論量 +450%，被評為「2025 最有感電信加值服務」。此合作開創「AI 電信」新定位，有效區隔中華電信/遠傳的傳統價格戰。關鍵數據：帶動 5G $599 方案新申辦成長 28%，品牌 AI 連結度從 12% 提升至 45%。',
    reasoning: [
      { signal: '社群討論量 +450%', reasoning: '市價 $8,280 的 AI 服務免費送，CP 值極高引發自發傳播', conclusion: '「AI 電信」定位已成功建立初步心智' },
      { signal: '$599 方案新申辦 +28%', reasoning: 'Perplexity Pro 有效降低 4G→5G 升級門檻', conclusion: '可進一步推出 $999+「AI Plus」方案帶動 ARPU 升級' },
    ],
    actions: [
      { trigger: 'AI 生態擴展', action: '洽談 ChatGPT Plus/Midjourney 等 AI 服務合作，打造「AI 全餐」', target: '策略合作部' },
      { trigger: '行銷素材建議', action: '製作「Perplexity Pro 10 大實用技巧」系列社群內容', target: 'IMC 團隊' },
      { trigger: 'ARPU 升級', action: '推出 $999+「AI Plus 方案」含雙 AI 服務', target: '產品團隊' },
    ],
  },
  e008: {
    headline: 'iPhone Air eSIM-only 將重塑電信通路格局',
    body: 'Apple 預計 2026 春季推出 iPhone Air（6.6mm 超薄/eSIM-only），完全取消實體 SIM 卡槽。台灣 eSIM 普及率僅 12%，電信門市實體 SIM 卡業務將受衝擊。但 eSIM 也帶來機會：線上開通降低門市成本、國際漫遊 eSIM 需求增加、雙號碼（工作+個人）使用情境擴大。',
    reasoning: [
      { signal: 'eSIM 普及率僅 12%', reasoning: '多數消費者未體驗過 eSIM 開通，流程陌生感是最大障礙', conclusion: '提前教育市場，優化開通體驗至 3 分鐘內' },
      { signal: '門市實體 SIM 業務受衝擊', reasoning: 'eSIM 線上自助開通將減少門市客流', conclusion: '門市轉型為體驗中心，展示 AI/影音/IoT 服務' },
    ],
    actions: [
      { trigger: 'eSIM 準備', action: '優化 My 台灣大 APP eSIM 開通流程，目標 3 分鐘完成', target: 'APP 團隊' },
      { trigger: '行銷素材建議', action: '製作「eSIM 超簡單」教學影片，iPhone Air 上市前提前佈局', target: 'IMC 團隊' },
    ],
  },
  s010: {
    headline: '露營戶外上網需求季節性強，山區收訊是痛點',
    body: '露營與登山活動參與人數逐年攀升，戶外活動者需要山區穩定收訊與緊急通訊功能。台灣大 5G 覆蓋主要集中於都會區，山區與偏鄉 4G 收訊亦不穩定，NCC 資料顯示山區覆蓋率僅 62%。衛星通訊（如 iPhone SOS）帶動消費者對「無死角收訊」的期待。',
    reasoning: [
      { signal: '露營關鍵字搜尋量 +120%', reasoning: '疫後戶外活動持續熱門', conclusion: '戶外場景是高情感價值行銷主題' },
      { signal: '山區斷訊抱怨頻繁', reasoning: '安全議題讓收訊問題的情緒反應特別強烈', conclusion: '山區覆蓋改善可轉化為正面 PR' },
    ],
    actions: [
      { trigger: '網路建設', action: '優先在熱門露營區/百岳登山口增設基地台', target: '網路工程部' },
      { trigger: '行銷素材建議', action: '製作「山上也有訊號」實測影片系列，展示覆蓋改善成果', target: 'IMC 團隊' },
      { trigger: '產品包裝', action: '推出「戶外安心通」含衛星緊急定位 + 離線地圖下載', target: '產品團隊' },
    ],
  },
}

function generateAISummary(entity: EntitySummary, entitySignals: InboxFact[]): EntityAISummary {
  const mapped = AI_SUMMARY_MAP[entity.id]
  if (mapped) {
    return {
      headline: mapped.headline,
      reasoning_chain: mapped.reasoning,
      body: mapped.body,
      actions: mapped.actions,
      generated_at: new Date().toISOString(),
    }
  }

  // Fallback: generate a generic summary
  const sentLabel = entity.avg_sentiment >= 0.7 ? '正面' : entity.avg_sentiment >= 0.5 ? '中性偏正' : '偏負面'
  const criticals = entitySignals.filter(s => s.severity === 'critical')
  const warnings = entitySignals.filter(s => s.severity === 'warning')

  const reasoning = entitySignals.slice(0, 3).map(s => ({
    signal: s.title,
    reasoning: `此信號反映 ${entity.canonical_name} 在「${s.title.split(' ')[0]}」面向的變化趨勢`,
    conclusion: s.severity === 'critical' ? '需立即關注' : s.severity === 'warning' ? '建議持續監測' : '目前趨勢穩定',
  }))

  const actions = criticals.length > 0
    ? [{ trigger: criticals[0].title, action: '立即啟動應急處理流程', target: '相關團隊' }]
    : warnings.length > 0
    ? [{ trigger: warnings[0].title, action: '安排專人追蹤分析', target: '分析團隊' }]
    : [{ trigger: '常規監測', action: '維持現有監測頻率', target: '數據團隊' }]

  return {
    headline: `${entity.canonical_name} 聲量分析：${entity.mention_count} 則提及，整體情感${sentLabel}`,
    reasoning_chain: reasoning,
    body: `${entity.canonical_name}（${entity.type}）在過去 4 週共有 ${entity.mention_count} 則提及，涵蓋 ${entity.aspect_count} 個面向，整體情感分數 ${Math.round(entity.avg_sentiment * 100)}%。${criticals.length > 0 ? `目前有 ${criticals.length} 個嚴重警示需要立即處理。` : ''}${warnings.length > 0 ? `另有 ${warnings.length} 個警告信號值得關注。` : '整體表現穩定。'}`,
    actions,
    generated_at: new Date().toISOString(),
  }
}

function generateChatReply(entity: EntitySummary, userMsg: string): string {
  const entitySignals = SIGNALS.filter(s => s.object_id === entity.id)
  const links = LINK_MAP[entity.id] ?? []
  const summary = AI_SUMMARY_MAP[entity.id]
  const sentPct = Math.round(entity.avg_sentiment * 100)
  const sentLabel = entity.avg_sentiment >= 0.7 ? '正面' : entity.avg_sentiment >= 0.5 ? '中性偏正' : '偏負面'

  // Gather rich context about this entity
  const relatedProducts = links.filter(l => l.linked_type === 'product').map(l => l.linked_name)
  const relatedScenarios = links.filter(l => l.linked_type === 'scenario').map(l => l.linked_name)
  const relatedBrands = links.filter(l => l.linked_type === 'brand').map(l => l.linked_name)
  const relatedKols = links.filter(l => l.linked_type === 'person').map(l => l.linked_name)
  const criticals = entitySignals.filter(s => s.severity === 'critical')
  const warnings = entitySignals.filter(s => s.severity === 'warning')
  const opportunities = entitySignals.filter(s => s.fact_type === 'opportunity')

  // Build context-aware response sections that get assembled based on the question
  const sections: string[] = []

  // Always start with a direct answer framing
  sections.push(`針對你的問題，以下是 **${entity.canonical_name}** 的分析：\n`)

  // Section: data overview (always include a compact version)
  const dataLine = `目前累計 ${entity.mention_count} 則提及、情感分數 ${sentPct}%（${sentLabel}）、${entity.aspect_count} 個討論面向。`
  sections.push(dataLine)

  // Section: key signals — pick the most relevant ones based on user question
  if (entitySignals.length > 0) {
    // Try to find signals whose title/description matches user keywords
    const userWords = userMsg.replace(/[?？！!。，、]/g, '').split(/\s+/).filter(w => w.length >= 2)
    let relevantSignals = entitySignals.filter(s =>
      userWords.some(w => s.title.includes(w) || s.description.includes(w))
    )
    if (relevantSignals.length === 0) relevantSignals = entitySignals.slice(0, 3)
    sections.push(`\n**相關信號：**\n${relevantSignals.slice(0, 4).map(s => {
      const icon = s.severity === 'critical' ? '🔴' : s.severity === 'warning' ? '🟡' : '🔵'
      return `${icon} ${s.title}：${s.description.slice(0, 80)}${s.description.length > 80 ? '...' : ''}`
    }).join('\n')}`)
  }

  // Section: relationships context
  const relParts: string[] = []
  if (relatedProducts.length > 0) relParts.push(`相關產品：${relatedProducts.slice(0, 4).join('、')}`)
  if (relatedScenarios.length > 0) relParts.push(`關聯情境：${relatedScenarios.slice(0, 4).join('、')}`)
  if (relatedBrands.length > 0) relParts.push(`關聯品牌：${relatedBrands.slice(0, 3).join('、')}`)
  if (relatedKols.length > 0) relParts.push(`相關 KOL：${relatedKols.join('、')}`)
  if (relParts.length > 0) {
    sections.push(`\n**關係圖譜：**\n${relParts.map(p => `• ${p}`).join('\n')}`)
  }

  // Section: risk & opportunity assessment
  if (criticals.length > 0 || warnings.length > 0 || opportunities.length > 0) {
    const riskParts: string[] = []
    if (criticals.length > 0) riskParts.push(`⚠️ ${criticals.length} 則嚴重警示需立即處理：${criticals.map(c => c.title).join('、')}`)
    if (warnings.length > 0) riskParts.push(`🟡 ${warnings.length} 則中度警示持續監測中`)
    if (opportunities.length > 0) riskParts.push(`💡 ${opportunities.length} 個潛在機會點：${opportunities.map(o => o.title).join('、')}`)
    sections.push(`\n**風險與機會：**\n${riskParts.join('\n')}`)
  }

  // Section: from AI Summary if available (reasoning + actions)
  if (summary) {
    // Pick one reasoning chain step that might be relevant
    const relevantReasoning = summary.reasoning.find(r =>
      userMsg.split('').some(c => r.signal.includes(c) || r.conclusion.includes(c))
    ) || summary.reasoning[0]
    if (relevantReasoning) {
      sections.push(`\n**洞察推論：**\n📊 信號「${relevantReasoning.signal}」→ ${relevantReasoning.reasoning} → **${relevantReasoning.conclusion}**`)
    }

    // Include actionable recommendations
    if (summary.actions.length > 0) {
      sections.push(`\n**建議行動：**\n${summary.actions.map(a => `• **${a.trigger}**：${a.action}（→ ${a.target}）`).join('\n')}`)
    }
  }

  // Section: market context (always useful for telecom)
  if (entity.type === 'brand' || entity.type === 'product' || entity.type === 'scenario') {
    sections.push(`\n**市場背景：**\n台灣電信「新三雄」格局：中華電信 39.4%（ARPU $525.3）、台灣大 32.0%（929 萬用戶/5G 344 萬/ARPU $460.9）、遠傳 28.6%（ARPU $527.7 三雄最高）。台灣大 2024 EPS $4.57 創六年新高，2026/1 超越中華成電信獲利王。Opensignal 影音體驗 73.2 分冠軍，但 5G availability 31.8% 落後遠傳 36.1%。Perplexity AI 合作為 AI 電信新定位，影音多享組 5 平台 + Prime Video 建構最完整 OTT 生態系。`)
  }

  return sections.join('\n')
}

// ────────────────────────────────────────────
// 7. Route Handler
// ────────────────────────────────────────────

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Build an SSE ReadableStream that emits text in chunks, simulating AI streaming */
function sseStream(text: string): Response {
  const encoder = new TextEncoder()
  // Split into ~20-char chunks to simulate streaming
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 20) {
    chunks.push(text.slice(i, i + 20))
  }
  let idx = 0
  const stream = new ReadableStream({
    start(controller) {
      function push() {
        if (idx < chunks.length) {
          const payload = JSON.stringify({ content: chunks[idx] })
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
          idx++
          setTimeout(push, 30 + Math.random() * 40)
        } else {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
      // Initial "thinking" delay
      setTimeout(push, 600 + Math.random() * 400)
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}

/** Enrich entity with sparkline + mention_delta from OBS_PATTERNS */
function enrichEntity(e: EntitySummary): EntitySummary {
  const pattern = OBS_PATTERNS[e.id]
  if (pattern && pattern.length >= 2) {
    // sparkline = mention counts over time (reversed so oldest first for chart)
    const sparkline = pattern.map(p => p[0]).reverse()
    const curr = pattern[0][0]
    const prev = pattern[1][0]
    const mention_delta = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0
    return { ...e, sparkline, mention_delta }
  }
  // For entities without explicit patterns, generate a simple sparkline from baseMentions
  const base = Math.max(1, Math.round(e.mention_count / 24))
  const sparkline = Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin(i * 0.6) * 0.15
    return Math.max(0, Math.round(base * (1 + wave + (11 - i) * 0.02)))
  })
  return { ...e, sparkline, mention_delta: 0 }
}

function handleApi(url: string, init?: RequestInit): Response | null {
  const parsed = new URL(url, 'http://localhost')
  const path = parsed.pathname
  const params = parsed.searchParams

  if (init?.method === 'PATCH') {
    return json({ success: true })
  }

  if (path === '/api/entities') {
    const q = params.get('q')?.toLowerCase()
    const limit = Number(params.get('limit') ?? 200)
    let list = ENTITIES
    if (q) {
      list = ENTITIES.filter(e =>
        e.canonical_name.toLowerCase().includes(q) ||
        (ALIAS_MAP[e.id] ?? []).some(a => a.toLowerCase().includes(q)) ||
        e.type.includes(q)
      )
    }
    const sort = params.get('sort') ?? 'mention_count'
    const order = params.get('order') ?? 'desc'
    const enriched = list.map(enrichEntity)
    const sorted = enriched.slice().sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sort] as number ?? 0
      const bVal = (b as unknown as Record<string, unknown>)[sort] as number ?? 0
      return order === 'desc' ? bVal - aVal : aVal - bVal
    })
    const result = sorted.slice(0, limit)
    return json({ data: result, pagination: { offset: 0, limit, total: sorted.length, has_more: sorted.length > limit } })
  }

  if (path === '/api/dashboard') {
    return json(DASHBOARD)
  }

  if (path === '/api/inbox/count') {
    const unread = SIGNALS.filter(s => !s.is_read).length
    return json({ count: unread, data: { unread } })
  }

  if (path === '/api/inbox') {
    const severity = params.get('severity')
    const factType = params.get('fact_type')
    const offset = Number(params.get('offset') ?? 0)
    const limit = Number(params.get('limit') ?? 30)
    let list = SIGNALS
    if (severity) list = list.filter(s => s.severity === severity)
    if (factType) list = list.filter(s => s.fact_type === factType)
    const page = list.slice(offset, offset + limit)
    return json({ data: page, pagination: { offset, limit, total: list.length, has_more: offset + limit < list.length } })
  }

  const obsMatch = path.match(/^\/api\/entities\/([^/]+)\/observations$/)
  if (obsMatch) {
    const id = obsMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return json({ data: [] })
    const obs = generateObservations(id, entity.mention_count, entity.avg_sentiment)
    const limit = Number(params.get('limit') ?? 24)
    return json({ data: obs.slice(0, limit), pagination: { offset: 0, limit, total: obs.length, has_more: false } })
  }

  // AI Summary endpoint
  const summaryMatch = path.match(/^\/api\/entities\/([^/]+)\/summary$/)
  if (summaryMatch) {
    const id = summaryMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return json({ data: null })
    const entitySignals = SIGNALS.filter(s => s.object_id === id)
    const summary = generateAISummary(entity, entitySignals)
    return json({ data: summary })
  }

  // AI Chat endpoint — return SSE stream
  const chatMatch = path.match(/^\/api\/entities\/([^/]+)\/chat$/)
  if (chatMatch) {
    const id = chatMatch[1]
    const entity = ENTITIES.find(e => e.id === id)
    if (!entity) return sseStream('找不到該實體的資料。')
    let body: { question?: string; messages?: { role: string; content: string }[] } = {}
    try { body = init?.body ? JSON.parse(init.body as string) : {} } catch {}
    const lastMsg = body.question || (body.messages?.filter(m => m.role === 'user').pop()?.content ?? '')
    const reply = generateChatReply(entity, lastMsg)
    return sseStream(reply)
  }

  const factsMatch = path.match(/^\/api\/entities\/([^/]+)\/facts$/)
  if (factsMatch) {
    const id = factsMatch[1]
    const entityFacts = SIGNALS.filter(s => s.object_id === id)
    return json({ data: entityFacts, pagination: { offset: 0, limit: 10, total: entityFacts.length, has_more: false } })
  }

  const detailMatch = path.match(/^\/api\/entities\/([^/]+)$/)
  if (detailMatch) {
    const id = detailMatch[1]
    const detail = buildEntityDetail(id)
    if (!detail) return json({ data: null })
    return json({ data: detail })
  }

  if (path === '/api/entity-types') {
    const typeCounts = new Map<string, number>()
    for (const e of ENTITIES) {
      typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1)
    }
    const types = Array.from(typeCounts.entries()).map(([name, count]) => ({
      name,
      display_name: name,
      entity_count: count,
    }))
    return json({ data: types })
  }

  if (path === '/api/graph') {
    const edges = Object.entries(LINK_MAP).flatMap(([sourceId, links]) =>
      links.filter(l => l.direction === 'outgoing').map(l => ({
        source_id: sourceId,
        target_id: l.linked_id,
        link_type: l.link_type,
      }))
    )
    return json({ data: { nodes: ENTITIES, edges } })
  }

  return null
}

// ────────────────────────────────────────────
// 7. Global Fetch Interceptor
// ────────────────────────────────────────────

const _originalFetch = window.fetch.bind(window)

// Track which entities have had their AI summary "generated"
const _summaryCache = new Set<string>()

window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.startsWith('/api/')) {
    const mock = handleApi(url, init)
    if (mock) {
      const isChat = url.includes('/chat')
      if (isChat) return Promise.resolve(mock)

      const smMatch = url.match(/\/entities\/([^/]+)\/summary/)
      if (smMatch) {
        const eid = smMatch[1]
        if (_summaryCache.has(eid)) {
          return new Promise(resolve => setTimeout(() => resolve(mock), 80 + Math.random() * 80))
        }
        _summaryCache.add(eid)
        return new Promise(resolve => setTimeout(() => resolve(mock), 3000 + Math.random() * 2000))
      }

      return new Promise(resolve => setTimeout(() => resolve(mock), 80 + Math.random() * 120))
    }
  }
  return _originalFetch(input, init)
}) as typeof window.fetch
