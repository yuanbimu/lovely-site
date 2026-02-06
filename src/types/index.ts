// TypeScript 类型定义

// 主播资料
export interface Profile {
  name: string;
  nickname: string;
  avatar: string;
  avatarApi: string;
  uid: string;
  bio: string;
  description: string;
  socials: {
    bilibili: string;
    weibo?: string;
  };
}

// 站点配置
export interface SiteConfig {
  showDynamics: boolean;
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
}

// 动态
export interface Dynamic {
  id: string;
  type: string;
  content: string;
  images: string[];
  author: string;
  time: string;
  timestamp?: number;
  stats: {
    likes: number;
    comments: number;
    reposts: number;
  };
  origin_user?: string;
  origin_content?: string;
  origin_images?: string[];
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

// 橱窗项目
export interface ShowcaseItem {
  id: string;
  name: string;
  description: string;
  image: string;
}

// 站点数据（site-data.json 的完整结构）
export interface SiteData {
  config: SiteConfig;
  site: SiteInfo;
  profile: Profile;
  stats: Stats;
  liveStatus: LiveStatus;
  dynamics: Dynamic[];
  articles: Article[];
}

// 配置数据（config.json 的结构）
export interface ConfigData {
  showcase: ShowcaseItem[];
}
