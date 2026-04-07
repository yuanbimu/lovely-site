/// <reference types="@cloudflare/workers-types" />

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

// ========== Timeline Events ==========

export interface TimelineEventData {
  id: string;
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export async function saveTimelineEvent(db: D1Database, event: TimelineEventData) {
  await db.prepare(`
    INSERT OR REPLACE INTO timeline_events 
    (id, date, title, content, color, icon, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.id,
    event.date,
    event.title,
    event.content || null,
    event.color || 'blue',
    event.icon || 'mdi-star',
    event.sort_order || 0,
    Date.now(),
    Date.now()
  ).run();
}

export async function getTimelineEvents(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM timeline_events ORDER BY date DESC, sort_order ASC')
    .all();
  return result.results || [];
}

export async function deleteTimelineEvent(db: D1Database, id: string) {
  await db.prepare('DELETE FROM timeline_events WHERE id = ?').bind(id).run();
}

export async function bulkSaveTimelineEvents(db: D1Database, events: TimelineEventData[]) {
  // 使用事务批量导入
  const statements = events.map(event => db.prepare(`
    INSERT OR REPLACE INTO timeline_events 
    (id, date, title, content, color, icon, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.id,
    event.date,
    event.title,
    event.content || null,
    event.color || 'blue',
    event.icon || 'mdi-star',
    event.sort_order || 0,
    Date.now(),
    Date.now()
  ));
  
  await db.batch(statements);
}
// ========== User Authentication ==========

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: number;
}

export async function createUser(db: D1Database, user: Omit<User, 'created_at' | 'updated_at'>) {
  const now = Date.now();
  await db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    user.username,
    user.email,
    user.password_hash,
    user.role,
    now,
    now
  ).run();
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE username = ?')
    .bind(username)
    .first<User>();
  return result;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return result;
}

export async function createSession(db: D1Database, session: Omit<Session, 'created_at'>) {
  await db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(
    session.id,
    session.user_id,
    session.expires_at,
    Date.now()
  ).run();
}

export async function getSessionById(db: D1Database, id: string): Promise<Session | null> {
  const result = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(id, Date.now())
    .first<Session>();
  return result;
}

export async function deleteSession(db: D1Database, id: string) {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
}

export async function deleteExpiredSessions(db: D1Database) {
  await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run();
}

export async function updateUserPassword(db: D1Database, userId: string, newPasswordHash: string) {
  await db.prepare(`
    UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?
  `).bind(newPasswordHash, Date.now(), userId).run();
}

export async function getUsers(db: D1Database): Promise<User[]> {
  const result = await db.prepare('SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC').all<User>();
  return result.results || [];
}

export async function updateUserRole(db: D1Database, userId: string, role: string) {
  await db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').bind(role, Date.now(), userId).run();
}

export async function deleteUser(db: D1Database, userId: string) {
  await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}

// ========== Songs ==========

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  url?: string;
  release_date?: string;
  created_at: number;
  updated_at: number;
}

export async function getSongs(db: D1Database): Promise<Song[]> {
  const result = await db.prepare('SELECT * FROM songs ORDER BY release_date DESC').all<Song>();
  return result.results || [];
}

export async function saveSong(db: D1Database, song: Omit<Song, 'created_at' | 'updated_at'>) {
  const now = Date.now();
  await db.prepare(`
    INSERT OR REPLACE INTO songs (id, title, artist, cover_url, url, release_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    song.id,
    song.title,
    song.artist || '東愛璃 Lovely',
    song.cover_url || null,
    song.url || null,
    song.release_date || null,
    now, // For UPSERT, created_at will be replaced, ideally we'd preserve it but keeping it simple for now
    now
  ).run();
}

export async function deleteSong(db: D1Database, id: string) {
  await db.prepare('DELETE FROM songs WHERE id = ?').bind(id).run();
}

// ========== Showcase (橱窗) ==========

export interface Showcase {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  created_at: number;
  updated_at: number;
}

export async function getShowcases(db: D1Database): Promise<Showcase[]> {
  const result = await db.prepare('SELECT * FROM showcases ORDER BY sort_order ASC, created_at DESC').all<Showcase>();
  return result.results || [];
}

export async function saveShowcase(db: D1Database, showcase: Omit<Showcase, 'created_at' | 'updated_at'>) {
  const now = Date.now();
  await db.prepare(`
    INSERT OR REPLACE INTO showcases (id, name, description, image_url, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    showcase.id,
    showcase.name,
    showcase.description || null,
    showcase.image_url || null,
    showcase.sort_order || 0,
    now,
    now
  ).run();
}

export async function deleteShowcase(db: D1Database, id: string) {
  await db.prepare('DELETE FROM showcases WHERE id = ?').bind(id).run();
}

