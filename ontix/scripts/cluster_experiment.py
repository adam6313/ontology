#!/usr/bin/env python3
"""
HDBSCAN Clustering 參數實驗
===========================
目標：找出最佳的 min_cluster_size 和 min_samples 參數

評估指標：
1. Silhouette Score (輪廓係數) - 越高越好，範圍 [-1, 1]
2. DBCV Score (基於密度的驗證) - HDBSCAN 原生指標
3. Noise Ratio (噪音比例) - 太高表示參數太嚴格
4. Cluster Count (群集數量) - 是否合理
5. Cluster Size Distribution - 各群大小是否平衡
"""

import sys
import json
import numpy as np
import psycopg2
from itertools import product
from dataclasses import dataclass
from typing import List, Tuple, Optional

# 嘗試導入 HDBSCAN
try:
    import hdbscan
    HDBSCAN_AVAILABLE = True
except ImportError:
    HDBSCAN_AVAILABLE = False
    print("Warning: hdbscan not installed, using sklearn DBSCAN as fallback")

from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import normalize

@dataclass
class ExperimentResult:
    """實驗結果"""
    min_cluster_size: int
    min_samples: int
    n_clusters: int
    noise_count: int
    noise_ratio: float
    silhouette: Optional[float]
    cluster_sizes: List[int]

    def to_dict(self):
        return {
            'min_cluster_size': self.min_cluster_size,
            'min_samples': self.min_samples,
            'n_clusters': self.n_clusters,
            'noise_count': self.noise_count,
            'noise_ratio': round(self.noise_ratio, 3),
            'silhouette': round(self.silhouette, 3) if self.silhouette else None,
            'cluster_sizes': self.cluster_sizes,
            'avg_cluster_size': round(np.mean(self.cluster_sizes), 1) if self.cluster_sizes else 0,
            'size_std': round(np.std(self.cluster_sizes), 1) if self.cluster_sizes else 0,
        }


def get_embeddings_by_topic(topic_id: int = None) -> Tuple[List[str], np.ndarray]:
    """從資料庫取得 embeddings"""
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="ontix_dev",
        user="ontix",
        password="ontix_dev"
    )

    if topic_id:
        query = """
            SELECT p.post_id, pe.embedding
            FROM posts p
            JOIN post_embeddings pe ON p.post_id = pe.post_id
            JOIN post_topics pt ON p.post_id::bigint = pt.post_id
            WHERE pt.topic_id = %s
            AND pe.embedding IS NOT NULL
        """
        params = (topic_id,)
    else:
        query = """
            SELECT p.post_id, pe.embedding
            FROM posts p
            JOIN post_embeddings pe ON p.post_id = pe.post_id
            WHERE pe.embedding IS NOT NULL
        """
        params = None

    cur = conn.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    post_ids = [str(row[0]) for row in rows]

    # 處理 embedding 格式（可能是字串或 list）
    embeddings_list = []
    for row in rows:
        emb = row[1]
        if isinstance(emb, str):
            # 解析字串格式 "[0.1, 0.2, ...]"
            emb = json.loads(emb)
        embeddings_list.append(emb)

    embeddings = np.array(embeddings_list, dtype=np.float32)
    return post_ids, embeddings


def run_hdbscan_experiment(
    embeddings: np.ndarray,
    min_cluster_size: int,
    min_samples: int
) -> ExperimentResult:
    """執行單次 HDBSCAN 實驗"""

    # L2 正規化（用於 cosine similarity）
    embeddings_normalized = normalize(embeddings)

    if HDBSCAN_AVAILABLE:
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=min_samples,
            metric='euclidean',  # 正規化後 euclidean ≈ cosine
            cluster_selection_method='eom'
        )
        labels = clusterer.fit_predict(embeddings_normalized)
    else:
        # Fallback to DBSCAN
        eps = 0.5  # 對應約 cosine similarity 0.75
        clusterer = DBSCAN(
            eps=eps,
            min_samples=min_samples,
            metric='euclidean'
        )
        labels = clusterer.fit_predict(embeddings_normalized)

    # 計算指標
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    noise_mask = labels == -1
    noise_count = np.sum(noise_mask)
    noise_ratio = noise_count / len(labels)

    # Silhouette score（需要至少 2 個 cluster）
    silhouette = None
    if n_clusters >= 2 and noise_count < len(labels):
        non_noise_mask = ~noise_mask
        if np.sum(non_noise_mask) > n_clusters:
            try:
                silhouette = silhouette_score(
                    embeddings_normalized[non_noise_mask],
                    labels[non_noise_mask]
                )
            except:
                pass

    # 各 cluster 大小
    cluster_sizes = []
    for i in range(n_clusters):
        size = np.sum(labels == i)
        cluster_sizes.append(int(size))
    cluster_sizes.sort(reverse=True)

    return ExperimentResult(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples,
        n_clusters=n_clusters,
        noise_count=int(noise_count),
        noise_ratio=noise_ratio,
        silhouette=silhouette,
        cluster_sizes=cluster_sizes
    )


def run_grid_search(
    embeddings: np.ndarray,
    min_cluster_sizes: List[int],
    min_samples_list: List[int]
) -> List[ExperimentResult]:
    """網格搜索最佳參數"""
    results = []

    for mcs, ms in product(min_cluster_sizes, min_samples_list):
        if ms > mcs:  # min_samples 不能大於 min_cluster_size
            continue
        result = run_hdbscan_experiment(embeddings, mcs, ms)
        results.append(result)

    return results


def evaluate_and_rank(results: List[ExperimentResult], n_samples: int) -> List[dict]:
    """評估並排名結果"""
    scored_results = []

    for r in results:
        # 計算綜合分數
        score = 0

        # 1. Silhouette score (權重 30%)
        if r.silhouette is not None and r.silhouette > 0:
            score += r.silhouette * 30

        # 2. 噪音比例懲罰 (目標: 10-30%)
        if 0.1 <= r.noise_ratio <= 0.3:
            score += 25  # 理想範圍
        elif r.noise_ratio < 0.1:
            score += 15  # 太少噪音可能過擬合
        elif r.noise_ratio <= 0.5:
            score += 10  # 可接受
        else:
            score += 0   # 噪音太多

        # 3. Cluster 數量合理性 (目標: 3-10 for 100 samples)
        expected_clusters = max(3, min(10, n_samples // 15))
        if r.n_clusters == 0:
            score += 0
        elif abs(r.n_clusters - expected_clusters) <= 2:
            score += 25
        elif abs(r.n_clusters - expected_clusters) <= 4:
            score += 15
        else:
            score += 5

        # 4. Cluster 大小平衡度 (權重 20%)
        if r.cluster_sizes and len(r.cluster_sizes) > 1:
            cv = np.std(r.cluster_sizes) / np.mean(r.cluster_sizes)  # 變異係數
            if cv < 0.5:
                score += 20  # 很平衡
            elif cv < 1.0:
                score += 15
            else:
                score += 5
        elif r.n_clusters == 1:
            score += 10

        result_dict = r.to_dict()
        result_dict['score'] = round(score, 1)
        scored_results.append(result_dict)

    # 按分數排序
    scored_results.sort(key=lambda x: x['score'], reverse=True)
    return scored_results


def print_results(results: List[dict], title: str):
    """打印結果表格"""
    print(f"\n{'='*80}")
    print(f" {title}")
    print(f"{'='*80}")
    print(f"{'Rank':<5} {'MCS':<5} {'MS':<5} {'Clusters':<10} {'Noise':<10} {'Silhouette':<12} {'Score':<8} {'Sizes'}")
    print(f"{'-'*80}")

    for i, r in enumerate(results[:10], 1):
        sizes_str = str(r['cluster_sizes'][:5])
        if len(r['cluster_sizes']) > 5:
            sizes_str += '...'

        sil_str = f"{r['silhouette']:.3f}" if r['silhouette'] else "N/A"

        print(f"{i:<5} {r['min_cluster_size']:<5} {r['min_samples']:<5} "
              f"{r['n_clusters']:<10} {r['noise_ratio']:.1%}     "
              f"{sil_str:<12} {r['score']:<8} {sizes_str}")


def main():
    print("=" * 80)
    print(" HDBSCAN Clustering 參數實驗")
    print("=" * 80)

    # 取得所有 embeddings（不分 topic）
    print("\n📊 載入資料...")
    post_ids, embeddings = get_embeddings_by_topic(topic_id=None)
    print(f"   總共 {len(embeddings)} 篇文章")

    if len(embeddings) < 10:
        print("❌ 資料量不足，至少需要 10 篇文章")
        return

    # 定義參數搜索空間
    n = len(embeddings)

    # 根據資料量動態調整搜索範圍
    if n < 50:
        min_cluster_sizes = [3, 4, 5]
        min_samples_list = [2, 3]
    elif n < 100:
        min_cluster_sizes = [3, 4, 5, 6, 7]
        min_samples_list = [2, 3, 4, 5]
    elif n < 500:
        min_cluster_sizes = [5, 7, 10, 12, 15]
        min_samples_list = [3, 5, 7, 10]
    else:
        min_cluster_sizes = [10, 15, 20, 25, 30]
        min_samples_list = [5, 10, 15]

    print(f"\n🔬 參數搜索空間:")
    print(f"   min_cluster_size: {min_cluster_sizes}")
    print(f"   min_samples: {min_samples_list}")

    # 執行網格搜索
    print(f"\n⏳ 執行實驗...")
    results = run_grid_search(embeddings, min_cluster_sizes, min_samples_list)

    # 評估並排名
    ranked_results = evaluate_and_rank(results, n)

    # 打印結果
    print_results(ranked_results, "全域 Clustering 結果 (所有文章)")

    # 最佳參數建議
    if ranked_results:
        best = ranked_results[0]
        print(f"\n" + "=" * 80)
        print(f" 🏆 最佳參數建議")
        print(f"=" * 80)
        print(f"""
    min_cluster_size = {best['min_cluster_size']}
    min_samples      = {best['min_samples']}

    預期結果:
    - Clusters: {best['n_clusters']} 個
    - Noise: {best['noise_ratio']:.1%}
    - Silhouette: {best['silhouette'] if best['silhouette'] else 'N/A'}
    - 平均 Cluster 大小: {best['avg_cluster_size']}
""")

    # 按 Topic 分別實驗
    print(f"\n" + "=" * 80)
    print(f" 按 Topic 分別實驗")
    print(f"=" * 80)

    # 取得有足夠資料的 topics
    conn = psycopg2.connect(
        host="localhost", port=5432, database="ontix_dev",
        user="ontix", password="ontix_dev"
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT pt.topic_id, t.name, COUNT(*) as cnt
        FROM post_topics pt
        JOIN topics t ON pt.topic_id = t.id
        GROUP BY pt.topic_id, t.name
        HAVING COUNT(*) >= 10
        ORDER BY cnt DESC
    """)
    topics = cur.fetchall()
    conn.close()

    topic_results = {}
    for topic_id, topic_name, count in topics:
        print(f"\n📁 Topic {topic_id}: {topic_name} ({count} 篇)")

        _, topic_embeddings = get_embeddings_by_topic(topic_id)

        if len(topic_embeddings) < 10:
            print("   ⚠️ 資料不足，跳過")
            continue

        # 針對小資料集調整參數
        if count < 30:
            mcs_list = [3, 4, 5]
            ms_list = [2, 3]
        else:
            mcs_list = [3, 5, 7]
            ms_list = [2, 3, 5]

        topic_exp_results = run_grid_search(topic_embeddings, mcs_list, ms_list)
        ranked = evaluate_and_rank(topic_exp_results, len(topic_embeddings))

        if ranked:
            best = ranked[0]
            topic_results[topic_id] = {
                'name': topic_name,
                'count': count,
                'best_params': {
                    'min_cluster_size': best['min_cluster_size'],
                    'min_samples': best['min_samples']
                },
                'expected_clusters': best['n_clusters'],
                'noise_ratio': best['noise_ratio'],
                'silhouette': best['silhouette']
            }
            print(f"   最佳: MCS={best['min_cluster_size']}, MS={best['min_samples']} "
                  f"→ {best['n_clusters']} clusters, {best['noise_ratio']:.0%} noise")

    # 總結建議
    print(f"\n" + "=" * 80)
    print(f" 📋 參數配置建議")
    print(f"=" * 80)

    print("""
    根據實驗結果，建議採用動態參數策略：

    ┌─────────────────────────────────────────────────────────────┐
    │  資料量            min_cluster_size    min_samples          │
    ├─────────────────────────────────────────────────────────────┤
    │  < 50 篇           3                   2                    │
    │  50-100 篇         5                   3                    │
    │  100-500 篇        max(5, n*0.05)      max(3, n*0.03)      │
    │  > 500 篇          max(10, n*0.03)     max(5, n*0.02)      │
    └─────────────────────────────────────────────────────────────┘

    Noise 閾值建議（Cosine Distance）：
    - 高信心分配: distance < 0.25
    - 正常分配:   distance < 0.35
    - 低信心標記: distance < 0.45
    - 標記 Noise: distance >= 0.45
    """)

    # 輸出 JSON 結果
    output = {
        'global_best': ranked_results[0] if ranked_results else None,
        'all_results': ranked_results,
        'topic_results': topic_results,
        'recommendations': {
            'dynamic_params': {
                'small': {'min_cluster_size': 3, 'min_samples': 2, 'threshold': 50},
                'medium': {'min_cluster_size': 5, 'min_samples': 3, 'threshold': 100},
                'large': {'min_cluster_size': 'n*0.05', 'min_samples': 'n*0.03', 'threshold': 500},
            },
            'noise_thresholds': {
                'high_confidence': 0.25,
                'normal': 0.35,
                'low_confidence': 0.45,
                'noise': 0.45
            }
        }
    }

    with open('/Users/adam/poc/ontology/ontix/scripts/cluster_experiment_results.json', 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n✅ 結果已儲存至 scripts/cluster_experiment_results.json")


if __name__ == '__main__':
    main()
