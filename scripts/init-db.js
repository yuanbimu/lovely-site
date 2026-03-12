#!/usr/bin/env node
/**
 * D1 数据库初始化脚本（跨平台 ES 模块）
 * 使用方法：npm run init:db:windows
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 初始化 D1 数据库...\n');

try {
  // 检查 wrangler 是否安装
  try {
    execSync('wrangler --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ 错误：未找到 wrangler 命令行工具');
    console.error('请先安装：npm install -g wrangler\n');
    process.exit(1);
  }

  // 执行数据库初始化
  const sqlFile = join(__dirname, 'init-db.sql');
  console.log(`📄 执行 SQL 文件：${sqlFile}\n`);
  
  execSync(`wrangler d1 execute lovely-site-db --local --file="${sqlFile}"`, {
    stdio: 'inherit'
  });

  console.log('\n✅ 数据库初始化完成!\n');
  console.log('💡 提示:');
  console.log('  - 本地开发请访问：http://localhost:4321/timeline');
  console.log('  - 管理后台请访问：http://localhost:4321/admin/timeline');
  console.log('  - Token 已配置在 .dev.vars 文件中\n');

} catch (error) {
  console.error('\n❌ 初始化失败:', error.message);
  console.error('\n请检查:');
  console.error('  1. Wrangler 是否正确安装');
  console.error('  2. 是否有访问数据库的权限');
  console.error('  3. SQL 文件是否存在\n');
  process.exit(1);
}
