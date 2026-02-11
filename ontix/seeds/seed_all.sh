#!/usr/bin/env bash
# ============================================================
# ONTIX DEMO SEED DATA - Run all seed files in order
# Usage: bash seeds/seed_all.sh
# Requires: DATABASE_URL environment variable
# ============================================================

set -euo pipefail

DB="${DATABASE_URL:?Please set DATABASE_URL}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🌱 Seeding Ontix demo data (12-week dataset)..."

echo "  [1/8] Entities + aliases..."
psql "$DB" -f "$DIR/demo_data.sql"

echo "  [2/8] Posts (~500)..."
psql "$DB" -f "$DIR/02_posts.sql"

echo "  [3/8] Post-entity mentions (~900)..."
psql "$DB" -f "$DIR/03_mentions.sql"

echo "  [4/8] Entity aspects (~450)..."
psql "$DB" -f "$DIR/04_aspects.sql"

echo "  [5/8] Weekly observations (12 weeks × 49 entities)..."
psql "$DB" -f "$DIR/05_observations.sql"

echo "  [6/8] Object relations + links..."
psql "$DB" -f "$DIR/06_relations.sql"

echo "  [7/8] Derived facts (~30 across 3 periods)..."
psql "$DB" -f "$DIR/07_facts.sql"

echo "  [8/8] Refreshing materialized views..."
psql "$DB" -f "$DIR/08_refresh.sql"

echo ""
echo "✅ Demo seed complete!"
echo "   49 entities · ~500 posts · ~900 mentions · ~450 aspects"
echo "   588 observations (12 weeks) · 78 relations · ~30 facts"
echo ""
echo "🎯 Key demo stories (visible in 12-week trend charts):"
echo "   • B5修復霜過敏危機 → product_drags_brand (W10-W12 sentiment crash)"
echo "   • CeraVe聲量暴增 → competitor_surge (W9-W12 gradual explosion)"
echo "   • 油痘肌護膚話題 +250% → topic_surge (W10-W12)"
echo "   • Carol凱若聲譽下降 → founder_reputation_risk (gradual W9-W12)"
echo "   • innisfree沉默 → silence_alert (zero mentions W9-W12)"
echo "   • 理膚寶水/控油情感翻轉 → aspect_sentiment_flip (W10-W12)"
echo "   • 韓系穿搭持續成長 → topic_surge (steady W1-W12)"
echo "   • 健身穿搭沉寂 → topic_decay (W9-W12 zero)"
echo "   • 3 narrative insights (理膚寶水 + 油痘肌護膚 + 鬍子茶)"
