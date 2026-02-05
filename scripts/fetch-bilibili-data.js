import fs from 'fs';
import path from 'path';

const BILIBILI_MID = '3821157';
const DATA_FILE = './src/data/site-data.json';

async function fetchBilibiliData() {
  try {
    console.log('Fetching Bilibili data...');
    
    const response = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${BILIBILI_MID}`);
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
    } else {
      console.error('Failed to fetch data:', data.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error fetching Bilibili data:', error);
    process.exit(1);
  }
}

fetchBilibiliData();
