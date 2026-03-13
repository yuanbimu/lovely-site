#!/bin/bash
# D1 + R2 啟用腳本
# 自動檢查並創建所需的 Cloudflare 資源

set -e

echo "=========================================="
echo "🚀 D1 + R2 啟用工具"
echo "=========================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查 wrangler 是否安裝
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ 錯誤：需要安裝 Node.js 和 npx${NC}"
    exit 1
fi

# 檢查 API Token
echo -e "${BLUE}🔑 檢查 Cloudflare API Token...${NC}"
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    # 嘗試從 .env 文件讀取
    if [ -f .env ]; then
        export $(grep -E '^CLOUDFLARE_API_TOKEN=' .env | xargs)
    fi
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ "$CLOUDFLARE_API_TOKEN" = "your_api_token_here" ]; then
    echo -e "${RED}❌ 未設置 CLOUDFLARE_API_TOKEN${NC}"
    echo ""
    echo "請先創建 API Token："
    echo "1. 訪問 https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 點擊 'Create Token'"
    echo "3. 使用 'Custom token' 模板"
    echo "4. 權限設置："
    echo "   - Zone:Read (如果需要管理域名)"
    echo "   - Account:Read"
    echo "   - D1:Edit"
    echo "   - R2:Edit"
    echo "   - Cloudflare Pages:Edit"
    echo "5. 複製 Token 並設置環境變量："
    echo "   export CLOUDFLARE_API_TOKEN=your_token_here"
    echo ""
    echo "或者更新 .env 文件中的 CLOUDFLARE_API_TOKEN"
    exit 1
fi

echo -e "${GREEN}✅ API Token 已設置${NC}"
echo ""

# 檢查現有 D1 數據庫
echo -e "${BLUE}🗄️  檢查 D1 數據庫...${NC}"
DB_LIST=$(npx wrangler d1 list 2>/dev/null || echo "")

if echo "$DB_LIST" | grep -q "lovely-site-db"; then
    echo -e "${GREEN}✅ 數據庫 'lovely-site-db' 已存在${NC}"
    # 提取 database_id
    DB_ID=$(echo "$DB_LIST" | grep "lovely-site-db" -A1 | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' || echo "")
    if [ -n "$DB_ID" ]; then
        echo -e "${BLUE}   Database ID: $DB_ID${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  數據庫 'lovely-site-db' 不存在，正在創建...${NC}"
    CREATE_OUTPUT=$(npx wrangler d1 create lovely-site-db 2>&1)
    echo "$CREATE_OUTPUT"
    
    # 提取 database_id
    DB_ID=$(echo "$CREATE_OUTPUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' || echo "")
    
    if [ -n "$DB_ID" ]; then
        echo -e "${GREEN}✅ 數據庫創建成功！${NC}"
        echo -e "${BLUE}   Database ID: $DB_ID${NC}"
        
        # 更新 wrangler.toml
        if [ -f wrangler.toml ]; then
            sed -i.bak "s/YOUR_DATABASE_ID/$DB_ID/g" wrangler.toml
            echo -e "${GREEN}✅ 已更新 wrangler.toml${NC}"
        fi
    else
        echo -e "${RED}❌ 創建數據庫失敗${NC}"
        exit 1
    fi
fi
echo ""

# 檢查 R2 存儲桶
echo -e "${BLUE}🪣 檢查 R2 存儲桶...${NC}"
BUCKET_LIST=$(npx wrangler r2 bucket list 2>/dev/null || echo "")

if echo "$BUCKET_LIST" | grep -q "lovely-site-images"; then
    echo -e "${GREEN}✅ 存儲桶 'lovely-site-images' 已存在${NC}"
else
    echo -e "${YELLOW}⚠️  存儲桶 'lovely-site-images' 不存在，正在創建...${NC}"
    npx wrangler r2 bucket create lovely-site-images
    echo -e "${GREEN}✅ 存儲桶創建成功！${NC}"
fi
echo ""

# 檢查 wrangler.toml 配置
echo -e "${BLUE}📝 檢查 wrangler.toml 配置...${NC}"
if [ -f wrangler.toml ]; then
    if grep -q "YOUR_DATABASE_ID" wrangler.toml; then
        echo -e "${YELLOW}⚠️  wrangler.toml 中還有佔位符 YOUR_DATABASE_ID${NC}"
        echo "   請手動更新或使用上面的 Database ID"
    else
        echo -e "${GREEN}✅ wrangler.toml 配置正確${NC}"
    fi
else
    echo -e "${RED}❌ 找不到 wrangler.toml${NC}"
fi
echo ""

# 檢查數據表
echo -e "${BLUE}📊 檢查數據表...${NC}"
echo "   即將執行 d1-schema.sql 創建數據表..."
echo ""
read -p "是否創建/更新數據表？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f d1-schema.sql ]; then
        npx wrangler d1 execute lovely-site-db --file=d1-schema.sql
        echo -e "${GREEN}✅ 數據表創建完成！${NC}"
    else
        echo -e "${RED}❌ 找不到 d1-schema.sql${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  跳過數據表創建${NC}"
fi
echo ""

# 總結
echo "=========================================="
echo -e "${GREEN}🎉 D1 + R2 啟用檢查完成！${NC}"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 上傳動態數據到 D1："
echo "   cd ../tools/upload-dynamics"
echo "   python upload-to-d1-r2.py"
echo ""
echo "2. 測試 API："
echo "   npm run dev:cf"
echo "   訪問 http://localhost:8788/api/dynamics"
echo ""
echo "3. 部署到生產環境："
echo "   git push origin main"
echo ""
