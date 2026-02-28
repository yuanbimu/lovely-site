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

  const fetchLiveStatus = async () => {
    const lastChecked = new Date().toISOString();
    
    try {
      // Try Cloudflare Functions API first (production)
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
    } catch (error) {
      console.error('[LiveStatus] API Error:', error);
      
      // Fallback: Fetch directly from Bilibili (for local development)
      // Note: This may still fail due to CORS in browser
      try {
        console.log('[LiveStatus] Falling back to Bilibili API...');
        const fallbackResponse = await fetch(
          `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${BILIBILI_UID}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );
        
        if (!fallbackResponse.ok) {
          throw new Error('Bilibili API failed');
        }
        
        const fallbackData = await fallbackResponse.json() as {
          code: number;
          data?: {
            live_status: number;
            title: string;
            room_id: number;
          };
        };
        
        if (fallbackData.code === 0 && fallbackData.data) {
          const { live_status, title, room_id } = fallbackData.data;
          const isLive = live_status === 1;
          
          const result: LiveStatusData = {
            isLive,
            title: isLive ? title : '',
            url: isLive ? `https://live.bilibili.com/${room_id}` : '',
            roomId: room_id?.toString() || '',
            lastChecked,
          };
          
          setData(result);
          setStatus(isLive ? 'live' : 'offline');
          return;
        }
      } catch (fallbackError) {
        console.error('[LiveStatus] Fallback also failed:', fallbackError);
      }
      
      // Ultimate fallback: assume offline
      setStatus('offline');
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

  // Show offline for both offline and error states
  return (
    <div className="live-status offline">
      <span className="offline-dot"></span>
      <span>未开播</span>
    </div>
  );
}
