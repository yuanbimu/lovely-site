#!/bin/bash
# =====================================================
# D1 数据库初始化脚本
# =====================================================
# 使用方法:
#   npm run init:db         # 本地开发环境
#   npm run init:db:prod    # 生产环境

if [ "$1" == "--prod" ]; then
  echo "🚀 初始化生产环境数据库..."
  wrangler d1 execute lovely-site-db --file=scripts/init-db.sql
else
  echo "🛠️ 初始化本地开发数据库..."
  wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
fi

echo "✅ 数据库初始化完成!"
echo ""
echo "💡 提示:"
echo "  - 本地开发请访问：http://localhost:4321/timeline"
echo "  - 管理后台请访问：http://localhost:4321/admin/timeline"
echo "  - Token 已配置在 .dev.vars 文件中"
