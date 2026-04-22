import type { LoginForm } from './types';

interface AdminLoginProps {
  loginForm: LoginForm;
  loginError: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminLogin({
  loginForm,
  loginError,
  onUsernameChange,
  onPasswordChange,
  onSubmit
}: AdminLoginProps) {
  return (
    <div className="admin-login">
      <div className="login-box">
        <h2>管理後台登錄</h2>
        <p>东爱璃 Lovely 应援站</p>
        
        {loginError && <div className="login-error">{loginError}</div>}
        
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="用戶名"
            value={loginForm.username}
            onChange={e => onUsernameChange(e.target.value)}
          />
          <input
            type="password"
            placeholder="密碼"
            value={loginForm.password}
            onChange={e => onPasswordChange(e.target.value)}
          />
          <button type="submit">登錄</button>
        </form>
      </div>
    </div>
  );
}
