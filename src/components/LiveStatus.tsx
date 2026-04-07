import { useState, useEffect, useCallback } from 'react';
import './LiveStatus.css';

interface LiveStatusData {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  lastChecked?: string;
  error?: string;
}

type StatusState = 'loading' | 'live' | 'offline' | 'error';

const BILIBILI_UID = '3821157';

// Format relative time (e.g., "2分钟前")
function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return '刚刚';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '刚刚';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

// Format time for tooltip (e.g., "2026-03-12 14:30")
function formatExactTime(dateString: string | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LiveStatus() {
  const [status, setStatus] = useState<StatusState>('loading');
  const [data, setData] = useState<LiveStatusData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const fetchLiveStatus = useCallback(async (isRetry = false, isManual = false) => {
    const lastChecked = new Date().toISOString();
    
    if (isManual) {
      setIsManualRefresh(true);
    }
    
    try {
      // Add cache-busting parameter for manual refresh to bypass browser cache
      const cacheBuster = isManual ? `?t=${Date.now()}` : '';
      const response = await fetch(`/api/live${cacheBuster}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: LiveStatusData = await response.json();
      console.log('[LiveStatus] Result:', result);
      
      setData(result);
      
      // If API returns error field, treat as error state
      if (result.error) {
        setStatus('error');
      } else {
        setStatus(result.isLive ? 'live' : 'offline');
      }
      
      setRetryCount(0);
    } catch (error) {
      console.error('[LiveStatus] API Error:', error);
      
      if (!isRetry && retryCount < 3) {
        console.log(`[LiveStatus] Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchLiveStatus(true, isManual);
        return;
      }
      
      setStatus('error');
      setData({
        isLive: false,
        title: '',
        url: '',
        roomId: BILIBILI_UID,
        lastChecked,
      });
    } finally {
      if (isManual) {
        setTimeout(() => setIsManualRefresh(false), 500);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    fetchLiveStatus();
    
    // Auto refresh every 15 minutes
    const interval = setInterval(() => {
      setRetryCount(0);
      fetchLiveStatus();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchLiveStatus]);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('loading');
    fetchLiveStatus(false, true);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="live-status loading">
        <span className="loading-spinner"></span>
        <span>检测中...</span>
      </div>
    );
  }

  // Live state
  if (status === 'live' && data) {
    return (
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="live-status live"
        title={`点击进入直播间: ${data.title}`}
      >
        <span className="live-dot"></span>
        <span className="live-text">正在直播</span>
        <span className="live-title">{data.title}</span>
        <span className="live-arrow">→</span>
      </a>
    );
  }

  // Offline state
  if (status === 'offline' && data) {
    return (
      <div className="live-status offline-container">
        <div className="offline-main">
          <span className="offline-dot"></span>
          <span className="offline-text">未开播</span>
          <button 
            className={`refresh-btn ${isManualRefresh ? 'spinning' : ''}`} 
            onClick={handleRetry}
            title="刷新状态"
            aria-label="刷新直播状态"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
        <span className="last-checked" title={`最后检查: ${formatExactTime(data.lastChecked)}`}>
          更新于 {formatRelativeTime(data.lastChecked)}
        </span>
      </div>
    );
  }

  // Error state
  return (
    <div className="live-status error-container">
      <div className="error-main">
        <span className="error-icon">⚠️</span>
        <span className="error-text">检测失败</span>
        <button 
          className={`retry-btn-small ${isManualRefresh ? 'spinning' : ''}`} 
          onClick={handleRetry}
          title="点击重试"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>
      {data && (
        <span className="last-checked" title={`最后尝试: ${formatExactTime(data.lastChecked)}`}>
          {formatRelativeTime(data.lastChecked)}
        </span>
      )}
    </div>
  );
}
