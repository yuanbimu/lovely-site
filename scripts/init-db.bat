@echo off
REM =====================================================
REM D1 数据库初始化脚本 (Windows)
REM =====================================================
REM 使用方法:
REM   npm run init:db         REM 本地开发环境
REM   npm run init:db:prod    REM 生产环境

IF "%1"=="--prod" (
  echo "Z[ 初始化生产环境数据库..."
  wrangler d1 execute lovely-site-db --file=scripts/init-db.sql
) ELSE (
  echo "Z[ 初始化本地开发数据库..."
  wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
)

echo "Z[ 数据库初始化完成!"
echo ""
echo "Z[ 提示:"
echo "  - 本地开发请访问：http://localhost:4321/timeline"
echo "  - 管理后台请访问：http://localhost:4321/admin/timeline"
echo "  - Token 已配置在 .dev.vars 文件中"
