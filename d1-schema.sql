-- 动态表
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

-- 用户信息表
CREATE TABLE IF NOT EXISTS user_info (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 直播状态表
CREATE TABLE IF NOT EXISTS live_status (
  id INTEGER PRIMARY KEY,
  is_live INTEGER NOT NULL,
  title TEXT,
  room_id TEXT,
  url TEXT,
  checked_at INTEGER NOT NULL
);

-- 时间线事件表
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

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions 表
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dynamics_publish_time ON dynamics(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_dynamics_type ON dynamics(type);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
