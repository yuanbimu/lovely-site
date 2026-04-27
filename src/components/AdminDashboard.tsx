import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import ImagePicker from './ImagePicker';
import AdminLogin from './admin/AdminLogin';
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboardTab from './admin/tabs/AdminDashboardTab';
import AdminTimelineTab from './admin/tabs/AdminTimelineTab';
import AdminSongsTab from './admin/tabs/AdminSongsTab';
import AdminShowcaseTab from './admin/tabs/AdminShowcaseTab';
import AdminUsersTab from './admin/tabs/AdminUsersTab';
import type {
  User,
  TimelineEvent,
  Song,
  Showcase,
  Stats,
  Message,
  LoginForm,
  NewUser,
  FolderImage
} from './admin/types';
import { toR2Path } from './admin/types';

const AUTH_API = '/api/auth';
const TIMELINE_API = '/api/timeline';

export default function AdminDashboard() {
  // 认证状态
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 登录表单
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // 当前页面
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard 数据
  const [stats, setStats] = useState<Stats>({
    timelineCount: 0,
    userCount: 0,
    songCount: 0,
    lastUpdate: null
  });
  
  // Timeline 数据
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [importText, setImportText] = useState('');
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineLimit, setTimelineLimit] = useState(20);
  const [timelineTotal, setTimelineTotal] = useState(0);

  // 歌单数据
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  // 橱窗数据
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
  const [maxShowcaseSort, setMaxShowcaseSort] = useState(0);
  const [folderImages, setFolderImages] = useState<FolderImage[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerType, setImagePickerType] = useState<'cover' | 'image'>('image');
  const [uploading, setUploading] = useState(false);
  
  // 用户管理
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({ username: '', email: '', password: '', role: 'editor' });
  
  // 消息提示
  const [message, setMessage] = useState<Message | null>(null);

  // 检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 加载数据
  useEffect(() => {
    if (user) {
      if (activeTab === 'dashboard') loadDashboardData();
      if (activeTab === 'timeline') loadTimelineData();
      if (activeTab === 'users' && user.role === 'admin') loadUsersData();
      if (activeTab === 'songs') loadSongsData();
      if (activeTab === 'showcase') loadShowcasesData();
    }
  }, [user, activeTab]);

  async function checkAuth() {
    try {
      const res = await fetch(`${AUTH_API}/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        showMessage('success', `欢迎回来，${data.user.username}！`);
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch {
      setLoginError('网络错误');
    }
  }

  async function handleLogout() {
    await fetch(`${AUTH_API}/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setActiveTab('dashboard');
  }

  async function loadDashboardData() {
    try {
      const [timelineRes, usersRes, songsRes] = await Promise.all([
        fetch(`${TIMELINE_API}?page=1&limit=1`, { credentials: 'include' }),
        user?.role === 'admin' ? fetch('/api/users', { credentials: 'include' }) : Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response),
        fetch('/api/songs', { credentials: 'include' })
      ]);

      const timelineData = await timelineRes.json();
      const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
      const songsData = await songsRes.json();

      setStats({
        timelineCount: timelineData.total || 0,
        userCount: usersData.data?.length || 0,
        songCount: songsData.data?.length || 0,
        lastUpdate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async function loadTimelineData(page = timelinePage, limit = timelineLimit) {
    try {
      const res = await fetch(`${TIMELINE_API}?page=${page}&limit=${limit}`, { credentials: 'include' });
      const data = await res.json();
      setEvents(data.data || []);
      setTimelineTotal(data.total || 0);
      setTimelinePage(data.page || page);
      setTimelineLimit(data.limit || limit);
    } catch {
      showMessage('error', '加载时间线失败');
    }
  }

  async function loadUsersData() {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        showMessage('error', data.error || '加载用户失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setShowUserForm(false);
        setNewUser({ username: '', email: '', password: '', role: 'editor' });
        loadUsersData();
        loadDashboardData();
        showMessage('success', '用户添加成功');
      } else {
        showMessage('error', data.error || '添加失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function handleUpdateRole(id: string, role: string) {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        loadUsersData();
        showMessage('success', '权限已更新');
      } else {
        showMessage('error', '更新失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('确定删除该用户？')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        loadUsersData();
        loadDashboardData();
        showMessage('success', '删除成功');
      } else {
        showMessage('error', data.error || '删除失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function loadSongsData() {
    try {
      const res = await fetch('/api/songs', { credentials: 'include' });
      const data = await res.json();
      setSongs(data.data || []);
    } catch {
      showMessage('error', '加载歌单失败');
    }
  }

  async function handleSaveSong() {
    if (!editingSong) return;
    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingSong)
      });
      if (res.ok) {
        setEditingSong(null);
        loadSongsData();
        showMessage('success', '保存成功');
      } else {
        showMessage('error', '保存失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function handleDeleteSong(id: string) {
    if (!confirm('确定删除该歌曲？')) return;
    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        loadSongsData();
        showMessage('success', '删除成功');
      }
    } catch {
      showMessage('error', '删除失败');
    }
  }

  // 橱窗管理函数
  async function loadShowcasesData() {
    try {
      const res = await fetch('/api/showcases', { credentials: 'include' });
      const data = await res.json();
      const showcasesData = data.data || [];
      setShowcases(showcasesData);
      
      const maxSort = showcasesData.reduce((max: number, s: Showcase) => 
        Math.max(max, s.sort_order || 0), 0);
      setMaxShowcaseSort(maxSort);
    } catch {
      showMessage('error', '加载橱窗失败');
    }
  }

  async function loadFolderImages(folder: string) {
    if (!folder) {
      setFolderImages([]);
      return;
    }
    const r2Folder = folder.startsWith('showcase/') ? folder : toR2Path(folder);
    try {
      const prefix = r2Folder + '/';
      const res = await fetch(`/api/r2-files?prefix=${encodeURIComponent(prefix)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        const images = (data.data.files || [])
          .filter((f: { key: string, url: string }) => 
            f.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !f.key.endsWith('.folder')
          )
          .map((f: { key: string, url: string }) => ({ key: f.key, url: f.url }));
        setFolderImages(images);
      }
    } catch {
      showMessage('error', '加载图片失败');
    }
  }

  async function deleteR2Image(key: string) {
    if (!confirm('确定删除该图片？')) return;
    try {
      const res = await fetch(`/api/r2-files/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showMessage('success', '删除成功');
        if (editingShowcase?.folder) {
          loadFolderImages(editingShowcase.folder);
        }
      } else {
        showMessage('error', '删除失败');
      }
    } catch {
      showMessage('error', '删除失败');
    }
  }

  const setEditingShowcaseWithImages = (showcase: Showcase | null) => {
    setEditingShowcase(showcase);
    if (showcase?.folder) {
      loadFolderImages(showcase.folder);
    } else {
      setFolderImages([]);
    }
  };

  async function handleSaveShowcase() {
    if (!editingShowcase) return;
    try {
      const res = await fetch('/api/showcases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingShowcase)
      });
      if (res.ok) {
        setEditingShowcase(null);
        loadShowcasesData();
        showMessage('success', '保存成功');
      } else {
        showMessage('error', '保存失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function handleDeleteShowcase(id: string) {
    if (!confirm('确定删除该橱窗？')) return;
    try {
      const res = await fetch(`/api/showcases/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        loadShowcasesData();
        showMessage('success', '删除成功');
      }
    } catch {
      showMessage('error', '删除失败');
    }
  }

  function openImagePicker(type: 'cover' | 'image') {
    if (type === 'image' && editingShowcase?.id && !editingShowcase?.folder) {
      showMessage('error', '请先在橱窗编辑表单中填写「目录名称」');
      return;
    }
    setImagePickerType(type);
    setShowImagePicker(true);
  }

  function handleSelectImage(url: string) {
    if (imagePickerType === 'cover') {
      setEditingSong(prev => prev ? { ...prev, cover_url: url } : null);
    } else {
      setEditingShowcase(prev => prev ? { ...prev, image_url: url } : null);
    }
    setShowImagePicker(false);
  }

  async function saveEvent(event: TimelineEvent) {
    try {
      const res = await fetch(TIMELINE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event)
      });
      
      if (res.ok) {
        setEditingEvent(null);
        loadTimelineData();
        showMessage('success', '保存成功！');
      } else {
        const data = await res.json();
        showMessage('error', data.error || '保存失败');
      }
    } catch {
      showMessage('error', '网络错误');
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('确定删除？')) return;
    
    try {
      const res = await fetch(`${TIMELINE_API}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        loadTimelineData();
        showMessage('success', '删除成功！');
      }
    } catch {
      showMessage('error', '删除失败');
    }
  }

  async function handleImport() {
    if (!importText.trim()) return;

    const lines = importText.trim().split('\n');
    const eventsToImport = lines.map(line => {
      const parts = line.split('|');
      const tagName = parts[3]?.trim() || '';
      const resolved = resolveTag(tagName);
      return {
        date: parts[0]?.trim() || '',
        title: parts[1]?.trim() || '',
        content: parts[2]?.trim() || '',
        tag: tagName,
        color: resolved.color,
        icon: resolved.icon
      };
    }).filter(e => e.date && e.title);

    try {
      const res = await fetch(`${TIMELINE_API}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ events: eventsToImport })
      });

      if (res.ok) {
        setImportText('');
        loadTimelineData();
        showMessage('success', `成功导入 ${eventsToImport.length} 个事件！`);
      }
    } catch {
      showMessage('error', '导入失败');
    }
  }

  // 标签系统：标签名 -> { color, icon }
  const TAG_MAP: Record<string, { color: string; icon: string }> = {
  '首播': { color: 'purple', icon: '🎤' },
  '歌回': { color: 'green', icon: '🎵' },
  '游戏': { color: 'teal', icon: '🎮' },
  '视频投稿': { color: 'cyan', icon: '📹' },
    '3D披露': { color: 'violet', icon: '👤' },
    '新衣装': { color: 'orange', icon: '👗' },
    '纪念回': { color: 'red', icon: '🏆' },
    '联动': { color: 'blue', icon: '🤝' },
    '重要': { color: 'red', icon: '⭐' },
    '生日': { color: 'yellow', icon: '🎂' },
    '周年': { color: 'amber', icon: '🎉' },
    '活动': { color: 'slate', icon: '📅' },
    '日常': { color: 'gray', icon: '📝' },
  };

  function resolveTag(tagName?: string): { color: string; icon: string } {
    if (tagName && TAG_MAP[tagName]) {
      return TAG_MAP[tagName];
    }
    return { color: 'blue', icon: '⭐' };
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleUploadToFolder(file: File) {
    if (!file || !editingShowcase?.folder) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', toR2Path(editingShowcase.folder));
      
      const res = await fetch('/api/r2-upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        showMessage('success', '上传成功！');
        loadFolderImages(editingShowcase.folder);
      } else {
        showMessage('error', data.error || '上传失败');
      }
    } catch {
      showMessage('error', '上传失败');
    } finally {
      setUploading(false);
    }
  }

  // 登录界面
  if (isLoading) {
    return <div className="admin-loading">加载中...</div>;
  }

  if (!user) {
    return (
      <AdminLogin
        loginForm={loginForm}
        loginError={loginError}
        onUsernameChange={(value) => setLoginForm(prev => ({ ...prev, username: value }))}
        onPasswordChange={(value) => setLoginForm(prev => ({ ...prev, password: value }))}
        onSubmit={handleLogin}
      />
    );
  }

  // 检查权限
  if (user.role === 'viewer') {
    return (
      <div className="admin-unauthorized">
        <h2>访问被拒</h2>
        <p>您的账户没有管理权限</p>
        <button onClick={handleLogout}>登出</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="admin-main">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            user={user}
            stats={stats}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'timeline' && (
          <AdminTimelineTab
            events={events}
            editingEvent={editingEvent}
            importText={importText}
            total={timelineTotal}
            page={timelinePage}
            limit={timelineLimit}
            onEditEvent={setEditingEvent}
            onSaveEvent={saveEvent}
            onDeleteEvent={deleteEvent}
            onImport={handleImport}
            onImportTextChange={setImportText}
            onUpdateEditingEvent={setEditingEvent}
            onPageChange={(p) => loadTimelineData(p, timelineLimit)}
            onLimitChange={(l) => loadTimelineData(1, l)}
          />
        )}

        {activeTab === 'songs' && (
          <AdminSongsTab
            songs={songs}
            editingSong={editingSong}
            onEditSong={setEditingSong}
            onUpdateEditingSong={setEditingSong}
            onSaveSong={handleSaveSong}
            onDeleteSong={handleDeleteSong}
            onOpenImagePicker={() => openImagePicker('cover')}
          />
        )}

        {activeTab === 'showcase' && (
          <AdminShowcaseTab
            showcases={showcases}
            editingShowcase={editingShowcase}
            folderImages={folderImages}
            uploading={uploading}
            maxShowcaseSort={maxShowcaseSort}
            onEditShowcase={setEditingShowcaseWithImages}
            onUpdateEditingShowcase={setEditingShowcase}
            onSaveShowcase={handleSaveShowcase}
            onDeleteShowcase={handleDeleteShowcase}
            onDeleteR2Image={deleteR2Image}
            onOpenImagePicker={() => openImagePicker('image')}
            onUploadToFolder={handleUploadToFolder}
          />
        )}

        {activeTab === 'users' && user.role === 'admin' && (
          <AdminUsersTab
            users={users}
            showUserForm={showUserForm}
            newUser={newUser}
            currentUser={user}
            onToggleUserForm={() => setShowUserForm(prev => !prev)}
            onUpdateNewUser={setNewUser}
            onAddUser={handleAddUser}
            onUpdateRole={handleUpdateRole}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleSelectImage}
        type={imagePickerType}
        showcaseFolder={editingShowcase?.folder}
      />
    </div>
  );
}
