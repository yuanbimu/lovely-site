// 站点配置中心
// 所有硬编码的配置都集中在这里

export const SITE_CONFIG = {
  // 站点基本信息
  url: 'https://lovely.yuanbimu.top',
  
  // CDN 配置
  cdn: {
    domain: 'cdn.yuanbimu.top',
    showcasePath: '/showcase',
  },
  
  // B站配置
  bilibili: {
    uid: '3821157',
    mid: '3821157',
    spaceUrl: 'https://space.bilibili.com/3821157',
  },
  
  // 分页配置
  pagination: {
    dynamicsPerPage: 10,
  },
  
  // 图片配置
  images: {
    avatar: '/images/avatar.webp',
    favicon: '/favicon.ico',
    defaultOgImage: '/images/Lovely.webp',
  },
  
  // 主题颜色（用于 CSS 变量）
  colors: {
    primary: '#6B5637',
    secondary: '#8B6F47',
    accent: '#9d84b7',
    bgCream: '#FAF6F0',
    bgLight: '#F5EDE3',
  },
} as const;

// 辅助函数：生成 CDN URL
export function getCdnUrl(path: string): string {
  return `https://${SITE_CONFIG.cdn.domain}${path}`;
}

// 辅助函数：生成橱窗图片 URL
export function getShowcaseImageUrl(imageName: string): string {
  return getCdnUrl(`${SITE_CONFIG.cdn.showcasePath}/${imageName}`);
}

// 辅助函数：生成站点完整 URL
export function getSiteUrl(path: string = ''): string {
  return `${SITE_CONFIG.url}${path}`;
}
