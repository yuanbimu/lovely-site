# D1 + R2 啟用腳本 (PowerShell)
# 自動檢查並創建所需的 Cloudflare 資源

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 D1 + R2 啟用工具" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 wrangler
if (!(Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 錯誤：需要安裝 Node.js 和 npx" -ForegroundColor Red
    exit 1
}

# 檢查 API Token
Write-Host "🔑 檢查 Cloudflare API Token..." -ForegroundColor Blue
$apiToken = $env:CLOUDFLARE_API_TOKEN

if ([string]::IsNullOrEmpty($apiToken) -or $apiToken -eq "your_api_token_here") {
    # 嘗試從 .env 文件讀取
    if (Test-Path .env) {
        $envContent = Get-Content .env -Raw
        if ($envContent -match 'CLOUDFLARE_API_TOKEN=(.+)') {
            $apiToken = $matches[1].Trim()
            $env:CLOUDFLARE_API_TOKEN = $apiToken
        }
    }
}

if ([string]::IsNullOrEmpty($apiToken) -or $apiToken -eq "your_api_token_here") {
    Write-Host "❌ 未設置 CLOUDFLARE_API_TOKEN" -ForegroundColor Red
    Write-Host ""
    Write-Host "請先創建 API Token："
    Write-Host "1. 訪問 https://dash.cloudflare.com/profile/api-tokens"
    Write-Host "2. 點擊 'Create Token'"
    Write-Host "3. 使用 'Custom token' 模板"
    Write-Host "4. 權限設置："
    Write-Host "   - Zone:Read (如果需要管理域名)"
    Write-Host "   - Account:Read"
    Write-Host "   - D1:Edit"
    Write-Host "   - R2:Edit"
    Write-Host "   - Cloudflare Pages:Edit"
    Write-Host "5. 複製 Token 並設置環境變量："
    Write-Host "   $env:CLOUDFLARE_API_TOKEN='your_token_here'"
    Write-Host ""
    Write-Host "或者更新 .env 文件中的 CLOUDFLARE_API_TOKEN"
    exit 1
}

Write-Host "✅ API Token 已設置" -ForegroundColor Green
Write-Host ""

# 切換到 lovely-site 目錄
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# 檢查現有 D1 數據庫
Write-Host "🗄️  檢查 D1 數據庫..." -ForegroundColor Blue
$DB_LIST = npx wrangler d1 list 2>&1

if ($DB_LIST -match "lovely-site-db") {
    Write-Host "✅ 數據庫 'lovely-site-db' 已存在" -ForegroundColor Green
    # 提取 database_id
    if ($DB_LIST -match "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})") {
        $DB_ID = $matches[1]
        Write-Host "   Database ID: $DB_ID" -ForegroundColor Blue
    }
} else {
    Write-Host "⚠️  數據庫 'lovely-site-db' 不存在，正在創建..." -ForegroundColor Yellow
    $CREATE_OUTPUT = npx wrangler d1 create lovely-site-db 2>&1
    Write-Host $CREATE_OUTPUT
    
    # 提取 database_id
    if ($CREATE_OUTPUT -match "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})") {
        $DB_ID = $matches[1]
        Write-Host "✅ 數據庫創建成功！" -ForegroundColor Green
        Write-Host "   Database ID: $DB_ID" -ForegroundColor Blue
        
        # 更新 wrangler.toml
        if (Test-Path wrangler.toml) {
            $content = Get-Content wrangler.toml -Raw
            $content = $content -replace "YOUR_DATABASE_ID", $DB_ID
            Set-Content -Path wrangler.toml -Value $content
            Write-Host "✅ 已更新 wrangler.toml" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ 創建數據庫失敗" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# 檢查 R2 存儲桶
Write-Host "🪣 檢查 R2 存儲桶..." -ForegroundColor Blue
$BUCKET_LIST = npx wrangler r2 bucket list 2>&1

if ($BUCKET_LIST -match "lovely-site-images") {
    Write-Host "✅ 存儲桶 'lovely-site-images' 已存在" -ForegroundColor Green
} else {
    Write-Host "⚠️  存儲桶 'lovely-site-images' 不存在，正在創建..." -ForegroundColor Yellow
    npx wrangler r2 bucket create lovely-site-images
    Write-Host "✅ 存儲桶創建成功！" -ForegroundColor Green
}
Write-Host ""

# 檢查 wrangler.toml 配置
Write-Host "📝 檢查 wrangler.toml 配置..." -ForegroundColor Blue
if (Test-Path wrangler.toml) {
    $content = Get-Content wrangler.toml -Raw
    if ($content -match "YOUR_DATABASE_ID") {
        Write-Host "⚠️  wrangler.toml 中還有佔位符 YOUR_DATABASE_ID" -ForegroundColor Yellow
        Write-Host "   請手動更新或使用上面的 Database ID"
    } else {
        Write-Host "✅ wrangler.toml 配置正確" -ForegroundColor Green
    }
} else {
    Write-Host "❌ 找不到 wrangler.toml" -ForegroundColor Red
}
Write-Host ""

# 總結
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 D1 + R2 啟用檢查完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步："
Write-Host "1. 創建數據表："
Write-Host "   npx wrangler d1 execute lovely-site-db --file=d1-schema.sql"
Write-Host ""
Write-Host "2. 上傳動態數據到 D1："
Write-Host "   cd ../tools/upload-dynamics"
Write-Host "   python upload-to-d1-r2.py"
Write-Host ""
Write-Host "3. 測試 API："
Write-Host "   npm run dev:cf"
Write-Host "   訪問 http://localhost:8788/api/dynamics"
Write-Host ""
Write-Host "4. 部署到生產環境："
Write-Host "   git push origin main"
Write-Host ""
