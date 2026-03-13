@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================
echo Cloudflare + D1 数据库一键配置
echo ===================================
echo.

REM 检查是否提供了 Token
if "%1"=="" (
    echo [错误] 请提供 API Token
    echo.
    echo 获取 Token 步骤:
    echo 1. 访问 https://dash.cloudflare.com/profile/api-tokens
    echo 2. 创建新 Token - 选择 "Edit Cloudflare Workers" 模板
    echo 3. 复制生成的 Token
    echo.
    echo 用法：scripts\complete-setup.bat 你的 Token
    echo.
    pause
    exit /b 1
)

set TOKEN=%1

echo [1/8] 设置 API Token 环境变量...
setx CLOUDFLARE_API_TOKEN %TOKEN%
if %errorlevel% neq 0 (
    echo [错误] 设置环境变量失败
    pause
    exit /b 1
)
echo ✓ Token 已保存到环境变量

echo.
echo ⚠️  重要提示:
echo 环境变量需要重启终端才能生效
echo.
echo 请关闭所有终端窗口，然后重新打开
echo 重新运行：scripts\complete-setup.bat %TOKEN%
echo.
pause

REM 重启后的检查点
echo.
echo [2/8] 验证登录状态...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 登录验证失败
    echo 请确认:
    echo 1. 已重启终端
    echo 2. Token 正确无误
    echo.
    echo 继续尝试配置...
) else (
    echo ✓ Cloudflare 登录成功
)

echo.
echo [3/8] 创建 D1 数据库...
wrangler d1 create lovely-site-db --location=enam > db_result.txt 2>&1
findstr "uuid" db_result.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 数据库创建成功
    type db_result.txt | findstr "uuid"
    echo.
    echo 请复制上面的 UUID，然后更新 wrangler.toml
    echo 或者手动运行：wrangler d1 create lovely-site-db --location=enam
    del db_result.txt
    pause
) else (
    type db_result.txt
    echo [警告] 数据库创建可能失败，继续后续步骤...
    del db_result.txt
    pause
)

echo.
echo [4/8] 更新 wrangler.toml...
echo 请手动更新 wrangler.toml 文件
echo 将 database_id 改为你刚才复制的 UUID
echo.
pause

echo.
echo [5/8] 初始化数据库...
wrangler d1 execute lovely-site-db --local --file=scripts\init-db.sql > init_result.txt 2>&1
if %errorlevel% equ 0 (
    echo ✓ 数据库初始化成功
) else (
    type init_result.txt
    echo [警告] 初始化失败
    del init_result.txt
    pause
    exit /b 1
)
del init_result.txt

echo.
echo [6/8] 验证数据库...
wrangler d1 list
echo.

echo.
echo [7/8] 检查初始数据...
wrangler d1 execute lovely-site-db --local --command="SELECT COUNT(*) as count FROM timeline_events;" 2>&1
echo.

echo.
echo [8/8] 启动开发服务器...
echo 配置完成！是否立即启动？
set /p START="输入 Y 启动开发服务器 (Y/N): "
if /i "%START%"=="Y" (
    echo.
    echo 启动中...
    npm run dev:cf
) else (
    echo.
    echo 稍后可以运行：npm run dev:cf
)

echo.
echo ===================================
echo ✅ 配置完成！
echo ===================================
echo.
echo 访问地址:
echo - Timeline: http://localhost:4321/timeline
echo - 管理后台：http://localhost:4321/admin/timeline
echo ===================================
pause
