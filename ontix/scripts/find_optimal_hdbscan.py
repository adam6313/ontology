#!/usr/bin/env python3
"""
找出 HDBSCAN 最佳 min_cluster_size 參數
"""
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
from hdbscan import HDBSCAN
from umap import UMAP
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

# 連線
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

# 讀取資料
print("讀取 embeddings...")
with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute("SELECT post_id, embedding FROM post_embeddings")
    posts = cur.fetchall()

embeddings = []
for p in posts:
    emb = parse_embedding(p['embedding'])
    if emb is not None:
        embeddings.append(emb)

print(f"載入 {len(embeddings)} 篇貼文")

if len(embeddings) < 20:
    print("資料太少，請先推更多資料")
    exit(1)

emb_matrix = np.vstack(embeddings)

# UMAP 降維
print("UMAP 降維...")
n_neighbors = min(15, len(embeddings) - 1)
n_components = min(20, len(embeddings) - 2)

umap_model = UMAP(
    n_neighbors=n_neighbors,
    n_components=n_components,
    min_dist=0.0,
    metric='cosine',
    random_state=42
)
reduced = umap_model.fit_transform(emb_matrix)

# 測試不同 min_cluster_size
min_sizes = [2, 3, 4, 5, 6, 8, 10, 12, 15]
results = []

print("\n測試不同 min_cluster_size...")
print("-" * 70)
print(f"{'min_size':>10} {'n_clusters':>12} {'noise_pct':>12} {'silhouette':>12} {'coverage':>12}")
print("-" * 70)

for min_size in min_sizes:
    hdbscan = HDBSCAN(
        min_cluster_size=min_size,
        min_samples=max(1, min_size // 2),
        metric='euclidean',
        cluster_selection_method='eom'
    )
    labels = hdbscan.fit_predict(reduced)

    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    noise_count = sum(1 for l in labels if l == -1)
    noise_pct = noise_count / len(labels) * 100
    coverage = (len(labels) - noise_count) / len(labels) * 100

    # Silhouette score（排除噪點）
    if n_clusters >= 2:
        mask = labels != -1
        if sum(mask) >= 2:
            sil = silhouette_score(reduced[mask], labels[mask])
        else:
            sil = -1
    else:
        sil = -1

    results.append({
        'min_size': min_size,
        'n_clusters': n_clusters,
        'noise_pct': noise_pct,
        'silhouette': sil,
        'coverage': coverage
    })

    print(f"{min_size:>10} {n_clusters:>12} {noise_pct:>11.1f}% {sil:>12.4f} {coverage:>11.1f}%")

print("-" * 70)

# 找最佳參數（平衡 silhouette 和 coverage）
valid_results = [r for r in results if r['silhouette'] > 0 and r['n_clusters'] >= 3]
if valid_results:
    # 綜合分數 = silhouette * 0.5 + coverage/100 * 0.5
    for r in valid_results:
        r['score'] = r['silhouette'] * 0.5 + r['coverage'] / 100 * 0.5

    best = max(valid_results, key=lambda x: x['score'])
    print(f"\n✅ 建議 min_cluster_size = {best['min_size']}")
    print(f"   - {best['n_clusters']} 個 cluster")
    print(f"   - {best['coverage']:.1f}% 覆蓋率")
    print(f"   - {best['silhouette']:.4f} silhouette score")

# 繪圖
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

min_sizes_arr = [r['min_size'] for r in results]

# 1. Cluster 數量
axes[0,0].plot(min_sizes_arr, [r['n_clusters'] for r in results], 'bo-', linewidth=2)
axes[0,0].set_xlabel('min_cluster_size')
axes[0,0].set_ylabel('Number of Clusters')
axes[0,0].set_title('Cluster Count vs min_cluster_size')
axes[0,0].grid(True, alpha=0.3)

# 2. 噪點比例
axes[0,1].plot(min_sizes_arr, [r['noise_pct'] for r in results], 'ro-', linewidth=2)
axes[0,1].set_xlabel('min_cluster_size')
axes[0,1].set_ylabel('Noise %')
axes[0,1].set_title('Noise Ratio vs min_cluster_size')
axes[0,1].grid(True, alpha=0.3)

# 3. Silhouette Score
axes[1,0].plot(min_sizes_arr, [r['silhouette'] for r in results], 'go-', linewidth=2)
axes[1,0].set_xlabel('min_cluster_size')
axes[1,0].set_ylabel('Silhouette Score')
axes[1,0].set_title('Silhouette Score vs min_cluster_size')
axes[1,0].grid(True, alpha=0.3)

# 4. Coverage
axes[1,1].plot(min_sizes_arr, [r['coverage'] for r in results], 'mo-', linewidth=2)
axes[1,1].set_xlabel('min_cluster_size')
axes[1,1].set_ylabel('Coverage %')
axes[1,1].set_title('Coverage vs min_cluster_size')
axes[1,1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('/Users/adam/poc/ontology/ontix/scripts/experiment_results/hdbscan_optimization.png', dpi=150)
print(f"\n📊 圖表已儲存: experiment_results/hdbscan_optimization.png")

conn.close()
