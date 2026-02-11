#!/bin/bash

# 生成 Python gRPC 代碼
echo "Generating Python gRPC code..."
python -m grpc_tools.protoc \
    -I../proto \
    --python_out=../ml_service \
    --grpc_python_out=../ml_service \
    ../proto/ml.proto

# 生成 Go gRPC 代碼
echo "Generating Go gRPC code..."
protoc \
    -I../proto \
    --go_out=../proto \
    --go-grpc_out=../proto \
    ../proto/ml.proto

echo "Done!"
