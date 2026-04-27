import type { User, NewUser } from '../types';

interface AdminUsersTabProps {
  users: User[];
  showUserForm: boolean;
  newUser: NewUser;
  currentUser: User;
  onToggleUserForm: () => void;
  onUpdateNewUser: (user: NewUser) => void;
  onAddUser: (e: React.FormEvent) => void;
  onUpdateRole: (id: string, role: string) => void;
  onDeleteUser: (id: string) => void;
}

export default function AdminUsersTab({
  users,
  showUserForm,
  newUser,
  currentUser,
  onToggleUserForm,
  onUpdateNewUser,
  onAddUser,
  onUpdateRole,
  onDeleteUser
}: AdminUsersTabProps) {
  return (
    <div className="tab-content">
      <div className="section-header">
        <h1>用户管理</h1>
        <button onClick={onToggleUserForm}>
          {showUserForm ? '取消' : '+ 新增管理员'}
        </button>
      </div>
      
      {showUserForm && (
        <div className="section edit-section">
          <h3>新建用户</h3>
          <form onSubmit={onAddUser} className="form-grid">
            <input required type="text" placeholder="用户名" value={newUser.username} onChange={e => onUpdateNewUser({...newUser, username: e.target.value})} />
            <input required type="email" placeholder="Email" value={newUser.email} onChange={e => onUpdateNewUser({...newUser, email: e.target.value})} />
            <input required type="password" placeholder="密码" value={newUser.password} onChange={e => onUpdateNewUser({...newUser, password: e.target.value})} />
            <select value={newUser.role} onChange={e => onUpdateNewUser({...newUser, role: e.target.value})}>
              <option value="admin">管理员 (admin)</option>
              <option value="editor">编辑者 (editor)</option>
              <option value="viewer">检视者 (viewer)</option>
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
              <th>用户名</th>
              <th>Email</th>
              <th>权限</th>
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
                    onChange={(e) => onUpdateRole(u.id, e.target.value)}
                    disabled={u.id === currentUser.id}
                  >
                    <option value="admin">管理员 (admin)</option>
                    <option value="editor">编辑者 (editor)</option>
                    <option value="viewer">检视者 (viewer)</option>
                  </select>
                </td>
                <td className="actions">
                  <button className="btn-danger" onClick={() => onDeleteUser(u.id)} disabled={u.id === currentUser.id}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
