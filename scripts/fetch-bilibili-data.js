import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 從環境變量讀取配置，使用默認值
const BILIBILI_MID = process.env.BILIBILI_UID || '3821157';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'site-data.json');

// 從環境變量讀取 cookie
const BILI_JCT = process.env.BILI_JCT;
const BUVID3 = process.env.BUVID3;
const BUVID4 = process.env.BUVID4;
const BILIBILI_SESSDATA = process.env.BILIBILI_SESSDATA;

function buildCookieHeader() {
  const cookies = [];
  if (BILI_JCT) cookies.push(`bili_jct=${BILI_JCT}`);
  if (BUVID3) cookies.push(`buvid3=${BUVID3}`);
  if (BUVID4) cookies.push(`buvid4=${BUVID4}`);
  if (BILIBILI_SESSDATA) cookies.push(`SESSDATA=${BILIBILI_SESSDATA}`);
  return cookies.join('; ');
}

async function fetchBilibiliData() {
  try {
    console.log('Fetching Bilibili data...');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://space.bilibili.com'
    };
    
    const cookieHeader = buildCookieHeader();
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('Using cookies from environment variables');
    } else {
      console.log('No cookies provided, fetching without authentication');
    }
    
    const response = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${BILIBILI_MID}`, { headers });
    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      const card = data.data.card;
      const avatarUrl = card.face;
      const fansCount = data.data.follower || card.fans;
      
      // 讀取現有的 site-data.json
      const siteData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      
      // 更新數據
      siteData.profile.avatar = avatarUrl;
      siteData.stats.fans = fansCount;
      siteData.stats.lastUpdated = new Date().toISOString().split('T')[0];
      
      // 寫回文件
      fs.writeFileSync(DATA_FILE, JSON.stringify(siteData, null, 2));
      
      console.log('✓ Updated avatar:', avatarUrl);
      console.log('✓ Updated fans count:', fansCount);
      console.log('✓ Data saved to', DATA_FILE);
    } else if (data.code === -352) {
      console.error('Error -352: Request blocked by Bilibili风控');
      console.error('Please set BILI_JCT, BUVID3, BUVID4, BILIBILI_SESSDATA environment variables in Cloudflare Pages settings');
      process.exit(1);
    } else {
      console.error('Failed to fetch data:', data.message, `(code: ${data.code})`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error fetching Bilibili data:', error);
    process.exit(1);
  }
}

fetchBilibiliData();
