#!/usr/bin/env node
/**
 * Wrangler 配置向导脚本
 * 使用方法：npm run setup
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('===================================');
console.log('⛅ Wrangler D1 数据库配置向导');
console.log('===================================\n');

// 步骤 1: 检查登录状态
console.log('[1/5] 检查 Cloudflare 登录状态...');
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✓ 已登录 Cloudflare\n');
} catch (error) {
  console.log('⚠️  需要登录 Cloudflare\n');
  console.log('即将打开浏览器，请完成登录授权...\n');
  
  try {
    execSync('wrangler login', { stdio: 'inherit' });
    console.log('✓ 登录成功\n');
  } catch (loginError) {
    console.error('❌ 登录失败');
    process.exit(1);
  }
}

// 步骤 2: 检查/创建数据库
console.log('[2/5] 检查数据库...');
try {
  const listOutput = execSync('wrangler d1 list', { encoding: 'utf8' });
  if (listOutput.includes('lovely-site-db')) {
    console.log('✓ 数据库已存在\n');
  } else {
    console.log('创建新数据库...');
    execSync('wrangler d1 create lovely-site-db --location=enam', { 
      stdio: 'inherit' 
    });
    console.log('✓ 数据库创建成功\n');
  }
} catch (dbError) {
  console.error('❌ 数据库操作失败:', dbError.message);
  process.exit(1);
}

// 步骤 3: 获取数据库 UUID
console.log('[3/5] 获取数据库信息...');
try {
  const listOutput = execSync('wrangler d1 list', { encoding: 'utf8' });
  console.log(listOutput);
  
  // 提取 UUID（简单解析）
  const uuidMatch = listOutput.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
  
  console.log('\n⚠️  重要：请手动更新 wrangler.toml');
  console.log('将 database_id 替换为上面显示的 UUID\n');
  
  if (uuidMatch) {
    const uuid = uuidMatch[1];
    console.log(`📋 复制这个 UUID: ${uuid}\n`);
  }
  
  console.log('按回车继续...');
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  }).question('', () => {
    continueSetup();
  });
  
} catch (error) {
  console.error('❌ 获取数据库信息失败');
  process.exit(1);
}

function continueSetup() {
  // 步骤 4: 初始化数据库
  console.log('[4/5] 初始化数据库表结构...');
  const sqlFile = join(__dirname, 'init-db.sql');
  
  if (!existsSync(sqlFile)) {
    console.error('❌ SQL 文件不存在:', sqlFile);
    process.exit(1);
  }
  
  try {
    execSync(`wrangler d1 execute lovely-site-db --local --file="${sqlFile}"`, { 
      stdio: 'inherit' 
    });
    console.log('✓ 数据库表创建成功\n');
  } catch (initError) {
    console.log('⚠️  本地初始化失败，可能是首次运行');
    console.log('稍后可以手动执行：npm run init:db:windows\n');
  }
  
  // 步骤 5: 验证
  console.log('[5/5] 验证配置...');
  try {
    const verifyOutput = execSync('wrangler d1 list', { encoding: 'utf8' });
    console.log('数据库列表:');
    console.log(verifyOutput);
  } catch (error) {
    console.log('⚠️  验证失败，但配置可能已成功');
  }
  
  // 完成
  console.log('\n===================================');
  console.log('✅ 配置完成！');
  console.log('===================================\n');
  console.log('下一步:');
  console.log('1. 更新 wrangler.toml 中的 database_id');
  console.log('2. 运行：npm run dev:cf');
  console.log('3. 访问：http://localhost:4321/timeline');
  console.log('\n详细文档：docs/WRANGLER_SETUP.md\n');
}
