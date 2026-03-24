/**
 * 建立初始 admin 帳號的腳本
 * 使用方式: node tools/create-admin.mjs <username> <password> <email>
 * 範例:    node tools/create-admin.mjs admin mypassword admin@example.com
 */
import { createHash } from 'crypto';
import { execSync } from 'child_process';

const [,, username = 'admin', password = 'admin123', email = 'admin@lovely.site'] = process.argv;

function hashPassword(pw) {
  return createHash('sha256').update(pw + 'lovely-site-salt').digest('hex');
}

const id = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
const passwordHash = hashPassword(password);
const now = Date.now();

const sql = `INSERT OR REPLACE INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES ('${id}', '${username}', '${email}', '${passwordHash}', 'admin', ${now}, ${now});`;

console.log('\n📋 Generated SQL:');
console.log(sql);
console.log('\n⏳ Writing to temp.sql and executing on remote D1...');

import { writeFileSync } from 'fs';
writeFileSync('_admin_seed.sql', sql);

try {
  // First try with account_id temporarily set via the wrangler.toml workaround
  execSync(`cmd /c "echo Y | npx wrangler d1 execute lovely-site-db --remote --file=_admin_seed.sql"`, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('\n✅ Admin account created!');
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Role:     admin`);
  console.log('\n⚠️  Please change the password after first login!');
} catch (e) {
  console.error('\n❌ Failed. Try running manually:');
  console.log(`npx wrangler d1 execute lovely-site-db --remote --command "${sql}"`);
} finally {
  try { import('fs').then(fs => fs.unlinkSync('_admin_seed.sql')); } catch {}
}
