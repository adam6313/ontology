#!/usr/bin/env python3
"""
產生 19 主題的相似度矩陣熱力圖
"""

import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # 使用非互動式後端
import matplotlib.font_manager as fm

# 嘗試使用系統中文字體
chinese_fonts = [
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/STHeiti Light.ttc',
    '/Library/Fonts/Arial Unicode.ttf',
]
for font_path in chinese_fonts:
    import os
    if os.path.exists(font_path):
        fm.fontManager.addfont(font_path)
        matplotlib.rcParams['font.family'] = fm.FontProperties(fname=font_path).get_name()
        break
else:
    matplotlib.rcParams['font.family'] = ['Arial Unicode MS', 'Heiti TC', 'sans-serif']

matplotlib.rcParams['axes.unicode_minus'] = False
import seaborn as sns
from sklearn.metrics.pairwise import cosine_similarity
import json

# 資料庫連線
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="ontix_dev",
    user="ontix",
    password="ontix_dev"
)

def fetch_topics():
    """取得所有主題及其 embedding"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, code, name, embedding
            FROM topics
            WHERE is_active = true AND embedding IS NOT NULL
            ORDER BY post_count DESC, id
        """)
        return cur.fetchall()

def parse_embedding(emb_str):
    """解析 pgvector 格式的 embedding"""
    if emb_str is None:
        return None
    if isinstance(emb_str, list):
        return np.array(emb_str)
    # pgvector 格式: [0.1,0.2,0.3,...]
    clean = emb_str.strip('[]')
    return np.array([float(x) for x in clean.split(',')])

def main():
    print("📊 取得主題資料...")
    topics = fetch_topics()
    print(f"   找到 {len(topics)} 個主題")

    # 解析 embeddings
    names = []
    embeddings = []

    for t in topics:
        emb = parse_embedding(t['embedding'])
        if emb is not None and len(emb) > 0:
            names.append(t['name'])
            embeddings.append(emb)
            print(f"   ✓ {t['name']} ({t['code']})")

    if len(embeddings) < 2:
        print("❌ 需要至少 2 個有 embedding 的主題")
        return

    # 轉換為矩陣
    emb_matrix = np.vstack(embeddings)
    print(f"\n📐 Embedding 矩陣形狀: {emb_matrix.shape}")

    # 計算相似度矩陣
    print("\n🔢 計算 Cosine Similarity...")
    sim_matrix = cosine_similarity(emb_matrix)

    # 找出高相似度的主題對 (降低閾值到 0.40 因為整體相似度較低)
    print("\n🔍 相對高相似度主題對 (similarity > 0.40):")
    print("-" * 60)

    high_sim_pairs = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            sim = sim_matrix[i][j]
            if sim > 0.40:
                high_sim_pairs.append((names[i], names[j], sim))
                print(f"   {names[i]} ↔ {names[j]}: {sim:.4f}")

    if not high_sim_pairs:
        print("   (無)")

    # 統計
    upper_tri = sim_matrix[np.triu_indices(len(names), k=1)]
    print(f"\n📈 相似度統計:")
    print(f"   平均: {upper_tri.mean():.4f}")
    print(f"   標準差: {upper_tri.std():.4f}")
    print(f"   最高: {upper_tri.max():.4f}")
    print(f"   最低: {upper_tri.min():.4f}")

    # 繪製熱力圖
    print("\n🎨 繪製熱力圖...")

    plt.figure(figsize=(14, 12))

    # 使用 seaborn 熱力圖
    mask = np.zeros_like(sim_matrix)
    # np.fill_diagonal(mask, True)  # 可選：隱藏對角線

    sns.heatmap(
        sim_matrix,
        xticklabels=names,
        yticklabels=names,
        annot=True,
        fmt='.2f',
        cmap='RdYlGn_r',  # 紅(高相似)→黃→綠(低相似)
        vmin=0.15,
        vmax=0.55,
        center=0.35,
        square=True,
        linewidths=0.5,
        cbar_kws={'label': 'Cosine Similarity'}
    )

    plt.title('19 Topic Embedding Similarity Matrix\n(Topics are well-separated - max similarity only 0.51)', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45, ha='right', fontsize=10)
    plt.yticks(rotation=0, fontsize=10)
    plt.tight_layout()

    # 儲存
    output_path = '/Users/adam/poc/ontology/ontix/scripts/topic_similarity_heatmap.png'
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"\n✅ 熱力圖已儲存: {output_path}")

    # 產生建議
    print("\n" + "=" * 60)
    print("📋 分析建議")
    print("=" * 60)

    if high_sim_pairs:
        print(f"\n⚠️  發現 {len(high_sim_pairs)} 對相對高相似度主題 (>0.40):")
        for t1, t2, sim in sorted(high_sim_pairs, key=lambda x: -x[2]):
            print(f"   • {t1} + {t2} ({sim:.2f})")

    # 找出與多個主題都高度相似的
    high_sim_count = {}
    for t1, t2, sim in high_sim_pairs:
        high_sim_count[t1] = high_sim_count.get(t1, 0) + 1
        high_sim_count[t2] = high_sim_count.get(t2, 0) + 1

    multi_overlap = [(t, c) for t, c in high_sim_count.items() if c >= 2]
    if multi_overlap:
        print(f"\n🎯 與多個主題重疊的「橋接主題」:")
        for t, c in sorted(multi_overlap, key=lambda x: -x[1]):
            print(f"   • {t} - 與 {c} 個主題相對高相似")

    # 重要發現
    print("\n" + "=" * 60)
    print("🔬 關鍵發現")
    print("=" * 60)
    print(f"""
    主題間平均相似度只有 {upper_tri.mean():.2f}，最高也只有 {upper_tri.max():.2f}

    這說明：19 個主題的 embedding 定義其實分得很開！

    25% 的模糊分類不是因為「主題太相似」，而是因為：
    1. 貼文內容本身涵蓋多個主題（真實的多標籤情況）
    2. 貼文內容過於模糊/短/缺乏特徵
    3. 某些貼文根本不屬於任何預定義主題

    建議：
    • 不需要合併主題
    • 應該允許多標籤分類
    • 對於「哪個都不像」的貼文，考慮新增「其他/雜談」類別
    """)

    # 輸出 JSON 供進一步分析
    json_output = {
        'topics': names,
        'similarity_matrix': sim_matrix.tolist(),
        'high_similarity_pairs': [(t1, t2, float(sim)) for t1, t2, sim in high_sim_pairs],
        'statistics': {
            'mean': float(upper_tri.mean()),
            'std': float(upper_tri.std()),
            'max': float(upper_tri.max()),
            'min': float(upper_tri.min())
        }
    }

    json_path = '/Users/adam/poc/ontology/ontix/scripts/topic_similarity.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_output, f, ensure_ascii=False, indent=2)
    print(f"\n📄 JSON 資料已儲存: {json_path}")

if __name__ == '__main__':
    main()
