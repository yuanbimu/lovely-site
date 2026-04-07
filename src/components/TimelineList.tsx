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
      <style>{`
        .timeline {
          position: relative;
          padding: 20px 0;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #4A90D9, #6B5637);
          border-radius: 2px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 50px;
          display: flex;
          align-items: center;
        }
        .timeline-item.left { justify-content: flex-start; }
        .timeline-item.right { justify-content: flex-end; }
        .timeline-item.left .timeline-content {
          margin-right: auto;
          margin-left: 0;
        }
        .timeline-item.right .timeline-content {
          margin-left: auto;
          margin-right: 0;
        }
        .timeline-content {
          width: 42%;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(107, 86, 55, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .timeline-content:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        .timeline-date {
          font-size: 0.85rem;
          color: #4A90D9;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .timeline-title {
          font-size: 1.1rem;
          color: #6B5637;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .timeline-desc {
          font-size: 0.95rem;
          color: #8B7355;
          line-height: 1.6;
        }
        .timeline-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          border: 3px solid;
          z-index: 10;
        }
        .timeline-dot.blue { border-color: #4A90D9; }
        .timeline-dot.green { border-color: #4CAF50; }
        .timeline-icon { font-size: 1.2rem; }
        
        @media (max-width: 768px) {
          .timeline::before { left: 30px; }
          .timeline-item {
            justify-content: flex-start !important;
            padding-left: 70px;
          }
          .timeline-content {
            width: 100%;
            margin: 0 !important;
          }
          .timeline-dot {
            left: 30px;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
          }
          .timeline-icon { font-size: 1rem; }
        }
        
        @media (max-width: 480px) {
          .timeline-content { padding: 16px; }
          .timeline-title { font-size: 1rem; }
          .timeline-desc { font-size: 0.9rem; }
        }
        
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
    </div>
  );
}
