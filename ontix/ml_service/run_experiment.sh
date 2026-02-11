#!/bin/bash
# UMAP Dimensionality Reduction Experiment Runner

set -e

# Load config
CONFIG_FILE="${CONFIG_FILE:-../config/config.yaml}"

# Extract DB URL from config (requires yq)
if command -v yq &> /dev/null && [ -f "$CONFIG_FILE" ]; then
    DB_HOST=$(yq '.postgres.host' "$CONFIG_FILE")
    DB_PORT=$(yq '.postgres.port' "$CONFIG_FILE")
    DB_USER=$(yq '.postgres.user' "$CONFIG_FILE")
    DB_PASS=$(yq '.postgres.password' "$CONFIG_FILE")
    DB_NAME=$(yq '.postgres.database' "$CONFIG_FILE")
    DB_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
else
    # Default local development DB
    DB_URL="${DB_URL:-postgres://ontix:ontix@localhost:5432/ontix}"
fi

echo "==================================="
echo "UMAP Experiment"
echo "==================================="
echo "Database: $DB_URL"
echo ""

# Check if in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: Not in a virtual environment"
    echo "Consider running: python -m venv venv && source venv/bin/activate"
fi

# Install dependencies if needed
pip install -q psycopg2-binary tabulate 2>/dev/null || true

# Run experiment
python experiment_umap.py \
    --db-url "$DB_URL" \
    --sample-size "${SAMPLE_SIZE:-1000}" \
    --min-cluster-size "${MIN_CLUSTER_SIZE:-5}" \
    --umap-dims "${UMAP_DIMS:-10,20,30,50,100}" \
    ${TEST_SIZES:+--test-sizes}

echo ""
echo "Done!"
