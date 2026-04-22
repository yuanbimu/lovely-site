#!/usr/bin/env node
/**
 * 同步 B站直播状态到 D1 数据库
 * 用法:
 *   node scripts/sync-live-to-d1.js         # 本地开发模式
 *   node scripts/sync-live-to-d1.js --prod  # 生产环境模式
 *
 * 建议定时运行（如每 5 分钟）：
 *   Windows 任务计划程序 / Linux cron
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UID = process.env.BILIBILI_UID || '3821157';
const DB_NAME = 'lovely-site-db';
const IS_PROD = process.argv.includes('--prod');

async function fetchLiveStatus() {
  const liveUrl = `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${UID}`;

  try {
    const res = await fetch(liveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://live.bilibili.com',
        'Accept': 'application/json, text/plain, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.code === 0 && data.data) {
      const room = data.data;
      const isLive = room.liveStatus === 1;
      const roomId = String(room.roomid || '');

      // 同时获取粉丝数
      let fansCount = 0;
      try {
        const cardRes = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${UID}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://space.bilibili.com',
            'Accept': 'application/json',
          },
        });

        if (cardRes.ok) {
          const cardData = await cardRes.json();
          if (cardData.code === 0 && cardData.data) {
            fansCount = cardData.data.follower || cardData.data.card?.fans || 0;
          }
        }
      } catch (cardErr) {
        console.error('⚠️ 获取粉丝数失败:', cardErr.message);
      }

      return {
        isLive,
        title: room.title || '',
        roomId,
        url: roomId ? `https://live.bilibili.com/${roomId}` : '',
        fans: fansCount,
      };
    }

    throw new Error(`Bilibili API error: ${data.message || data.code}`);
  } catch (err) {
    console.error('❌ 请求 Bilibili API 失败:', err.message);
    // 返回未开播作为保守默认值，避免覆盖正确数据
    return null;
  }
}

function escapeSqlString(str) {
  return str.replace(/'/g, "''");
}

async function syncToD1() {
  console.log(`🚀 同步直播状态到 D1 (${IS_PROD ? '生产' : '本地'})...\n`);

  const status = await fetchLiveStatus();

  if (!status) {
    console.log('⚠️ 获取直播状态失败，跳过本次同步');
    process.exit(1);
  }

  const checkedAt = Date.now();

  const sql = `
INSERT OR REPLACE INTO live_status (id, is_live, title, room_id, url, fans, checked_at)
VALUES (1, ${status.isLive ? 1 : 0}, '${escapeSqlString(status.title)}', '${escapeSqlString(status.roomId)}', '${escapeSqlString(status.url)}', ${status.fans || 0}, ${checkedAt});
`;

  const tempSqlPath = join(__dirname, 'temp-live-sync.sql');
  writeFileSync(tempSqlPath, sql, 'utf-8');

  try {
    const cmd = IS_PROD
      ? `npx wrangler d1 execute ${DB_NAME} --remote --file="${tempSqlPath}"`
      : `npx wrangler d1 execute ${DB_NAME} --local --file="${tempSqlPath}"`;

    console.log(`📄 执行 SQL: ${cmd}\n`);
    execSync(cmd, { stdio: 'inherit', cwd: join(__dirname, '..') });

    console.log('\n✅ 同步成功!');
    console.log(`   状态: ${status.isLive ? '直播中' : '未开播'}`);
    console.log(`   标题: ${status.title || '-'}`);
    console.log(`   粉丝: ${(status.fans || 0).toLocaleString('zh-CN')}`);
    console.log(`   时间: ${new Date(checkedAt).toLocaleString('zh-CN')}`);
  } catch (err) {
    console.error('\n❌ 同步失败:', err.message);
    process.exit(1);
  } finally {
    try {
      unlinkSync(tempSqlPath);
    } catch {
      // 忽略清理错误
    }
  }
}

syncToD1();
