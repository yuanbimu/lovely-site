# D1 + R2 啟用指南

## 📋 概述

本文檔指導你如何啟用 Cloudflare D1 數據庫和 R2 存儲桶，用於存儲東愛璃應援站的動態數據和圖片。

---

## 🔑 步驟 1：創建 Cloudflare API Token

### 1.1 登錄 Cloudflare Dashboard

訪問：https://dash.cloudflare.com/

### 1.2 創建 API Token

1. 點擊右上角用戶名 → **My Profile**
2. 左側菜單選擇 **API Tokens**
3. 點擊 **Create Token**
4. 選擇 **Custom token** 模板

### 1.3 配置 Token 權限

| 權限 | 設置 |
|------|------|
| **Token name** | `lovely-site-d1-r2` |
| **Account** | 你的賬戶 |
| **Permissions** | 添加以下權限： |
| | Account:Read |
| | D1:Edit |
| | R2:Edit |
| | Cloudflare Pages:Edit |
| | Zone:Read (如果管理自定義域名) |

### 1.4 保存 Token

1. 點擊 **Continue to summary**
2. 確認權限無誤
3. 點擊 **Create Token**
4. **立即複製 Token**（只顯示一次！）

---

## 🔧 步驟 2：設置環境變量

### 選項 A：臨時設置（當前終端）

**PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN = "你的_token_這裡"
```

**CMD:**
```cmd
set CLOUDFLARE_API_TOKEN=你的_token_這裡
```

**Bash (Git Bash/WSL):**
```bash
export CLOUDFLARE_API_TOKEN="你的_token_這裡"
```

### 選項 B：更新 .env 文件

編輯 `lovely-site/.env` 文件：

```env
CLOUDFLARE_ACCOUNT_ID=你的_account_id
CLOUDFLARE_API_TOKEN=你的_token_這裡
```

### 選項 C：系統環境變量（Windows）

1. 按 `Win + R`，輸入 `sysdm.cpl`，回車
2. 點擊 **高級** → **環境變量**
3. 在 **用戶變量** 中點擊 **新建**
4. 變量名：`CLOUDFLARE_API_TOKEN`
5. 變量值：你的 Token
6. 確定保存

---

## 🚀 步驟 3：運行啟用腳本

### Windows (PowerShell)

```powershell
cd lovely-site
.\scripts\setup-d1-r2.ps1
```

如果提示執行策略問題：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Linux/macOS (Bash)

```bash
cd lovely-site
chmod +x scripts/setup-d1-r2.sh
./scripts/setup-d1-r2.sh
```

---

## 📝 步驟 4：手動操作（如果腳本失敗）

### 4.1 創建 D1 數據庫

```bash
npx wrangler d1 create lovely-site-db
```

輸出示例：
```
✅ Successfully created DB 'lovely-site-db'
[
  {
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "name": "lovely-site-db",
    "created_at": "...",
    ...
  }
]
```

**記錄 `uuid`！**

### 4.2 更新 wrangler.toml

編輯 `wrangler.toml`，替換佔位符：

```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← 替換為你的 uuid
```

### 4.3 創建 R2 存儲桶

```bash
npx wrangler r2 bucket create lovely-site-images
```

### 4.4 創建數據表

```bash
npx wrangler d1 execute lovely-site-db --file=d1-schema.sql
```

---

## 📊 步驟 5：上傳數據

### 5.1 確保有動態數據

確保已運行抓取腳本：
```bash
cd tools/getdym
python getDynamics.py
```

### 5.2 運行上傳腳本

```bash
cd tools/upload-dynamics
python upload-to-d1-r2.py
```

按照提示設置 R2 環境變量（如果需要上傳圖片）：
```bash
$env:R2_ENDPOINT="https://你的account_id.r2.cloudflarestorage.com"
$env:R2_ACCESS_KEY_ID="你的_access_key"
$env:R2_SECRET_ACCESS_KEY="你的_secret_key"
$env:R2_BUCKET_NAME="lovely-site-images"
$env:CDN_DOMAIN="你的cdn域名.com"  # 可選
```

### 5.3 執行 SQL 上傳

腳本會生成 `output/dynamics-insert.sql`，執行：
```bash
cd lovely-site
npx wrangler d1 execute lovely-site-db --file=../tools/upload-dynamics/output/dynamics-insert.sql
```

---

## ✅ 步驟 6：驗證

### 6.1 本地測試

```bash
cd lovely-site
npm run dev:cf
```

訪問：
- http://localhost:8788/api/dynamics
- http://localhost:8788/api/dynamics?limit=5

### 6.2 檢查數據

```bash
npx wrangler d1 execute lovely-site-db --command="SELECT COUNT(*) FROM dynamics"
```

---

## 🚀 步驟 7：部署

```bash
git add .
git commit -m "啟用 D1 + R2，更新 wrangler.toml"
git push origin main
```

Cloudflare Pages 會自動部署，D1 和 R2 綁定會自動生效。

---

## 🔍 常見問題

### Q1: 提示 "In a non-interactive environment"

**解決：** 確保設置了 `CLOUDFLARE_API_TOKEN` 環境變量

### Q2: "database_id" 是什麼？

**回答：** 這是 D1 數據庫的唯一 ID，格式如 `12345678-1234-1234-1234-123456789abc`，創建數據庫時會顯示

### Q3: R2 圖片上傳失敗

**解決：** 
1. 確保創建了 R2 Access Key：Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. 設置正確的環境變量
3. 或者先不上傳圖片，只使用 D1 存儲動態元數據

### Q4: 如何獲取 CLOUDFLARE_ACCOUNT_ID？

**回答：** 
1. 登錄 Cloudflare Dashboard
2. 任意頁面右側邊欄顯示 "Account ID"
3. 或者從 URL 提取：`https://dash.cloudflare.com/你的_account_id/...`

---

## 📚 相關文檔

- [D1 文檔](https://developers.cloudflare.com/d1/)
- [R2 文檔](https://developers.cloudflare.com/r2/)
- [Wrangler 文檔](https://developers.cloudflare.com/workers/wrangler/)

---

## ✅ 檢查清單

- [ ] 創建了 Cloudflare API Token
- [ ] 設置了 CLOUDFLARE_API_TOKEN 環境變量
- [ ] 創建了 D1 數據庫 `lovely-site-db`
- [ ] 更新了 `wrangler.toml` 的 `database_id`
- [ ] 創建了 R2 存儲桶 `lovely-site-images`
- [ ] 執行了 `d1-schema.sql` 創建數據表
- [ ] 運行了上傳腳本將數據導入 D1
- [ ] 本地測試 API 正常
- [ ] 部署到生產環境

完成！🎉
