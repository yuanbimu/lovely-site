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

  // 導入靜態櫥窗數據
  async function importStaticShowcases() {
    const staticShowcases = [
      { id: "model-1", name: "偶像服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-1.jpg", sort_order: 1 },
      { id: "model-2", name: "宅服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-2.jpg", sort_order: 2 },
      { id: "model-3", name: "JK服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-3.jpg", sort_order: 3 },
      { id: "model-4", name: "睡衣", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-4.jpg", sort_order: 4 },
      { id: "model-5", name: "袋鼠服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-5.jpg", sort_order: 5 },
      { id: "model-6", name: "诗紫苑", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-6.jpg", sort_order: 6 },
      { id: "model-7", name: "泳装", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-7.jpg", sort_order: 7 },
      { id: "model-8", name: "高马尾", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-8.jpg", sort_order: 8 },
      { id: "model-9", name: "紫色偶像服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-9.jpg", sort_order: 9 },
      { id: "model-10", name: "天使服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-10.jpg", sort_order: 10 },
      { id: "model-11", name: "旗袍", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-11.jpg", sort_order: 11 },
      { id: "model-12", name: "机娘", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-12.jpg", sort_order: 12 },
      { id: "model-13", name: "儿童服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-13.jpg", sort_order: 13 },
      { id: "model-14", name: "练习生服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-14.jpg", sort_order: 14 },
      { id: "model-15", name: "女仆装", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-15.jpg", sort_order: 15 },
      { id: "model-16", name: "璃月服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-16.jpg", sort_order: 16 },
      { id: "model-17", name: "兔女郎", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-17.jpg", sort_order: 17 },
      { id: "model-18", name: "冬季睡衣", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-18.jpg", sort_order: 18 },
      { id: "model-19", name: "王道偶像服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-19.jpg", sort_order: 19 },
      { id: "model-20", name: "女巫服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-20.jpg", sort_order: 20 },
      { id: "model-21", name: "弓箭手服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-21.jpg", sort_order: 21 },
      { id: "model-22", name: "圣女服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-22.jpg", sort_order: 22 },
      { id: "model-23", name: "社畜服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-23.jpg", sort_order: 23 },
      { id: "model-24", name: "星光服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-24.jpg", sort_order: 24 },
      { id: "model-25", name: "恶魔服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-25.jpg", sort_order: 25 },
      { id: "model-26", name: "炼金服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-26.jpg", sort_order: 26 },
      { id: "model-27", name: "和服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-27.jpg", sort_order: 27 },
      { id: "model-28", name: "玉女服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-28.jpg", sort_order: 28 },
      { id: "model-29", name: "重置宅服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-29.jpg", sort_order: 29 },
      { id: "model-30", name: "运动服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-30.jpg", sort_order: 30 },
      { id: "model-31", name: "幼稚园", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-31.jpg", sort_order: 31 },
      { id: "model-32", name: "？？服", description: "待編寫", image_url: "https://cdn.yuanbimu.top/showcase/model-32.jpg", sort_order: 32 },
    ];

    try {
      let successCount = 0;
      for (const showcase of staticShowcases) {
        const res = await fetch('/api/showcases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(showcase)
        });
        if (res.ok) successCount++;
      }
      loadShowcasesData();
      showMessage('success', `成功導入 ${successCount} 個櫥窗`);
    } catch {
      showMessage('error', '導入失敗');
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
                <input
                  type="text"
                  value={editingSong.cover_url || ''}
                  onChange={e => setEditingSong({...editingSong, cover_url: e.target.value})}
                  placeholder="封面圖片 URL"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
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
                <input
                  type="text"
                  value={editingShowcase.image_url || ''}
                  onChange={e => setEditingShowcase({...editingShowcase, image_url: e.target.value})}
                  placeholder="圖片 URL"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <div className="form-actions">
                  <button onClick={handleSaveShowcase}>保存</button>
                  <button className="btn-secondary" onClick={() => setEditingShowcase(null)}>取消</button>
                </div>
              </div>
            )}
            
            <div className="section">
              <div className="section-header">
                <h3>櫥窗列表 ({showcases.length})</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={importStaticShowcases} style={{ background: '#4A90D9' }}>
                    導入靜態數據
                  </button>
                  <button onClick={() => setEditingShowcase({ id: '', name: '', sort_order: 0 })}>
                    + 新增
                  </button>
                </div>
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
    </div>
  );
}
