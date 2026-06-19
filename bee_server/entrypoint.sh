#!/bin/sh
set -e

echo "🐝 小蜜蜂招工平台启动中..."
echo "等待数据库就绪..."

# 等待 DATABASE_URL 环境变量可用
attempt=0
max_attempts=30
until npx prisma db push --skip-generate 2>/dev/null || [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt+1))
  echo "等待数据库... ($attempt/$max_attempts)"
  sleep 2
done

echo "🚀 启动服务..."
node dist/main.js
