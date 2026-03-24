-- =====================================================
-- D1 数据库完整初始化脚本 (包含管理员)
-- =====================================================

-- 0. 清除現有表（確保重新建立）
DROP TABLE IF EXISTS dynamics;
DROP TABLE IF EXISTS user_info;
DROP TABLE IF EXISTS live_status;
DROP TABLE IF EXISTS timeline_events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS songs;

-- 1. 动态表
CREATE TABLE IF NOT EXISTS dynamics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT,
  images TEXT,
  local_images TEXT,
  author TEXT,
  publish_time INTEGER NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. 用户信息表
CREATE TABLE IF NOT EXISTS user_info (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 3. 直播状态表
CREATE TABLE IF NOT EXISTS live_status (
  id INTEGER PRIMARY KEY,
  is_live INTEGER NOT NULL,
  title TEXT,
  room_id TEXT,
  url TEXT,
  checked_at INTEGER NOT NULL
);

-- 4. 时间线事件表
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'mdi-star',
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 5. 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 6. Sessions 表
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. 歌单表
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

-- 8. 创建索引
CREATE INDEX IF NOT EXISTS idx_dynamics_publish_time ON dynamics(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_dynamics_type ON dynamics(type);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_songs_created ON songs(created_at DESC);

-- 9. 初始化 Timeline 数据
INSERT OR REPLACE INTO timeline_events 
(id, date, title, content, color, icon, sort_order, created_at, updated_at)
VALUES 
('event_20200426', '2020-04-26', '在 B 站发表第一条动态', '', 'blue', '⭐', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('event_20200428', '2020-04-28', '投稿第一个视频，展示了自己的立绘', '', 'blue', '▶️', 2, strftime('%s', 'now'), strftime('%s', 'now')),
('event_20200429_1', '2020-04-29', '投稿自我介绍视频', '在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源。', 'green', '🎤', 3, strftime('%s', 'now'), strftime('%s', 'now')),
('event_20200501', '2020-05-01', '首次直播', '进行了首次正式直播，与观众互动。', 'purple', '🎬', 4, strftime('%s', 'now'), strftime('%s', 'now'));

-- 10. 添加管理员用户 (admin / admin123)
-- Hash: sha256('admin123' + 'lovely-site-salt')
INSERT OR REPLACE INTO users (id, username, email, password_hash, role, created_at, updated_at)
VALUES ('admin_init', 'admin', 'admin@lovely.site', '8465a583feb725b487b0c5d252684baf7ac879b2c24b60068ebef1777e70d89d', 'admin', strftime('%s', 'now'), strftime('%s', 'now'));
