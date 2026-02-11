FROM python:3.11

WORKDIR /app

# 安裝系統依賴 (HDBSCAN, UMAP, BERTopic 需要)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 升級 pip
RUN pip install --upgrade pip

# 先安裝編譯較慢的套件
RUN pip install --no-cache-dir numpy==1.26.4 scipy==1.12.0 Cython

# 安裝 HDBSCAN 和 UMAP（使用較新版本避免編譯問題）
RUN pip install --no-cache-dir hdbscan umap-learn==0.5.5

# 複製 requirements 並安裝其餘套件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製程式碼
COPY . .

# 暴露 HTTP port
EXPOSE 50052

# 啟動服務
CMD ["python", "server.py"]
