import { useState, useEffect } from 'react';
import './LiveStatus.css';

interface LiveStatusData {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  lastChecked: string;
}

type StatusState = 'loading' | 'live' | 'offline' | 'error';

const BILIBILI_UID = '3821157';

export default function LiveStatus() {
  const [status, setStatus] = useState<StatusState>('loading');
  const [data, setData] = useState<LiveStatusData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLiveStatus = async (isRetry = false) => {
    const lastChecked = new Date().toISOString();
    
    try {
      console.log('[LiveStatus] Fetching from /api/live...');
      const response = await fetch('/api/live');
      console.log('[LiveStatus] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: LiveStatusData = await response.json();
      console.log('[LiveStatus] Result:', result);
      
      setData(result);
      setStatus(result.isLive ? 'live' : 'offline');
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('[LiveStatus] API Error:', error);
      
      // Only retry up to 3 times
      if (!isRetry && retryCount < 3) {
        console.log(`[LiveStatus] Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        await fetchLiveStatus(true);
        return;
      }
      
      // After all retries, show error state
      setStatus('error');
      setData({
        isLive: false,
        title: '',
        url: '',
        roomId: BILIBILI_UID,
        lastChecked,
      });
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    // Retry every 15 minutes
    const interval = setInterval(() => {
      setRetryCount(0); // Reset retry count for periodic checks
      fetchLiveStatus();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus('loading');
    fetchLiveStatus();
  };

  if (status === 'loading') {
    return (
      <div className="live-status loading">
        <span className="pulse">检测中...</span>
      </div>
    );
  }

  if (status === 'live' && data) {
    return (
      <a href={data.url} target="_blank" rel="noopener noreferrer" className="live-status live">
        <span className="live-dot"></span>
        <span className="live-text">正在直播</span>
        <span className="live-title">{data.title}</span>
      </a>
    );
  }

  if (status === 'offline' && data) {
    return (
      <div className="live-status offline">
        <span className="offline-dot"></span>
        <span>未开播</span>
      </div>
    );
  }

  // Error state - show error message with retry button
  return (
    <div className="live-status error">
      <span>⚠️ 检测失败</span>
      <button className="retry-btn" onClick={handleRetry}>
        重试
      </button>
    </div>
  );
}
