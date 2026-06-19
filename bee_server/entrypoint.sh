#!/bin/sh
set -e

echo "🐝 小蜜蜂招工平台启动中..."

echo "📦 同步数据库 Schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "🚀 启动服务..."
exec node dist/main.js
