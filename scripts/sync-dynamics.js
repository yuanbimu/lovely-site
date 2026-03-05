/**
 * B 站动态数据同步脚本
 * 
 * 功能：
 * 1. 从 B 站 API 获取用户动态列表
 * 2. 下载动态图片到本地（用于 R2 上传）
 * 3. 保存动态元数据到 JSON 文件（本地开发）或 D1 数据库（生产环境）
 * 
 * 使用方式：
 * - 本地开发：node scripts/sync-dynamics.js
 * - GitHub Actions: 自动定时执行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取配置
const BILIBILI_MID = process.env.BILIBILI_UID || '3821157';
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'dynamics.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'dynamics');

// 从环境变量读取 Cookie（可选，用于绕过风控）
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

/**
 * 从 B 站 API 获取动态列表
 * API 文档：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/dynamic/overview.md
 */
async function fetchDynamics() {
  console.log('\ud83d\udce5 \u6b63\u5728\u83b7\u53d6 B \u7ad9\u52a8\u6001...');
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': `https://space.bilibili.com/${BILIBILI_MID}/dynamic`,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Origin': 'https://space.bilibili.com',
    'Connection': 'keep-alive'
  };
  
  const cookieHeader = buildCookieHeader();
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
    console.log('\u2705 \u4f7f\u7528 Cookie \u8ba4\u8bc1');
  } else {
    console.log('\u26a0\ufe0f  \u672a\u63d0\u4f9b Cookie\uff0c\u53ef\u80fd\u89e6\u53d1\u98ce\u63a7');
  }
  
  try {
    // B \u7ad9\u52a8\u6001 API v2
    // \u6dfb\u52a0 30 \u79d2\u8d85\u65f6
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(
      `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${BILIBILI_MID}&timezone_offset=-480&offset=&features=itemOpusStyle`,
      { headers, signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    // \u68c0\u67e5\u54cd\u5e94\u7c7b\u578b
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('\u274c API \u8fd4\u56de\u975e JSON \u54cd\u5e94:');
      console.error('   Status:', response.status);
      console.error('   Content-Type:', contentType);
      console.error('   Response (first 500 chars):', text.substring(0, 500));
      
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error('B\u7ad9\u8fd4\u56de\u4e86 HTML \u9875\u9762\uff0c\u53ef\u80fd\u662f Cookie \u5df2\u8fc7\u671f\u6216\u88ab\u98ce\u63a7\u62e6\u622a\u3002\u8bf7\u68c0\u67e5 GitHub Secrets \u4e2d\u7684 BILIBILI_SESSDATA \u662f\u5426\u6709\u6548\u3002');
      }
      throw new Error(`API \u8fd4\u56de\u975e JSON: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 0) {
      // \u7279\u6b8a\u9519\u8bef\u7801\u5904\u7406
      if (data.code === -352) {
        throw new Error('B\u7ad9\u98ce\u63a7\u62e6\u622a (-352)\u3002Cookie \u53ef\u80fd\u5df2\u8fc7\u671f\uff0c\u8bf7\u66f4\u65b0 GitHub Secrets\u3002');
      }
      if (data.code === -101) {
        throw new Error('B\u7ad9\u672a\u767b\u5f55 (-101)\u3002SESSDATA \u65e0\u6548\uff0c\u8bf7\u66f4\u65b0 GitHub Secrets\u3002');
      }
      throw new Error(`API \u8fd4\u56de\u9519\u8bef\uff1a${data.message} (code: ${data.code})`);
    }
    
    const items = data.data?.items || [];
    console.log(`\u2705 \u83b7\u53d6\u5230 ${items.length} \u6761\u52a8\u6001`);
    
    return items.map(item => parseDynamicItem(item));
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('\u274c \u8bf7\u6c42\u8d85\u65f6 (30\u79d2)');
      throw new Error('\u8bf7\u6c42\u8d85\u65f6\uff0c\u53ef\u80fd\u662f\u7f51\u7edc\u95ee\u9898\u6216 B\u7ad9 API \u4e0d\u54cd\u5e94');
    }
    console.error('\u274c \u83b7\u53d6\u52a8\u6001\u5931\u8d25:', error.message);
    throw error;
  }
}

/**
 * 解析动态数据项
 */
function parseDynamicItem(item) {
  const modules = item.modules || {};
  const moduleAuthor = modules.module_author || {};
  const moduleDesc = modules.module_desc || {};
  const moduleDynamic = modules.module_dynamic || {};
  const moduleStat = modules.module_stat || {};
  
  // 动态 ID
  const id = item.id || item.inner_id || '';
  
  // 动态类型
  const type = moduleDynamic.type || 'text';
  
  // 文字内容
  let content = '';
  if (moduleDesc?.description) {
    content = moduleDesc.description;
  } else if (moduleDynamic?.desc?.text) {
    content = moduleDynamic.desc.text;
  }
  
  // 图片列表
  const images = [];
  if (moduleDynamic?.major?.opus?.summary?.pic_urls?.length > 0) {
    images.push(...moduleDynamic.major.opus.summary.pic_urls);
  } else if (moduleDynamic?.major?.draw?.items?.length > 0) {
    moduleDynamic.major.draw.items.forEach(img => {
      if (img.src) images.push(img.src);
    });
  }
  
  // 作者信息
  const author = moduleAuthor?.name || '東愛璃 Lovely';
  
  // 发布时间（Unix 时间戳）
  const publishTime = item?.modules?.module_author?.pub_time 
    ? new Date(moduleAuthor.pub_time.replace(/-/g, '/')).getTime()
    : Date.now();
  
  // 统计数据
  const stats = {
    likes: moduleStat?.likes || 0,
    comments: moduleStat?.comments || 0,
    reposts: moduleStat?.reposts || 0
  };
  
  return {
    id,
    type,
    content,
    images,
    author,
    publish_time: publishTime,
    likes: stats.likes,
    comments: stats.comments,
    reposts: stats.reposts,
    raw: item // 保留原始数据用于调试
  };
}

/**
 * 下载图片到本地
 */
async function downloadImages(dynamics) {
  console.log('📸 正在下载动态图片...');
  
  // 确保图片目录存在
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  
  let downloadedCount = 0;
  const failedDownloads = [];
  
  for (const dynamic of dynamics) {
    if (!dynamic.images || dynamic.images.length === 0) continue;
    
    dynamic.local_images = [];
    
    for (let i = 0; i < dynamic.images.length; i++) {
      const imageUrl = dynamic.images[i];
      const filename = `${dynamic.id}_${i}.webp`;
      const localPath = path.join(IMAGES_DIR, filename);
      const publicPath = `/images/dynamics/${filename}`;
      
      try {
        // 检查是否已下载
        if (fs.existsSync(localPath)) {
          console.log(`  ⏭️  跳过已存在：${filename}`);
          dynamic.local_images.push(publicPath);
          continue;
        }
        
        // 下载图片
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        
        dynamic.local_images.push(publicPath);
        downloadedCount++;
        console.log(`  ✅ 下载：${filename}`);
      } catch (error) {
        console.error(`  ❌ 下载失败：${filename} - ${error.message}`);
        failedDownloads.push({ url: imageUrl, error: error.message });
        // 保留原始 URL 作为回退
        dynamic.local_images.push(imageUrl);
      }
    }
  }
  
  console.log(`✅ 下载完成：${downloadedCount} 张图片`);
  if (failedDownloads.length > 0) {
    console.warn(`⚠️  失败：${failedDownloads.length} 张`);
  }
  
  return { downloadedCount, failedDownloads };
}

/**
 * 保存数据到 JSON 文件（本地开发）
 */
function saveToJsonFile(dynamics) {
  console.log('💾 正在保存数据到 JSON 文件...');
  
  // 读取现有数据（保留配置信息）
  let existingData = { dynamics: [], lastUpdated: null };
  if (fs.existsSync(DATA_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (error) {
      console.warn('⚠️  读取现有文件失败，创建新文件');
    }
  }
  
  // 更新数据
  const updatedData = {
    ...existingData,
    dynamics: dynamics,
    lastUpdated: new Date().toISOString()
  };
  
  // 写入文件
  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
  console.log(`✅ 数据已保存到：${DATA_FILE}`);
}

/**
 * 主函数
 */
async function sync() {
  console.log('🚀 开始同步 B 站动态数据...');
  console.log(`📍 MID: ${BILIBILI_MID}`);
  console.log(`📁 数据文件：${DATA_FILE}`);
  console.log(`🖼️  图片目录：${IMAGES_DIR}`);
  console.log('');
  
  try {
    // 1. 获取动态列表
    const dynamics = await fetchDynamics();
    console.log('');
    
    // 2. 下载图片
    await downloadImages(dynamics);
    console.log('');
    
    // 3. 保存到 JSON 文件
    saveToJsonFile(dynamics);
    console.log('');
    
    console.log('✅ 同步完成！');
    console.log(`   - 动态数量：${dynamics.length}`);
    console.log(`   - 数据文件：${DATA_FILE}`);
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    process.exit(1);
  }
}

// 执行同步
sync();
