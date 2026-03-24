-- =====================================================
-- D1 数据库完整初始化脚本
-- =====================================================
-- 执行方式 (本地): wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
-- 执行方式 (生产): wrangler d1 execute lovely-site-db --file=scripts/init-db.sql

-- =====================================================
-- 1. 动态表
-- =====================================================
CREATE TABLE IF NOT EXISTS dynamics (
  id TEXT PRIMARY KEY,              -- B 站动态 ID
  type TEXT NOT NULL,               -- 类型：text/image/video/article
  content TEXT,                     -- 文字内容
  images TEXT,                      -- 图片 URL 数组 (JSON)
  local_images TEXT,                -- R2 本地路径数组 (JSON)
  author TEXT,                      -- 作者名
  publish_time INTEGER NOT NULL,    -- 发布时间戳
  likes INTEGER DEFAULT 0,          -- 点赞数
  comments INTEGER DEFAULT 0,       -- 评论数
  reposts INTEGER DEFAULT 0,        -- 转发数
  created_at INTEGER NOT NULL,      -- 本地创建时间戳
  updated_at INTEGER NOT NULL       -- 本地更新时间戳
);

-- =====================================================
-- 2. 用户信息表
-- =====================================================
CREATE TABLE IF NOT EXISTS user_info (
  key TEXT PRIMARY KEY,             -- 键名
  value TEXT NOT NULL,              -- JSON 值
  updated_at INTEGER NOT NULL       -- 更新时间戳
);

-- =====================================================
-- 3. 直播状态表
-- =====================================================
CREATE TABLE IF NOT EXISTS live_status (
  id INTEGER PRIMARY KEY,           -- 固定为 1
  is_live INTEGER NOT NULL,         -- 是否直播
  title TEXT,                       -- 直播标题
  room_id TEXT,                     -- 房间号
  url TEXT,                         -- 直播间 URL
  checked_at INTEGER NOT NULL       -- 检查时间戳
);

-- =====================================================
-- 4. 时间线事件表
-- =====================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,              -- 事件 ID(UUID)
  date TEXT NOT NULL,               -- 事件日期 (YYYY-MM-DD)
  title TEXT NOT NULL,              -- 事件标题
  content TEXT,                     -- 事件详细描述
  color TEXT DEFAULT 'blue',        -- 颜色主题:blue/green/purple/red
  icon TEXT DEFAULT 'mdi-star',     -- 图标
  sort_order INTEGER DEFAULT 0,     -- 排序顺序 (数字小的在前)
  created_at INTEGER NOT NULL,      -- 本地创建时间戳
  updated_at INTEGER NOT NULL       -- 本地更新时间戳
);

-- =====================================================
-- 5. 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- =====================================================
-- 6. Sessions 表
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- 7. 歌单表
-- =====================================================
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  url TEXT,
  release_date TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- =====================================================
-- 8. 创建索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dynamics_publish_time ON dynamics(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_dynamics_type ON dynamics(type);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_songs_created ON songs(created_at DESC);

-- =====================================================
-- 9. 初始化 Timeline 数据 (东爱璃早期重要事件)
-- =====================================================
INSERT OR REPLACE INTO timeline_events 
(id, date, title, content, color, icon, sort_order, created_at, updated_at)
VALUES 
(
  'event_20200426',
  '2020-04-26',
  '在 B 站发表第一条动态',
  '',
  'blue',
  '⭐',
  1,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200428',
  '2020-04-28',
  '投稿第一个视频，展示了自己的立绘',
  '',
  'blue',
  '▶️',
  2,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200429_1',
  '2020-04-29',
  '投稿自我介绍视频',
  '在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源。',
  'green',
  '🎤',
  3,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200501',
  '2020-05-01',
  '首次直播',
  '进行了首次正式直播，与观众互动。',
  'purple',
  '🎬',
  4,
  strftime('%s', 'now'),
  strftime('%s', 'now')
);
