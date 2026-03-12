-- 动态表
CREATE TABLE IF NOT EXISTS dynamics (
  id TEXT PRIMARY KEY,              -- B 站动态 ID
  type TEXT NOT NULL,               -- 类型：text/image/video/article
  content TEXT,                     -- 文字内容
  images TEXT,                      -- 图片 URL 数组（JSON）
  local_images TEXT,                -- R2 本地路径数组（JSON）
  author TEXT,                      -- 作者名
  publish_time INTEGER NOT NULL,    -- 发布时间戳
  likes INTEGER DEFAULT 0,          -- 点赞数
  comments INTEGER DEFAULT 0,       -- 评论数
  reposts INTEGER DEFAULT 0,        -- 转发数
  created_at INTEGER NOT NULL,      -- 本地创建时间戳
  updated_at INTEGER NOT NULL       -- 本地更新时间戳
);

-- 用户信息表
CREATE TABLE IF NOT EXISTS user_info (
  key TEXT PRIMARY KEY,             -- 键名
  value TEXT NOT NULL,              -- JSON 值
  updated_at INTEGER NOT NULL       -- 更新时间戳
);

-- 直播状态表
CREATE TABLE IF NOT EXISTS live_status (
  id INTEGER PRIMARY KEY,           -- 固定为 1
  is_live INTEGER NOT NULL,         -- 是否直播
  title TEXT,                       -- 直播标题
  room_id TEXT,                     -- 房间号
  url TEXT,                         -- 直播间 URL
  checked_at INTEGER NOT NULL       -- 检查时间戳
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dynamics_publish_time ON dynamics(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_dynamics_type ON dynamics(type);
-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dynamics_publish_time ON dynamics(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_dynamics_type ON dynamics(type);

-- 时间线事件表
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,              -- 事件 ID（UUID）
  date TEXT NOT NULL,               -- 事件日期（YYYY-MM-DD）
  title TEXT NOT NULL,              -- 事件标题
  content TEXT,                     -- 事件详细描述
  color TEXT DEFAULT 'blue',        -- 颜色主题：blue/green/purple/red
  icon TEXT DEFAULT 'mdi-star',     -- 图标
  sort_order INTEGER DEFAULT 0,     -- 排序顺序（数字小的在前）
  created_at INTEGER NOT NULL,      -- 本地创建时间戳
  updated_at INTEGER NOT NULL       -- 本地更新时间戳
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_events(sort_order);
