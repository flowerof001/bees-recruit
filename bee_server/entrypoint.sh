#!/bin/sh

echo "🐝 小蜜蜂招工平台启动中..."

if [ -n "$DATABASE_URL" ]; then
  echo "📦 同步数据库..."
  npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "⚠️ DB push 失败，继续启动..."
else
  echo "⚠️ DATABASE_URL 未设置，跳过数据库同步"
fi

echo "🚀 启动服务..."
exec node dist/main.js
