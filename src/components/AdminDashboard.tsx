import { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  url?: string;
  release_date?: string;
  created_at?: number;
}

interface Showcase {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  image_url?: string;
  sort_order?: number;
  created_at?: number;
}

const AUTH_API = '/api/auth';
const TIMELINE_API = '/api/timeline';

export default function AdminDashboard() {
  // 認證狀態
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 登錄表單
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // 當前頁面
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard 數據
  const [stats, setStats] = useState({
    timelineCount: 0,
    userCount: 0,
    songCount: 0,
    lastUpdate: null as string | null
  });
  
  // Timeline 數據
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [importText, setImportText] = useState('');

  // 歌單數據
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  // 櫥窗數據
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
const [showImagePicker, setShowImagePicker] = useState(false);
const [r2Files, setR2Files] = useState<{type: string, name?: string, key: string, url: string}[]>([]);
const [r2Folders, setR2Folders] = useState<{name: string, key: string}[]>([]);
const [imagePickerType, setImagePickerType] = useState<'cover' | 'image'>('image');
const [showUploader, setShowUploader] = useState(false);
const [uploadFolder, setUploadFolder] = useState('showcase');
const [uploading, setUploading] = useState(false);

// 过滤当前目录的文件（排除根目录的文件）
const currentFolderFiles = r2Files.filter(f => {
  if (!uploadFolder) return false; // 不显示根目录文件
  return f.key.startsWith(uploadFolder + '/');
});
  
  // 用戶管理
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'editor' });
  
  // 消息提示
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 檢查登錄狀態
  useEffect(() => {
    checkAuth();
  }, []);

  // 加載數據
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
        const data: any = await res.json();
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
      
      const data: any = await res.json();
      if (res.ok) {
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        showMessage('success', `歡迎回來，${data.user.username}！`);
      } else {
        setLoginError(data.error || '登錄失敗');
      }
    } catch {
      setLoginError('網絡錯誤');
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
        fetch(TIMELINE_API, { credentials: 'include' }),
        user?.role === 'admin' ? fetch('/api/users', { credentials: 'include' }) : Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        fetch('/api/songs', { credentials: 'include' })
      ]);
      
      const timelineData: any = await timelineRes.json();
      const usersData: any = usersRes.ok ? await (usersRes as Response).json() : { data: [] };
      const songsData: any = songsRes.ok ? await (songsRes as Response).json() : { data: [] };

      setStats({
        timelineCount: timelineData.data?.length || 0,
        userCount: usersData.data?.length || 0,
        songCount: songsData.data?.length || 0,
        lastUpdate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async function loadTimelineData() {
    try {
      const res = await fetch(TIMELINE_API, { credentials: 'include' });
      const data: any = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      showMessage('error', '加載時間線失敗');
    }
  }

  async function loadUsersData() {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data: any = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        showMessage('error', data.error || '加載用戶失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
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
      const data: any = await res.json();
      if (res.ok) {
        setShowUserForm(false);
        setNewUser({ username: '', email: '', password: '', role: 'editor' });
        loadUsersData();
        loadDashboardData();
        showMessage('success', '用戶添加成功');
      } else {
        showMessage('error', data.error || '添加失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
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
        showMessage('success', '權限已更新');
      } else {
        showMessage('error', '更新失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('確定刪除該用戶？')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data: any = await res.json();
      if (res.ok) {
        loadUsersData();
        loadDashboardData();
        showMessage('success', '刪除成功');
      } else {
        showMessage('error', data.error || '刪除失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
    }
  }

  async function loadSongsData() {
    try {
      const res = await fetch('/api/songs', { credentials: 'include' });
      const data: any = await res.json();
      setSongs(data.data || []);
    } catch {
      showMessage('error', '加載歌單失敗');
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
        showMessage('error', '保存失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
    }
  }

  async function handleDeleteSong(id: string) {
    if (!confirm('確定刪除該歌曲？')) return;
    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        loadSongsData();
        showMessage('success', '刪除成功');
      }
    } catch {
      showMessage('error', '刪除失敗');
    }
  }

  // 櫥窗管理函數
  async function loadShowcasesData() {
    try {
      const res = await fetch('/api/showcases', { credentials: 'include' });
      const data: any = await res.json();
      setShowcases(data.data || []);
    } catch {
      showMessage('error', '加載櫥窗失敗');
    }
  }

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
        showMessage('error', '保存失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
    }
  }

  async function handleDeleteShowcase(id: string) {
    if (!confirm('確定刪除該櫥窗？')) return;
    try {
      const res = await fetch(`/api/showcases/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        loadShowcasesData();
        showMessage('success', '刪除成功');
      }
    } catch {
      showMessage('error', '刪除失敗');
    }
  }

  async function openImagePicker(type: 'cover' | 'image', folder?: string) {
    setImagePickerType(type);
    
    // 如果传入了 folder 或 editingShowcase 有 folder，则自动设置
    const targetFolder = folder || (type === 'image' ? editingShowcase?.folder : '');
    
    try {
      const res = await fetch('/api/r2-files', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        let folders = data.data.folders || [];
        
        // 如果目标目录不在列表中，动态添加
        if (targetFolder && !folders.find((f: { name: string }) => f.name === targetFolder)) {
          folders = [...folders, { name: targetFolder, key: targetFolder + '/' }];
        }
        
        setR2Folders(folders);
        setR2Files(data.data.files || []);
        
        // 自动设置目录（优先使用传入的 folder）
        if (targetFolder) {
          setUploadFolder(targetFolder);
        } else if (folders.length > 0) {
          setUploadFolder(folders[0].name); // 默认选第一个目录
        } else {
          setUploadFolder(''); // 无目录时清空
        }
        
        setShowImagePicker(true);
      }
    } catch {
      showMessage('error', '獲取文件列表失敗');
    }
  }

  function selectImage(url: string) {
    if (imagePickerType === 'cover') {
      setEditingSong(editingSong ? { ...editingSong, cover_url: url } : null);
    } else {
      setEditingShowcase(editingShowcase ? { ...editingShowcase, image_url: url } : null);
    }
    setShowImagePicker(false);
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);
      
      const res = await fetch('/api/r2-upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        showMessage('success', '上傳成功！');
        // 刷新文件列表
        const listRes = await fetch('/api/r2-files', { credentials: 'include' });
        const listData = await listRes.json();
        if (listData.success && listData.data) {
          setR2Folders(listData.data.folders || []);
          setR2Files(listData.data.files || []);
        }
      } else {
        showMessage('error', data.error || '上傳失敗');
      }
    } catch {
      showMessage('error', '上傳失敗');
    } finally {
      setUploading(false);
    }
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
        const data: any = await res.json();
        showMessage('error', data.error || '保存失敗');
      }
    } catch {
      showMessage('error', '網絡錯誤');
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('確定删除？')) return;
    
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
      showMessage('error', '删除失敗');
    }
  }

  async function handleImport() {
    if (!importText.trim()) return;
    
    const lines = importText.trim().split('\n');
    const events = lines.map(line => {
      const parts = line.split('|');
      return {
        date: parts[0]?.trim() || '',
        title: parts[1]?.trim() || '',
        content: parts[2]?.trim() || ''
      };
    }).filter(e => e.date && e.title);

    try {
      const res = await fetch(`${TIMELINE_API}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ events })
      });
      
      if (res.ok) {
        setImportText('');
        loadTimelineData();
        showMessage('success', `成功導入 ${events.length} 個事件！`);
      }
    } catch {
      showMessage('error', '導入失敗');
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  // 登錄界面
  if (isLoading) {
    return <div className="admin-loading">加載中...</div>;
  }

  if (!user) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h2>管理後台登錄</h2>
          <p>东爱璃 Lovely 应援站</p>
          
          {loginError && <div className="login-error">{loginError}</div>}
          
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="用戶名"
              value={loginForm.username}
              onChange={e => setLoginForm({...loginForm, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="密碼"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
            />
            <button type="submit">登錄</button>
          </form>
        </div>
      </div>
    );
  }

  // 檢查權限
  if (user.role === 'viewer') {
    return (
      <div className="admin-unauthorized">
        <h2>訪問被拒</h2>
        <p>您的賬戶沒有管理權限</p>
        <button onClick={handleLogout}>登出</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">🎀 东爱璃 Lovely</div>
          <div className="logo-sub">管理後台</div>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span> 概覽
          </button>
          <button 
            className={activeTab === 'timeline' ? 'active' : ''}
            onClick={() => setActiveTab('timeline')}
          >
            <span>📅</span> 時間線管理
          </button>
          <button 
            className={activeTab === 'songs' ? 'active' : ''}
            onClick={() => setActiveTab('songs')}
          >
            <span>🎵</span> 歌單管理
          </button>
          <button 
            className={activeTab === 'showcase' ? 'active' : ''}
            onClick={() => setActiveTab('showcase')}
          >
            <span>🖼️</span> 櫥窗管理
          </button>
          {user.role === 'admin' && (
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <span>👥</span> 用戶管理
            </button>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>登出</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h1>儀表板</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{stats.timelineCount}</div>
                <div className="stat-label">時間線事件</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.userCount}</div>
                <div className="stat-label">管理用戶</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎵</div>
                <div className="stat-value">{stats.songCount}</div>
                <div className="stat-label">歌單數量</div>
              </div>
            </div>
            
            <div className="quick-actions">
              <h2>快速操作</h2>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('timeline')}>
                  <span>➕</span> 添加時間線事件
                </button>
                {user.role === 'admin' && (
                  <button onClick={() => setActiveTab('users')}>
                    <span>👤</span> 添加管理員
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="tab-content">
            <h1>時間線管理</h1>
            
            {/* 導入區 */}
            <div className="section import-section">
              <h3>批量導入</h3>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="格式：日期|標題|內容&#10;2024-01-01|新年|內容描述"
                rows={4}
              />
              <button onClick={handleImport}>導入事件</button>
            </div>
            
            {/* 編輯表單 */}
            {editingEvent && (
              <div className="section edit-section">
                <h3>{editingEvent.id ? '編輯事件' : '新建事件'}</h3>
                <div className="form-grid">
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                  />
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                    placeholder="標題"
                  />
                </div>
                <textarea
                  value={editingEvent.content || ''}
                  onChange={e => setEditingEvent({...editingEvent, content: e.target.value})}
                  placeholder="內容（可選）"
                  rows={3}
                />
                <div className="form-actions">
                  <button onClick={() => saveEvent(editingEvent)}>保存</button>
                  <button className="btn-secondary" onClick={() => setEditingEvent(null)}>取消</button>
                </div>
              </div>
            )}
            
            {/* 事件列表 */}
            <div className="section">
              <div className="section-header">
                <h3>事件列表 ({events.length})</h3>
                <button onClick={() => setEditingEvent({ id: '', date: '', title: '', content: '' })}>
                  + 新建
                </button>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>標題</th>
                    <th>內容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.date}</td>
                      <td>{event.title}</td>
                      <td>{event.content?.substring(0, 50)}...</td>
                      <td className="actions">
                        <button onClick={() => setEditingEvent(event)}>編輯</button>
                        <button className="btn-danger" onClick={() => deleteEvent(event.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Songs Tab */}
        {activeTab === 'songs' && (
          <div className="tab-content">
            <h1>歌單管理</h1>
            
            {editingSong && (
              <div className="section edit-section">
                <h3>{editingSong.id ? '編輯歌曲' : '新增歌曲'}</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    value={editingSong.title}
                    onChange={e => setEditingSong({...editingSong, title: e.target.value})}
                    placeholder="歌名 (必填)"
                  />
                  <input
                    type="text"
                    value={editingSong.artist}
                    onChange={e => setEditingSong({...editingSong, artist: e.target.value})}
                    placeholder="歌手"
                  />
                  <input
                    type="date"
                    value={editingSong.release_date || ''}
                    onChange={e => setEditingSong({...editingSong, release_date: e.target.value})}
                    placeholder="發佈時間"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>封面圖片</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {editingSong.cover_url ? (
                      <img src={editingSong.cover_url} alt="cover" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
                    )}
                    <button type="button" onClick={() => openImagePicker('cover')} style={{ padding: '8px 16px', background: '#4A90D9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      選擇圖片
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={editingSong.url || ''}
                  onChange={e => setEditingSong({...editingSong, url: e.target.value})}
                  placeholder="歌曲連結 (Bilibili/網易雲 等)"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <div className="form-actions">
                  <button onClick={handleSaveSong}>保存</button>
                  <button className="btn-secondary" onClick={() => setEditingSong(null)}>取消</button>
                </div>
              </div>
            )}
            
            <div className="section">
              <div className="section-header">
                <h3>歌曲列表 ({songs.length})</h3>
                <button onClick={() => setEditingSong({ id: '', title: '', artist: '東愛璃 Lovely' })}>
                  + 新增
                </button>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>封面</th>
                    <th>歌名 / 歌手</th>
                    <th>發佈日</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map(song => (
                    <tr key={song.id}>
                      <td>
                        {song.cover_url ? (
                          <img src={song.cover_url} alt="cover" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
                        )}
                      </td>
                      <td>
                        <strong>{song.title}</strong>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>{song.artist}</div>
                      </td>
                      <td>{song.release_date || '-'}</td>
                      <td className="actions">
                        {song.url && <a href={song.url} target="_blank" rel="noreferrer" style={{ marginRight: '8px', color: '#8B6F47' }}>連結</a>}
                        <button onClick={() => setEditingSong(song)}>編輯</button>
                        <button className="btn-danger" onClick={() => handleDeleteSong(song.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Showcase Tab */}
        {activeTab === 'showcase' && (
          <div className="tab-content">
            <h1>櫥窗管理</h1>
            
            {editingShowcase && (
              <div className="section edit-section">
                <h3>{editingShowcase.id ? '編輯櫥窗' : '新增櫥窗'}</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    value={editingShowcase.name}
                    onChange={e => setEditingShowcase({...editingShowcase, name: e.target.value})}
                    placeholder="名稱 (必填)"
                  />
                  <input
                    type="text"
                    value={editingShowcase.folder || ''}
                    onChange={e => setEditingShowcase({...editingShowcase, folder: e.target.value})}
                    placeholder="目錄名 (如 model-1)"
                  />
                </div>
                <div className="form-grid">
                  <input
                    type="number"
                    value={editingShowcase.sort_order || 0}
                    onChange={e => setEditingShowcase({...editingShowcase, sort_order: parseInt(e.target.value) || 0})}
                    placeholder="排序"
                  />
                </div>
                <input
                  type="text"
                  value={editingShowcase.description || ''}
                  onChange={e => setEditingShowcase({...editingShowcase, description: e.target.value})}
                  placeholder="描述"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>櫥窗圖片</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {editingShowcase.image_url ? (
                      <img src={editingShowcase.image_url} alt="showcase" style={{ width: '80px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '80px', height: '100px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                    )}
                    <button type="button" onClick={() => openImagePicker('image', editingShowcase?.folder)} style={{ padding: '8px 16px', background: '#4A90D9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      選擇圖片
                    </button>
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={handleSaveShowcase}>保存</button>
                  <button className="btn-secondary" onClick={() => setEditingShowcase(null)}>取消</button>
                </div>
              </div>
            )}
            
            <div className="section">
              <div className="section-header">
                <h3>櫥窗列表 ({showcases.length})</h3>
                <button onClick={() => setEditingShowcase({ id: '', name: '', sort_order: 0 })}>
                  + 新增
                </button>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>圖片</th>
                    <th>名稱 / 描述</th>
                    <th>排序</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {showcases.map(showcase => (
                    <tr key={showcase.id}>
                      <td>
                        {showcase.image_url ? (
                          <img src={showcase.image_url} alt={showcase.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                        )}
                      </td>
                      <td>
                        <strong>{showcase.name}</strong>
                        {showcase.description && <div style={{ fontSize: '0.85em', color: '#666' }}>{showcase.description}</div>}
                      </td>
                      <td>{showcase.sort_order || 0}</td>
                      <td className="actions">
                        <button onClick={() => setEditingShowcase(showcase)}>編輯</button>
                        <button className="btn-danger" onClick={() => handleDeleteShowcase(showcase.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="tab-content">
            <div className="section-header">
              <h1>用戶管理</h1>
              <button onClick={() => setShowUserForm(!showUserForm)}>
                {showUserForm ? '取消' : '+ 新增管理員'}
              </button>
            </div>
            
            {showUserForm && (
              <div className="section edit-section">
                <h3>新建用戶</h3>
                <form onSubmit={handleAddUser} className="form-grid">
                  <input required type="text" placeholder="用戶名" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                  <input required type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  <input required type="password" placeholder="密碼" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="admin">管理員 (admin)</option>
                    <option value="editor">編輯者 (editor)</option>
                    <option value="viewer">檢視者 (viewer)</option>
                  </select>
                  <div className="form-actions">
                    <button type="submit">保存</button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="section">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>用戶名</th>
                    <th>Email</th>
                    <th>權限</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          disabled={u.id === user.id}
                        >
                          <option value="admin">管理員 (admin)</option>
                          <option value="editor">編輯者 (editor)</option>
                          <option value="viewer">檢視者 (viewer)</option>
                        </select>
                      </td>
                      <td className="actions">
                        <button className="btn-danger" onClick={() => handleDeleteUser(u.id)} disabled={u.id === user.id}>刪除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 圖片選擇器 Modal */}
      {showImagePicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '20px', maxWidth: '700px', maxHeight: '85vh',
            width: '90%', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#6B5637' }}>選擇圖片</h3>
              <button onClick={() => setShowImagePicker(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            {/* 上傳區域 */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 12px', background: '#4A90D9', color: 'white', borderRadius: '8px', fontSize: '14px' }}>
                  <span>📤</span>
                  <span>上傳圖片</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleUpload(file);
                    }}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <select 
                  value={uploadFolder} 
                  onChange={e => setUploadFolder(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="">選擇目錄</option>
                  {r2Folders.map(folder => (
                    <option key={folder.name} value={folder.name}>{folder.name}</option>
                  ))}
                </select>
                {uploading && <span style={{ color: '#4A90D9', fontSize: '14px' }}>上傳中...</span>}
              </div>
              {uploadFolder && <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>當前目錄: <strong>{uploadFolder}</strong></div>}
            </div>

            <div style={{ overflow: 'auto', flex: 1 }}>
              {/* 文件夹列表 */}
              {r2Folders.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>📁 目錄</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {r2Folders.map(folder => (
                      <button
                        key={folder.name}
                        onClick={() => setUploadFolder(folder.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: uploadFolder === folder.name ? '2px solid #6B5637' : '1px solid #ddd',
                          background: uploadFolder === folder.name ? '#f5f0e8' : 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {currentFolderFiles.filter(f => f.key.match(/\.(jpg|jpeg|png|gif|webp)$/i)).map(file => (
                  <div key={file.key} onClick={() => selectImage(file.url)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={file.url} alt={file.key} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                    <div style={{ fontSize: '10px', padding: '4px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.key}</div>
                  </div>
                ))}
              </div>
              {currentFolderFiles.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暫無圖片文件，請上傳</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
