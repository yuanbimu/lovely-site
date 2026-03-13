@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================
echo Cloudflare API Token 配置向导
echo ===================================
echo.

REM 检查是否提供了 Token
if "%1"=="" (
    echo [错误] 请提供 API Token
    echo.
    echo 用法：scripts\configure-cloudflare.bat 你的 Token
    echo.
    echo 获取 Token 步骤:
    echo 1. 访问 https://dash.cloudflare.com/profile/api-tokens
    echo 2. 创建新 Token - 选择 "Edit Cloudflare Workers" 模板
    echo 3. 复制生成的 Token
    echo.
    pause
    exit /b 1
)

echo [1/6] 设置 API Token 环境变量...
setx CLOUDFLARE_API_TOKEN %1
if %errorlevel% neq 0 (
    echo [错误] 设置环境变量失败
    pause
    exit /b 1
)
echo ✓ Token 已保存

echo.
echo ⚠️  重要提示:
echo 环境变量需要重启终端才能生效
echo.
echo 请关闭所有终端窗口，然后重新打开
echo 再次运行：npm run setup:windows
echo.
pause

echo.
echo [2/6] 尝试验证登录...
REM 注意：当前终端可能还无法读取新环境变量
REM 需要用户重启终端后再次运行

echo.
echo ===================================
echo ✓ 配置已保存！
echo ===================================
echo.
echo 下一步:
echo 1. 关闭所有终端窗口
echo 2. 重新打开终端
echo 3. 运行：wrangler whoami
echo 4. 如果显示账号信息，继续运行：npm run setup:windows
echo.
echo 详细文档：docs/RENEW_API_TOKEN.md
echo ===================================
pause
