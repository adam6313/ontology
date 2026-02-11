# 社交媒體輿情系統 Ontology 設計

基於 Palantir Ontology 思維框架設計的社交媒體輿情監控系統。

---

## 一、設計理念

### 核心問題
傳統輿情系統存在「資料豐富、行動貧乏」的困境：
- **認知斷裂**：系統呈現資料表，管理者關心的是品牌、事件、危機
- **回饋斷裂**：洞察與行動之間存在鴻溝

### 設計原則
1. **閉環原則** — 資料服務於行動，行動回饋回資料
2. **擁抱複雜** — 承載必要的「最優複雜性」
3. **簡單驅動** — 技術讓複雜業務變得簡單可控

---

## 二、核心物件（Objects）設計

### 物件架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                     輿情 Ontology 物件層                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Post   │    │ Author  │    │  Topic  │    │  Event  │  │
│  │  貼文   │    │  作者   │    │  話題   │    │  事件   │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Brand   │    │Campaign │    │Response │    │  Alert  │  │
│  │  品牌   │    │  活動   │    │ 回應記錄│    │  警報   │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 物件屬性定義

#### Post（貼文）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| platform | enum | 平台（微博/小紅書/抖音/B站） |
| content | text | 貼文內容 |
| created_at | datetime | 發布時間 |
| sentiment_score | float | 情感分數 [-1, 1] |
| risk_score | int | 風險等級 [0, 100] |
| engagement | object | 互動資料 {likes, comments, reposts} |
| images | array | 圖片列表 |
| video_id | string | 影片ID（如有） |

#### Author（作者）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| platform | string | 所屬平台 |
| username | string | 使用者名稱 |
| followers | int | 粉絲數 |
| influence_tier | enum | 影響力等級（KOL/KOC/普通使用者） |
| historical_stance | enum | 歷史立場（正面/中性/負面） |
| engagement_rate | float | 互動率 |
| credibility_score | float | 可信度評分 |

#### Brand（品牌）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| name | string | 品牌名稱 |
| industry | string | 所屬產業 |
| keywords | array | 監控關鍵詞列表 |
| competitors | array | 競品列表 |
| baseline_sentiment | float | 歷史情感基線值 |
| responsible_team | string | 負責團隊 |

#### Event（事件）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| title | string | 事件標題 |
| event_type | enum | 事件類型（危機/正面/中性） |
| severity | enum | 嚴重程度（P1/P2/P3/P4） |
| status | enum | 狀態（active/resolved/archived） |
| started_at | datetime | 爆發時間 |
| peak_at | datetime | 峰值時間 |
| ended_at | datetime | 結束時間 |
| sentiment_trajectory | array | 情感變化曲線 |
| impact_scope | object | 影響範圍 |

#### Alert（警報）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| trigger_condition | string | 觸發條件 |
| severity | enum | 嚴重等級（P1/P2/P3/P4） |
| assignee | string | 指派對象 |
| status | enum | 處理狀態（pending/processing/resolved） |
| created_at | datetime | 建立時間 |
| sla_deadline | datetime | SLA 截止時間 |

#### Response（回應記錄）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| response_type | enum | 回應類型（私訊/評論/聲明） |
| content | text | 回應內容 |
| channel | string | 發布管道 |
| created_at | datetime | 發布時間 |
| effectiveness_score | float | 效果評分 |

#### Topic（話題）
| 屬性 | 類型 | 描述 |
|------|------|------|
| id | string | 唯一識別碼 |
| name | string | 話題名稱 |
| keywords | array | 關鍵詞集 |
| heat_curve | array | 熱度曲線 |
| lifecycle_stage | enum | 生命週期階段 |

---

## 三、關係（Relations）設計

### 關係圖譜

```
                    ┌─────────┐
                    │  Event  │
                    │  事件   │
                    └────┬────┘
                         │ contains
                         ▼
┌─────────┐  posts    ┌─────────┐  belongs_to ┌─────────┐
│ Author  │──────────▶│  Post   │────────────▶│  Topic  │
│  作者   │           │  貼文   │             │  話題   │
└─────────┘           └────┬────┘             └────┬────┘
     │                     │                       │
     │ influences          │ mentions              │ relates_to
     ▼                     ▼                       ▼
┌─────────┐           ┌─────────┐             ┌─────────┐
│ Author  │           │  Brand  │             │Campaign │
│(其他人) │           │  品牌   │             │  活動   │
└─────────┘           └─────────┘             └─────────┘
                           │
                           │ triggers
                           ▼
                      ┌─────────┐  generates  ┌─────────┐
                      │  Alert  │────────────▶│Response │
                      │  警報   │             │ 回應記錄│
                      └─────────┘             └─────────┘
```

### 關係定義

| 關係名稱 | 來源物件 | 目標物件 | 描述 |
|----------|----------|----------|------|
| posts | Author | Post | 作者發布貼文 |
| mentions | Post | Brand | 貼文提及品牌 |
| belongs_to | Post | Topic | 貼文屬於話題 |
| contains | Event | Post | 事件包含貼文 |
| triggers | Brand/Post | Alert | 觸發警報 |
| generates | Alert | Response | 警報產生回應 |
| influences | Author | Author | 作者影響關係 |
| competes_with | Brand | Brand | 品牌競爭關係 |
| relates_to | Topic | Campaign | 話題關聯活動 |

---

## 四、動作（Actions）設計

### 動作列表

| 動作名稱 | 觸發者 | 影響物件 | 描述 | 寫回邏輯 |
|----------|--------|----------|------|----------|
| `Escalate_Alert` | 系統/分析師 | Alert | 升級警報 | 推送通知、更新狀態 |
| `Claim_Alert` | 分析師 | Alert | 認領警報 | 更新負責人、記錄時間 |
| `Tag_Sentiment` | 分析師 | Post | 修正情感標籤 | 更新標籤、回訓模型 |
| `Mark_KOL` | 分析師 | Author | 標記為重點關注 | 升級影響力等級 |
| `Create_Response` | 公關團隊 | Response | 建立回應 | 記錄回應、關聯事件 |
| `Contact_Author` | 公關團隊 | Author | 聯繫作者 | 建立溝通記錄 |
| `Archive_Event` | 管理者 | Event | 事件結案 | 更新狀態、產生報告 |
| `Simulate_Spread` | 分析師 | Event | 傳播模擬 | 產生預測結果 |

### 動作詳細定義

#### Escalate_Alert
```yaml
name: Escalate_Alert
description: 升級警報到更高層級
parameters:
  alert_id:
    type: string
    required: true
  target_level:
    type: enum
    values: [P1, P2, P3, P4]
  reason:
    type: string
  notify_users:
    type: array
effects:
  - update: Alert.severity
  - create: Notification
  - log: AuditTrail
```

#### Create_Response
```yaml
name: Create_Response
description: 建立官方回應
parameters:
  event_id:
    type: string
    required: true
  response_type:
    type: enum
    values: [聲明, 評論, 私訊]
  content:
    type: string
    required: true
  target_author_id:
    type: string
effects:
  - create: Response
  - update: Event.status
  - link: Response -> Event
  - notify: ResponsibleTeam
```

#### Contact_Author
```yaml
name: Contact_Author
description: 聯繫貼文作者
parameters:
  author_id:
    type: string
    required: true
  channel:
    type: enum
    values: [私訊, 評論, 郵件]
  message:
    type: string
    required: true
effects:
  - create: ContactRecord
  - update: Author.contact_history
  - link: ContactRecord -> Event
```

---

## 五、閉環流程設計

### 核心閉環

```
┌──────────────────────────────────────────────────────────────────┐
│                         輿情閉環系統                              │
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│   │ 1. 觀測  │───▶│ 2. 洞察  │───▶│ 3. 行動  │───▶│ 4. 回饋  │  │
│   │ Observe  │    │ Insight  │    │  Action  │    │ Feedback │  │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│        │               │               │               │        │
│        ▼               ▼               ▼               ▼        │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│   │ 資料採集 │    │ 風險評估 │    │ 執行回應 │    │ 效果追蹤 │  │
│   │ Post入庫 │    │ Alert生成│    │ Response │    │ 情感變化 │  │
│   │ 情感分析 │    │ 趨勢預測 │    │ 寫回系統 │    │ 模型優化 │  │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│        │                                               │        │
│        └───────────────────────────────────────────────┘        │
│                          持續循環                                │
└──────────────────────────────────────────────────────────────────┘
```

### 各階段詳解

#### 1. 觀測（Observe）
- 多平台資料採集（微博、小紅書、抖音、B站、新聞）
- 即時情感分析
- 實體識別（品牌、人物、地點）
- Post 物件入庫

#### 2. 洞察（Insight）
- 異常檢測（聲量突增、情感突變）
- 風險評分計算
- Alert 自動產生
- 趨勢預測

#### 3. 行動（Action）
- Alert 認領與處理
- Response 建立與發布
- 作者聯繫
- 寫回到來源系統

#### 4. 回饋（Feedback）
- 效果追蹤（情感變化）
- 模型優化（情感分析、風險評分）
- 經驗沉澱（知識庫更新）
- 規則迭代

---

## 六、場景模擬（Scenarios）應用

### 危機沙盤推演

**場景 1：傳播預測**
> 「如果這則負面貼文被某 KOL 轉發，24 小時內曝光量會達到多少？」

系統基於歷史傳播模式和 KOL 影響力資料，模擬傳播路徑和曝光量。

**場景 2：回應時機**
> 「如果我們在 2 小時內發布聲明 vs 6 小時後發布，輿論走向有何差異？」

系統對比不同回應時間的歷史案例，預測情感走勢差異。

**場景 3：資源調度**
> 「當前團隊人力下，同時處理 3 個二級事件的回應時間是多少？」

系統基於團隊處理能力模型，計算並行處理的 SLA 風險。

---

## 七、與傳統方式對比

| 維度 | 傳統方式 | Ontology 方式 |
|------|----------|---------------|
| 資料展現 | 資料表、報表 | 業務物件（品牌、事件、作者） |
| 分析師工作 | 人工刷社交媒體 | 系統自動預警 |
| 記錄方式 | Excel、郵件 | Response 物件自動關聯 |
| 決策依據 | 憑經驗判斷 | 傳播模擬 + 風險評分 |
| 事後復盤 | 靠回憶整理 | Event 完整生命週期記錄 |
| 經驗傳承 | 個人累積 | 自動沉澱至知識庫 |
| 閉環能力 | 無 | 觀測→洞察→行動→回饋 |

---

## 八、實施建議

### 分階段實施路徑

```
Phase 1        Phase 2        Phase 3        Phase 4
   │              │              │              │
   ▼              ▼              ▼              ▼
核心物件        關係建模        動作閉環        AI 增強
────────        ────────        ────────        ────────
Post            傳播鏈路        Alert →         智慧預警
Author          影響力圖譜      Response        自動回應
Brand           競品關係        Writeback       LLM 問答
Topic           話題關聯        SLA 管理        預測模型
```

### 關鍵成功因素

1. **資料品質** - 確保採集資料的完整性和準確性
2. **Schema 設計** - 物件和關係要符合業務實際
3. **動作閉環** - 確保每個動作都有寫回機制
4. **持續迭代** - 根據使用回饋不斷優化模型
