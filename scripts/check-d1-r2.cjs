const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 讀取 .env 文件
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// 解析環境變量
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

// 設置環境變量
process.env.CLOUDFLARE_API_TOKEN = envVars.CLOUDFLARE_API_TOKEN;
process.env.CLOUDFLARE_ACCOUNT_ID = envVars.CLOUDFLARE_ACCOUNT_ID;

console.log('🔑 使用 API Token:', process.env.CLOUDFLARE_API_TOKEN?.substring(0, 10) + '...');
console.log('');

// 檢查 D1 數據庫
console.log('🗄️  檢查 D1 數據庫...');
try {
  const result = execSync('npx wrangler d1 list', {
    encoding: 'utf8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  console.log(result);
  
  if (result.includes('lovely-site-db')) {
    console.log('✅ 數據庫已存在');
  } else {
    console.log('⚠️  數據庫不存在，需要創建');
  }
} catch (error) {
  console.error('❌ 檢查失敗:', error.message);
  console.error(error.stderr);
}

console.log('');

// 檢查 R2 存儲桶
console.log('🪣 檢查 R2 存儲桶...');
try {
  const result = execSync('npx wrangler r2 bucket list', {
    encoding: 'utf8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  console.log(result);
  
  if (result.includes('lovely-site-images')) {
    console.log('✅ 存儲桶已存在');
  } else {
    console.log('⚠️  存儲桶不存在，需要創建');
  }
} catch (error) {
  console.error('❌ 檢查失敗:', error.message);
  console.error(error.stderr);
}
