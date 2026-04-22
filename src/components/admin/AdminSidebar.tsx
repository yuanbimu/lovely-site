import type { User } from './types';

interface AdminSidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const TABS = [
  { id: 'dashboard', label: '概覽', icon: '📊' },
  { id: 'timeline', label: '時間線管理', icon: '📅' },
  { id: 'songs', label: '歌單管理', icon: '🎵' },
  { id: 'showcase', label: '櫥窗管理', icon: '🖼️' },
];

export default function AdminSidebar({ user, activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo">🎀 东爱璃 Lovely</div>
        <div className="logo-sub">管理後台</div>
      </div>
      
      <nav className="admin-nav">
        {TABS.map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
        {user.role === 'admin' && (
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => onTabChange('users')}
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
        <button className="logout-btn" onClick={onLogout}>登出</button>
      </div>
    </aside>
  );
}
