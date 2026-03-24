import { useState, useEffect } from 'react';

interface TimelineEvent {
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
}

export default function TimelineList() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/timeline');
        if (response.ok) {
          const result = await response.json();
          const fetchedEvents = result.data || [];
          
          if (fetchedEvents.length === 0) {
            // 如果 API 返回空，使用默认数据
            setEvents(getDefaultEvents());
          } else {
            setEvents(fetchedEvents);
          }
        } else {
          setError(true);
          setEvents(getDefaultEvents());
        }
      } catch (err) {
        console.error('[Timeline] Failed to fetch events:', err);
        setError(true);
        setEvents(getDefaultEvents());
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  function getDefaultEvents(): TimelineEvent[] {
    return [
      {
        date: "2020-04-26",
        title: "在 B 站发表第一条动态",
        content: "",
        color: "blue",
        icon: "⭐"
      },
      {
        date: "2020-04-28",
        title: "投稿第一个视频，展示了自己的立绘",
        content: "",
        color: "blue",
        icon: "▶️"
      },
      {
        date: "2020-04-29",
        title: "投稿自我介绍视频",
        content: "在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源",
        color: "green",
        icon: "🎤"
      }
    ];
  }

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="spinner"></div>
        <p>正在加载时间线...</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
          <div className="timeline-content">
            <div className="timeline-date">{event.date}</div>
            <h3 className="timeline-title">{event.title}</h3>
            {event.content && <p className="timeline-desc">{event.content}</p>}
          </div>
          <div className={`timeline-dot ${event.color || 'blue'}`}>
            <span className="timeline-icon">{event.icon || '⭐'}</span>
          </div>
        </div>
      ))}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-loading {
          text-align: center;
          padding: 60px 20px;
          color: #8B7355;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(107, 86, 55, 0.1);
          border-left-color: #6B5637;
          border-radius: 50%;
          margin: 0 auto 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
