/// <reference types="@cloudflare/workers-types" />

/**
 * 判断是否为本地开发环境 - 用于 R2 URL 生成
 */
export function isLocalDevEnv(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      const host = parsed.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.')) {
        return true;
      }
    }
  } catch {
    // 解析失败默认返回 false (生产环境)
    return false;
  }
  return false;
}

/**
 * 构建 R2 文件访问 URL
 * 本地环境返回代理地址，生产环境返回 CDN 地址
 */
export function buildR2Url(key: string, baseUrl: string): string {
  const isLocal = isLocalDevEnv(baseUrl);
  if (isLocal) {
    return `http://127.0.0.1:8788/api/r2-get/${encodeURIComponent(key)}`;
  }
  return `https://cdn.yuanbimu.top/${key}`;
}
