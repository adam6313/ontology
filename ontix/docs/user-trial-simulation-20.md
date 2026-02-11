# Ontix 20 人試用模擬報告
### 2026-02-10 | Phase 7-8 完成後

---

## 方法論

模擬 20 位目標用戶實際使用 Ontix 現有功能，記錄每位用戶的：
- 角色背景與使用場景
- 逐步操作體驗（能做到 ✅ / 部分 ⚠️ / 做不到 ❌）
- 好評 👍 與差評 👎
- 購買意願評分（1-10）

### 目前已有功能清單（Phase 7-8 完成後）
- Pulse：Signal Banner / What Changed（Top Movers, Sentiment Drops, Emerging） / Trend Detection / Topic Radar / SOV Treemap / Metric Cards with Sparklines / Entity Monitor with Sparkline + Delta% / Recent Insights / ⌘K搜尋 / Watchlist / PeriodSelector（All/1W/4W/12W）
- EntityProfile：Header + Stats + Sentiment Bar / PeriodSelector / Aspect Distribution + Sentiment Filter / Aspect Drill-down → Mentions / Mention Sort（Latest/Most Positive/Most Negative） / Mention Sentiment Filter / TrendChart（雙軸：mentions + sentiment%） / SentimentChart / KOL Attribution Panel / Topic Distribution（person） / WhoDiscusses + RelatedBrands（topic） / Related Entities / Insights & Alerts / Event Marker
- Knowledge Graph：Force-directed + drag + pan / Node icons + color / Edge styles / Hover detail / Type filter / Click detail card
- Inbox：Severity filter / Fact type filter / Evidence readable / Batch select + 全部已讀/忽略 / Pagination
- 搜尋：⌘K 快捷鍵 / 文字搜尋跨所有實體

### 仍不存在的功能
- 比較功能（A vs B）
- 匯出/報告（PDF, CSV, 週報）
- 原文連結（post URL）
- 自訂 alert 閾值
- email/webhook 通知
- 用戶帳號/權限
- 資料源管理 UI
- 即時更新（仍為 batch）
- 多品牌 workspace
- 中文 UI（大部分英文）

---

## U1：王雅琪，品牌方行銷經理（美妝）

**背景**：某韓系美妝品牌台灣分公司，負責 3 條產品線的行銷策略
**場景**：月會前需要了解品牌旗下產品的消費者口碑變化

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 打開 Pulse | ✅ What Changed 顯示 Top Movers + Sentiment Drops | 👍「一眼就看到哪些產品有異動」 |
| 2 | 切換 Period 到 4W | ✅ 數據連動更新 | 👍 |
| 3 | 點進某產品看 Aspect Distribution | ✅ 有保濕效果、質地、價格等面向 | 👍「能看到消費者在意什麼」 |
| 4 | 切 Negative filter 看負面 aspects | ✅ 只顯示負面面向 | 👍👍「這很實用」 |
| 5 | 點 aspect → 鑽取看 mentions | ✅ 顯示該面向相關提及 | 👍 |
| 6 | 想看原文出處（哪個 KOL 在哪個平台發的） | ⚠️ 有 author + platform，但沒有原文連結 | 😕「不能點過去看？」 |
| 7 | 看 Mention Trend 趨勢圖 | ✅ 雙軸折線圖清楚 | 👍 |
| 8 | 想截圖放進月報 PPT | ⚠️ 只能手動截圖 | 😕 |
| 9 | 想匯出 aspect 分析數據 | ❌ 沒有匯出 | 😤 |

### 好評 👍
1. **What Changed 區域超直觀** — 不用找就知道哪些產品有變化
2. **Aspect × Sentiment 篩選很強** — 直接看到負面面向，省去人工翻閱
3. **Trend Chart 雙軸設計好** — mentions 和 sentiment 同時看
4. **Period 切換流暢** — 4W 和 12W 的對比很有感

### 差評 👎
1. **沒有匯出** — 月會需要 PPT/PDF，手動截圖太慢
2. **沒有原文連結** — 看到負面提及想去原文回覆
3. **界面是英文** — 跟中文客戶簡報不搭
4. **不能跨產品比較** — 想看 A 產品 vs B 產品的 aspect 對比

### 購買意願：5/10
> 「功能有到位，但沒辦法帶出去用。如果能匯出報告就到 7 分。」

---

## U2：陳柏翰，KOL 代理商 AE

**背景**：中型代理商，同時服務 4 個品牌客戶
**場景**：準備季度回顧簡報，需要呈現 KOL Campaign 成效

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋客戶品牌名 | ✅ ⌘K 搜尋找到 | 👍 |
| 2 | 看品牌 Entity Profile | ✅ 完整 stats | 👍 |
| 3 | 看 KOL Attribution Panel | ✅ 顯示哪些 KOL 在討論此品牌 | 👍👍「這個功能太好了」 |
| 4 | 想看 KOL 的 engagement rate | ❌ 系統沒有社群指標 | 😤 |
| 5 | 想比較「合作前 vs 合作後」聲量 | ⚠️ 可以切 Period，但沒有 period-over-period 對比 | 😕 |
| 6 | 想匯出品牌+KOL 分析報告 | ❌ 沒有匯出 | 😡 |
| 7 | 想用 Event Marker 標記 campaign 日期 | ✅ TrendChart 有 Event Marker | 👍 |

### 好評 👍
1. **KOL Attribution Panel** — 代理商最需要的功能之一
2. **Event Marker** — 可以標記 campaign launch，很實用
3. **Knowledge Graph** — 視覺化品牌 × KOL × 產品關係
4. **Sparkline 趨勢一目了然** — Entity Card 上就能看到趨勢

### 差評 👎
1. **沒有匯出報告** — AE 的核心需求，必須給客戶看報告
2. **缺乏社群指標** — engagement rate, reach, impressions 都沒有
3. **沒有 period-over-period** — 無法展示 campaign 前後對比
4. **Watchlist 沒有分組** — 不同客戶的品牌混在一起

### 購買意願：4/10
> 「KOL Attribution 很新穎，但沒有報告功能就沒法用在業務上。」

---

## U3：林思妤，美妝品牌社群經理

**背景**：負責品牌 Instagram + Threads 社群經營
**場景**：每週一早上需要快速掌握上週口碑狀況

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 打開 Pulse → 切 1W | ✅ 顯示上週變化 | 👍 |
| 2 | 看 Signal Banner | ✅ 有嚴重警告提醒 | 👍「很明顯」 |
| 3 | 看 Sentiment Drops | ✅ 最低情緒的實體 | 👍 |
| 4 | 點進負面產品看 mentions | ✅ 可以篩 Negative | 👍 |
| 5 | 想回覆該留言 → 找原文 | ❌ 沒有原文連結 | 😡「最需要的功能沒有」 |
| 6 | 想知道是哪個平台的貼文 | ⚠️ mention 有 platform 欄位 | 👍 |
| 7 | 想設定 alert → 情緒低於 0.3 自動通知 | ❌ 沒有自訂閾值 + 沒有通知 | 😤 |

### 好評 👍
1. **1W period 很適合週報** — 切一下就看到上週變化
2. **Sentiment filter** — 快速找到需要危機處理的內容
3. **Signal Banner** — 開頁面就看到警告
4. **Aspect drill-down** — 能穿透到具體面向

### 差評 👎
1. **沒有原文連結** — 社群經理的第一需求是去原文回覆
2. **沒有即時通知** — 等到隔天才看到負面評論已經太遲
3. **沒有 email/LINE 通知** — 不可能一直開著系統
4. **看不到留言數/按讚數** — 不知道影響範圍多大

### 購買意願：3/10
> 「分析很棒但我需要的是行動工具，找到問題後要能立刻去原文處理。」

---

## U4：張育誠，代理商數據分析師

**背景**：負責客戶的輿情數據分析和報告撰寫
**場景**：需要深度分析某品牌在「保濕」話題的市場定位

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋「保濕」topic | ✅ 找到 content_topic | 👍 |
| 2 | 看 WhoDiscusses | ✅ 哪些品牌/KOL 在討論 | 👍 |
| 3 | 看 RelatedBrands | ✅ 關聯品牌 | 👍 |
| 4 | 想看「保濕」在各品牌的聲量佔比 | ⚠️ 沒有 topic × brand 矩陣 | 😕 |
| 5 | 想拉出趨勢圖 + 各品牌分別的線 | ❌ 沒有多品牌比較 | 😤 |
| 6 | 想匯出原始數據做自己的分析 | ❌ 沒有 CSV 匯出 | 😤 |
| 7 | Knowledge Graph 看品牌關係 | ✅ 視覺化很有感 | 👍 |
| 8 | 想用 API 直接拉數據 | ⚠️ API 存在但沒有文件 | 😕 |

### 好評 👍
1. **Knowledge Graph 超強** — 市面上很少工具有這個
2. **Topic entity 概念很好** — 把話題當實體追蹤是對的
3. **Aspect 分析有深度** — 不只是聲量，有面向級別的情緒
4. **Ontology 推論有價值** — product_drags_brand 這種洞察競品沒有

### 差評 👎
1. **沒有 CSV/Excel 匯出** — 分析師需要原始數據
2. **沒有交叉分析** — topic × brand, aspect × time 的矩陣
3. **API 沒有文件** — 想自己拉數據但不知道怎麼用
4. **數據量不確定** — 不知道涵蓋多少平台、多少 KOL

### 購買意願：5/10
> 「底層引擎很強，但我需要更多數據切面。如果有 CSV 匯出 + API 文件就能用。」

---

## U5：許家瑜，電商品牌 PM

**背景**：負責保養品電商平台的產品策略
**場景**：想了解消費者對新上架產品的口碑反饋

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | Pulse → 看 Emerging entities | ✅ 新出現的實體列表 | 👍 |
| 2 | 找到新產品 → EntityProfile | ✅ 有基本 stats | 👍 |
| 3 | 看 Aspect Distribution | ✅ 消費者討論面向 | 👍👍「這太有價值了」 |
| 4 | 切 Negative → 看負面面向 | ✅ 篩選出問題面向 | 👍 |
| 5 | 鑽取看具體 mentions | ✅ 看到消費者怎麼說 | 👍 |
| 6 | 想看跟競品比較 | ❌ 沒有比較功能 | 😤 |
| 7 | 想設置持續追蹤 | ⚠️ Watchlist 可以追蹤 | 👍 |
| 8 | 想分享給產品團隊 | ❌ 沒有分享連結或匯出 | 😕 |

### 好評 👍
1. **Aspect Analysis 是殺手功能** — 直接知道消費者在意什麼
2. **Watchlist** — 可以追蹤特定產品
3. **Mention sort** — 按情緒排序找問題很快
4. **Trend Detection 自動化** — 不用自己盯，系統會告訴我變化

### 差評 👎
1. **沒有比較功能** — PM 最需要的是競品對比
2. **沒有分享連結** — 不能給團隊看
3. **沒有通知** — 新品上架期間需要密切關注
4. **Emerging 判斷邏輯不太對** — mention_count ≤ 8 不一定是新品

### 購買意願：6/10
> 「Aspect 分析比我用過的任何工具都深。差比較和匯出。」

---

## U6：吳建志，公關公司 Account Director

**背景**：負責多個企業客戶的聲譽管理
**場景**：客戶 CEO 有負面新聞，需要快速評估影響

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋 CEO 名字 | ✅ 找到 person entity | 👍 |
| 2 | 看 sentiment 變化 | ✅ TrendChart 看到下降 | 👍 |
| 3 | 看 Inbox → founder_risk alert | ✅ Ontology 自動偵測到 | 👍👍「wow，自動警告」|
| 4 | 看 Knowledge Graph → CEO 關聯公司 | ✅ founded_by 關係 | 👍 |
| 5 | 想看媒體報導原文 | ❌ 沒有原文連結 | 😤 |
| 6 | 想看影響擴散範圍（哪些媒體轉載） | ❌ 沒有此功能 | 😤 |
| 7 | 想匯出危機報告給客戶 | ❌ 沒有匯出 | 😡 |
| 8 | 想監控競品是否趁機攻擊 | ⚠️ competitor_surge rule 有 | 👍 |

### 好評 👍
1. **Ontology Rules 超前** — founder_risk + competitor_surge 是真正的洞察
2. **Knowledge Graph** — 看到 CEO → 公司 → 品牌 → 產品的影響鏈
3. **Aspect drill-down** — 看到具體哪些面向被討論
4. **Signal Banner** — 危機時第一時間看到警告

### 差評 👎
1. **沒有原文連結** — 公關需要看原文來準備回應
2. **沒有匯出報告** — 危機報告是核心產出物
3. **沒有即時通知** — 危機處理不能等隔天
4. **缺乏影響範圍分析** — 不知道多少人看到、多少媒體轉載

### 購買意願：4/10
> 「Ontology 推論是我見過最聰明的功能，但公關的工具需要速度和行動力。」

---

## U7：黃詩涵，KOL 本人（美妝領域，15 萬粉）

**背景**：全職美妝 KOL，需要了解自己的品牌價值
**場景**：想看自己在各品牌之間的被提及狀況，談合作時有數據支撐

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋自己名字 | ✅ 找到 person entity | 👍 |
| 2 | 看 Topic Distribution | ✅ 自己討論了哪些話題 | 👍 |
| 3 | 看 mentions + sentiment | ✅ 別人怎麼討論自己 | 👍 |
| 4 | 看 Related Entities | ✅ 關聯品牌和產品 | 👍 |
| 5 | 想看自己的「品牌影響力分數」 | ❌ 沒有 KOL scoring | 😕 |
| 6 | 想看跟其他 KOL 比較 | ❌ 沒有比較功能 | 😤 |
| 7 | 想截圖發給品牌方 | ⚠️ 手動截圖可以 | 😕 |

### 好評 👍
1. **Topic Distribution** — 知道自己的內容標籤是什麼
2. **Knowledge Graph** — 看到自己跟品牌的關聯網絡很酷
3. **Sentiment 分析** — 知道別人怎麼看自己的內容
4. **介面設計漂亮** — Liquid Glass 風格很現代

### 差評 👎
1. **缺少 KOL 專屬指標** — reach, engagement, influence score
2. **沒有比較功能** — 想跟同類型 KOL 比較
3. **沒有報告匯出** — 需要拿數據跟品牌談合作
4. **數據來源不透明** — 不知道追蹤了哪些平台

### 購買意願：3/10
> 「有趣但不是為 KOL 設計的，我需要的是 Kolr 那種功能。」

---

## U8：鄭雅文，代理商策略企劃

**背景**：負責 Campaign 前的市場洞察研究
**場景**：客戶要做「防曬」Campaign，需要瞭解市場態勢

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋「防曬」topic | ✅ 找到相關 topic | 👍 |
| 2 | 看 WhoDiscusses | ✅ 哪些 KOL/品牌在討論 | 👍 |
| 3 | 看 RelatedBrands | ✅ 關聯品牌清楚 | 👍 |
| 4 | 切 12W 看季節性趨勢 | ✅ Trend Chart 看到變化 | 👍 |
| 5 | 想看「防曬」× 各品牌的聲量份額 | ❌ 沒有交叉分析 | 😤 |
| 6 | 想看消費者的主要 pain points | ✅ Aspect negative filter | 👍👍 |
| 7 | 想把分析整理成提案 | ❌ 沒有匯出 | 😤 |

### 好評 👍
1. **Topic 追蹤 + WhoDiscusses** — 快速了解市場生態
2. **Aspect Negative Filter** — 直接找到消費者痛點
3. **12W Period** — 看季節性趨勢很實用
4. **Trend Detection 自動化** — 不用自己算百分比

### 差評 👎
1. **沒有匯出** — 提案需要
2. **沒有 topic × brand 矩陣** — 需要更細的交叉切面
3. **沒有時間比較** — 想看去年同期 vs 今年
4. **數據覆蓋率不確定** — 不知道爬了多少資料

### 購買意願：5/10
> 「Topic 分析比 QSearch 深很多，但要能匯出才有用。」

---

## U9：李宗翰，品牌方 CMO

**背景**：管理品牌整體行銷策略，月預算 500 萬
**場景**：每月 board meeting 需要展示品牌健康度

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 打開 Pulse | ✅ 一頁式 overview | 👍「乾淨」 |
| 2 | 看 SOV Treemap | ⚠️ 只是類型分佈，不是品牌競爭 | 😕「這不是我要的 SOV」 |
| 3 | 看 Metric Cards + Sparkline | ✅ Total Mentions + Sentiment 有趨勢 | 👍 |
| 4 | 想看品牌 vs 競品的聲量比較 | ❌ 沒有比較功能 | 😡「最基本的需求」 |
| 5 | 想看月度趨勢報告 | ❌ 沒有報告 | 😡 |
| 6 | 想設定 KPI dashboard | ❌ 沒有自訂 dashboard | 😤 |
| 7 | 想看 campaign ROI | ❌ 沒有 campaign tracking | 😤 |

### 好評 👍
1. **Pulse 視覺設計專業** — board meeting 可以展示
2. **Signal Banner** — CMO 需要知道異常
3. **Ontology Insights** — AI 生成的洞察摘要有 C-level 視角
4. **Sparkline everywhere** — 所有數字都帶趨勢

### 差評 👎
1. **SOV 不是真的 SOV** — 需要 brand vs brand
2. **沒有比較功能** — CMO 最在意的是跟競品比
3. **沒有報告** — board meeting 需要 PDF
4. **沒有自訂 dashboard** — 每個品牌的 KPI 不同

### 購買意願：3/10
> 「視覺很好但缺核心商務功能。i-Buzz 至少有報告和競品比較。」

---

## U10：周育萱，新創品牌創辦人（DTC 保養品）

**背景**：小團隊（5 人），自己看數據自己做行銷
**場景**：想了解消費者對自家產品的真實評價

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋品牌名 | ✅ 找到 | 👍 |
| 2 | Aspect Distribution | ✅ 看到消費者討論面向 | 👍👍「從來沒看過這種分析」 |
| 3 | Negative aspects → drill-down | ✅ 看到具體不滿 | 👍👍 |
| 4 | TrendChart | ✅ 看到聲量趨勢 | 👍 |
| 5 | Inbox alerts | ✅ 自動通知異常 | 👍 |
| 6 | Watchlist 追蹤競品 | ✅ Star 加入 | 👍 |
| 7 | 想看定價夠不夠 | ❌ 沒有比較功能 | 😕 |
| 8 | 想分享給團隊 | ❌ 沒有分享/匯出 | 😕 |

### 好評 👍
1. **Aspect 分析對小品牌極有價值** — 省下做焦點團體的錢
2. **Inbox alerts** — 小團隊沒時間盯，自動通知很好
3. **Watchlist** — 追蹤競品方便
4. **Ontology insights** — AI 洞察省很多分析時間

### 差評 👎
1. **價格考量** — 小品牌預算有限，不知道定價
2. **不知道資料涵蓋範圍** — 我的品牌有被追蹤嗎？
3. **沒有比較功能** — 想跟大品牌比
4. **沒有行動建議** — 告訴我問題但沒告訴我怎麼做

### 購買意願：6/10
> 「如果定價合理，Aspect 分析 + 自動 alert 就值得買。」

---

## U11：蔡明哲，廣告公司媒體企劃

**背景**：負責品牌的數位媒體投放策略
**場景**：想用輿情數據來優化廣告投放 targeting

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 看 Topic Radar | ✅ 熱門話題 | 👍 |
| 2 | 看話題的 WhoDiscusses | ✅ 哪些 KOL 在討論 | 👍 |
| 3 | 想看受眾 demographics | ❌ 沒有受眾資料 | 😤 |
| 4 | 想看 platform breakdown | ⚠️ mention 有 platform 但沒聚合統計 | 😕 |
| 5 | 想匯出熱門話題給廣告文案 | ❌ 沒有匯出 | 😤 |
| 6 | 想看話題的 peak 時間 | ❌ 沒有小時/天級別的資料 | 😕 |

### 好評 👍
1. **Topic Radar** — 快速看到消費者在聊什麼
2. **Aspect 分析** — 知道消費者的 pain points 可以當廣告素材
3. **Knowledge Graph** — 看品牌生態系
4. **Trend Detection** — 知道什麼話題正在爆

### 差評 👎
1. **沒有受眾資料** — 廣告企劃需要 demographics
2. **沒有平台聚合統計** — 不知道哪個平台聲量最大
3. **沒有匯出** — 需要給文案團隊
4. **時間粒度太粗** — 只有週級別，需要日/小時級別

### 購買意願：3/10
> 「有趣的市場洞察但缺乏媒體企劃需要的數據維度。」

---

## U12：楊佳穎，品牌方 CX（Customer Experience）主管

**背景**：負責消費者體驗優化
**場景**：想系統性追蹤消費者對產品各面向的滿意度變化

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 看主力產品的 Aspect Distribution | ✅ 完整面向分析 | 👍👍「這就是我要的」 |
| 2 | Negative filter → 看不滿面向 | ✅ | 👍 |
| 3 | 鑽取看具體 mentions | ✅ | 👍 |
| 4 | 想追蹤某 aspect 隨時間的變化 | ❌ 沒有 aspect-level 時間序列 | 😤 |
| 5 | 想設定 aspect sentiment 下降 alert | ⚠️ aspect_sentiment_flip rule 有 | 👍 |
| 6 | 想看各產品的 CX 分數比較 | ❌ 沒有比較功能 | 😤 |
| 7 | 想匯出月度 CX report | ❌ 沒有匯出 | 😤 |

### 好評 👍
1. **Aspect 分析完美符合 CX 需求** — 每個面向的情緒都有
2. **aspect_sentiment_flip alert** — 自動偵測面向情緒翻轉
3. **Mention drill-down** — 可以追到具體消費者說了什麼
4. **Sentiment filter** — 快速定位問題

### 差評 👎
1. **沒有 aspect 時間序列** — CX 追蹤需要看趨勢
2. **沒有比較功能** — 想跨產品比較 CX 分數
3. **沒有匯出** — CX 月報需要
4. **沒有自訂分類** — 想把 aspects 分成自己的 taxonomy

### 購買意願：6/10
> 「Aspect 分析是市場上最好的，就差 aspect 趨勢和匯出。」

---

## U13：劉彥廷，代理商業務總監

**背景**：負責開發新客戶，需要用工具展示代理商能力
**場景**：pitch meeting 要 demo 工具給潛在客戶看

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 打開 Pulse → 展示 dashboard | ✅ 視覺效果佳 | 👍「客戶會印象深刻」 |
| 2 | Knowledge Graph demo | ✅ 互動式圖譜很震撼 | 👍👍 |
| 3 | Aspect drill-down demo | ✅ | 👍 |
| 4 | 想展示「你的品牌 vs 競品」 | ❌ 沒有比較頁 | 😤 |
| 5 | 想即時輸入客戶品牌搜尋 | ⚠️ 只能搜現有資料 | 😕 |
| 6 | 想給客戶看精美報告 sample | ❌ 沒有報告 | 😡 |

### 好評 👍
1. **Knowledge Graph 是 demo 殺手鐧** — 客戶都會「哇」
2. **Pulse 視覺設計 > 競品** — Liquid Glass 很現代
3. **Ontology Insights** — AI 洞察是差異化亮點
4. **Sparkline + Delta%** — 數字都帶趨勢感

### 差評 👎
1. **沒有 demo 報告** — pitch 需要給客戶帶走的東西
2. **沒有比較功能** — 客戶第一個問題一定是「跟競品比呢？」
3. **不能即時加入新品牌** — demo 時要搜客戶的品牌
4. **英文介面** — 台灣客戶可能不習慣

### 購買意願：5/10
> 「Knowledge Graph + Insights 做 pitch 很強，但缺報告和比較就缺臨門一腳。」

---

## U14：陳怡伶，代理商 Senior Planner

**背景**：負責寫 Campaign proposal 的策略部分
**場景**：需要用輿情數據支撐 Campaign 策略建議

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | Topic 搜尋 → 看市場話題分佈 | ✅ Topic Radar + WhoDiscusses | 👍 |
| 2 | Aspect 分析 → 找消費者 unmet needs | ✅ Negative aspects 就是 unmet needs | 👍👍「策略切角就在這裡」 |
| 3 | Knowledge Graph → 看品牌生態系 | ✅ | 👍 |
| 4 | 想做 consumer journey mapping | ❌ 沒有此功能 | 😕 |
| 5 | 想拿 insights 原文放進提案 | ⚠️ 可以複製文字 | 👍 |
| 6 | 想匯出圖表放進簡報 | ❌ 沒有匯出 | 😤 |

### 好評 👍
1. **Aspect Negative = Unmet Needs** — 策略企劃的金礦
2. **Ontology Insights** — AI 洞察可以直接引用
3. **Topic 生態追蹤** — 了解話題全貌
4. **Period 切換** — 看不同時間範圍的變化

### 差評 👎
1. **沒有匯出** — 提案簡報必需
2. **沒有消費者旅程分析** — 策略需要
3. **沒有關鍵字雲/詞頻** — 想看高頻詞彙
4. **Insight 語言混雜** — 有時英文有時中文

### 購買意願：5/10
> 「Aspect + Topic 分析的深度比 i-Buzz 好，要有匯出就能買。」

---

## U15：林志偉，台灣微型電商品牌主

**背景**：1-2 人公司，販售手工保養品
**場景**：想知道消費者對自己品牌（還很小）的評價

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 搜尋品牌名 | ❌ 品牌太小，沒有被追蹤 | 😤 |
| 2 | 想自己加入追蹤 | ❌ 沒有資料源管理 UI | 😤 |
| 3 | 瀏覽大品牌的分析 | ✅ 介面好看 | 👍 |
| 4 | 想看競品的 aspect 分析 | ✅ 大品牌有 | 👍 |

### 好評 👍
1. **介面設計很好** — 比一般輿情工具現代
2. **概念有價值** — 如果有自己品牌的資料會很有用
3. **Aspect 分析有深度** — 看競品的消費者痛點可以參考

### 差評 👎
1. **品牌不在系統中** — 最大的問題
2. **沒有自助加入追蹤** — 需要手動設定
3. **價格可能太高** — 微型品牌預算有限
4. **沒有免費試用** — 不知道值不值

### 購買意願：2/10
> 「如果我的品牌在裡面而且有免費 tier，會考慮。」

---

## U16：張淑芬，品牌方 PR Director

**背景**：大型消費品集團 PR 部門主管
**場景**：年度品牌聲譽報告撰寫

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 看多個品牌的 EntityProfile | ✅ 逐一檢視 | 👍 |
| 2 | Inbox alerts 看品牌風險 | ✅ severity filter | 👍 |
| 3 | 想看年度聲量趨勢 | ⚠️ 最多 12W，沒有年度 | 😤 |
| 4 | 想匯出品牌聲譽報告 | ❌ 沒有報告 | 😡 |
| 5 | 想追蹤媒體 coverage | ❌ 不分辨 KOL vs 媒體 | 😕 |
| 6 | 想用 Knowledge Graph 做 stakeholder mapping | ✅ 視覺化好 | 👍 |

### 好評 👍
1. **Knowledge Graph** — stakeholder mapping 的好工具
2. **Ontology alerts** — 品牌風險偵測
3. **Aspect 分析** — PR 需要知道公眾議論面向
4. **Sentiment 追蹤** — 看品牌情緒變化

### 差評 👎
1. **時間範圍太短** — PR 需要年度數據
2. **沒有匯出報告** — 品牌聲譽報告是核心產出物
3. **不區分媒體 vs KOL** — PR 需要分開看
4. **沒有比較功能** — 集團下多品牌需要比較

### 購買意願：3/10
> 「需要年度數據 + 報告匯出 + 媒體分類才有 PR 的價值。」

---

## U17：黃彥博，代理商 Data Lead

**背景**：帶 3 人數據團隊，負責建立數據驅動文化
**場景**：評估 Ontix 是否能取代現有的 QSearch

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 全面試用各功能 | ✅ 功能齊全 | 👍 |
| 2 | 評估 API 能力 | ⚠️ API 完整但沒有文件 | 😕 |
| 3 | 評估數據覆蓋率 | ❌ 不知道涵蓋多少平台 | 😤 |
| 4 | 測試自訂分析 | ⚠️ 有 API 但沒有 Notebook 整合 | 😕 |
| 5 | 評估 vs QSearch | ⚠️ 分析深度勝，但覆蓋率不確定 | 😕 |

### 好評 👍
1. **Ontology Engine** — QSearch 沒有的概念
2. **Aspect × Sentiment** — 比 QSearch 的聲量分析深
3. **Knowledge Graph** — 全新的分析維度
4. **TrendChart + Sparkline** — 視覺化比 QSearch 好

### 差評 👎
1. **數據覆蓋率不透明** — 代理商需要保證覆蓋率
2. **沒有 API 文件** — 想建自己的 dashboard
3. **沒有比較功能** — 基本需求
4. **沒有 CSV 匯出** — 數據團隊需要

### 購買意願：5/10
> 「引擎比 QSearch 強，但缺透明度和數據可攜性。做為輔助工具 OK，取代不行。」

---

## U18：陳思宇，品牌方社群行銷專員

**背景**：負責品牌的 UGC 內容策略
**場景**：想找到消費者產出的好內容來 repost

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 看產品 mentions | ✅ 有內容列表 | 👍 |
| 2 | Sort by Most Positive | ✅ 情緒排序 | 👍 |
| 3 | 想找到原文 → repost | ❌ 沒有原文連結 | 😡 |
| 4 | 想看哪個 KOL 提到品牌 | ✅ KOL Attribution | 👍 |
| 5 | 想看 KOL 的粉絲數/ER | ❌ 沒有社群指標 | 😤 |

### 好評 👍
1. **Mention Sort by Sentiment** — 快速找到正面口碑
2. **KOL Attribution** — 知道誰在討論
3. **Aspect 分析** — 知道消費者最愛哪個面向

### 差評 👎
1. **沒有原文連結** — UGC repost 的第一步
2. **沒有社群指標** — 不知道 KOL 的影響力
3. **沒有內容分類** — 想區分 review vs mention vs tutorial
4. **沒有圖片/影片** — UGC 經營需要看原始媒體

### 購買意願：2/10
> 「分析工具不是我的主要需求，我需要的是發現好內容並 repost。」

---

## U19：蕭裕民，品牌方商品開發

**背景**：負責新品配方和規格決策
**場景**：想從消費者口碑中找到新品開發方向

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 看品類 topic 的 Aspects | ✅ 消費者討論面向 | 👍 |
| 2 | Negative filter → 看痛點 | ✅ | 👍👍「這些就是產品改良方向」 |
| 3 | 看 mentions 原文脈絡 | ✅ | 👍 |
| 4 | 想量化痛點 priority | ⚠️ aspect 有 mention count 但沒有 severity | 😕 |
| 5 | 想看「保濕」面向在不同品牌的表現 | ❌ 沒有 aspect × brand 矩陣 | 😤 |
| 6 | 想匯出 aspect 列表給 R&D | ❌ 沒有匯出 | 😤 |

### 好評 👍
1. **Aspect Negative 分析 = 產品改良金礦** — 真正的消費者洞察
2. **Mention drill-down** — 看到消費者怎麼描述問題
3. **Ontology insights** — AI 自動摘要省分析時間
4. **Topic entity** — 追蹤品類趨勢

### 差評 👎
1. **沒有 aspect × brand 交叉分析** — 需要對標競品
2. **沒有匯出** — R&D 團隊不會自己來看系統
3. **aspect 沒有時間趨勢** — 想知道哪個痛點在加劇
4. **沒有 aspect 自訂分組** — 想按產品規格維度重新分類

### 購買意願：5/10
> 「如果能匯出 + 交叉分析，這會是產品開發最好的消費者洞察工具。」

---

## U20：王建勳，代理商老闆（CEO）

**背景**：30 人代理商，年營收 5000 萬
**場景**：評估是否採購 Ontix 給全公司使用

### 操作體驗

| Step | 動作 | 結果 | 反應 |
|------|------|------|------|
| 1 | 自己試用 Pulse | ✅ 第一印象好 | 👍 |
| 2 | Knowledge Graph | ✅ 很有差異化 | 👍「這是跟客戶的 wow moment」 |
| 3 | 問 AE 試用意見 | AE 說沒有匯出報告 | 😤 |
| 4 | 問分析師試用意見 | 分析師說沒有 CSV | 😤 |
| 5 | 評估 vs QSearch 年約 | ⚠️ 功能不同很難比 | 😕 |
| 6 | 想知道定價 | ❌ 沒有公開定價 | 😕 |
| 7 | 想看 data security / SLA | ❌ 沒有 | 😤 |

### 好評 👍
1. **差異化明確** — Knowledge Graph + Ontology 是獨特賣點
2. **UI/UX 現代** — 比 QSearch/i-Buzz 好看
3. **Aspect 分析深度** — 確實比現有工具強
4. **Alert 自動化** — 省人力

### 差評 👎
1. **沒有報告匯出** — AE 團隊無法使用
2. **沒有多帳號/權限** — 全公司使用需要
3. **沒有 SLA/Security spec** — 企業採購需要
4. **不確定能否取代現有工具** — 功能互補但不是超集

### 購買意願：4/10
> 「會考慮做為輔助工具，但不能取代 QSearch。等匯出 + 帳號管理完成再談。」

---

## 統整分析

### 購買意願分佈

| 分數 | 人數 | 角色 |
|------|------|------|
| 6 | 3 | U5 電商PM, U10 新創品牌主, U12 CX主管 |
| 5 | 5 | U1 行銷經理, U4 數據分析師, U8 策略企劃, U14 Planner, U17 Data Lead, U19 商品開發 |
| 4 | 2 | U2 AE, U6 公關Director, U20 代理商老闆 |
| 3 | 4 | U3 社群經理, U7 KOL, U9 CMO, U11 媒體企劃, U16 PR Director |
| 2 | 2 | U15 微型品牌主, U18 社群行銷專員 |

**平均購買意願：4.1/10**（上次 Phase 0-6 為 2.4/10，提升 +1.7）

### 每個缺失功能被多少用戶撞到

| 缺失功能 | 撞到的用戶數 | 角色列舉 |
|----------|-------------|----------|
| **匯出/報告（PDF/CSV）** | **17/20** | 幾乎所有人 |
| **比較功能（A vs B）** | **13/20** | U1,2,5,6,7,8,9,12,13,15,16,17,19 |
| **原文連結（post URL）** | **6/20** | U1,3,6,14,18,和部分隱含 |
| **API 文件** | 3/20 | U4,17,20 |
| **多帳號/權限** | 3/20 | U13,17,20 |
| 通知（email/LINE/webhook） | 3/20 | U3,5,6 |
| KOL 社群指標 | 3/20 | U2,7,18 |
| 資料覆蓋率透明度 | 4/20 | U4,8,15,17 |
| Aspect 時間趨勢 | 3/20 | U12,16,19 |
| 交叉分析（topic×brand, aspect×brand） | 4/20 | U4,8,11,19 |
| 中文 UI | 2/20 | U1,13 |
| 自訂 dashboard/alert | 2/20 | U3,9 |
| 年度時間範圍（>12W） | 2/20 | U9,16 |
| 自助加入追蹤 | 2/20 | U15,13 |
| 平台聚合統計 | 2/20 | U11,18 |

### Deal-breaker vs Nice-to-have

#### 🔴 Deal-breakers（沒有就不買）
1. **匯出/報告** — 17/20 用戶撞到，AE/策略/PM/CX 全部需要
2. **比較功能** — 13/20，CMO/PM/策略的核心工作流

#### 🟡 Critical（有會大幅提高購買意願）
3. **原文連結** — 社群經理/公關的行動力基礎
4. **交叉分析** — 數據分析師/策略/商品開發需要
5. **API 文件** — 數據團隊自助分析

#### 🟢 Nice-to-have
6. 多帳號/權限
7. 通知系統
8. KOL 社群指標
9. 中文 UI
10. 年度時間範圍

### 好評排名（被多少用戶提到）

| 好評功能 | 提及次數 | 典型反應 |
|----------|----------|----------|
| **Aspect × Sentiment 分析** | 16/20 | 「市場上最深的消費者洞察」 |
| **Knowledge Graph** | 12/20 | 「demo 殺手鐧」「wow moment」 |
| **Sparkline + Delta%** | 11/20 | 「所有數字都帶趨勢感」 |
| **Ontology Insights / Rules** | 10/20 | 「AI 自動洞察是差異化」 |
| **TrendChart 雙軸** | 9/20 | 「mentions + sentiment 同時看」 |
| **What Changed 區域** | 8/20 | 「不用找就知道異常」 |
| **Period Selector** | 8/20 | 「切時間範圍很流暢」 |
| **Watchlist** | 6/20 | 「追蹤競品方便」 |
| **Inbox alerts** | 7/20 | 「小團隊最需要自動通知」 |
| **Pulse 視覺設計** | 7/20 | 「比 QSearch/i-Buzz 好看」 |

### 目前功能中「有但沒人用」或「解決不了問題」

| 功能 | 問題 |
|------|------|
| **SOV Treemap** | 0/20 用戶覺得有用 — 不是真的 brand vs brand SOV |
| **Event Marker** | 只有 1/20 注意到 — 功能藏太深 |
| **Emerging 區域** | U5 指出判斷邏輯不對 — mention_count ≤ 8 不等於新品 |
| **SentimentChart** | 與 TrendChart 重複 — 2 個圖表讓人困惑 |
| **Topic Distribution（person）** | 只有 KOL 自己會看 — 非目標用戶 |

### 與上次模擬（Phase 0-6）的進步

| 維度 | Phase 0-6 | Phase 7-8 | 變化 |
|------|-----------|-----------|------|
| 平均購買意願 | 2.4/10 | 4.1/10 | **+1.7** |
| 趨勢圖 | ❌ 沒有 | ✅ TrendChart + Sparkline | 已解決 |
| 時間範圍 | ❌ 沒有 | ✅ Period Selector | 已解決 |
| Aspect drill-down | ❌ 沒有 | ✅ Aspect → Mentions | 已解決 |
| Batch inbox | ❌ 沒有 | ✅ 批量操作 | 已解決 |
| Evidence 可讀化 | ❌ JSON | ✅ 人類可讀 | 已解決 |
| 比較功能 | ❌ | ❌ | **仍然缺失** |
| 匯出/報告 | ❌ | ❌ | **仍然缺失** |
| 原文連結 | ❌ | ❌ | **仍然缺失** |

### 下一步優先級建議

根據 20 人模擬，最能提升購買意願的改動：

1. **匯出功能**（17/20 撞到）→ CSV + 截圖/PDF 優先
2. **比較頁面**（13/20 撞到）→ A vs B 雙欄對比
3. **原文連結**（6/20 但影響社群/公關的核心工作流）→ 在 mention 加 URL
4. **修正 SOV**（0/20 覺得有用）→ 改成真正的 brand competition 或移除
5. **交叉分析**（4/20 但是高價值用戶需要）→ aspect × brand 矩陣

### 最有可能的首批付費用戶

| 優先 | 角色 | 原因 | 差什麼就能成交 |
|------|------|------|----------------|
| 1 | **U12 CX 主管** | Aspect 分析完美匹配需求 | 匯出 + aspect 趨勢 |
| 2 | **U5 電商 PM** | Aspect + Watchlist + Alert | 比較 + 分享連結 |
| 3 | **U10 新創品牌主** | Aspect + Alert 省焦點團體費用 | 定價合理 + 免費 tier |
| 4 | **U19 商品開發** | Aspect Negative = 產品改良金礦 | 匯出 + 交叉分析 |
| 5 | **U4 數據分析師** | Knowledge Graph + Ontology | CSV + API docs |
