#!/usr/bin/env node
/**
 * 将生产 D1 数据同步到本地开发数据库
 *
 * 用法：
 *   node scripts/pull-d1.js
 *   node scripts/pull-d1.js --keep-dump
 *   node scripts/pull-d1.js --dump-file=./tmp/prod-d1.sql
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, isAbsolute, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const DB_NAME = 'lovely-site-db';
const KEEP_DUMP = process.argv.includes('--keep-dump');
const dumpFileArg = process.argv.find((arg) => arg.startsWith('--dump-file='));
const dumpFile = dumpFileArg
  ? resolve(projectRoot, dumpFileArg.slice('--dump-file='.length))
  : join(projectRoot, '.tmp', 'prod-d1-export.sql');
const localD1StateDir = join(projectRoot, '.wrangler', 'state', 'v3', 'd1');

function ensureParentDir(filePath) {
  const parentDir = dirname(filePath);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }
}

function runWrangler(args) {
  const command = `npx wrangler ${args.map((arg) => `"${arg}"`).join(' ')}`;
  execSync(command, {
    cwd: projectRoot,
    stdio: 'inherit'
  });
}

function getDisplayPath(filePath) {
  return isAbsolute(filePath) ? filePath : resolve(projectRoot, filePath);
}

function removeDumpIfNeeded(filePath) {
  if (!KEEP_DUMP && existsSync(filePath)) {
    rmSync(filePath, { force: true });
  }
}

function resetLocalD1State() {
  if (existsSync(localD1StateDir)) {
    rmSync(localD1StateDir, { recursive: true, force: true });
  }
}

console.log('🚀 开始同步生产 D1 到本地开发数据库...\n');
console.log(`📦 数据库：${DB_NAME}`);
console.log(`📄 导出文件：${getDisplayPath(dumpFile)}\n`);

try {
  ensureParentDir(dumpFile);

  console.log('1/2 导出生产 D1 数据...');
  runWrangler(['d1', 'export', DB_NAME, '--remote', `--output=${dumpFile}`]);
  console.log('✓ 生产数据导出完成\n');

  console.log('2/2 重置本地 D1 并导入...');
  resetLocalD1State();
  runWrangler(['d1', 'execute', DB_NAME, '--local', `--file=${dumpFile}`]);
  console.log('✓ 本地数据库同步完成\n');

  console.log('✅ 同步成功！');
  console.log('下一步：');
  console.log('  1. 运行 npm run dev:all');
  console.log('  2. 访问 http://127.0.0.1:8788/api/showcases 验证接口');
  console.log('  3. 如需保留 SQL 导出文件，请使用 --keep-dump');

  removeDumpIfNeeded(dumpFile);
} catch (error) {
  console.error('\n❌ 同步失败:', error instanceof Error ? error.message : String(error));
  console.error('\n请检查：');
  console.error('  1. 是否已执行 npx wrangler login');
  console.error('  2. 是否有生产 D1 读取权限');
  console.error('  3. wrangler.toml 中的 database_id 是否正确');
  console.error('  4. 本地 D1 是否能被 wrangler 正常访问');
  process.exit(1);
}
