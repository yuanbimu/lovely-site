@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================
echo Wrangler D1 数据库配置向导
echo ===================================
echo.

REM 检查是否已登录
echo [1/5] 检查 Cloudflare 登录状态...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo *** 需要登录 Cloudflare ***
    echo.
    echo 即将打开浏览器，请完成登录授权
    echo.
    pause
    wrangler login
    if %errorlevel% neq 0 (
        echo [错误] 登录失败
        pause
        exit /b 1
    )
) else (
    echo ✓ 已登录 Cloudflare
)

echo.
echo [2/5] 检查现有数据库...
wrangler d1 list > temp_db_list.txt 2>&1
findstr "lovely-site-db" temp_db_list.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 数据库已存在
    del temp_db_list.txt
) else (
    echo 创建新数据库...
    del temp_db_list.txt
    wrangler d1 create lovely-site-db --location=enam
    if %errorlevel% neq 0 (
        echo [错误] 创建数据库失败
        pause
        exit /b 1
    )
)

echo.
echo [3/5] 获取数据库信息...
wrangler d1 list
echo.
echo 请复制上面显示的数据库 UUID
echo 然后更新 wrangler.toml 文件中的 database_id
echo.
pause

echo.
echo [4/5] 初始化数据库表结构...
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
if %errorlevel% neq 0 (
    echo [警告] 本地数据库初始化失败，可能是还未安装 SQLite
    echo 跳过此步骤，稍后手动执行
) else (
    echo ✓ 数据库表创建成功
)

echo.
echo [5/5] 验证配置...
echo.
echo 数据库列表:
wrangler d1 list

echo.
echo ===================================
echo ✓ 配置完成！
echo ===================================
echo.
echo 下一步:
echo 1. 更新 wrangler.toml 中的 database_id
echo 2. 运行：npm run dev:cf
echo.
echo 详细文档：docs/WRANGLER_SETUP.md
echo ===================================
pause
