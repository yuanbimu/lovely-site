export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
}

export interface DynamicData {
  id: string;
  type: string;
  content: string;
  images: string[];
  local_images?: string[];
  author: string;
  publish_time: number;
  likes: number;
  comments: number;
  reposts: number;
}

export async function saveDynamic(db: D1Database, dynamic: DynamicData) {
  await db.prepare(`
    INSERT OR REPLACE INTO dynamics 
    (id, type, content, images, local_images, author, publish_time, likes, comments, reposts, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    dynamic.id,
    dynamic.type,
    dynamic.content,
    JSON.stringify(dynamic.images),
    JSON.stringify(dynamic.local_images || []),
    dynamic.author,
    dynamic.publish_time,
    dynamic.likes,
    dynamic.comments,
    dynamic.reposts,
    Date.now(),
    Date.now()
  ).run();
}

export async function getDynamics(db: D1Database, limit: number = 20, offset: number = 0) {
  const result = await db
    .prepare('SELECT * FROM dynamics ORDER BY publish_time DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all();
  return result.results;
}

export async function saveUserInfo(db: D1Database, key: string, value: any) {
  await db.prepare(`
    INSERT OR REPLACE INTO user_info (key, value, updated_at)
    VALUES (?, ?, ?)
  `).bind(key, JSON.stringify(value), Date.now()).run();
}

export async function getUserInfo(db: D1Database, key: string) {
  const result = await db
    .prepare('SELECT value FROM user_info WHERE key = ?')
    .bind(key)
    .first<{ value: string }>();
  return result ? JSON.parse(result.value) : null;
}

export async function saveLiveStatus(db: D1Database, status: {
  is_live: boolean;
  title?: string;
  room_id?: string;
  url?: string;
}) {
  await db.prepare(`
    INSERT OR REPLACE INTO live_status (id, is_live, title, room_id, url, checked_at)
    VALUES (1, ?, ?, ?, ?, ?)
  `).bind(
    status.is_live ? 1 : 0,
    status.title || null,
    status.room_id || null,
    status.url || null,
    Date.now()
  ).run();
}

export async function getLiveStatus(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM live_status WHERE id = 1')
    .first<{
      is_live: number;
      title: string | null;
      room_id: string | null;
      url: string | null;
      checked_at: number;
    }>();
  
  if (!result) return null;
  
  return {
    isLive: result.is_live === 1,
    title: result.title || '',
    roomId: result.room_id || '',
    url: result.url || '',
    checkedAt: result.checked_at
  };
}
