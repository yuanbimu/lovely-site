// Admin Dashboard 共享类型定义

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  tag?: string;
  sort_order?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  url?: string;
  release_date?: string;
  created_at?: number;
}

export interface Showcase {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  image_url?: string;
  sort_order?: number;
  created_at?: number;
}

export interface Stats {
  timelineCount: number;
  userCount: number;
  songCount: number;
  lastUpdate: string | null;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface FolderImage {
  key: string;
  url: string;
}

// 路径映射：数据库字段 model-N <-> R2 路径 showcase/model-N
export function toR2Path(folder: string): string {
  return folder ? `showcase/${folder}` : '';
}

export function toDisplayPath(folder: string): string {
  return folder ? `showcase/${folder}` : '';
}
