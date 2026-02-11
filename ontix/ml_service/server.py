"""
ML Service - HDBSCAN Clustering HTTP Server

純 HDBSCAN 聚類 + UMAP 降維 + LLM 命名
"""
import os
import json
import uvicorn
import numpy as np
from hdbscan import HDBSCAN
from umap import UMAP
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="Ontix ML Service - HDBSCAN")

# OpenAI client for cluster naming
openai_client = None
if os.getenv('OPENAI_API_KEY'):
    openai_client = OpenAI()
    print("OpenAI client initialized")
else:
    print("Warning: OPENAI_API_KEY not set, using generic names")


class Embedding(BaseModel):
    values: list[float]


class ClusteringRequest(BaseModel):
    embeddings: list[Embedding]
    texts: list[str] = []
    min_cluster_size: int = 5
    topic_context: str = ""  # 所屬 Topic 名稱，用於生成更精準的子群名稱


class Cluster(BaseModel):
    centroid: Embedding
    size: int
    name: str
    keywords: list[str]


class ClusteringResponse(BaseModel):
    clusters: list[Cluster]
    labels: list[int]  # cluster index for each post (-1 = noise)
    noise_count: int


def generate_cluster_name(sample_texts: list[str], cluster_idx: int, topic_context: str = "") -> str:
    """使用 LLM 基於樣本貼文生成名稱"""
    if not openai_client or not sample_texts:
        return f"群組{cluster_idx + 1}"

    prompt = f"""你是社群內容分析專家。分析以下貼文群組，找出它們的共同主題。

貼文樣本：
{chr(10).join(f'{i+1}. {t[:200]}' for i, t in enumerate(sample_texts[:8]))}

請分析這些貼文的共同特徵，生成一個精準的群組名稱。

命名優先順序（由高到低）：
1. 【最優先】如果帖子明確討論同一個品牌或產品，直接使用該名稱
   - 例如：iPhone 17、SK-II 神仙水、特斯拉 Model Y、麥當勞、星巴克
2. 【次優先】如果是同一品牌的多個產品，使用品牌名
   - 例如：Apple 產品、Nike 球鞋、無印良品
3. 【一般】如果沒有明確品牌，使用具體的內容類型
   - 例如：美食探店、髮型設計、旅遊景點

規則：
- 名稱 2-10 個字
- 品牌/產品名稱可以用英文或原文
- 名稱要讓品牌方一眼就能識別是否與他們相關

回覆 JSON：{{"name": "群組名稱"}}"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=50,
            temperature=0.1
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("name", f"群組{cluster_idx + 1}")
    except Exception as e:
        print(f"LLM naming failed: {e}")
        return f"群組{cluster_idx + 1}"


@app.post("/cluster", response_model=ClusteringResponse)
def run_clustering(req: ClusteringRequest):
    """執行 HDBSCAN 聚類"""
    embeddings = np.array([e.values for e in req.embeddings])
    texts = req.texts
    min_cluster_size = max(req.min_cluster_size, 2)
    topic_context = req.topic_context

    print(f"Running HDBSCAN on {len(embeddings)} posts (min_cluster_size={min_cluster_size}, topic={topic_context})")

    if len(texts) < min_cluster_size * 2:
        print("Not enough posts for clustering")
        return ClusteringResponse(clusters=[], noise_count=len(texts))

    # UMAP 降維 (實驗結果: 20 維效果最佳)
    n_neighbors = min(15, len(embeddings) - 1)
    n_components = min(20, len(embeddings) - 2)

    umap_model = UMAP(
        n_neighbors=n_neighbors,
        n_components=n_components,
        min_dist=0.0,
        metric='cosine',
        random_state=42
    )

    print("Running UMAP...")
    reduced = umap_model.fit_transform(embeddings)

    # HDBSCAN 聚類
    hdbscan_model = HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=max(1, min_cluster_size // 2),
        metric='euclidean',
        cluster_selection_method='eom'
    )

    print("Running HDBSCAN...")
    labels = hdbscan_model.fit_predict(reduced)

    # 統計聚類結果
    unique_labels = set(labels)
    noise_count = sum(1 for l in labels if l == -1)

    clusters = []
    for label in sorted(unique_labels):
        if label == -1:
            continue

        # 該聚類的索引
        indices = [i for i, l in enumerate(labels) if l == label]
        if not indices:
            continue

        # 計算 centroid（用原始 embedding）
        cluster_embeddings = embeddings[indices]
        centroid = cluster_embeddings.mean(axis=0)

        # 取得樣本貼文
        sample_texts = [texts[i] for i in indices[:10]] if texts else []

        # LLM 生成名稱（傳入 topic_context）
        name = generate_cluster_name(sample_texts, len(clusters), topic_context)

        clusters.append(Cluster(
            centroid=Embedding(values=centroid.tolist()),
            size=len(indices),
            name=name,
            keywords=[]  # 不再提取關鍵詞
        ))

    print(f"Found {len(clusters)} clusters, {noise_count} noise points")

    # Map original labels to cluster indices (0-based)
    label_map = {old: new for new, old in enumerate(sorted(l for l in unique_labels if l != -1))}
    mapped_labels = [label_map.get(l, -1) for l in labels]

    return ClusteringResponse(clusters=clusters, labels=mapped_labels, noise_count=noise_count)


@app.get("/health")
def health():
    return {"status": "ok", "engine": "HDBSCAN"}


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=50052)
