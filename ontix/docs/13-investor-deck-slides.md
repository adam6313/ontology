# iKala — AI 時代的企業操作系統（投資人簡報）

---

## Slide 1 — 封面

**iKala — AI 時代的企業操作系統**

百萬次決策。千位人員與 AI Agent。一個統一本體。

---

## Slide 2 — 市場機會

**企業 AI 的真正挑戰**

- 企業坐擁 PB 級資料，但 87% 的 AI 專案未能進入生產環境
- 問題不在模型，而在於缺乏統一的語義層將資料、邏輯與行動串聯
- 市場需要的不是更多 AI 工具，而是一個 AI 操作系統

**我們的定位：建構企業級 Ontology 架構，讓 AI 真正落地**

---

## Slide 3 — 三大核心支柱

**Ontology 架構總覽**

| Ontology Language | Ontology Engine | Ontology Toolchain |
|---|---|---|
| 統一語義編碼層 | 高效能讀寫引擎 | 開發者與 AI Agent 工具鏈 |
| Data · Action · Logic · Security | Read/Write 分離 · CDC 即時同步 | OSDK · Tool Factory · Knowledge Modules |

---

## Slide 4 — Ontology Language

**四維語義編碼**

### Data Encoding（資料編碼）

- Multimodal Data Plane：結構化、非結構化、即時串流資料統一建模
- Object Types → Properties → Link Types（1:1 / 1:N / M:N）
- 每個業務實體（客戶、訂單、設備）成為可操作的語義物件

### Action Encoding（行動編碼）

- 動作 = 可執行的「動詞」，綁定於 Object Type
- 原子事務交易，單次 Action 可操作 10,000+ 物件
- Side Effects 機制：觸發下游通知、同步、審批流

### Logic Encoding（邏輯編碼）

- 四級運算光譜：Simple Rules → ML Models → LLM → Multi-engine Orchestration
- Compute Modules：封裝複雜邏輯為可重用、可版控的模組
- 支援 Python / TypeScript / SQL 多語言運算

### Security Encoding（安全編碼）

- 三維存取控制矩陣：Role × Classification × Purpose
- 資料安全在 Ontology 層強制執行，非應用層
- 欄位級加密、動態脫敏、完整審計軌跡

---

## Slide 5 — Ontology Engine

**為規模而生的讀寫分離架構**

### 讀取路徑（Read Path）

- Object Set Service (OSS)：宣告式查詢，支援複雜篩選與聚合
- Object Storage V2：從 V1/Phonograph 架構進化，支援 100 億+ 物件/類型
- 單一物件支援 2,000+ 屬性欄位
- 增量索引：僅處理變更資料，查詢延遲 < 100ms

### 寫入路徑（Write Path）

- Object Data Funnel：寫入驗證 → 衝突解析 → 事務提交
- 原子性保證：跨多物件類型的交易一致性
- 樂觀鎖 + 版本控制，支援高併發寫入

### CDC 即時同步

- Change Data Capture：低延遲雙向資料同步
- Source → Ontology → Source 閉環更新
- 事件驅動架構，變更即時傳播至所有消費端

---

## Slide 6 — Ontology Toolchain

**人與 AI Agent 的統一工具鏈**

### OSDK（Ontology SDK）

- 自動產生 Type-safe API（TypeScript / Python / Java）
- 開發者直接操作語義物件，無需理解底層資料庫結構
- 完整 IDE 整合，IntelliSense 自動補全

### Tool Factory

- 人類使用者 → No-code/Low-code 應用建構器
- AI Agent → 結構化工具呼叫介面（Function Calling）
- 同一組 Ontology Action 同時服務人與 AI

### Knowledge Modules（知識模組）

- 領域知識封裝為可重用模組（零售、製造、金融…）
- 跨組織分享與市集機制
- 版本控制 + 依賴管理 + 自動化測試

### DevOps & Governance

- CI/CD Pipeline 整合
- 變更影響分析：修改一個 Object Type 前預覽所有下游影響
- 完整 Lineage 追蹤：從原始資料到 AI 決策的全鏈路

---

## Slide 7 — 閉環運作展示

**從資料到決策的完整閉環**

```
資料整合 → Ontology 建模 → AI 分析 → 自動執行 → 回饋優化
   ↑                                                    |
   └────────────────────────────────────────────────────┘
```

**實際場景：智慧零售**

1. **資料整合**：POS、庫存、CRM、社群數據匯入
2. **Ontology 建模**：商品、門市、顧客、訂單建立語義關聯
3. **AI 分析**：需求預測模型 + LLM 洞察摘要
4. **自動執行**：觸發補貨 Action、調整定價、推播個人化促銷
5. **回饋優化**：執行結果回寫 Ontology，模型持續學習

---

## Slide 8 — 全端生態系統

**iKala 產品矩陣**

### iKala Nexus — 企業操作大腦

- AI Agent 覆蓋：HR / Sales / Marketing / Finance / Operations
- 每個 Agent 基於 Ontology 運作，共享統一語義層
- 多 Agent 協作：跨部門任務自動編排

### iKala Cloud — Google Cloud 原生

- AIOps：智慧維運、異常偵測、自動修復
- CloudGPT：自然語言操作雲端基礎設施
- 混合雲 / 多雲 Ontology 延伸

### Kolr — 社群數據智慧

- 3 億+ 網紅數據，覆蓋 6 大社群平台
- 社群語義物件直接融入企業 Ontology
- 行銷 ROI 閉環追蹤

---

## Slide 9 — 跨產業應用

**一個 Ontology，無限產業場景**

| 產業 | 核心物件 | AI Agent 應用 |
|---|---|---|
| 零售 | 商品、顧客、門市、訂單 | 需求預測、動態定價、個人化推薦 |
| 製造 | 設備、產線、工單、品質 | 預測性維護、排程優化、良率提升 |
| 金融 | 帳戶、交易、風險、合規 | 反詐欺偵測、信用評估、自動核保 |
| 醫療 | 病患、診斷、藥品、療程 | 臨床決策支援、用藥安全、資源調度 |
| 媒體 | 內容、創作者、受眾、廣告 | 內容推薦、受眾分群、廣告優化 |

---

## Slide 10 — 護城河與商業模式

**三層護城河**

| 層級 | 護城河類型 | 機制 |
|---|---|---|
| Ontology Language | 轉換成本 | 企業語義模型一旦建立，遷移成本極高 |
| Ontology Engine | 規模經濟 | 資料量越大，效能優勢越明顯 |
| Ontology Toolchain | 網路效應 | 知識模組越多，生態價值指數成長 |

**商業模式**

- 平台訂閱（按 Object 數量 / API 呼叫量計費）
- 專業服務（Ontology 建模諮詢、產業知識模組客製）
- 知識模組市集（第三方開發者分潤）

---

## Slide 11 — 結語

**百萬次決策。千位人員與 AI Agent。一個統一本體。**

iKala 不只提供 AI 工具，
我們建構讓 AI 真正理解企業的語義基礎設施。

**The Enterprise Ontology for the AI Era.**
