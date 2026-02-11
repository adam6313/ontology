# 開發計劃文件
## Dynamic Tagging System PoC

**版本**：v1.0
**日期**：2026-02-03
**作者**：Kolr Engineering Team
**關聯 PRD**：[07-dynamic-tagging-prd.md](./07-dynamic-tagging-prd.md)

---

## 1. 總覽

### 1.1 目標

在 2 週內完成 Dynamic Tagging System PoC，處理 5 萬篇美妝貼文，驗證：
- 標籤相關性 ≥ 85%
- 覆蓋率 ≥ 90%
- 聚類一致性 ≥ 80%

### 1.2 技術棧

| 層級 | 技術 | 用途 |
|------|------|------|
| **主服務** | Go 1.21+ | 流程控制、API |
| **ML 服務** | Python 3.10+ | Embedding、HDBSCAN |
| **通訊** | gRPC | Go ↔ Python |
| **向量 DB** | Qdrant | 語意搜尋 |
| **快取** | Redis | Centroid 儲存 |
| **關聯 DB** | PostgreSQL | 標籤儲存 |
| **LLM** | GPT-4o-mini | Soft Tagging |
| **Embedding** | MiniLM-L12-v2 | 384 維向量 |
| **Clustering** | HDBSCAN | 主題發現 |

### 1.3 時程總覽

```
Week 1                              Week 2
Day 1-2    Day 3-7                  Day 8-10     Day 11-14
│          │                        │            │
▼          ▼                        ▼            ▼
┌────────┐ ┌──────────────────────┐ ┌──────────┐ ┌──────────┐
│ Phase 0│ │      Phase 1         │ │ Phase 2  │ │ Phase 3  │
│  環境  │ │     核心元件         │ │ 流程整合 │ │ API+驗證 │
│  準備  │ │                      │ │          │ │          │
└────────┘ └──────────────────────┘ └──────────┘ └──────────┘
```

---

## 2. Phase 0: 環境準備 (Day 1-2)

### 2.1 Docker Compose 環境

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: kolr_tagging
      POSTGRES_USER: kolr
      POSTGRES_PASSWORD: kolr_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ml-service:
    build: ./ml_service
    ports:
      - "50051:50051"
    volumes:
      - ./ml_service:/app
      - model_cache:/root/.cache

volumes:
  redis_data:
  qdrant_data:
  postgres_data:
  model_cache:
```

### 2.2 Python ML 環境

```txt
# ml_service/requirements.txt
sentence-transformers==2.2.2
hdbscan==0.8.33
numpy==1.24.3
grpcio==1.59.0
grpcio-tools==1.59.0
openai==1.3.0
scikit-learn==1.3.2
```

### 2.3 Go 依賴

```go
// go.mod
module kolr-dynamic-tagging

go 1.21

require (
    github.com/redis/go-redis/v9 v9.3.0
    github.com/qdrant/go-client v1.7.0
    github.com/lib/pq v1.10.9
    github.com/sashabaranov/go-openai v1.17.9
    google.golang.org/grpc v1.59.0
    google.golang.org/protobuf v1.31.0
)
```

### 2.4 測試資料準備

```sql
-- scripts/export_posts.sql
COPY (
    SELECT
        id,
        content,
        likes,
        comments,
        platform,
        author_id,
        created_at
    FROM posts
    WHERE category = '美妝'
      AND created_at >= '2024-01-01'
      AND LENGTH(content) >= 20
    ORDER BY created_at DESC
    LIMIT 50000
) TO '/tmp/beauty_posts_50k.json' WITH (FORMAT JSON);
```

### 2.5 資料庫 Schema

```sql
-- scripts/init.sql

-- 貼文標籤表
CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL UNIQUE,
    hard_tags JSONB DEFAULT '[]',
    soft_tags JSONB DEFAULT '[]',
    sentiment VARCHAR(20),
    cluster_id VARCHAR(50),
    risk_score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_tags_cluster ON post_tags(cluster_id);
CREATE INDEX idx_post_tags_sentiment ON post_tags(sentiment);

-- Cluster 資訊表
CREATE TABLE clusters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    keywords JSONB DEFAULT '[]',
    post_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'EMERGING',
    parent_hard_tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cluster 歷史記錄
CREATE TABLE cluster_history (
    id SERIAL PRIMARY KEY,
    cluster_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.6 Phase 0 Checklist

```
☐ Docker Compose 啟動成功
  ☐ Redis 連線測試
  ☐ Qdrant 連線測試
  ☐ PostgreSQL 連線測試

☐ Python 環境
  ☐ requirements.txt 安裝完成
  ☐ MiniLM 模型下載完成 (首次約 500MB)

☐ Go 環境
  ☐ go mod tidy 完成
  ☐ protoc 編譯 gRPC

☐ 測試資料
  ☐ 匯出 50,000 篇貼文
  ☐ 驗證 JSON 格式正確
```

---

## 3. Phase 1: 核心元件開發 (Day 3-7)

### 3.1 Step 1: Embedding Service (Day 3)

**檔案**: `ml_service/embedding_server.py`

```python
# proto/ml.proto
syntax = "proto3";

package ml;

service EmbeddingService {
    rpc Embed(EmbedRequest) returns (EmbedResponse);
    rpc BatchEmbed(BatchEmbedRequest) returns (BatchEmbedResponse);
}

message EmbedRequest {
    string text = 1;
}

message EmbedResponse {
    repeated float embedding = 1;
}

message BatchEmbedRequest {
    repeated string texts = 1;
}

message BatchEmbedResponse {
    repeated Embedding embeddings = 1;
}

message Embedding {
    repeated float values = 1;
}
```

```python
# ml_service/embedding_server.py
import grpc
from concurrent import futures
from sentence_transformers import SentenceTransformer
import ml_pb2
import ml_pb2_grpc

class EmbeddingService(ml_pb2_grpc.EmbeddingServiceServicer):
    def __init__(self):
        print("Loading MiniLM model...")
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("Model loaded!")

    def Embed(self, request, context):
        embedding = self.model.encode(request.text)
        return ml_pb2.EmbedResponse(embedding=embedding.tolist())

    def BatchEmbed(self, request, context):
        texts = list(request.texts)
        embeddings = self.model.encode(texts)

        response = ml_pb2.BatchEmbedResponse()
        for emb in embeddings:
            response.embeddings.append(
                ml_pb2.Embedding(values=emb.tolist())
            )
        return response

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    ml_pb2_grpc.add_EmbeddingServiceServicer_to_server(
        EmbeddingService(), server
    )
    server.add_insecure_port('[::]:50051')
    print("Embedding service started on port 50051")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

**驗收標準**:
```
☐ gRPC 服務啟動成功
☐ 單篇 Embed: "這個氣墊超持妝" → 384 維向量
☐ 批次 100 篇 < 2 秒
☐ 向量 L2 norm ≈ 1.0
```

---

### 3.2 Step 2: Centroid Manager (Day 4)

**檔案**: `internal/clustering/centroid_manager.go`

```go
package clustering

import (
    "context"
    "encoding/json"
    "math"

    "github.com/redis/go-redis/v9"
)

type CentroidManager struct {
    redis     *redis.Client
    threshold float64
}

func NewCentroidManager(redisClient *redis.Client, threshold float64) *CentroidManager {
    return &CentroidManager{
        redis:     redisClient,
        threshold: threshold,
    }
}

// FindNearest 找最相似的 Cluster
func (cm *CentroidManager) FindNearest(ctx context.Context, embedding []float64) (string, float64, error) {
    centroids, err := cm.GetAll(ctx)
    if err != nil {
        return "", 0, err
    }

    if len(centroids) == 0 {
        return "", 0, nil // 冷啟動，沒有 Centroid
    }

    var bestID string
    var bestScore float64 = -1

    for id, centroid := range centroids {
        score := cosineSimilarity(embedding, centroid)
        if score > bestScore {
            bestScore = score
            bestID = id
        }
    }

    if bestScore >= cm.threshold {
        return bestID, bestScore, nil
    }

    return "", bestScore, nil // 比對失敗
}

// GetAll 從 Redis 載入所有 Centroid
func (cm *CentroidManager) GetAll(ctx context.Context) (map[string][]float64, error) {
    result, err := cm.redis.HGetAll(ctx, "cluster:centroids").Result()
    if err != nil {
        return nil, err
    }

    centroids := make(map[string][]float64)
    for id, data := range result {
        var vec []float64
        if err := json.Unmarshal([]byte(data), &vec); err != nil {
            continue
        }
        centroids[id] = vec
    }

    return centroids, nil
}

// Add 新增 Centroid
func (cm *CentroidManager) Add(ctx context.Context, clusterID string, centroid []float64) error {
    data, err := json.Marshal(centroid)
    if err != nil {
        return err
    }
    return cm.redis.HSet(ctx, "cluster:centroids", clusterID, data).Err()
}

// Update 更新 Centroid (增量平均)
func (cm *CentroidManager) Update(ctx context.Context, clusterID string, newCentroid []float64) error {
    return cm.Add(ctx, clusterID, newCentroid)
}

// Delete 刪除 Centroid
func (cm *CentroidManager) Delete(ctx context.Context, clusterID string) error {
    return cm.redis.HDel(ctx, "cluster:centroids", clusterID).Err()
}

// Count 回傳 Centroid 數量
func (cm *CentroidManager) Count(ctx context.Context) (int64, error) {
    return cm.redis.HLen(ctx, "cluster:centroids").Result()
}

func cosineSimilarity(a, b []float64) float64 {
    if len(a) != len(b) {
        return 0
    }

    var dot, normA, normB float64
    for i := range a {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    if normA == 0 || normB == 0 {
        return 0
    }

    return dot / (math.Sqrt(normA) * math.Sqrt(normB))
}
```

**驗收標準**:
```
☐ Add 10 個 Centroid 成功
☐ FindNearest 正確找出最相似
☐ 查詢延遲 < 1ms
☐ Count 回傳正確數量
```

---

### 3.3 Step 3: HDBSCAN Service (Day 5)

**檔案**: `ml_service/clustering_server.py`

```python
# ml_service/clustering_server.py
import grpc
from concurrent import futures
import hdbscan
import numpy as np
from openai import OpenAI
import json

import ml_pb2
import ml_pb2_grpc

class ClusteringService(ml_pb2_grpc.ClusteringServiceServicer):
    def __init__(self):
        self.openai = OpenAI()

    def RunClustering(self, request, context):
        # 1. 轉換 embeddings
        embeddings = np.array([list(e.values) for e in request.embeddings])
        texts = list(request.texts)

        # 2. HDBSCAN 聚類
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=request.min_cluster_size or 50,
            min_samples=10,
            metric='euclidean'
        )
        labels = clusterer.fit_predict(embeddings)

        # 3. 處理每個 Cluster
        response = ml_pb2.ClusteringResponse()

        unique_labels = set(labels)
        for label in unique_labels:
            if label == -1:  # 噪點
                continue

            mask = labels == label
            cluster_embeddings = embeddings[mask]
            cluster_texts = [texts[i] for i in range(len(texts)) if mask[i]]

            # 計算 Centroid
            centroid = cluster_embeddings.mean(axis=0)

            # LLM 命名
            name, keywords = self._generate_name(cluster_texts[:10])

            cluster = ml_pb2.Cluster(
                centroid=ml_pb2.Embedding(values=centroid.tolist()),
                size=int(mask.sum()),
                name=name,
                keywords=keywords
            )
            response.clusters.append(cluster)

        response.noise_count = int((labels == -1).sum())

        return response

    def _generate_name(self, sample_texts):
        prompt = f"""分析以下社群貼文，它們屬於同一個討論主題。

貼文樣本：
{chr(10).join(f'- {t[:150]}' for t in sample_texts[:5])}

請提供：
1. 主題名稱（2-4個字）
2. 3-5個關鍵詞

回覆 JSON 格式：
{{"name": "...", "keywords": [...]}}"""

        response = self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=100
        )

        result = json.loads(response.choices[0].message.content)
        return result.get("name", "未命名"), result.get("keywords", [])


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))
    ml_pb2_grpc.add_ClusteringServiceServicer_to_server(
        ClusteringService(), server
    )
    server.add_insecure_port('[::]:50052')
    print("Clustering service started on port 50052")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

**驗收標準**:
```
☐ 輸入 5000 個 embedding → 輸出 15-25 個 Cluster
☐ 每個 Cluster 有 name + keywords
☐ 執行時間 < 15 秒
☐ noise_count < 20%
```

---

### 3.4 Step 4: LLM Tagger (Day 6)

**檔案**: `internal/tagging/soft_tagger.go`

```go
package tagging

import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/sashabaranov/go-openai"
)

type SoftTagger struct {
    client *openai.Client
}

type TagResult struct {
    SoftTags    []string `json:"soft_tags"`
    Sentiment   string   `json:"sentiment"`
    ProductType string   `json:"product_type,omitempty"`
}

func NewSoftTagger(apiKey string) *SoftTagger {
    return &SoftTagger{
        client: openai.NewClient(apiKey),
    }
}

func (st *SoftTagger) Tag(ctx context.Context, content string) (*TagResult, error) {
    prompt := fmt.Sprintf(`分析這篇社群貼文，提取標籤資訊。

貼文：%s

回覆 JSON 格式：
{
  "soft_tags": ["標籤1", "標籤2", ...],
  "sentiment": "positive/negative/neutral",
  "product_type": "產品類型（如有）"
}`, content)

    resp, err := st.client.CreateChatCompletion(
        ctx,
        openai.ChatCompletionRequest{
            Model: openai.GPT4oMini,
            Messages: []openai.ChatCompletionMessage{
                {Role: openai.ChatMessageRoleUser, Content: prompt},
            },
            ResponseFormat: &openai.ChatCompletionResponseFormat{
                Type: openai.ChatCompletionResponseFormatTypeJSONObject,
            },
            MaxTokens: 150,
        },
    )
    if err != nil {
        return nil, err
    }

    var result TagResult
    if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
        return nil, err
    }

    return &result, nil
}

func (st *SoftTagger) BatchTag(ctx context.Context, contents []string) ([]*TagResult, error) {
    results := make([]*TagResult, len(contents))

    for i, content := range contents {
        result, err := st.Tag(ctx, content)
        if err != nil {
            results[i] = &TagResult{Sentiment: "unknown"}
            continue
        }
        results[i] = result
    }

    return results, nil
}
```

**驗收標準**:
```
☐ 輸入 "這個氣墊超持妝" → soft_tags 包含相關標籤
☐ sentiment 為 positive/negative/neutral
☐ 單篇延遲 < 500ms
☐ 錯誤處理正常
```

---

### 3.5 Step 5: Storage Layer (Day 7)

**檔案**: `internal/storage/qdrant.go`

```go
package storage

import (
    "context"

    "github.com/qdrant/go-client/qdrant"
)

type QdrantStore struct {
    client     *qdrant.Client
    collection string
}

func NewQdrantStore(host string, port int, collection string) (*QdrantStore, error) {
    client, err := qdrant.NewClient(&qdrant.Config{
        Host: host,
        Port: port,
    })
    if err != nil {
        return nil, err
    }

    return &QdrantStore{
        client:     client,
        collection: collection,
    }, nil
}

func (qs *QdrantStore) InitCollection(ctx context.Context, vectorSize uint64) error {
    return qs.client.CreateCollection(ctx, &qdrant.CreateCollection{
        CollectionName: qs.collection,
        VectorsConfig: qdrant.NewVectorsConfig(&qdrant.VectorParams{
            Size:     vectorSize,
            Distance: qdrant.Distance_Cosine,
        }),
    })
}

func (qs *QdrantStore) Upsert(ctx context.Context, id string, vector []float32, payload map[string]interface{}) error {
    points := []*qdrant.PointStruct{
        {
            Id:      qdrant.NewIDStr(id),
            Vectors: qdrant.NewVectors(vector...),
            Payload: qdrant.NewValueMap(payload),
        },
    }

    _, err := qs.client.Upsert(ctx, &qdrant.UpsertPoints{
        CollectionName: qs.collection,
        Points:         points,
    })
    return err
}

func (qs *QdrantStore) Search(ctx context.Context, vector []float32, limit uint64) ([]*qdrant.ScoredPoint, error) {
    result, err := qs.client.Query(ctx, &qdrant.QueryPoints{
        CollectionName: qs.collection,
        Query:          qdrant.NewQuery(vector...),
        Limit:          qdrant.PtrOf(limit),
        WithPayload:    qdrant.NewWithPayload(true),
    })
    if err != nil {
        return nil, err
    }
    return result, nil
}
```

**檔案**: `internal/storage/postgres.go`

```go
package storage

import (
    "context"
    "database/sql"
    "encoding/json"

    _ "github.com/lib/pq"
)

type PostgresStore struct {
    db *sql.DB
}

type PostTag struct {
    PostID    string   `json:"post_id"`
    HardTags  []string `json:"hard_tags"`
    SoftTags  []string `json:"soft_tags"`
    Sentiment string   `json:"sentiment"`
    ClusterID string   `json:"cluster_id"`
    RiskScore int      `json:"risk_score"`
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }
    return &PostgresStore{db: db}, nil
}

func (ps *PostgresStore) SavePostTag(ctx context.Context, pt *PostTag) error {
    hardTagsJSON, _ := json.Marshal(pt.HardTags)
    softTagsJSON, _ := json.Marshal(pt.SoftTags)

    _, err := ps.db.ExecContext(ctx, `
        INSERT INTO post_tags (post_id, hard_tags, soft_tags, sentiment, cluster_id, risk_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (post_id) DO UPDATE SET
            hard_tags = $2,
            soft_tags = $3,
            sentiment = $4,
            cluster_id = $5,
            risk_score = $6,
            updated_at = NOW()
    `, pt.PostID, hardTagsJSON, softTagsJSON, pt.Sentiment, pt.ClusterID, pt.RiskScore)

    return err
}

func (ps *PostgresStore) GetPostsByCluster(ctx context.Context, clusterID string, limit int) ([]*PostTag, error) {
    rows, err := ps.db.QueryContext(ctx, `
        SELECT post_id, hard_tags, soft_tags, sentiment, cluster_id, risk_score
        FROM post_tags
        WHERE cluster_id = $1
        LIMIT $2
    `, clusterID, limit)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var results []*PostTag
    for rows.Next() {
        var pt PostTag
        var hardTagsJSON, softTagsJSON []byte

        if err := rows.Scan(&pt.PostID, &hardTagsJSON, &softTagsJSON, &pt.Sentiment, &pt.ClusterID, &pt.RiskScore); err != nil {
            continue
        }

        json.Unmarshal(hardTagsJSON, &pt.HardTags)
        json.Unmarshal(softTagsJSON, &pt.SoftTags)
        results = append(results, &pt)
    }

    return results, nil
}
```

**驗收標準**:
```
☐ Qdrant: 建立 collection 成功
☐ Qdrant: 寫入 1000 筆 < 5 秒
☐ Qdrant: Search Top 10 < 50ms
☐ PostgreSQL: SavePostTag 成功
☐ PostgreSQL: GetPostsByCluster 成功
```

---

## 4. Phase 2: 流程整合 (Day 8-10)

### 4.1 Step 6: Post Processor (Day 8-9)

**檔案**: `cmd/processor/main.go`

```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "os"
    "strings"

    "kolr-dynamic-tagging/internal/clustering"
    "kolr-dynamic-tagging/internal/ml"
    "kolr-dynamic-tagging/internal/storage"
    "kolr-dynamic-tagging/internal/tagging"
)

type Post struct {
    ID       string `json:"id"`
    Content  string `json:"content"`
    Likes    int    `json:"likes"`
    Comments int    `json:"comments"`
    Platform string `json:"platform"`
}

type Processor struct {
    embedClient     *ml.EmbeddingClient
    centroidMgr     *clustering.CentroidManager
    softTagger      *tagging.SoftTagger
    qdrantStore     *storage.QdrantStore
    postgresStore   *storage.PostgresStore
    pendingPool     *storage.RedisQueue
}

func (p *Processor) Process(ctx context.Context, post *Post) error {
    // Step 1: Rules Filter
    if !p.rulesFilter(post) {
        return nil // 丟棄
    }

    // Step 2: Risk Score
    riskScore := p.calculateRiskScore(post)

    // Step 3: Embedding
    embedding, err := p.embedClient.Embed(ctx, post.Content)
    if err != nil {
        return fmt.Errorf("embedding failed: %w", err)
    }

    // Step 4: Centroid 比對
    clusterID, score, err := p.centroidMgr.FindNearest(ctx, embedding)
    if err != nil {
        return fmt.Errorf("centroid match failed: %w", err)
    }

    // Step 5: 分流處理
    if clusterID == "" {
        // 比對失敗，放入 Pending Pool
        return p.pendingPool.Push(ctx, post.ID, embedding)
    }

    // Step 6: LLM Tagging (僅高價值貼文)
    var tagResult *tagging.TagResult
    if riskScore >= 70 {
        tagResult, _ = p.softTagger.Tag(ctx, post.Content)
    }

    // Step 7: 儲存
    // Qdrant
    payload := map[string]interface{}{
        "content":    post.Content,
        "cluster_id": clusterID,
        "score":      score,
        "risk_score": riskScore,
    }
    if err := p.qdrantStore.Upsert(ctx, post.ID, toFloat32(embedding), payload); err != nil {
        return fmt.Errorf("qdrant upsert failed: %w", err)
    }

    // PostgreSQL
    postTag := &storage.PostTag{
        PostID:    post.ID,
        ClusterID: clusterID,
        RiskScore: riskScore,
    }
    if tagResult != nil {
        postTag.SoftTags = tagResult.SoftTags
        postTag.Sentiment = tagResult.Sentiment
    }
    if err := p.postgresStore.SavePostTag(ctx, postTag); err != nil {
        return fmt.Errorf("postgres save failed: %w", err)
    }

    log.Printf("Processed post %s → cluster %s (score: %.2f, risk: %d)",
        post.ID, clusterID, score, riskScore)

    return nil
}

func (p *Processor) rulesFilter(post *Post) bool {
    // 排除抽獎
    keywords := []string{"抽獎", "giveaway", "留言+分享", "tag好友"}
    for _, kw := range keywords {
        if strings.Contains(post.Content, kw) {
            return false
        }
    }

    // 排除太短
    if len(post.Content) < 20 {
        return false
    }

    return true
}

func (p *Processor) calculateRiskScore(post *Post) int {
    score := 50

    // 內容長度
    if len(post.Content) > 50 {
        score += 10
    }
    if len(post.Content) > 100 {
        score += 10
    }

    // 互動數據
    if post.Likes > 50 {
        score += 10
    }
    if post.Comments > 10 {
        score += 10
    }

    // 有描述詞
    descriptive := []string{"推薦", "超好用", "雷", "回購", "必買"}
    for _, d := range descriptive {
        if strings.Contains(post.Content, d) {
            score += 10
            break
        }
    }

    if score > 100 {
        score = 100
    }
    return score
}

func toFloat32(f64 []float64) []float32 {
    f32 := make([]float32, len(f64))
    for i, v := range f64 {
        f32[i] = float32(v)
    }
    return f32
}
```

**驗收標準**:
```
☐ 單篇處理完整流程 < 300ms
☐ Rules Filter 正確排除抽獎文
☐ Risk Score 計算正確
☐ 高價值貼文有 LLM Tags
☐ 低價值貼文無 LLM Tags（節省成本）
☐ 比對失敗的進入 Pending Pool
```

---

### 4.2 Step 7: Batch Clusterer (Day 10)

**檔案**: `cmd/clusterer/main.go`

```go
package main

import (
    "context"
    "log"
    "time"

    "kolr-dynamic-tagging/internal/clustering"
    "kolr-dynamic-tagging/internal/ml"
    "kolr-dynamic-tagging/internal/storage"
)

type BatchClusterer struct {
    pendingPool   *storage.RedisQueue
    clusterClient *ml.ClusteringClient
    centroidMgr   *clustering.CentroidManager
    threshold     int // 觸發閾值
}

func (bc *BatchClusterer) Run(ctx context.Context) {
    ticker := time.NewTicker(5 * time.Minute) // 每 5 分鐘檢查
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            bc.checkAndProcess(ctx)
        }
    }
}

func (bc *BatchClusterer) checkAndProcess(ctx context.Context) {
    count, err := bc.pendingPool.Len(ctx)
    if err != nil {
        log.Printf("Error getting pending pool length: %v", err)
        return
    }

    if count < int64(bc.threshold) {
        log.Printf("Pending pool size: %d (threshold: %d), skipping", count, bc.threshold)
        return
    }

    log.Printf("Pending pool reached threshold (%d), triggering HDBSCAN", count)

    // 取出所有 pending embeddings
    items, err := bc.pendingPool.PopAll(ctx)
    if err != nil {
        log.Printf("Error popping pending pool: %v", err)
        return
    }

    // 呼叫 HDBSCAN
    result, err := bc.clusterClient.RunClustering(ctx, items.Embeddings, items.Texts)
    if err != nil {
        log.Printf("HDBSCAN failed: %v", err)
        // 放回 pending pool
        bc.pendingPool.PushBatch(ctx, items)
        return
    }

    // 處理結果
    log.Printf("HDBSCAN found %d clusters, %d noise", len(result.Clusters), result.NoiseCount)

    for _, cluster := range result.Clusters {
        // 檢查是否與現有 Cluster 重疊
        existingID, score, _ := bc.centroidMgr.FindNearest(ctx, cluster.Centroid)

        if existingID != "" && score > 0.85 {
            // 重疊，更新現有 Cluster
            log.Printf("Cluster '%s' overlaps with existing '%s' (score: %.2f), merging",
                cluster.Name, existingID, score)
            bc.centroidMgr.Update(ctx, existingID, cluster.Centroid)
        } else {
            // 新 Cluster
            newID := generateClusterID()
            log.Printf("New cluster discovered: %s (%s), size: %d",
                newID, cluster.Name, cluster.Size)
            bc.centroidMgr.Add(ctx, newID, cluster.Centroid)
            // TODO: 儲存 Cluster 資訊到 PostgreSQL
        }
    }
}

func generateClusterID() string {
    return fmt.Sprintf("cluster_%d", time.Now().UnixNano())
}
```

**驗收標準**:
```
☐ 定期檢查 Pending Pool
☐ 達到閾值自動觸發 HDBSCAN
☐ 新 Cluster 存入 Redis
☐ 重疊 Cluster 正確合併
☐ 後續貼文可即時歸類
```

---

## 5. Phase 3: API + 驗證 (Day 11-14)

### 5.1 Step 8: Search API (Day 11)

**檔案**: `cmd/api/main.go`

```go
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "kolr-dynamic-tagging/internal/ml"
    "kolr-dynamic-tagging/internal/storage"
)

type API struct {
    embedClient   *ml.EmbeddingClient
    qdrantStore   *storage.QdrantStore
    postgresStore *storage.PostgresStore
}

type SearchRequest struct {
    Query string `json:"query" binding:"required"`
    Limit int    `json:"limit"`
}

type SearchResult struct {
    PostID    string   `json:"post_id"`
    Content   string   `json:"content"`
    Score     float32  `json:"score"`
    ClusterID string   `json:"cluster_id"`
    SoftTags  []string `json:"soft_tags"`
}

func (a *API) Search(c *gin.Context) {
    var req SearchRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if req.Limit == 0 {
        req.Limit = 10
    }

    // 1. Query Embedding
    embedding, err := a.embedClient.Embed(c.Request.Context(), req.Query)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "embedding failed"})
        return
    }

    // 2. Qdrant Search
    results, err := a.qdrantStore.Search(c.Request.Context(), toFloat32(embedding), uint64(req.Limit))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
        return
    }

    // 3. 組裝結果
    var searchResults []SearchResult
    for _, r := range results {
        sr := SearchResult{
            PostID:    r.Id.GetStr(),
            Score:     r.Score,
            Content:   r.Payload["content"].GetStringValue(),
            ClusterID: r.Payload["cluster_id"].GetStringValue(),
        }
        searchResults = append(searchResults, sr)
    }

    c.JSON(http.StatusOK, gin.H{
        "query":   req.Query,
        "results": searchResults,
    })
}

func (a *API) GetClusters(c *gin.Context) {
    clusters, err := a.postgresStore.GetAllClusters(c.Request.Context())
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, clusters)
}

func (a *API) GetClusterPosts(c *gin.Context) {
    clusterID := c.Param("id")
    limit := 50

    posts, err := a.postgresStore.GetPostsByCluster(c.Request.Context(), clusterID, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, posts)
}

func main() {
    r := gin.Default()

    api := &API{
        // 初始化...
    }

    r.POST("/search", api.Search)
    r.GET("/clusters", api.GetClusters)
    r.GET("/clusters/:id/posts", api.GetClusterPosts)

    r.Run(":8080")
}
```

**API 規格**:
```
POST /search
Request:  {"query": "持妝底妝推薦", "limit": 10}
Response: {"query": "...", "results": [{post_id, content, score, cluster_id}, ...]}

GET /clusters
Response: [{id, name, post_count, keywords}, ...]

GET /clusters/:id/posts
Response: [{post_id, content, soft_tags, sentiment}, ...]
```

**驗收標準**:
```
☐ POST /search 延遲 < 100ms
☐ 搜尋結果相關性人工評估 > 80%
☐ GET /clusters 列出所有 Cluster
☐ GET /clusters/:id/posts 正確回傳
```

---

### 5.2 Step 9-10: 測試與驗證 (Day 12-14)

**測試腳本**: `scripts/run_showcase.sh`

```bash
#!/bin/bash

echo "=== Dynamic Tagging Show Case ==="
echo ""

# Step 1: 清空資料
echo "[1/7] 清空所有資料..."
redis-cli FLUSHALL
curl -X DELETE "http://localhost:6333/collections/posts"
psql -c "TRUNCATE post_tags, clusters, cluster_history"

# Step 2: 冷啟動測試
echo "[2/7] 冷啟動測試 - 處理前 5000 篇..."
go run cmd/processor/main.go --input testdata/beauty_posts_50k.json --limit 5000

echo "等待 HDBSCAN 觸發..."
sleep 30

# Step 3: 驗證 Cluster 產生
echo "[3/7] 驗證 Cluster 產生..."
CLUSTER_COUNT=$(redis-cli HLEN cluster:centroids)
echo "Cluster 數量: $CLUSTER_COUNT"

# Step 4: 正常處理測試
echo "[4/7] 處理剩餘貼文..."
go run cmd/processor/main.go --input testdata/beauty_posts_50k.json --skip 5000

# Step 5: 搜尋測試
echo "[5/7] 搜尋效果測試..."
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"query": "持妝底妝推薦", "limit": 10}'

echo ""

# Step 6: 統計報告
echo "[6/7] 生成統計報告..."
go run scripts/evaluate.go

# Step 7: 完成
echo "[7/7] Show Case 完成！"
```

**評估腳本**: `scripts/evaluate.go`

```go
package main

import (
    "context"
    "fmt"
    "log"
)

func main() {
    ctx := context.Background()

    // 連接資料庫...

    // 統計
    stats := collectStats(ctx)

    fmt.Println("=== PoC 成果報告 ===")
    fmt.Println("")
    fmt.Printf("📊 數據規模\n")
    fmt.Printf("├─ 處理貼文: %d 篇\n", stats.TotalPosts)
    fmt.Printf("├─ 總耗時: %s\n", stats.Duration)
    fmt.Printf("└─ 總成本: $%.2f\n", stats.Cost)
    fmt.Println("")
    fmt.Printf("📈 Cluster 統計\n")
    fmt.Printf("├─ Cluster 數: %d 個\n", stats.ClusterCount)
    fmt.Printf("├─ 最大 Cluster: %s (%d 篇)\n", stats.LargestCluster, stats.LargestSize)
    fmt.Printf("├─ 噪點比例: %.1f%%\n", stats.NoiseRate*100)
    fmt.Printf("└─ 即時歸類率: %.1f%%\n", stats.AssignRate*100)
    fmt.Println("")
    fmt.Printf("✅ 指標達成\n")
    fmt.Printf("├─ 標籤相關性: %.0f%% (目標 ≥85%%)\n", stats.Relevance*100)
    fmt.Printf("├─ 覆蓋率: %.0f%% (目標 ≥90%%)\n", stats.Coverage*100)
    fmt.Printf("└─ 聚類一致性: %.0f%% (目標 ≥80%%)\n", stats.Consistency*100)
}
```

---

## 6. 專案結構總覽

```
kolr-dynamic-tagging/
├── docker-compose.yml
├── Makefile
├── go.mod
├── go.sum
├── README.md
│
├── cmd/
│   ├── processor/              # 主處理流程
│   │   └── main.go
│   ├── clusterer/              # 批次聚類
│   │   └── main.go
│   └── api/                    # REST API
│       └── main.go
│
├── internal/
│   ├── filter/
│   │   └── rules.go            # L1 Rules Filter
│   ├── scoring/
│   │   └── risk_score.go       # L2 Risk Score
│   ├── clustering/
│   │   └── centroid_manager.go # Centroid 管理
│   ├── tagging/
│   │   └── soft_tagger.go      # LLM Tagging
│   ├── storage/
│   │   ├── qdrant.go           # 向量儲存
│   │   ├── postgres.go         # 關聯式儲存
│   │   └── redis.go            # 快取 + Queue
│   └── ml/
│       ├── client.go           # gRPC Client
│       └── embedding_client.go
│
├── proto/
│   └── ml.proto                # gRPC 定義
│
├── ml_service/                 # Python ML 服務
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── embedding_server.py
│   └── clustering_server.py
│
├── scripts/
│   ├── init.sql                # 資料庫初始化
│   ├── export_posts.sql        # 匯出測試資料
│   ├── run_showcase.sh         # Show Case 腳本
│   └── evaluate.go             # 評估腳本
│
└── testdata/
    └── beauty_posts_50k.json   # 測試資料
```

---

## 7. Checklist 總覽

```
Phase 0: 環境準備 (Day 1-2)
☐ Docker Compose 環境
☐ Python ML 環境
☐ Go 開發環境
☐ 測試資料準備

Phase 1: 核心元件 (Day 3-7)
☐ Step 1: Embedding Service (Day 3)
☐ Step 2: Centroid Manager (Day 4)
☐ Step 3: HDBSCAN Service (Day 5)
☐ Step 4: LLM Tagger (Day 6)
☐ Step 5: Storage Layer (Day 7)

Phase 2: 流程整合 (Day 8-10)
☐ Step 6: Post Processor (Day 8-9)
☐ Step 7: Batch Clusterer (Day 10)

Phase 3: API + 驗證 (Day 11-14)
☐ Step 8: Search API (Day 11)
☐ Step 9: 冷啟動測試 (Day 12)
☐ Step 10: Show Case 測試 (Day 13-14)

最終驗收
☐ 標籤相關性 ≥ 85%
☐ 覆蓋率 ≥ 90%
☐ 聚類一致性 ≥ 80%
☐ 處理延遲 < 300ms
☐ 成本 < $5
☐ Demo 完成
```

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-02-03 | Kolr Engineering | Initial development plan |
