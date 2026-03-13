@echo off
chcp 65001 >nul
:: D1 + R2 啟用腳本 (Windows Batch)
:: 自動檢查並創建所需的 Cloudflare 資源

echo ==========================================
echo 🚀 D1 + R2 啟用工具
echo ==========================================
echo.

cd /d "%~dp0\.."

:: 檢查 API Token
echo 🔑 檢查 Cloudflare API Token...

if "%CLOUDFLARE_API_TOKEN%"=="" (
    :: 嘗試從 .env 文件讀取
    if exist .env (
        for /f "tokens=2 delims==" %%a in ('findstr /B "CLOUDFLARE_API_TOKEN=" .env') do (
            set "CLOUDFLARE_API_TOKEN=%%a"
        )
    )
)

if "%CLOUDFLARE_API_TOKEN%"=="" (
    echo ❌ 未設置 CLOUDFLARE_API_TOKEN
    echo.
    echo 請先創建 API Token：
    echo 1. 訪問 https://dash.cloudflare.com/profile/api-tokens
    echo 2. 點擊 'Create Token'
    echo 3. 使用 'Custom token' 模板
    echo 4. 權限設置：
    echo    - Zone:Read
    echo    - Account:Read
    echo    - D1:Edit
    echo    - R2:Edit
    echo    - Cloudflare Pages:Edit
    echo 5. 複製 Token 並運行：
    echo    set CLOUDFLARE_API_TOKEN=你的_token
    pause
    exit /b 1
)

echo ✅ API Token 已設置
echo.

:: 檢查 D1 數據庫
echo 🗄️  檢查 D1 數據庫...
npx wrangler d1 list | findstr "lovely-site-db" >nul
if %errorlevel%==0 (
    echo ✅ 數據庫 'lovely-site-db' 已存在
) else (
    echo ⚠️  數據庫不存在，正在創建...
    npx wrangler d1 create lovely-site-db
    echo.
    echo ⚠️  請從上方輸出中複製 database_id
    echo     然後更新 wrangler.toml 中的 YOUR_DATABASE_ID
)
echo.

:: 檢查 R2 存儲桶
echo 🪣 檢查 R2 存儲桶...
npx wrangler r2 bucket list | findstr "lovely-site-images" >nul
if %errorlevel%==0 (
    echo ✅ 存儲桶 'lovely-site-images' 已存在
) else (
    echo ⚠️  存儲桶不存在，正在創建...
    npx wrangler r2 bucket create lovely-site-images
    echo ✅ 存儲桶創建成功！
)
echo.

:: 檢查 wrangler.toml
echo 📝 檢查 wrangler.toml...
findstr "YOUR_DATABASE_ID" wrangler.toml >nul
if %errorlevel%==0 (
    echo ⚠️  wrangler.toml 中還有佔位符 YOUR_DATABASE_ID
    echo     請手動更新為真實的 database_id
) else (
    echo ✅ wrangler.toml 配置正確
)
echo.

:: 總結
echo ==========================================
echo 🎉 D1 + R2 啟用檢查完成！
echo ==========================================
echo.
echo 下一步：
echo 1. 創建數據表：
echo    npx wrangler d1 execute lovely-site-db --file=d1-schema.sql
echo.
echo 2. 上傳動態數據：
echo    cd ..\tools\upload-dynamics
echo    python upload-to-d1-r2.py
echo.
echo 3. 測試 API：
echo    npm run dev:cf
echo    訪問 http://localhost:8788/api/dynamics
echo.
pause
