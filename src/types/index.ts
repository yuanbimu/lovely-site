// TypeScript 类型定义

// 主播资料
export interface Profile {
  name: string;
  nickname: string;
  avatar: string;
  uid: string;
  bio: string;
  description: string;
  socials: {
    bilibili: string;
    live: string;
    weibo?: string;
  };
  aboutText: string[];
}

// 站点配置
export interface SiteConfig {
  showLiveStatus: boolean;
  showFansCount: boolean;
}

// 站点信息
export interface SiteInfo {
  title: string;
  description: string;
  author: string;
}

// 统计数据
export interface Stats {
  fans: number;
  following: number;
  lastUpdated: string;
  avatar: string;
}

// 直播状态
export interface LiveStatus {
  isLive: boolean;
  title: string;
  url: string;
  lastChecked: string;
  fans?: number;
}

// 文章
export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  cover?: string;
  author: string;
  time: string;
  tags?: string[];
}

// 站点数据（site-data.json 的完整结构）
export interface SiteData {
  config: SiteConfig;
  site: SiteInfo;
  profile: Profile;
  stats: Stats;
  liveStatus: LiveStatus;
  articles: Article[];
}
