#!/usr/bin/env node
/**
 * 初始化第一个管理员用户
 * 使用方法：node scripts/init-admin.js <username> <password> <email>
 */

const { execSync } = require('child_process');

// 简易密码哈希（与 auth.ts 中使用相同的算法）
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'lovely-site-salt');
  
  // 使用 Node.js crypto 模块
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
    console.error('错误：密码至少需要6个字符');
    process.exit(1);
  }
  
  const userId = `admin_${Date.now()}`;
  const passwordHash = await hashPassword(password);
  const now = Date.now();
  
  const sql = `
    INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES ('${userId}', '${username}', '${email}', '${passwordHash}', 'admin', ${now}, ${now});
  `;
  
  console.log('正在创建管理员用户...');
  console.log(`用户名: ${username}`);
  console.log(`邮箱: ${email}`);
  
  try {
    // 保存 SQL 到临时文件
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, 'temp-admin.sql');
    fs.writeFileSync(tempFile, sql);
    
    // 执行 SQL
    const result = execSync(`npx wrangler d1 execute lovely-site-db --file=${tempFile} --remote`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    // 删除临时文件
    fs.unlinkSync(tempFile);
    
    console.log('\n✅ 管理员用户创建成功！');
    console.log(`\n请使用以下信息登录：`);
    console.log(`用户名: ${username}`);
    console.log(`密码: ${password}`);
    console.log(`\n登录地址: /admin/timeline`);
    
  } catch (error) {
    console.error('\n❌ 创建失败:', error.message);
    console.error(error.stderr);
    process.exit(1);
  }
}

main();
