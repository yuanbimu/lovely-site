#!/usr/bin/env node
/**
 * 把线上公开内容灌入本地 D1，供本地预览使用。
 *
 * 背景：本地 D1 初始为空，而 `npm run init:db` 依赖的建表 SQL 当前缺失，
 * 唯一「官方」同步路径 `npm run pull:db` 需要 `wrangler login` 才能读远程库。
 * 这个脚本走线上只读 API（/api/timeline、/api/songs、/api/showcases），
 * 不需要任何 Cloudflare 凭据。
 *
 * 用法：
 *   npm run seed:local
 *
 * 说明：
 * - 只写本地库（--local），不碰线上。
 * - 表结构按 functions/lib/db.ts 的读写列推导，仅作本地预览用；
 *   权威结构以线上 D1 为准，需要完整同步时用 `npm run pull:db`。
 * - 管理员账号无法通过公开 API 获取，登录相关功能仍需自己初始化。
 */

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BASE = process.env.LOVELY_API_BASE || 'https://lovely.yuanbimu.top';
const DB_NAME = 'lovely-site-db';
const sqlFile = join(projectRoot, '.tmp', 'seed-local-d1.sql');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT,
  icon TEXT,
  tag TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  cover_url TEXT,
  url TEXT,
  release_date TEXT,
  tag TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS showcases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  folder TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);
`;

function quote(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function fetchJson(path) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`请求失败 ${response.status}: ${path}`);
  }
  return response.json();
}

/**
 * 分页反而更麻烦：/api/timeline 用 page、/api/songs 用 offset，
 * 且两个接口不传 limit 时都直接返回全部数据，所以这里一次取完。
 */
async function fetchAll(path) {
  const res = await fetchJson(path);
  return res.data || [];
}

function buildInserts(rows, table, columns) {
  return rows
    .map((row) => {
      const values = columns.map((column) => quote(row[column]));
      return `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    })
    .join('\n');
}

async function main() {
  console.log(`🚀 从 ${BASE} 拉取公开内容...\n`);

  const [timeline, songs, showcases] = await Promise.all([
    fetchAll('/api/timeline'),
    fetchAll('/api/songs'),
    fetchAll('/api/showcases'),
  ]);

  console.log(`  时间线：${timeline.length} 条`);
  console.log(`  歌单：${songs.length} 条`);
  console.log(`  橱窗：${showcases.length} 条\n`);

  if (timeline.length === 0 && songs.length === 0 && showcases.length === 0) {
    throw new Error('线上没有返回任何内容，请检查 LOVELY_API_BASE');
  }

  const sql = [
    SCHEMA.trim(),
    buildInserts(timeline, 'timeline_events', [
      'id', 'date', 'title', 'content', 'color', 'icon', 'tag', 'sort_order', 'created_at', 'updated_at',
    ]),
    buildInserts(songs, 'songs', [
      'id', 'title', 'artist', 'cover_url', 'url', 'release_date', 'tag', 'created_at', 'updated_at',
    ]),
    buildInserts(showcases, 'showcases', [
      'id', 'name', 'description', 'folder', 'image_url', 'sort_order', 'created_at', 'updated_at',
    ]),
  ].join('\n\n');

  const outDir = dirname(sqlFile);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(sqlFile, sql, 'utf-8');
  console.log(`📄 已生成 SQL：${sqlFile}\n`);

  console.log('📥 写入本地 D1...');
  execSync(`npx wrangler d1 execute ${DB_NAME} --local --file="${sqlFile}"`, {
    stdio: 'inherit',
    cwd: projectRoot,
  });

  console.log('\n✅ 本地数据已就绪');
  console.log('   下一步：npm run dev:cf → http://127.0.0.1:8788/timeline');
}

main().catch((err) => {
  console.error('\n❌ 失败:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
