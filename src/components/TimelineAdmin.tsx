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

interface ApiResponse {
  data?: TimelineEvent[];
  success?: boolean;
  error?: string;
  message?: string;
  count?: number;
}

const API_BASE = '/api/timeline';

export default function TimelineAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 导入文本框
  const [importText, setImportText] = useState('');
  
  // 编辑状态
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // 检查本地存储的 token
  useEffect(() => {
    const savedToken = localStorage.getItem('timeline_admin_token');
    if (savedToken) {
      setToken(savedToken);
      // 验证 token 是否有效
      verifyToken(savedToken);
    }
  }, []);

  // 自动清除成功消息
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function verifyToken(testToken: string) {
    try {
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        loadEvents();
      } else {
        localStorage.removeItem('timeline_admin_token');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setError('请输入 Token');
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        }
      });

      if (response.ok) {
        localStorage.setItem('timeline_admin_token', token.trim());
        setIsAuthenticated(true);
        setError(null);
        loadEvents();
      } else {
        setError('Token 无效，请检查后重试');
        localStorage.removeItem('timeline_admin_token');
      }
    } catch (err) {
      setError('网络连接失败，请稍后重试');
    }
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.data) {
        setEvents(result.data);
      } else {
        setError(result.error || '加载失败');
      }
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!importText.trim()) {
      setError('请输入要导入的数据');
      return;
    }

    setLoading(true);
    try {
      const jsonData = JSON.parse(importText);
      const eventsToImport = Array.isArray(jsonData) ? jsonData : jsonData.events;

      if (!Array.isArray(eventsToImport)) {
        throw new Error('数据格式必须是数组或包含 events 数组的对象');
      }

      const response = await fetch(`${API_BASE}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ events: eventsToImport })
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(`成功导入 ${result.count} 条事件`);
        setImportText('');
        loadEvents();
      } else {
        setError(result.error || '导入失败');
      }
    } catch (err: any) {
      setError(err.message || 'JSON 解析失败，请检查格式');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这条事件吗？')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage('删除成功');
        loadEvents();
      } else {
        setError(result.error || '删除失败');
      }
    } catch (err) {
      setError('删除失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingEvent) return;

    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingEvent)
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage('保存成功');
        setEditingEvent(null);
        loadEvents();
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('保存失败');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('timeline_admin_token');
    setToken('');
    setIsAuthenticated(false);
    setEvents([]);
  }

  if (!isAuthenticated) {
    return (
      <div className="timeline-admin-login">
        <div className="login-card">
          <h1>🔐 Timeline 管理后台</h1>
          <p className="login-desc">请输入管理 Token</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="输入 Token"
              className="token-input"
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '验证中...' : '进入后台'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-admin">
      <div className="admin-header">
        <h1>📋 Timeline 管理</h1>
        <button onClick={handleLogout} className="logout-btn">退出登录</button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message-display">{error}</div>
      )}

      {/* 导入区域 */}
      <div className="import-section">
        <h2>📥 导入数据</h2>
        <p className="import-hint">
          粘贴 JSON 格式的数据，可以是数组或包含 events 数组的对象
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={`[
  {
    "date": "2024-01-01",
    "title": "事件标题",
    "content": "事件描述",
    "color": "blue",
    "icon": "mdi-star"
  }
]`}
          className="import-textarea"
          rows={10}
        />
        <button 
          onClick={handleImport} 
          className="import-btn"
          disabled={loading || !importText.trim()}
        >
          {loading ? '导入中...' : '导入数据'}
        </button>
      </div>

      {/* 事件列表 */}
      <div className="events-section">
        <h2>📝 现有事件 ({events.length})</h2>
        {loading && !events.length ? (
          <div className="loading">加载中...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">暂无事件</div>
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                {editingEvent?.id === event.id ? (
                  // 编辑模式
                  <div className="event-edit-form">
                    <input
                      type="text"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                      placeholder="日期 (YYYY-MM-DD)"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                      placeholder="标题"
                      className="edit-input"
                    />
                    <textarea
                      value={editingEvent.content || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, content: e.target.value})}
                      placeholder="描述"
                      className="edit-textarea"
                      rows={3}
                    />
                    <input
                      type="text"
                      value={editingEvent.color || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, color: e.target.value})}
                      placeholder="颜色 (blue/green/purple/red)"
                      className="edit-input edit-input-small"
                    />
                    <input
                      type="text"
                      value={editingEvent.icon || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, icon: e.target.value})}
                      placeholder="图标"
                      className="edit-input edit-input-small"
                    />
                    <input
                      type="number"
                      value={editingEvent.sort_order || 0}
                      onChange={(e) => setEditingEvent({...editingEvent, sort_order: parseInt(e.target.value) || 0})}
                      placeholder="排序"
                      className="edit-input edit-input-small"
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveEdit} className="save-btn">保存</button>
                      <button onClick={() => setEditingEvent(null)} className="cancel-btn">取消</button>
                    </div>
                  </div>
                ) : (
                  // 查看模式
                  <div className="event-content">
                    <div className="event-date">{event.date}</div>
                    <h3 className="event-title">{event.title}</h3>
                    {event.content && <p className="event-desc">{event.content}</p>}
                    <div className="event-meta">
                      <span className="event-color">颜色：{event.color}</span>
                      <span className="event-icon">图标：{event.icon}</span>
                      <span className="event-sort">排序：{event.sort_order}</span>
                    </div>
                    <div className="event-actions">
                      <button onClick={() => setEditingEvent(event)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDelete(event.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
