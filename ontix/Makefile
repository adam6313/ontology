.PHONY: all build up down logs ps proto clean test

# 預設目標
all: proto up

# ============================================
# Docker 操作
# ============================================

# 啟動所有服務
up:
	docker compose up -d
	@echo ""
	@echo "Ontix services started!"
	@echo "  Redis:    localhost:6379"
	@echo "  Qdrant:   localhost:6333 (REST), localhost:6334 (gRPC)"
	@echo "  Postgres: localhost:5432"
	@echo "  ML:       localhost:50052 (HDBSCAN Clustering)"
	@echo ""
	@echo "Embedding: Gemini API (text-embedding-004)"
	@echo "Tagging:   OpenAI API (gpt-4o-mini)"

# 啟動並顯示 logs
up-logs:
	docker compose up

# 停止所有服務
down:
	docker compose down

# 停止並清除資料
down-clean:
	docker compose down -v

# 查看 logs
logs:
	docker compose logs -f

logs-ml:
	docker compose logs -f ml-service

# 查看服務狀態
ps:
	docker compose ps

# 重建 ML Service
rebuild-ml:
	docker compose build ml-service
	docker compose up -d ml-service

# ============================================
# Proto 生成
# ============================================

# 生成 Python gRPC 代碼
proto-python:
	cd ml_service && python -m grpc_tools.protoc \
		-I../proto \
		--python_out=. \
		--grpc_python_out=. \
		../proto/ml.proto

# 生成 Go gRPC 代碼
proto-go:
	protoc \
		-I proto \
		--go_out=pkg/grpc/mlpb \
		--go-grpc_out=pkg/grpc/mlpb \
		proto/ml.proto

# 生成所有 Proto
proto: proto-python proto-go

# ============================================
# 測試
# ============================================

# 測試 Redis 連線
test-redis:
	@echo "Testing Redis..."
	@docker compose exec redis redis-cli ping

# 測試 Qdrant 連線
test-qdrant:
	@echo "Testing Qdrant..."
	@curl -s http://localhost:6333/collections | head -c 100

# 測試 PostgreSQL 連線
test-postgres:
	@echo "Testing PostgreSQL..."
	@docker compose exec postgres psql -U ontix -d ontix -c "SELECT 1"

# 測試 ML Service
test-ml:
	@echo "Testing ML Service..."
	@cd ml_service && python -c "import grpc; print('gRPC OK')"

# 測試所有連線
test: test-redis test-qdrant test-postgres
	@echo ""
	@echo "All connections OK!"

# ============================================
# 開發
# ============================================

# Go build
build:
	go build -o bin/processor ./cmd/processor
	go build -o bin/clusterer ./cmd/clusterer
	go build -o bin/api ./cmd/api

# Go mod
mod:
	go mod tidy

# 進入 ML Service shell
shell-ml:
	docker compose exec ml-service bash

# 進入 PostgreSQL shell
shell-db:
	docker compose exec postgres psql -U ontix -d ontix

# 進入 Redis shell
shell-redis:
	docker compose exec redis redis-cli

# ============================================
# 清理
# ============================================

# 清除所有資料 (保留 images)
clean:
	docker compose down -v
	@echo "All data cleaned!"

# 清除所有 (包含 images)
clean-all:
	docker compose down -v --rmi all
	rm -rf bin/
	@echo "All cleaned including images!"
