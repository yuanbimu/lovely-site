import { useState, useEffect } from 'react';
import './TimelineAdmin.css';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  tag?: string;
  sort_order?: number;
}

// 标签系统：标签名 -> { color, icon }
const TAG_MAP: Record<string, { color: string; icon: string }> = {
  '首播': { color: 'purple', icon: '🎤' },
  '歌回': { color: 'green', icon: '🎵' },
  '游戏': { color: 'teal', icon: '🎮' },
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

const TAG_NAMES = Object.keys(TAG_MAP);

function resolveTag(tagName?: string): { color: string; icon: string } {
  if (tagName && TAG_MAP[tagName]) {
    return TAG_MAP[tagName];
  }
  return { color: 'blue', icon: '⭐' };
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
  // 认证状态
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 登录表单
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // 时间线数据
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 导入文本框
  const [importText, setImportText] = useState('');
  
  // 编辑状态
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 自动清除成功消息
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
      setLoginError('请输入用户名和密码');
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
        setSuccessMessage(`欢迎回来，${data.user.username}！`);
      } else {
        setLoginError(data.error || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      setLoginError('网络连接失败，请稍后重试');
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
        setError('加载数据失败');
      }
    } catch (err) {
      setError('网络错误，无法加载数据');
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
        setError(data.error || '保存失败');
      }
    } catch (err) {
      setError('网络错误，保存失败');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('确定要删除这个事件吗？此操作不可撤销。')) {
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
        setError(data.error || '删除失败');
      }
    } catch (err) {
      setError('网络错误，删除失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!importText.trim()) {
      setError('请输入要导入的数据');
      return;
    }

    try {
      const lines = importText.trim().split('\n');
      const events = lines.map(line => {
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

      if (events.length === 0) {
        setError('没有有效的数据可导入');
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
        setSuccessMessage(`成功导入 ${data.count} 个事件！`);
      } else {
        const data = await response.json();
        setError(data.error || '导入失败');
      }
    } catch (err) {
      setError('数据格式错误或网络错误');
    } finally {
      setLoading(false);
    }
  }

  // 登录界面
  if (isLoading) {
    return (
      <div className="timeline-admin">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="timeline-admin">
        <div className="login-container">
          <h2>管理员登录</h2>
          <p className="login-description">请使用您的用户名和密码登录以管理时间线</p>
          
          {loginError && (
            <div className="error-message">{loginError}</div>
          )}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="输入用户名"
                disabled={isLoginLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="输入密码"
                disabled={isLoginLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 检查权限
  if (user.role === 'viewer') {
    return (
      <div className="timeline-admin">
        <div className="access-denied">
          <h2>访问被拒</h2>
          <p>您的账户（{user.username}）没有编辑权限。</p>
          <p>需要管理员或编辑员权限才能管理时间线。</p>
          <button onClick={handleLogout} className="btn btn-secondary">
            登出
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-admin">
      {/* 头部信息 */}
      <div className="admin-header">
        <div className="user-info">
          <span>当前用户: <strong>{user.username}</strong></span>
          <span className="user-role">角色: {user.role}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
          登出
        </button>
      </div>

      {/* 成功/错误提示 */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* 导入区域 */}
      <div className="import-section">
        <h3>批量导入</h3>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="格式：日期|标题|内容|标签（每行一个事件）&#10;例如：&#10;2024-01-01|新年快乐|祝大家新年快乐！|重要&#10;2024-03-15|首次歌回|唱了多首经典歌曲|首播&#10;标签可选：首播、歌回、游戏、3D披露、新衣装、纪念回、联动、重要、生日、周年、活动、日常"
          rows={4}
        />
        <button 
          onClick={handleImport} 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '导入中...' : '导入事件'}
        </button>
      </div>

      {/* 编辑表单 */}
      {editingEvent && (
        <div className="edit-form">
          <h3>{editingEvent.id ? '编辑事件' : '新建事件'}</h3>
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
              <label>标题</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                placeholder="事件标题"
              />
            </div>
          </div>
          <div className="form-group">
            <label>内容</label>
            <textarea
              value={editingEvent.content || ''}
              onChange={(e) => setEditingEvent({ ...editingEvent, content: e.target.value })}
              placeholder="事件详细内容（可选）"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>标签</label>
            <select
              value={editingEvent.tag || ''}
              onChange={(e) => {
                const tagName = e.target.value;
                const resolved = resolveTag(tagName);
                setEditingEvent({
                  ...editingEvent,
                  tag: tagName,
                  color: resolved.color,
                  icon: resolved.icon
                });
              }}
            >
              <option value="">请选择标签</option>
              {TAG_NAMES.map(tag => (
                <option key={tag} value={tag}>
                  {TAG_MAP[tag].icon} {tag}
                </option>
              ))}
            </select>
            <div className="tag-presets">
              {TAG_NAMES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-preset ${editingEvent.tag === tag ? 'active' : ''}`}
                  onClick={() => {
                    const resolved = resolveTag(tag);
                    setEditingEvent({
                      ...editingEvent,
                      tag,
                      color: resolved.color,
                      icon: resolved.icon
                    });
                  }}
                >
                  {TAG_MAP[tag].icon} {tag}
                </button>
              ))}
            </div>
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
            onClick={() => setEditingEvent({ id: '', date: '', title: '', content: '', tag: '', color: 'blue', icon: '⭐' })}
            className="btn btn-primary btn-sm"
          >
            + 新建事件
          </button>
        </div>

        {loading && events.length === 0 ? (
          <div className="loading">加载中...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">暂无事件，点击上方按钮创建第一个事件</div>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>标题</th>
                <th>内容</th>
                <th>标签</th>
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
                    {event.tag ? (
                      <span className="tag-badge">
                        {resolveTag(event.tag).icon} {event.tag}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <button 
                      onClick={() => setEditingEvent(event)}
                      className="btn btn-secondary btn-sm"
                    >
                      编辑
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
