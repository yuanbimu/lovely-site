@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================
echo Cloudflare 完整配置向导
echo ===================================
echo.

REM 检查是否提供了 Token
if "%1"=="" (
    echo [错误] 请提供 API Token
    echo.
    echo 创建正确权限的 Token 步骤:
    echo 1. 访问 https://dash.cloudflare.com/profile/api-tokens
    echo 2. 点击 "Create Token"
    echo 3. 选择 "Edit Cloudflare Workers" 模板
    echo 4. 确保权限包含:
    echo    - Account - Account Settings - Edit
    echo    - Account - Cloudflare Pages - Edit  
    echo    - Account - D1 - Edit
    echo    - Workers Scripts - Edit
    echo 5. 复制生成的 Token
    echo.
    echo 用法：scripts\full-setup.bat 你的 Token
    echo.
    pause
    exit /b 1
)

set TOKEN=%1
set CLOUDFLARE_API_TOKEN=%TOKEN%

echo [1/7] 验证登录状态...
wrangler whoami > auth_check.txt 2>&1
findstr "logged in" auth_check.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 登录失败，请检查 Token
    type auth_check.txt
    del auth_check.txt
    pause
    exit /b 1
)
echo ✓ 登录成功
type auth_check.txt | findstr "Account"
del auth_check.txt

echo.
echo [2/7] 创建 D1 数据库...
wrangler d1 create lovely-site-db --location=enam > db_create.txt 2>&1
findstr "uuid" db_create.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 数据库创建成功
    for /f "tokens=2 delims=: " %%i in ('findstr "uuid" db_create.txt') do set DB_UUID=%%i
    echo UUID: !DB_UUID!
    echo.
    echo 正在自动更新 wrangler.toml...
    
    REM 更新 wrangler.toml
    (for /f "delims=" %%a in (wrangler.toml) do (
        set "line=%%a"
        setlocal enabledelayedexpansion
        set "line=!line:database_id = "YOUR_DATABASE_ID"=database_id = "!DB_UUID"!"
        echo(!line!
        endlocal
    )) > wrangler.toml.tmp
    move /y wrangler.toml.tmp wrangler.toml >nul
    echo ✓ wrangler.toml 已更新
) else (
    echo [警告] 自动创建数据库失败
    type db_create.txt
    echo.
    echo 请手动创建:
    echo wrangler d1 create lovely-site-db --location=enam
    echo 然后更新 wrangler.toml
    del db_create.txt
    pause
)

echo.
echo [3/7] 初始化数据库...
wrangler d1 execute lovely-site-db --local --file=scripts\init-db.sql > init.txt 2>&1
if %errorlevel% equ 0 (
    echo ✓ 数据库初始化成功
) else (
    echo [警告] 初始化失败
    type init.txt
    del init.txt
    pause
    exit /b 1
)
del init.txt

echo.
echo [4/7] 验证数据库...
wrangler d1 list

echo.
echo [5/7] 检查表结构...
wrangler d1 execute lovely-site-db --local --command="SELECT name FROM sqlite_master WHERE type='table';" 2>&1

echo.
echo [6/7] 检查初始数据...
wrangler d1 execute lovely-site-db --local --command="SELECT COUNT(*) as count FROM timeline_events;" 2>&1

echo.
echo [7/7] 启动开发服务器...
echo 是否立即启动？
set /p START="输入 Y 启动 (Y/N): "
if /i "%START%"=="Y" (
    npm run dev:cf
) else (
    echo.
    echo 稍后运行：npm run dev:cf
)

echo.
echo ===================================
echo ✅ 配置完成！
echo ===================================
pause
