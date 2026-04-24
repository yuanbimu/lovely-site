import { useState, useEffect, useRef } from 'react';

interface TimelineEvent {
  date: string;
  title: string;
  content?: string;
  color?: string;
  icon?: string;
  tag?: string;
}

export default function TimelineList() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedYear) params.set('year', selectedYear);
        if (selectedTag) params.set('tag', selectedTag);
        const url = params.toString() ? `/api/timeline?${params.toString()}` : '/api/timeline';
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          const fetchedEvents = result.data || [];
          setEvents(fetchedEvents);

          if (isFirstLoad.current && fetchedEvents.length > 0) {
            const years = Array.from(new Set(fetchedEvents.map((e: TimelineEvent) => e.date.split('-')[0]))).sort().reverse();
            const tags = Array.from(new Set(fetchedEvents.map((e: TimelineEvent) => e.tag).filter(Boolean))).sort();
            setAvailableYears(years as string[]);
            setAvailableTags(tags as string[]);
          }
        } else {
          setError(true);
          if (isFirstLoad.current) setEvents(getDefaultEvents());
        }
      } catch (err) {
        console.error('[Timeline] Failed to fetch events:', err);
        setError(true);
        if (isFirstLoad.current) setEvents(getDefaultEvents());
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }

    load();
  }, [selectedYear, selectedTag]);

  function getTagClass(tag: string): string {
    const map: Record<string, string> = {
      '首播': 'debut',
      '歌回': 'song',
      '遊戲': 'game',
      '视频投稿': 'video',
      '3D披露': '_3d',
      '新衣裝': 'costume',
      '紀念回': 'memorial',
      '聯動': 'collab',
      '重要': 'important',
      '生日': 'birthday',
      '周年': 'anniversary',
      '活動': 'event',
      '日常': 'daily'
    };
    return map[tag] || '';
  }

  function getDefaultEvents(): TimelineEvent[] {
    return [
      {
        date: "2020-04-26",
        title: "在 B 站发表第一条动态",
        content: "",
        tag: "日常",
        color: "gray",
        icon: "📝"
      },
      {
        date: "2020-04-28",
        title: "投稿第一个视频，展示了自己的立绘",
        content: "",
        tag: "首播",
        color: "purple",
        icon: "🎤"
      },
      {
        date: "2020-04-29",
        title: "投稿自我介绍视频",
        content: "在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源",
        tag: "首播",
        color: "purple",
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
        .timeline-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .timeline-tag {
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: 12px;
          background: rgba(74, 144, 217, 0.12);
          color: #4A90D9;
          font-weight: 500;
          border: 1px solid rgba(74, 144, 217, 0.2);
        }
        .timeline-tag.important { background: rgba(231, 76, 60, 0.12); color: #e74c3c; border-color: rgba(231, 76, 60, 0.2); }
        .timeline-tag.debut { background: rgba(155, 89, 182, 0.12); color: #9b59b6; border-color: rgba(155, 89, 182, 0.2); }
        .timeline-tag.anniversary { background: rgba(243, 156, 18, 0.12); color: #f39c12; border-color: rgba(243, 156, 18, 0.2); }
        .timeline-tag.song { background: rgba(46, 204, 113, 0.12); color: #2ecc71; border-color: rgba(46, 204, 113, 0.2); }
        .timeline-tag.collab { background: rgba(52, 152, 219, 0.12); color: #3498db; border-color: rgba(52, 152, 219, 0.2); }
        .timeline-tag.costume { background: rgba(230, 126, 34, 0.12); color: #e67e22; border-color: rgba(230, 126, 34, 0.2); }
        .timeline-tag.game { background: rgba(26, 188, 156, 0.12); color: #1abc9c; border-color: rgba(26, 188, 156, 0.2); }
        .timeline-tag.video { background: rgba(6, 182, 212, 0.12); color: #06b6d4; border-color: rgba(6, 182, 212, 0.2); }
        .timeline-tag._3d { background: rgba(142, 68, 173, 0.12); color: #8e44ad; border-color: rgba(142, 68, 173, 0.2); }
        .timeline-tag.memorial { background: rgba(192, 57, 43, 0.12); color: #c0392b; border-color: rgba(192, 57, 43, 0.2); }
        .timeline-tag.birthday { background: rgba(241, 196, 15, 0.12); color: #d4ac0d; border-color: rgba(241, 196, 15, 0.2); }
        .timeline-tag.event { background: rgba(52, 73, 94, 0.12); color: #34495e; border-color: rgba(52, 73, 94, 0.2); }
        .timeline-tag.daily { background: rgba(149, 165, 166, 0.12); color: #7f8c8d; border-color: rgba(149, 165, 166, 0.2); }
        
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
        .timeline-filters {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .filter-group label {
          font-size: 0.85rem;
          color: #8B7355;
          font-weight: 500;
        }
        .filter-group select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(107, 86, 55, 0.2);
          background: white;
          color: #6B5637;
          font-size: 0.95rem;
          cursor: pointer;
          min-width: 120px;
        }
        .filter-reset {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(107, 86, 55, 0.2);
          background: white;
          color: #6B5637;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-reset:hover {
          background: rgba(107, 86, 55, 0.05);
        }
        @media (max-width: 768px) {
          .timeline-filters {
            gap: 12px;
          }
        }
      `}</style>

      {/* 筛选栏 */}
      <div className="timeline-filters">
        <div className="filter-group">
          <label>年份</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="">全部</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>标签</label>
          <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
            <option value="">全部</option>
            {availableTags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {(selectedYear || selectedTag) && (
          <button className="filter-reset" onClick={() => { setSelectedYear(''); setSelectedTag(''); }}>
            重置
          </button>
        )}
      </div>

      {events.map((event, index) => (
        <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
          <div className="timeline-content">
            <div className="timeline-date">{event.date}</div>
            <h3 className="timeline-title">{event.title}</h3>
            {event.content && <p className="timeline-desc">{event.content}</p>}
            {event.tag && (
              <div className="timeline-tags">
                <span className={`timeline-tag ${getTagClass(event.tag)}`}>{event.icon || '⭐'} {event.tag}</span>
              </div>
            )}
          </div>
          <div className={`timeline-dot ${event.color || 'blue'}`}>
            <span className="timeline-icon">{event.icon || '⭐'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
