#!/usr/bin/env node
/**
 * 初始化第一個管理員用戶
 * 使用方法：node scripts/init-admin.js <username> <password> <email>
 */

const { execSync } = require('child_process');

// 簡易密碼哈希（與 auth.ts 中使用相同的算法）
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'lovely-site-salt');
  
  // 使用 Node.js crypto 模塊
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('使用方法：node scripts/init-admin.js <username> <password> <email>');
    console.log('示例：node scripts/init-admin.js admin yourpassword admin@example.com');
    process.exit(1);
  }
  
  const [username, password, email] = args;
  
  if (password.length < 6) {
    console.error('錯誤：密碼至少需要6個字符');
    process.exit(1);
  }
  
  const userId = `admin_${Date.now()}`;
  const passwordHash = await hashPassword(password);
  const now = Date.now();
  
  const sql = `
    INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES ('${userId}', '${username}', '${email}', '${passwordHash}', 'admin', ${now}, ${now});
  `;
  
  console.log('正在創建管理員用戶...');
  console.log(`用戶名: ${username}`);
  console.log(`郵箱: ${email}`);
  
  try {
    // 保存 SQL 到臨時文件
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, 'temp-admin.sql');
    fs.writeFileSync(tempFile, sql);
    
    // 執行 SQL
    const result = execSync(`npx wrangler d1 execute lovely-site-db --file=${tempFile} --remote`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    // 删除臨時文件
    fs.unlinkSync(tempFile);
    
    console.log('\n✅ 管理員用戶創建成功！');
    console.log(`\n請使用以下信息登錄：`);
    console.log(`用戶名: ${username}`);
    console.log(`密碼: ${password}`);
    console.log(`\n登錄地址: /admin/timeline`);
    
  } catch (error) {
    console.error('\n❌ 創建失敗:', error.message);
    console.error(error.stderr);
    process.exit(1);
  }
}

main();
