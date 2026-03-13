import { useState, useEffect } from 'react';
import './TimelineAdmin.css';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

const API_BASE = '/api/timeline';
const AUTH_BASE = '/api/auth';

export default function TimelineAdmin() {
  // 認證狀態
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 登錄表單
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // 時間線數據
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 導入文本框
  const [importText, setImportText] = useState('');
  
  // 編輯狀態
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // 檢查登錄狀態
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 自動清除成功消息
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function checkAuthStatus() {
    try {
      const response = await fetch(`${AUTH_BASE}/me`, {
        credentials: 'include' // 包含 Cookie
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          loadEvents();
        }
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
    setIsLoginLoading(true);

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError('請輸入用戶名和密碼');
      setIsLoginLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        setError(null);
        loadEvents();
        setSuccessMessage(`歡迎回來，${data.user.username}！`);
      } else {
        setLoginError(data.error || '登錄失敗，請檢查用戶名和密碼');
      }
    } catch (err) {
      setLoginError('網絡連接失敗，請稍後重試');
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${AUTH_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setEvents([]);
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        setError('加載數據失敗');
      }
    } catch (err) {
      setError('網絡錯誤，無法加載數據');
    } finally {
      setLoading(false);
    }
  }

  async function saveEvent(event: TimelineEvent) {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event)
      });

      if (response.ok) {
        setEditingEvent(null);
        loadEvents();
        setSuccessMessage('保存成功！');
      } else {
        const data = await response.json();
        setError(data.error || '保存失敗');
      }
    } catch (err) {
      setError('網絡錯誤，保存失敗');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('確定要删除這個事件嗎？此操作不可撤銷。')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        loadEvents();
        setSuccessMessage('删除成功！');
      } else {
        const data = await response.json();
        setError(data.error || '删除失敗');
      }
    } catch (err) {
      setError('網絡錯誤，删除失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!importText.trim()) {
      setError('請輸入要導入的數據');
      return;
    }

    try {
      const lines = importText.trim().split('\n');
      const events = lines.map(line => {
        const parts = line.split('|');
        return {
          date: parts[0]?.trim() || '',
          title: parts[1]?.trim() || '',
          content: parts[2]?.trim() || ''
        };
      }).filter(e => e.date && e.title);

      if (events.length === 0) {
        setError('沒有有效的數據可導入');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ events })
      });

      if (response.ok) {
        const data = await response.json();
        setImportText('');
        loadEvents();
        setSuccessMessage(`成功導入 ${data.count} 個事件！`);
      } else {
        const data = await response.json();
        setError(data.error || '導入失敗');
      }
    } catch (err) {
      setError('數據格式錯誤或網絡錯誤');
    } finally {
      setLoading(false);
    }
  }

  // 登錄界面
  if (isLoading) {
    return (
      <div className="timeline-admin">
        <div className="loading">加載中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="timeline-admin">
        <div className="login-container">
          <h2>管理員登錄</h2>
          <p className="login-description">請使用您的用戶名和密碼登錄以管理時間線</p>
          
          {loginError && (
            <div className="error-message">{loginError}</div>
          )}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">用戶名</label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="輸入用戶名"
                disabled={isLoginLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密碼</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="輸入密碼"
                disabled={isLoginLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? '登錄中...' : '登錄'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 檢查權限
  if (user.role === 'viewer') {
    return (
      <div className="timeline-admin">
        <div className="access-denied">
          <h2>訪問被拒</h2>
          <p>您的賬戶（{user.username}）沒有編輯權限。</p>
          <p>需要管理員或編輯員權限才能管理時間線。</p>
          <button onClick={handleLogout} className="btn btn-secondary">
            登出
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-admin">
      {/* 頭部信息 */}
      <div className="admin-header">
        <div className="user-info">
          <span>當前用戶: <strong>{user.username}</strong></span>
          <span className="user-role">角色: {user.role}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
          登出
        </button>
      </div>

      {/* 成功/錯誤提示 */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* 導入區域 */}
      <div className="import-section">
        <h3>批量導入</h3>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="格式：日期|標題|內容（每行一個事件）&#10;例如：&#10;2024-01-01|新年快樂|祝大家新年快樂！&#10;2024-03-15|重要事件|這是一個重要事件"
          rows={4}
        />
        <button 
          onClick={handleImport} 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '導入中...' : '導入事件'}
        </button>
      </div>

      {/* 編輯表單 */}
      {editingEvent && (
        <div className="edit-form">
          <h3>{editingEvent.id ? '編輯事件' : '新建事件'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>日期</label>
              <input
                type="date"
                value={editingEvent.date}
                onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>標題</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                placeholder="事件標題"
              />
            </div>
          </div>
          <div className="form-group">
            <label>內容</label>
            <textarea
              value={editingEvent.content || ''}
              onChange={(e) => setEditingEvent({ ...editingEvent, content: e.target.value })}
              placeholder="事件詳細內容（可選）"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button 
              onClick={() => saveEvent(editingEvent)} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button 
              onClick={() => setEditingEvent(null)} 
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 事件列表 */}
      <div className="events-list">
        <div className="list-header">
          <h3>事件列表 ({events.length})</h3>
          <button 
            onClick={() => setEditingEvent({ id: '', date: '', title: '', content: '' })}
            className="btn btn-primary btn-sm"
          >
            + 新建事件
          </button>
        </div>

        {loading && events.length === 0 ? (
          <div className="loading">加載中...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">暫無事件，點擊上方按鈕創建第一個事件</div>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>標題</th>
                <th>內容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.date}</td>
                  <td>{event.title}</td>
                  <td>{event.content?.substring(0, 50)}...</td>
                  <td>
                    <button 
                      onClick={() => setEditingEvent(event)}
                      className="btn btn-secondary btn-sm"
                    >
                      編輯
                    </button>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="btn btn-danger btn-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
