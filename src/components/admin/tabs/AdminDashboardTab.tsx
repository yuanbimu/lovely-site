import type { Stats, User } from '../types';

interface AdminDashboardTabProps {
  user: User;
  stats: Stats;
  onNavigate: (tab: string) => void;
}

export default function AdminDashboardTab({ user, stats, onNavigate }: AdminDashboardTabProps) {
  return (
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
          <button onClick={() => onNavigate('timeline')}>
            <span>➕</span> 添加時間線事件
          </button>
          {user.role === 'admin' && (
            <button onClick={() => onNavigate('users')}>
              <span>👤</span> 添加管理員
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
