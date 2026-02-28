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

export default function LiveStatus() {
  const [status, setStatus] = useState<StatusState>('loading');
  const [data, setData] = useState<LiveStatusData | null>(null);

  const fetchLiveStatus = async () => {
    try {
      const response = await fetch('/api/live');
      const result: LiveStatusData = await response.json();
      setData(result);
      setStatus(result.isLive ? 'live' : 'offline');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (status === 'error') {
    return (
      <div className="live-status error">
        <span>⚠️ 检测失败</span>
      </div>
    );
  }

  return (
    <div className="live-status offline">
      <span className="offline-dot"></span>
      <span>未开播</span>
    </div>
  );
}