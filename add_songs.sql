-- 歌单 (Songs) 表格
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '東愛璃 Lovely',
  cover_url TEXT,
  url TEXT,
  release_date TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_songs_release_date ON songs(release_date DESC);
