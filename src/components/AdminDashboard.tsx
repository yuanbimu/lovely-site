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
    lastUpdate: null as string | null
  });
  
  // Timeline 數據
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [importText, setImportText] = useState('');
  
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
      const [timelineRes] = await Promise.all([
        fetch(TIMELINE_API, { credentials: 'include' })
      ]);
      
      const timelineData = await timelineRes.json();
      setStats({
        timelineCount: timelineData.data?.length || 0,
        userCount: 0,
        lastUpdate: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async function loadTimelineData() {
    try {
      const res = await fetch(TIMELINE_API, { credentials: 'include' });
      const data = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      showMessage('error', '加載時間線失敗');
    }
  }

  async function loadUsersData() {
    // 這裡需要一個獲取所有用戶的 API
    // 暫時留空
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
                <div className="stat-value">0</div>
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

        {/* Users Tab */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="tab-content">
            <h1>用戶管理</h1>
            <p>用戶管理功能開發中...</p>
          </div>
        )}
      </main>
    </div>
  );
}
