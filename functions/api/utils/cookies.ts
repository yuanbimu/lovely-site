/// <reference types="@cloudflare/workers-types" />

/**
 * 从 Cookie 头中提取指定名称的 Cookie 值
 */
export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const cookie of cookieHeader.split(';')) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

/**
 * 判断是否启用 Secure Cookie
 * 本地开发环境 (http://localhost 或 http://127.0.0.1) 不使用 Secure
 */
export function isSecureCookieEnabled(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      const host = parsed.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.')) {
        return false;
      }
    }
  } catch {
    // 解析失败默认保守返回 true
    return true;
  }
  // HTTPS 或非本地环境使用 Secure
  return true;
}

/**
 * 构建 Session Cookie 字符串
 */
export function buildSessionCookie(token: string, isSecure: boolean, maxAge: number): string {
  const securePart = isSecure ? 'Secure; ' : '';
  return `session=${token}; HttpOnly; ${securePart}SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}
