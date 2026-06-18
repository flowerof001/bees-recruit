#!/bin/sh
set -e

echo "🐝 小蜜蜂招工平台启动中..."

# 生成 Prisma Client
echo "📦 生成 Prisma Client..."
npx prisma generate

# 推送数据库 schema（不覆盖已有数据）
echo "🗄️  同步数据库 Schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "🚀 启动服务..."
exec node dist/main.js
