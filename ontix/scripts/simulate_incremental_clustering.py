#!/usr/bin/env python3
"""
模擬增量 Cluster 分配流程

展示：
1. 初始化 - 用部分資料建立 clusters
2. 即時分配 - KNN 分配新文章
3. Pending 處理 - Micro-batch HDBSCAN
4. 統計分析
"""
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
from hdbscan import HDBSCAN
from umap import UMAP
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import time
import random

# ============================================================
# 配置
# ============================================================
CONFIG = {
    "confidence_threshold": 0.6,      # 信心度閾值
    "pending_batch_size": 100,        # Micro-batch 大小
    "min_cluster_size": 3,            # HDBSCAN 參數
    "initial_ratio": 0.7,             # 初始化用的資料比例
}

# ============================================================
# 資料庫連線
# ============================================================
conn = psycopg2.connect(
    host="localhost", port=5432, dbname="ontix_dev",
    user="ontix", password="ontix_dev"
)

def parse_embedding(emb_str):
    if emb_str is None:
        return None
    if isinstance(emb_str, (list, np.ndarray)):
        return np.array(emb_str)
    clean = emb_str.strip('[]')
    return np.array([float(x) for x in clean.split(',')])

# ============================================================
# Centroid Cache (模擬 Redis)
# ============================================================
class CentroidCache:
    """模擬 Redis centroid cache"""

    def __init__(self):
        self.centroids = {}  # cluster_id -> embedding
        self.cluster_sizes = {}  # cluster_id -> count
        self.cluster_names = {}  # cluster_id -> name

    def add_cluster(self, cluster_id, centroid, size, name=""):
        self.centroids[cluster_id] = centroid
        self.cluster_sizes[cluster_id] = size
        self.cluster_names[cluster_id] = name

    def get_all_centroids(self):
        return self.centroids

    def update_centroid(self, cluster_id, new_centroid, new_size):
        self.centroids[cluster_id] = new_centroid
        self.cluster_sizes[cluster_id] = new_size

    def stats(self):
        return {
            "total_clusters": len(self.centroids),
            "total_posts": sum(self.cluster_sizes.values()),
            "sizes": dict(self.cluster_sizes)
        }

# ============================================================
# Pending Queue (模擬 Redis sorted set)
# ============================================================
class PendingQueue:
    """模擬 pending queue"""

    def __init__(self):
        self.queue = []  # [(post_id, embedding, content)]

    def add(self, post_id, embedding, content):
        self.queue.append((post_id, embedding, content))

    def pop_batch(self, size):
        batch = self.queue[:size]
        self.queue = self.queue[size:]
        return batch

    def size(self):
        return len(self.queue)

# ============================================================
# 即時分配器
# ============================================================
class RealtimeAssigner:
    """即時 KNN 分配"""

    def __init__(self, centroid_cache, confidence_threshold=0.6):
        self.cache = centroid_cache
        self.threshold = confidence_threshold
        self.stats = {
            "assigned": 0,
            "pending": 0,
            "total_latency_ms": 0
        }

    def assign(self, post_id, embedding):
        """分配單篇文章，返回 (cluster_id, confidence, is_pending)"""
        start = time.time()

        centroids = self.cache.get_all_centroids()
        if not centroids:
            return None, 0, True

        # 計算與所有 centroid 的相似度
        centroid_ids = list(centroids.keys())
        centroid_vectors = np.array([centroids[cid] for cid in centroid_ids])

        similarities = cosine_similarity([embedding], centroid_vectors)[0]

        # 找最高的兩個
        sorted_indices = np.argsort(similarities)[::-1]
        best_idx = sorted_indices[0]
        second_idx = sorted_indices[1] if len(sorted_indices) > 1 else sorted_indices[0]

        best_cluster = centroid_ids[best_idx]
        best_sim = similarities[best_idx]
        second_sim = similarities[second_idx]

        # 信心度 = top1 相似度 * (top1 - top2 的差距)
        gap = best_sim - second_sim
        confidence = best_sim * (1 + gap)  # 簡化的信心度公式

        latency_ms = (time.time() - start) * 1000
        self.stats["total_latency_ms"] += latency_ms

        is_pending = confidence < self.threshold
        if is_pending:
            self.stats["pending"] += 1
        else:
            self.stats["assigned"] += 1

        return best_cluster, confidence, is_pending

    def get_stats(self):
        total = self.stats["assigned"] + self.stats["pending"]
        avg_latency = self.stats["total_latency_ms"] / total if total > 0 else 0
        return {
            **self.stats,
            "total": total,
            "pending_rate": self.stats["pending"] / total if total > 0 else 0,
            "avg_latency_ms": avg_latency
        }

# ============================================================
# Micro-batch 處理器
# ============================================================
class MicroBatchProcessor:
    """處理 pending queue 的 HDBSCAN"""

    def __init__(self, centroid_cache, min_cluster_size=3):
        self.cache = centroid_cache
        self.min_cluster_size = min_cluster_size
        self.stats = {
            "batches_processed": 0,
            "posts_assigned": 0,
            "new_clusters_created": 0,
            "outliers": 0
        }

    def process(self, pending_batch, existing_next_cluster_id):
        """處理一批 pending 文章"""
        if len(pending_batch) < self.min_cluster_size:
            # 太少，全部標記為 outlier
            self.stats["outliers"] += len(pending_batch)
            return [], existing_next_cluster_id

        # 提取 embeddings
        embeddings = np.array([item[1] for item in pending_batch])

        # 嘗試用 HDBSCAN 聚類
        # 先降維（如果資料夠多）
        if len(embeddings) > 10:
            n_neighbors = min(5, len(embeddings) - 1)
            n_components = min(10, len(embeddings) - 2)
            umap = UMAP(n_neighbors=n_neighbors, n_components=n_components,
                       min_dist=0.0, metric='cosine', random_state=42)
            reduced = umap.fit_transform(embeddings)
        else:
            reduced = embeddings

        hdbscan = HDBSCAN(
            min_cluster_size=self.min_cluster_size,
            min_samples=1,
            metric='euclidean'
        )
        labels = hdbscan.fit_predict(reduced)

        # 處理結果
        assignments = []
        new_clusters = defaultdict(list)

        for i, label in enumerate(labels):
            post_id, embedding, content = pending_batch[i]

            if label == -1:
                # Outlier - 嘗試分配到現有最近的 cluster
                centroids = self.cache.get_all_centroids()
                if centroids:
                    centroid_ids = list(centroids.keys())
                    centroid_vectors = np.array([centroids[cid] for cid in centroid_ids])
                    sims = cosine_similarity([embedding], centroid_vectors)[0]
                    best_idx = np.argmax(sims)
                    assignments.append((post_id, centroid_ids[best_idx], sims[best_idx]))
                    self.stats["posts_assigned"] += 1
                else:
                    self.stats["outliers"] += 1
            else:
                # 屬於新發現的 cluster
                new_clusters[label].append((post_id, embedding, content))

        # 創建新 cluster
        next_id = existing_next_cluster_id
        for label, members in new_clusters.items():
            if len(members) >= self.min_cluster_size:
                # 計算 centroid
                member_embeddings = np.array([m[1] for m in members])
                centroid = member_embeddings.mean(axis=0)

                # 加入 cache
                self.cache.add_cluster(next_id, centroid, len(members), f"新群組_{next_id}")

                # 分配成員
                for post_id, _, _ in members:
                    assignments.append((post_id, next_id, 0.9))

                self.stats["new_clusters_created"] += 1
                self.stats["posts_assigned"] += len(members)
                next_id += 1
            else:
                # 太小，標記為 outlier
                self.stats["outliers"] += len(members)

        self.stats["batches_processed"] += 1
        return assignments, next_id

    def get_stats(self):
        return self.stats

# ============================================================
# 主模擬流程
# ============================================================
def main():
    print("=" * 70)
    print("增量 Cluster 分配模擬")
    print("=" * 70)

    # 1. 讀取資料
    print("\n📊 載入資料...")
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT p.post_id, p.content, pe.embedding
            FROM posts p
            JOIN post_embeddings pe ON p.post_id = pe.post_id
        """)
        posts = cur.fetchall()

    all_posts = []
    for p in posts:
        emb = parse_embedding(p['embedding'])
        if emb is not None:
            all_posts.append({
                'post_id': p['post_id'],
                'content': p['content'][:200] if p['content'] else "",
                'embedding': emb
            })

    print(f"   載入 {len(all_posts)} 篇貼文")

    if len(all_posts) < 20:
        print("❌ 資料太少，請先推送更多資料")
        return

    # 2. 分割資料：初始化用 vs 模擬新進用
    random.shuffle(all_posts)
    split_idx = int(len(all_posts) * CONFIG["initial_ratio"])
    initial_posts = all_posts[:split_idx]
    new_posts = all_posts[split_idx:]

    print(f"   初始化資料: {len(initial_posts)} 篇")
    print(f"   模擬新進資料: {len(new_posts)} 篇")

    # 3. 初始化 - 用 HDBSCAN 建立初始 clusters
    print("\n🔧 初始化 Clusters (HDBSCAN)...")

    embeddings = np.array([p['embedding'] for p in initial_posts])

    # UMAP 降維
    n_neighbors = min(15, len(embeddings) - 1)
    n_components = min(20, len(embeddings) - 2)
    umap = UMAP(n_neighbors=n_neighbors, n_components=n_components,
                min_dist=0.0, metric='cosine', random_state=42)
    reduced = umap.fit_transform(embeddings)

    # HDBSCAN
    hdbscan = HDBSCAN(
        min_cluster_size=CONFIG["min_cluster_size"],
        min_samples=max(1, CONFIG["min_cluster_size"] // 2),
        metric='euclidean'
    )
    labels = hdbscan.fit_predict(reduced)

    # 建立 centroid cache
    cache = CentroidCache()
    cluster_members = defaultdict(list)

    for i, label in enumerate(labels):
        if label != -1:
            cluster_members[label].append(i)

    for cluster_id, members in cluster_members.items():
        member_embeddings = embeddings[members]
        centroid = member_embeddings.mean(axis=0)
        cache.add_cluster(cluster_id, centroid, len(members), f"群組_{cluster_id}")

    initial_stats = cache.stats()
    print(f"   建立 {initial_stats['total_clusters']} 個 clusters")
    print(f"   覆蓋 {initial_stats['total_posts']}/{len(initial_posts)} 篇 ({initial_stats['total_posts']/len(initial_posts)*100:.1f}%)")

    # 4. 模擬即時分配
    print("\n⚡ 模擬即時分配...")
    print(f"   信心度閾值: {CONFIG['confidence_threshold']}")

    assigner = RealtimeAssigner(cache, CONFIG["confidence_threshold"])
    pending_queue = PendingQueue()
    assignments = []

    for post in new_posts:
        cluster_id, confidence, is_pending = assigner.assign(
            post['post_id'],
            post['embedding']
        )

        if is_pending:
            pending_queue.add(post['post_id'], post['embedding'], post['content'])
        else:
            assignments.append((post['post_id'], cluster_id, confidence))

    realtime_stats = assigner.get_stats()
    print(f"   處理 {realtime_stats['total']} 篇")
    print(f"   直接分配: {realtime_stats['assigned']} ({100-realtime_stats['pending_rate']*100:.1f}%)")
    print(f"   進入 pending: {realtime_stats['pending']} ({realtime_stats['pending_rate']*100:.1f}%)")
    print(f"   平均延遲: {realtime_stats['avg_latency_ms']:.2f} ms")

    # 5. 模擬 Micro-batch 處理
    print("\n🔄 模擬 Micro-batch 處理...")
    print(f"   Pending queue 大小: {pending_queue.size()}")

    processor = MicroBatchProcessor(cache, CONFIG["min_cluster_size"])
    next_cluster_id = max(cache.get_all_centroids().keys()) + 1 if cache.get_all_centroids() else 0

    batch_num = 0
    while pending_queue.size() > 0:
        batch = pending_queue.pop_batch(CONFIG["pending_batch_size"])
        batch_assignments, next_cluster_id = processor.process(batch, next_cluster_id)
        assignments.extend(batch_assignments)
        batch_num += 1
        print(f"   Batch {batch_num}: 處理 {len(batch)} 篇")

    batch_stats = processor.get_stats()
    print(f"\n   Micro-batch 統計:")
    print(f"   - 批次數: {batch_stats['batches_processed']}")
    print(f"   - 分配成功: {batch_stats['posts_assigned']}")
    print(f"   - 新建 cluster: {batch_stats['new_clusters_created']}")
    print(f"   - Outliers: {batch_stats['outliers']}")

    # 6. 最終統計
    print("\n" + "=" * 70)
    print("📈 最終統計")
    print("=" * 70)

    final_stats = cache.stats()
    print(f"\nCluster 狀態:")
    print(f"   總 clusters: {final_stats['total_clusters']}")
    print(f"   總覆蓋貼文: {final_stats['total_posts']}")

    # Cluster 大小分佈
    sizes = list(final_stats['sizes'].values())
    print(f"\nCluster 大小分佈:")
    print(f"   最小: {min(sizes)}")
    print(f"   最大: {max(sizes)}")
    print(f"   平均: {np.mean(sizes):.1f}")
    print(f"   中位數: {np.median(sizes):.1f}")

    # 分配統計
    total_new = len(new_posts)
    assigned_count = len(assignments)
    coverage = assigned_count / total_new * 100 if total_new > 0 else 0

    print(f"\n新文章分配:")
    print(f"   新文章總數: {total_new}")
    print(f"   成功分配: {assigned_count} ({coverage:.1f}%)")

    # 信心度分佈
    if assignments:
        confidences = [a[2] for a in assignments]
        print(f"\n信心度分佈:")
        print(f"   最低: {min(confidences):.3f}")
        print(f"   最高: {max(confidences):.3f}")
        print(f"   平均: {np.mean(confidences):.3f}")

    print("\n" + "=" * 70)
    print("✅ 模擬完成")
    print("=" * 70)

    # 7. 流程總結
    print("\n📝 流程總結:")
    print("""
    ┌─────────────────────────────────────────────────────────────┐
    │  1. 初始化                                                   │
    │     └─ HDBSCAN 建立初始 clusters + centroids                │
    │                                                             │
    │  2. 即時分配 (每篇新文章)                                    │
    │     └─ KNN 找最近 centroid                                  │
    │     └─ 高信心度 → 直接分配                                   │
    │     └─ 低信心度 → pending queue                             │
    │                                                             │
    │  3. Micro-batch (定期處理 pending)                          │
    │     └─ 小規模 HDBSCAN                                       │
    │     └─ 發現新 cluster 或分配到現有                           │
    │                                                             │
    │  4. 採樣維護 (每週，本次未模擬)                               │
    │     └─ 採樣重算 centroid                                    │
    │     └─ 合併/清理 clusters                                   │
    └─────────────────────────────────────────────────────────────┘
    """)

if __name__ == "__main__":
    main()
    conn.close()
