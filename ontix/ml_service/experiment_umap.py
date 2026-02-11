"""
UMAP 降維實驗 - 比較不同維度對聚類品質的影響

實驗目標：
1. 比較原始維度 vs UMAP 降維後的聚類品質
2. 找出最佳降維目標維度
3. 測量 DBCV, Silhouette, Noise Ratio 三個指標

執行方式：
    python experiment_umap.py --db-url "postgres://..." --sample-size 1000
"""
import argparse
import time
import json
import numpy as np
import psycopg2
from dataclasses import dataclass
from typing import Optional
from hdbscan import HDBSCAN, validity_index
from umap import UMAP
from sklearn.metrics import silhouette_score
from tabulate import tabulate


@dataclass
class ExperimentResult:
    """單次實驗結果"""
    name: str
    dimensions: int
    n_clusters: int
    noise_ratio: float
    dbcv: float
    silhouette: float
    time_umap: float
    time_hdbscan: float

    @property
    def total_time(self) -> float:
        return self.time_umap + self.time_hdbscan

    @property
    def composite_score(self) -> float:
        """綜合分數 (越高越好)"""
        # DBCV: -1 to 1, higher is better
        # Silhouette: -1 to 1, higher is better
        # Noise ratio: 0 to 1, lower is better
        dbcv_norm = (self.dbcv + 1) / 2  # normalize to 0-1
        sil_norm = (self.silhouette + 1) / 2  # normalize to 0-1
        noise_score = 1 - self.noise_ratio  # invert so higher is better

        # 加權：DBCV(0.4) + Silhouette(0.3) + NoiseScore(0.3)
        return 0.4 * dbcv_norm + 0.3 * sil_norm + 0.3 * noise_score


def load_embeddings_from_db(db_url: str, limit: int = 1000) -> tuple[np.ndarray, list[str]]:
    """從資料庫載入 embeddings"""
    print(f"Loading embeddings from database (limit={limit})...")

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    cur.execute("""
        SELECT p.post_id, p.content, pe.embedding
        FROM posts p
        JOIN post_embeddings pe ON p.post_id = pe.post_id
        LIMIT %s
    """, (limit,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        raise ValueError("No embeddings found in database")

    post_ids = [row[0] for row in rows]
    contents = [row[1] for row in rows]

    # Parse embeddings (stored as vector type)
    embeddings = []
    for row in rows:
        emb = row[2]
        if isinstance(emb, str):
            # Parse "[0.1, 0.2, ...]" format
            emb = json.loads(emb.replace('(', '[').replace(')', ']'))
        embeddings.append(emb)

    embeddings = np.array(embeddings, dtype=np.float32)
    print(f"Loaded {len(embeddings)} embeddings, shape: {embeddings.shape}")

    return embeddings, contents


def load_embeddings_from_file(file_path: str) -> tuple[np.ndarray, list[str]]:
    """從 JSON 檔案載入 embeddings"""
    print(f"Loading embeddings from {file_path}...")

    with open(file_path, 'r') as f:
        data = json.load(f)

    embeddings = np.array([d['embedding'] for d in data], dtype=np.float32)
    contents = [d.get('content', '') for d in data]

    print(f"Loaded {len(embeddings)} embeddings, shape: {embeddings.shape}")
    return embeddings, contents


def run_hdbscan(embeddings: np.ndarray, min_cluster_size: int = 5) -> tuple[np.ndarray, HDBSCAN]:
    """執行 HDBSCAN 聚類"""
    model = HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=max(1, min_cluster_size // 2),
        metric='euclidean',
        cluster_selection_method='eom',
        gen_min_span_tree=True  # 需要計算 DBCV
    )
    labels = model.fit_predict(embeddings)
    return labels, model


def calculate_metrics(
    embeddings: np.ndarray,
    labels: np.ndarray,
    model: Optional[HDBSCAN] = None
) -> tuple[float, float, float, int]:
    """計算聚類品質指標"""
    unique_labels = set(labels)
    n_clusters = len([l for l in unique_labels if l >= 0])
    noise_count = sum(1 for l in labels if l == -1)
    noise_ratio = noise_count / len(labels)

    # DBCV (Density-Based Clustering Validation)
    # 需要至少 2 個 cluster
    if n_clusters >= 2 and model is not None:
        try:
            dbcv = validity_index(embeddings, labels, metric='euclidean')
        except Exception as e:
            print(f"  DBCV calculation failed: {e}")
            dbcv = -1.0
    else:
        dbcv = -1.0  # 無法計算

    # Silhouette Score
    # 需要至少 2 個 cluster 且有非噪點
    non_noise_mask = labels >= 0
    if n_clusters >= 2 and sum(non_noise_mask) > n_clusters:
        try:
            silhouette = silhouette_score(
                embeddings[non_noise_mask],
                labels[non_noise_mask]
            )
        except Exception as e:
            print(f"  Silhouette calculation failed: {e}")
            silhouette = -1.0
    else:
        silhouette = -1.0  # 無法計算

    return dbcv, silhouette, noise_ratio, n_clusters


def run_experiment(
    name: str,
    embeddings: np.ndarray,
    umap_dims: Optional[int],
    min_cluster_size: int = 5
) -> ExperimentResult:
    """執行單次實驗"""
    print(f"\n{'='*60}")
    print(f"Experiment: {name}")
    print(f"{'='*60}")

    original_dims = embeddings.shape[1]

    # UMAP 降維
    if umap_dims is not None and umap_dims < original_dims:
        print(f"Running UMAP: {original_dims} → {umap_dims} dimensions...")

        n_neighbors = min(15, len(embeddings) - 1)

        start = time.time()
        umap_model = UMAP(
            n_neighbors=n_neighbors,
            n_components=umap_dims,
            min_dist=0.0,
            metric='cosine',
            random_state=42
        )
        reduced = umap_model.fit_transform(embeddings)
        time_umap = time.time() - start

        print(f"  UMAP completed in {time_umap:.2f}s")
        final_dims = umap_dims
    else:
        reduced = embeddings
        time_umap = 0.0
        final_dims = original_dims
        print(f"No UMAP (using original {original_dims} dimensions)")

    # HDBSCAN 聚類
    print(f"Running HDBSCAN (min_cluster_size={min_cluster_size})...")
    start = time.time()
    labels, model = run_hdbscan(reduced, min_cluster_size)
    time_hdbscan = time.time() - start
    print(f"  HDBSCAN completed in {time_hdbscan:.2f}s")

    # 計算指標
    print("Calculating metrics...")
    dbcv, silhouette, noise_ratio, n_clusters = calculate_metrics(reduced, labels, model)

    result = ExperimentResult(
        name=name,
        dimensions=final_dims,
        n_clusters=n_clusters,
        noise_ratio=noise_ratio,
        dbcv=dbcv,
        silhouette=silhouette,
        time_umap=time_umap,
        time_hdbscan=time_hdbscan
    )

    print(f"\nResults:")
    print(f"  Clusters: {n_clusters}")
    print(f"  Noise ratio: {noise_ratio:.1%}")
    print(f"  DBCV: {dbcv:.4f}")
    print(f"  Silhouette: {silhouette:.4f}")
    print(f"  Composite Score: {result.composite_score:.4f}")

    return result


def run_all_experiments(
    embeddings: np.ndarray,
    min_cluster_size: int = 5,
    umap_dimensions: list[int] = None
) -> list[ExperimentResult]:
    """執行所有實驗"""
    original_dims = embeddings.shape[1]

    if umap_dimensions is None:
        # 預設測試維度
        umap_dimensions = [10, 20, 30, 50, 100]

    # 過濾掉大於原始維度的
    umap_dimensions = [d for d in umap_dimensions if d < original_dims]

    results = []

    # 1. 原始維度 (no UMAP)
    result = run_experiment(
        name=f"Original ({original_dims}d)",
        embeddings=embeddings,
        umap_dims=None,
        min_cluster_size=min_cluster_size
    )
    results.append(result)

    # 2. 各種 UMAP 維度
    for dims in umap_dimensions:
        result = run_experiment(
            name=f"UMAP → {dims}d",
            embeddings=embeddings,
            umap_dims=dims,
            min_cluster_size=min_cluster_size
        )
        results.append(result)

    return results


def print_summary(results: list[ExperimentResult]):
    """印出實驗摘要"""
    print("\n" + "="*80)
    print("EXPERIMENT SUMMARY")
    print("="*80)

    # 準備表格數據
    headers = [
        "Experiment", "Dims", "Clusters", "Noise%",
        "DBCV", "Silhouette", "Score", "Time(s)"
    ]

    rows = []
    for r in results:
        rows.append([
            r.name,
            r.dimensions,
            r.n_clusters,
            f"{r.noise_ratio:.1%}",
            f"{r.dbcv:.4f}",
            f"{r.silhouette:.4f}",
            f"{r.composite_score:.4f}",
            f"{r.total_time:.2f}"
        ])

    print(tabulate(rows, headers=headers, tablefmt="grid"))

    # 找出最佳結果
    best = max(results, key=lambda r: r.composite_score)
    print(f"\n🏆 Best: {best.name} (Score: {best.composite_score:.4f})")

    # 比較原始 vs 最佳 UMAP
    original = results[0]
    if best != original:
        score_diff = best.composite_score - original.composite_score
        time_diff = original.total_time - best.total_time
        print(f"\n📊 Comparison (Original vs Best UMAP):")
        print(f"   Score improvement: {score_diff:+.4f} ({score_diff/original.composite_score*100:+.1f}%)")
        print(f"   Time saved: {time_diff:.2f}s ({time_diff/original.total_time*100:.1f}%)")
        print(f"   DBCV: {original.dbcv:.4f} → {best.dbcv:.4f}")
        print(f"   Silhouette: {original.silhouette:.4f} → {best.silhouette:.4f}")
        print(f"   Noise: {original.noise_ratio:.1%} → {best.noise_ratio:.1%}")


def run_min_cluster_size_experiment(
    embeddings: np.ndarray,
    umap_dims: int = 50,
    sizes: list[int] = None
) -> list[ExperimentResult]:
    """測試不同 min_cluster_size 的影響"""
    if sizes is None:
        sizes = [3, 5, 7, 10, 15, 20]

    print("\n" + "="*80)
    print(f"MIN_CLUSTER_SIZE EXPERIMENT (UMAP → {umap_dims}d)")
    print("="*80)

    # 先做一次 UMAP
    original_dims = embeddings.shape[1]
    n_neighbors = min(15, len(embeddings) - 1)

    print(f"Running UMAP: {original_dims} → {umap_dims} dimensions...")
    umap_model = UMAP(
        n_neighbors=n_neighbors,
        n_components=umap_dims,
        min_dist=0.0,
        metric='cosine',
        random_state=42
    )
    reduced = umap_model.fit_transform(embeddings)

    results = []
    for size in sizes:
        print(f"\n--- min_cluster_size = {size} ---")

        start = time.time()
        labels, model = run_hdbscan(reduced, size)
        time_hdbscan = time.time() - start

        dbcv, silhouette, noise_ratio, n_clusters = calculate_metrics(reduced, labels, model)

        result = ExperimentResult(
            name=f"min_size={size}",
            dimensions=umap_dims,
            n_clusters=n_clusters,
            noise_ratio=noise_ratio,
            dbcv=dbcv,
            silhouette=silhouette,
            time_umap=0,
            time_hdbscan=time_hdbscan
        )
        results.append(result)

        print(f"  Clusters: {n_clusters}, Noise: {noise_ratio:.1%}, Score: {result.composite_score:.4f}")

    return results


def main():
    parser = argparse.ArgumentParser(description='UMAP Dimensionality Reduction Experiment')
    parser.add_argument('--db-url', type=str, help='PostgreSQL connection URL')
    parser.add_argument('--file', type=str, help='JSON file with embeddings')
    parser.add_argument('--sample-size', type=int, default=1000, help='Number of samples to use')
    parser.add_argument('--min-cluster-size', type=int, default=5, help='HDBSCAN min_cluster_size')
    parser.add_argument('--umap-dims', type=str, default='10,20,30,50,100',
                       help='UMAP target dimensions (comma-separated)')
    parser.add_argument('--test-sizes', action='store_true',
                       help='Also test different min_cluster_size values')

    args = parser.parse_args()

    # 載入數據
    if args.db_url:
        embeddings, contents = load_embeddings_from_db(args.db_url, args.sample_size)
    elif args.file:
        embeddings, contents = load_embeddings_from_file(args.file)
    else:
        # 使用隨機數據做 demo
        print("No data source specified, using random embeddings for demo...")
        np.random.seed(42)
        embeddings = np.random.randn(500, 128).astype(np.float32)
        contents = [f"Sample text {i}" for i in range(500)]

    # 解析 UMAP 維度
    umap_dims = [int(d) for d in args.umap_dims.split(',')]

    # 執行實驗
    results = run_all_experiments(
        embeddings,
        min_cluster_size=args.min_cluster_size,
        umap_dimensions=umap_dims
    )

    # 印出摘要
    print_summary(results)

    # 可選：測試不同 min_cluster_size
    if args.test_sizes:
        size_results = run_min_cluster_size_experiment(embeddings, umap_dims=50)
        print("\n" + "="*80)
        print("MIN_CLUSTER_SIZE SUMMARY")
        print("="*80)

        headers = ["min_size", "Clusters", "Noise%", "DBCV", "Silhouette", "Score"]
        rows = [[r.name, r.n_clusters, f"{r.noise_ratio:.1%}",
                 f"{r.dbcv:.4f}", f"{r.silhouette:.4f}", f"{r.composite_score:.4f}"]
                for r in size_results]
        print(tabulate(rows, headers=headers, tablefmt="grid"))

        best_size = max(size_results, key=lambda r: r.composite_score)
        print(f"\n🏆 Best min_cluster_size: {best_size.name} (Score: {best_size.composite_score:.4f})")

    # 輸出建議
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("="*80)

    best = max(results, key=lambda r: r.composite_score)
    original = results[0]

    if best.dimensions < original.dimensions:
        print(f"✅ UMAP 降維到 {best.dimensions} 維是有益的")
        print(f"   - 聚類品質提升 {(best.composite_score - original.composite_score)*100:.1f}%")
        print(f"   - 計算時間減少 {(original.total_time - best.total_time)/original.total_time*100:.1f}%")
    else:
        print("❌ UMAP 降維在此數據集上沒有明顯優勢")
        print("   建議保持原始維度進行聚類")


if __name__ == '__main__':
    main()
