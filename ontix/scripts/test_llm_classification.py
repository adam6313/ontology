#!/usr/bin/env python3
"""
測試 LLM 分類 vs Embedding 分類
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json
from openai import OpenAI

# 資料庫連線
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="ontix_dev",
    user="ontix",
    password="ontix_dev"
)

# OpenAI client
import yaml
with open('/Users/adam/poc/ontology/ontix/config/dev.yaml') as f:
    config = yaml.safe_load(f)
client = OpenAI(api_key=config['openai_api_key'])

TOPICS = [
    "美妝時尚", "美食", "旅遊", "日常話題", "生活風格",
    "藝術和娛樂", "科技", "健康", "運動", "寵物",
    "交通工具", "家庭和關係", "宗教命理", "成人", "遊戲",
    "商業和經濟", "法律政治社會", "教育工作學習", "氣候環境"
]

def get_ambiguous_posts(limit=10):
    """取得模糊分類的貼文"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                p.post_id,
                p.content,
                t1.name as top1_topic,
                s1.similarity as top1_sim,
                t2.name as top2_topic,
                s2.similarity as top2_sim,
                (s1.similarity - s2.similarity) as gap
            FROM posts p
            JOIN post_topic_scores s1 ON p.post_id::text = s1.post_id::text AND s1.rank = 1
            JOIN post_topic_scores s2 ON p.post_id::text = s2.post_id::text AND s2.rank = 2
            JOIN topics t1 ON s1.topic_id = t1.id
            JOIN topics t2 ON s2.topic_id = t2.id
            WHERE (s1.similarity - s2.similarity) < 0.02
            ORDER BY gap ASC
            LIMIT %s
        """, (limit,))
        return cur.fetchall()

def classify_with_llm(content: str) -> dict:
    """使用 LLM 分類"""
    prompt = f"""你是社群貼文分類專家。請分析以下貼文並分類。

可用的主題類別：
{json.dumps(TOPICS, ensure_ascii=False)}

貼文內容：
{content[:500]}

請回傳 JSON 格式：
{{
    "primary_topic": "主要主題",
    "secondary_topic": "次要主題（如果有的話，沒有就填 null）",
    "confidence": "high/medium/low",
    "reason": "簡短說明分類理由"
}}

只回傳 JSON，不要其他文字。"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)

def main():
    print("📊 取得模糊分類貼文...")
    posts = get_ambiguous_posts(10)
    print(f"   找到 {len(posts)} 篇模糊貼文\n")

    if not posts:
        print("❌ 沒有找到模糊分類的貼文")
        return

    print("=" * 80)
    print("🔬 Embedding vs LLM 分類比較")
    print("=" * 80)

    results = []
    for i, post in enumerate(posts, 1):
        print(f"\n--- 貼文 {i} (gap: {post['gap']:.4f}) ---")
        print(f"內容: {post['content'][:100]}...")
        print(f"\n📊 Embedding 分類:")
        print(f"   Top1: {post['top1_topic']} ({post['top1_sim']:.3f})")
        print(f"   Top2: {post['top2_topic']} ({post['top2_sim']:.3f})")

        print(f"\n🤖 LLM 分類:")
        try:
            llm_result = classify_with_llm(post['content'])
            print(f"   主題: {llm_result['primary_topic']}")
            if llm_result.get('secondary_topic'):
                print(f"   次要: {llm_result['secondary_topic']}")
            print(f"   信心: {llm_result['confidence']}")
            print(f"   理由: {llm_result['reason']}")

            results.append({
                'post_id': post['post_id'],
                'embedding_top1': post['top1_topic'],
                'embedding_top2': post['top2_topic'],
                'llm_primary': llm_result['primary_topic'],
                'llm_secondary': llm_result.get('secondary_topic'),
                'llm_confidence': llm_result['confidence'],
                'match': llm_result['primary_topic'] == post['top1_topic'] or
                         llm_result['primary_topic'] == post['top2_topic']
            })
        except Exception as e:
            print(f"   ❌ 錯誤: {e}")

    # 統計
    print("\n" + "=" * 80)
    print("📈 統計結果")
    print("=" * 80)

    if results:
        match_count = sum(1 for r in results if r['match'])
        print(f"\nLLM 結果與 Embedding Top1/Top2 一致: {match_count}/{len(results)} ({match_count/len(results)*100:.0f}%)")

        high_conf = sum(1 for r in results if r['llm_confidence'] == 'high')
        med_conf = sum(1 for r in results if r['llm_confidence'] == 'medium')
        low_conf = sum(1 for r in results if r['llm_confidence'] == 'low')
        print(f"LLM 信心度分佈: high={high_conf}, medium={med_conf}, low={low_conf}")

        multi_label = sum(1 for r in results if r['llm_secondary'])
        print(f"LLM 認為是多標籤: {multi_label}/{len(results)} ({multi_label/len(results)*100:.0f}%)")

if __name__ == '__main__':
    main()
