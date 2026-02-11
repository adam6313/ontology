# Ontix

社群貼文動態標籤與主題發現系統

基於 Palantir Ontology 思想，將社交媒體資料從「冷冰冰的行與列」轉化為具有業務語義的「物件」。

## Background

本專案源自輿情監控系統的標籤痛點：
- **語意落差**：口語表達（如「不用帶尿袋了」）無法識別為「續航」
- **顆粒度過粗**：只能標「3C」，無法細分討論主題
- **無法自動進化**：新話題、新流行語無法即時納入

Ontix 透過 **Dynamic Tagging + Clustering** 解決這些問題。

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Ontix System                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  Processor  │────▶│ Gemini API  │────▶│   Qdrant    │       │
│  │   (Post)    │     │ (Embedding) │     │  (Vectors)  │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                                                       │
│         │ Centroid Match                                        │
│         ▼                                                       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │    Redis    │────▶│  Clusterer  │────▶│ ML Service  │       │
│  │ (Centroids) │     │  (Batch)    │     │ (HDBSCAN)   │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                   │                   │               │
│         │                   ▼                   ▼               │
│         │            ┌─────────────┐     ┌─────────────┐       │
│         └───────────▶│ PostgreSQL  │◀────│ OpenAI API  │       │
│                      │   (Tags)    │     │ (Tagging)   │       │
│                      └─────────────┘     └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Embedding | Gemini `text-embedding-004` | 768-dim vectors (免費) |
| Tagging | OpenAI `gpt-4o-mini` | LLM 語意標籤 |
| Clustering | HDBSCAN (Python) | 主題發現 |
| Vector DB | Qdrant | 向量儲存與搜尋 |
| Cache | Redis | Centroids + Pending Pool |
| Storage | PostgreSQL | 標籤與聚類儲存 |

## Project Structure (DDD)

```
ontix/
├── cmd/                           # 應用程式入口
│   ├── processor/                 # 貼文處理服務
│   ├── clusterer/                 # 批次聚類服務
│   └── api/                       # REST API
│
├── internal/
│   ├── domain/                    # 領域層
│   │   ├── post/                  # 貼文聚合
│   │   ├── tag/                   # 標籤聚合
│   │   ├── cluster/               # 聚類聚合
│   │   └── embedding/             # 向量值物件
│   │
│   ├── service/                   # 服務層
│   │   ├── tagging/               # 標籤服務
│   │   └── clustering/            # 聚類服務
│   │
│   └── infrastructure/            # 基礎設施層
│       ├── persistence/           # 儲存實作
│       │   ├── postgres/
│       │   ├── redis/
│       │   └── qdrant/
│       ├── external/              # 外部服務
│       │   ├── gemini/
│       │   ├── openai/
│       │   └── mlservice/
│       └── config/
│
├── pkg/                           # 共用套件
│   └── grpc/
│
├── ml_service/                    # Python HDBSCAN 服務
├── proto/                         # gRPC 定義
├── scripts/                       # 工具腳本
├── docs/                          # 文件
├── docker-compose.yml
└── go.mod
```

## Quick Start

### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env:
# - GEMINI_API_KEY (from https://aistudio.google.com/app/apikey)
# - OPENAI_API_KEY
```

### 2. Start Services

```bash
make up
make ps
```

### 3. Generate Proto

```bash
make proto
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Redis | 6379 | Centroid cache + Pending Pool |
| Qdrant | 6333/6334 | Vector database |
| PostgreSQL | 5432 | Tag storage |
| ML Service | 50052 | HDBSCAN Clustering |

## Commands

```bash
make up              # Start services
make down            # Stop services
make logs            # View logs
make test            # Test connections
make proto           # Generate gRPC code
make build           # Build Go binaries
```

## Domain Model

```
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│     Post     │     Tag      │   Cluster    │   Embedding   │
│  (Aggregate) │  (Aggregate) │  (Aggregate) │    (Value)    │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ - ID         │ - HardTag    │ - Centroid   │ - Vector      │
│ - Content    │ - SoftTag    │ - Status     │ - Similarity  │
│ - Metrics    │ - PostTag    │ - Keywords   │ - Distance    │
│ - RiskScore  │ - Confidence │ - Assignment │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

## Cost Estimation (PoC 50K posts)

| Item | Cost |
|------|------|
| Embedding (Gemini) | **Free** |
| Tagging (gpt-4o-mini) | ~$15 |
| Cluster Naming | ~$2 |
| **Total** | **~$17** |

## Documents

| 文件 | 說明 |
|------|------|
| [PRD](./docs/07-dynamic-tagging-prd.md) | 產品需求文件 |
| [開發計劃](./docs/08-development-plan.md) | 開發計劃 |
| [Ontology 思想](./docs/01-palantir-ontology-intro.md) | Palantir Ontology 核心概念 |
| [輿情系統設計](./docs/02-sentiment-system-design.md) | 輿情系統 Ontology 設計 |
| [LLM + RAG](./docs/06-llm-rag-architecture.md) | LLM + Ontology RAG 架構 |
