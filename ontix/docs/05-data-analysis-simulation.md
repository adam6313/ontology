# 數據分析流程模擬

模擬海量數據架構下的完整數據分析流程，從數據流入到洞察輸出。

---

## 模擬場景

- **監控品牌**：100 個
- **日均數據量**：1000 萬貼文
- **實時 QPS**：~115 條/秒

---

## 一、數據流入模擬（T+0 秒）

### 原始數據樣本

```json
// Kafka Topic: raw_posts (實時流入，約 115 條/秒)

{"id":"wb_892347234","platform":"weibo","time":"2024-01-29T14:23:01",
 "author_id":"u_38923","content":"茶顏悅色的新品好難喝，踩雷了",
 "metrics":{"likes":12,"reposts":3,"comments":8}}

{"id":"xhs_f8923d","platform":"xiaohongshu","time":"2024-01-29T14:23:01",
 "author_id":"xhs_889234","content":"在茶顏悅色喝到蟲子！噁心🤮避雷",
 "images":["img1.jpg","img2.jpg"],"metrics":{"likes":89,"collects":23}}

{"id":"dy_29834","platform":"douyin","time":"2024-01-29T14:23:02",
 "author_id":"dy_923847","content":"瑞幸新品測評 真的絕了 推薦！",
 "video_id":"v_8923","metrics":{"likes":2341,"comments":127}}
```

---

## 二、實時處理流水線模擬（T+0.5 秒）

### Step 1: 實體識別 (NER)

```
Input:  "在茶顏悅色喝到蟲子！噁心🤮避雷"

Output: {
  "brands": ["茶顏悅色"],
  "topics": ["食品安全", "消費體驗"],
  "entities": ["蟲子"],
  "intent": "投訴"
}
```

### Step 2: 情感分析

```
Model: distilbert-sentiment-chinese (GPU 推理, 延遲 ~30ms)

Output: {
  "sentiment": "negative",
  "score": -0.92,
  "confidence": 0.97,
  "aspects": {
    "產品質量": -0.95,
    "品牌形象": -0.88
  }
}
```

### Step 3: 風險評分

```
risk_score = weighted_sum(
  sentiment_score     * 0.25,  # -0.92 → 23 分
  author_influence    * 0.20,  # 12847粉絲 → 15 分
  spread_velocity     * 0.25,  # 89讚/10min → 18 分
  keyword_sensitivity * 0.15,  # "蟲子" → 15 分
  has_evidence        * 0.15   # 有圖片 → 12 分
)

Output: risk_score = 83 🔴 (閾值 70，觸發晉升)
```

### 處理結果分流

```
原始貼文 ID: xhs_f8923d
風險評分: 83

Decision: score >= 70 → 晉升為 KeyPost Object

執行動作:
✓ 寫入 Elasticsearch (全文檢索)
✓ 寫入 Redis (實時狀態追蹤)
✓ 寫入 ClickHouse (聚合統計)
✓ 發送到 alert_check_topic (警報檢測)

同時，另外 99 條低風險貼文:
→ 僅寫入 ClickHouse 參與聚合，不創建獨立 Object
```

---

## 三、信號聚合模擬（每分鐘觸發）

### ClickHouse 聚合查詢

```sql
-- 每分鐘執行的物化視圖刷新
INSERT INTO brand_signals_1min
SELECT
    toStartOfMinute(event_time) AS time_bucket,
    brand_id,

    -- 基礎統計
    count() AS total_posts,
    countIf(sentiment = 'positive') AS positive_count,
    countIf(sentiment = 'neutral') AS neutral_count,
    countIf(sentiment = 'negative') AS negative_count,

    -- 情感指標
    avg(sentiment_score) AS sentiment_avg,
    stddevPop(sentiment_score) AS sentiment_stddev,

    -- 傳播指標
    sum(likes + reposts + comments) AS total_engagement,
    max(risk_score) AS max_risk_score,

    -- 熱詞提取 (Top 10)
    topK(10)(keywords) AS hot_keywords,

    -- 異常檢測
    countIf(risk_score >= 70) AS high_risk_count

FROM raw_posts_enriched
WHERE event_time >= now() - INTERVAL 1 MINUTE
GROUP BY time_bucket, brand_id
```

### 聚合結果示例

```
brand_signals_1min 表數據 (14:23:00 - 14:24:00)

time_bucket │ brand_id  │ total │ pos │ neu │ neg │ sent_avg │ risk_max
────────────┼───────────┼───────┼─────┼─────┼─────┼──────────┼─────────
14:23:00    │ 茶顏悅色  │  847  │ 312 │ 298 │ 237 │  -0.12   │   83
14:23:00    │ 瑞幸咖啡  │  623  │ 445 │ 156 │  22 │  +0.58   │   34
14:23:00    │ 蜜雪冰城  │  534  │ 289 │ 198 │  47 │  +0.31   │   45
14:23:00    │ 喜茶      │  412  │ 234 │ 145 │  33 │  +0.42   │   28
14:23:00    │ 奈雪的茶  │  298  │ 156 │ 112 │  30 │  +0.35   │   31

💡 注意: 茶顏悅色的 neg 比例突增，risk_max 觸發閾值
```

---

## 四、異常檢測模擬（T+2 分鐘）

### 基線對比檢測

```sql
-- 計算茶顏悅色過去 7 天同時段的基線
WITH baseline AS (
  SELECT
    avg(negative_ratio) AS baseline_neg_ratio,
    stddevPop(negative_ratio) AS baseline_stddev,
    avg(total_posts) AS baseline_volume
  FROM brand_signals_hourly
  WHERE brand_id = '茶顏悅色'
    AND toHour(time_bucket) = 14  -- 同一小時
    AND time_bucket >= now() - INTERVAL 7 DAY
)
```

### 檢測結果

| 指標 | 基線值 | 當前值 | Z-Score |
|------|--------|--------|---------|
| 負面比例 | 8.2% | 28.0% | **+4.2 σ** 🔴 |
| 聲量 | 523/min | 847/min | +2.1 σ 🟡 |
| 最高風險分 | 45 | 83 | **+3.8 σ** 🔴 |

⚠️ 觸發條件滿足: Z-Score > 3 → 生成 Alert

---

## 五、分析查詢模擬

### 場景 A：實時監控大屏

**API Request**: `GET /api/dashboard/realtime`

**查詢路由**: Redis (熱數據) + ClickHouse (近實時聚合)

```sql
-- Query 1: 最近 5 分鐘各品牌概況 (ClickHouse)
SELECT
  brand_id,
  sum(total_posts) AS posts_5min,
  avg(sentiment_avg) AS sentiment,
  max(max_risk_score) AS top_risk
FROM brand_signals_1min
WHERE time_bucket >= now() - INTERVAL 5 MINUTE
GROUP BY brand_id
ORDER BY top_risk DESC
LIMIT 20

-- Query 2: 活躍警報 (Redis)
ZRANGEBYSCORE alerts:active 0 +inf WITHSCORES
```

**響應時間**: 45ms

**返回數據**:

```json
{
  "timestamp": "2024-01-29T14:25:00Z",
  "brands_overview": [
    {
      "brand_id": "茶顏悅色",
      "posts_5min": 4235,
      "sentiment": -0.15,
      "sentiment_trend": "declining",
      "top_risk": 83,
      "status": "alert",
      "alert_id": "ALT-20240129-017"
    },
    {
      "brand_id": "瑞幸咖啡",
      "posts_5min": 3112,
      "sentiment": 0.54,
      "sentiment_trend": "stable",
      "top_risk": 34,
      "status": "normal"
    }
  ],
  "active_alerts": [
    {
      "id": "ALT-20240129-017",
      "brand": "茶顏悅色",
      "level": "P1",
      "trigger_reason": "負面情感異常 (+4.2σ)",
      "created_at": "2024-01-29T14:23:45Z"
    }
  ]
}
```

---

### 場景 B：趨勢分析查詢

**用戶操作**: "查看茶顏悅色過去 24 小時情感趨勢"

**查詢路由**: ClickHouse (溫數據，小時級聚合)

```sql
SELECT
  time_bucket,
  total_posts,
  positive_ratio,
  neutral_ratio,
  negative_ratio,
  sentiment_avg,
  high_risk_count
FROM brand_signals_hourly
WHERE brand_id = '茶顏悅色'
  AND time_bucket >= now() - INTERVAL 24 HOUR
ORDER BY time_bucket
```

**掃描行數**: 24 行
**響應時間**: 23ms

**可視化輸出**:

```
📊 茶顏悅色 24H 情感趨勢

情感分數
 +0.5 ┤
      │ ****  ***
 +0.3 ┤*    **   ***  ****
      │               *    ***
 +0.1 ┤                      **
    0 ┤────────────────────────────────────────────────────────
      │                                   **
 -0.1 ┤                                     *
      │                                      *
 -0.3 ┤                                       **
      │                                         *
 -0.5 ┤                                          ← 事件爆發點
      └─┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬──
       14  16  18  20  22  00  02  04  06  08  10  12  14  (時)
       └──────── 昨日 ────────┘ └──────── 今日 ────────┘

📍 異常標記: 14:23 負面聲量突增 340%
```

---

### 場景 C：下鑽到具體貼文

**用戶操作**: "查看 14:00-15:00 時段的負面關鍵貼文"

**查詢路由**: Elasticsearch (KeyPost 全文檢索)

```json
POST /keyposts/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"brand_id": "茶顏悅色"}},
        {"term": {"sentiment": "negative"}},
        {"range": {"risk_score": {"gte": 70}}},
        {"range": {"created_at": {
          "gte": "2024-01-29T14:00:00",
          "lt": "2024-01-29T15:00:00"
        }}}
      ]
    }
  },
  "sort": [{"risk_score": "desc"}],
  "size": 20
}
```

**命中數**: 23 篇 KeyPost
**響應時間**: 67ms

**返回明細**:

```
┌─────────────────────────────────────────────────────────────────────┐
│ #1  Risk: 83  Platform: 小紅書                                      │
│ ─────────────────────────────────────────────────────────────────── │
│ Author: @愛喝奶茶的小魚 (12,847 粉絲, KOC)                          │
│ Time: 2024-01-29 14:23:01                                           │
│ Content: "在茶顏悅色喝到蟲子！！噁心死了 🤮 大家避雷"                │
│ Images: 3 張 [查看]                                                 │
│ ─────────────────────────────────────────────────────────────────── │
│ Metrics: 👍 2,847  💬 892  ⭐ 567  🔄 234                            │
│ Sentiment: -0.92 (產品質量: -0.95, 品牌形象: -0.88)                 │
│ ─────────────────────────────────────────────────────────────────── │
│ [查看傳播鏈] [查看作者畫像] [關聯到事件] [發起回應]                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ #2  Risk: 76  Platform: 微博                                        │
│ ─────────────────────────────────────────────────────────────────── │
│ Author: @本地美食探店V (89,234 粉絲, 認證博主)                      │
│ Time: 2024-01-29 14:45:23                                           │
│ Content: "茶顏悅色又出食品安全問題了？有網友爆料喝到異物 [轉發]"     │
│ [查看原轉發鏈]                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 場景 D：傳播鏈路分析

**用戶操作**: "分析這篇貼文的傳播路徑"

**查詢**: 圖數據庫 (Neo4j)

```cypher
MATCH path = (origin:Post {id: 'xhs_f8923d'})<-[:REPOSTS*1..5]-(p:Post)
RETURN path
ORDER BY p.created_at
```

**傳播鏈可視化**:

```
                    ┌─────────────────┐
                    │ 原帖 (小紅書)    │
                    │ @愛喝奶茶的小魚  │
                    │ 14:23 · 2,847讚 │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 微博 @本地美食V │  │ 抖音 @奶茶測評  │  │ 小紅書 截圖轉發 │
│ 14:45 · 1,234讚 │  │ 15:02 · 5,672讚 │  │ (327 篇聚合)   │
│ 🔴 KOL 放大節點  │  │ 🔴 KOL 放大節點  │  │                 │
└────────┬────────┘  └────────┬────────┘  └─────────────────┘
         │                    │
  ┌──────┴──────┐      ┌──────┴──────┐
  ▼             ▼      ▼             ▼
┌───────┐  ┌───────┐ ┌───────┐  ┌───────┐
│ 567   │  │ 媒體  │ │ 892   │  │ B站   │
│ 轉發  │  │ 跟進  │ │ 評論  │  │ 搬運  │
└───────┘  └───────┘ └───────┘  └───────┘

📊 傳播統計:
• 總觸達: ~850,000 人
• 傳播深度: 5 層
• 關鍵放大節點: 2 個 (佔總曝光 67%)
• 跨平台擴散: 小紅書 → 微博 → 抖音 → B站
```

---

### 場景 E：競品對比分析

**用戶操作**: "對比茶顏悅色與競品本週表現"

```sql
SELECT
  brand_id,
  sum(total_posts) AS weekly_posts,
  avg(sentiment_avg) AS avg_sentiment,
  sum(high_risk_count) AS crisis_posts,
  sum(total_engagement) AS total_engagement
FROM brand_signals_daily
WHERE brand_id IN ('茶顏悅色','喜茶','奈雪的茶','蜜雪冰城','瑞幸咖啡')
  AND date >= today() - 7
GROUP BY brand_id
```

**對比報表**:

```
📊 新茶飲品牌週度對比 (2024-01-22 ~ 2024-01-29)

品牌        │ 聲量     │ 情感均值  │ 危機貼文 │ 互動量    │ 健康度
────────────┼──────────┼───────────┼──────────┼───────────┼─────────
瑞幸咖啡    │ 892,341  │ +0.42 🟢  │    12    │ 5,672,341 │ 92/100
蜜雪冰城    │ 734,892  │ +0.38 🟢  │    23    │ 4,123,892 │ 88/100
喜茶        │ 523,412  │ +0.35 🟢  │    18    │ 3,234,123 │ 85/100
奈雪的茶    │ 412,893  │ +0.31 🟢  │    15    │ 2,123,456 │ 83/100
茶顏悅色    │ 687,234  │ -0.05 🟡  │   156    │ 8,923,412 │ 45/100
            │ ⬆️+34%   │ ⬇️-0.47   │ ⬆️+1200% │ ⬆️+340%   │ ⬇️-47

💡 洞察: 茶顏悅色本週因食安事件，危機貼文數遠超競品，但互動量最高
        (危機帶來的關注度)，整體品牌健康度大幅下降
```

---

## 六、查詢性能總結

| 分析場景 | 數據源 | 響應時間 | 技術選型 |
|----------|--------|----------|----------|
| 實時大屏 | Redis + 分鐘聚合 | <100ms | Redis Cluster |
| 趨勢分析 | 小時/天聚合表 | <500ms | ClickHouse |
| 下鑽明細 | KeyPost 索引 | <200ms | Elasticsearch |
| 傳播鏈路 | 關係圖譜 | <1s | Neo4j |
| 競品對比 | 預聚合寬表 | <300ms | ClickHouse |
| LLM 問答 | Ontology + 向量 | 2-5s | LLM + RAG |

---

## 七、分析閉環

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 1. 採集  │───▶│ 2. 分析  │───▶│ 3. 洞察  │───▶│ 4. 行動  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│1000萬/日 │    │ 聚合統計 │    │ 異常檢測 │    │ 私信聯繫 │
│ 貼文入庫 │    │ 情感分析 │    │ 根因定位 │    │ 發布聲明 │
│          │    │ 傳播追蹤 │    │ 影響評估 │    │ 門店自查 │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                       ┌──────────┐                  │
                       │ 5. 反饋  │◀─────────────────┘
                       └──────────┘
                            │
                            ▼
                       ┌──────────┐
                       │ 情感回升 │
                       │ 模型優化 │
                       │ 規則更新 │
                       └──────────┘
```
