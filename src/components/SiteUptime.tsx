import { useState, useEffect } from 'react';
import './SiteUptime.css';

interface TimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// 建站日期：2025-03-12
const SITE_START_DATE = new Date('2025-03-12T00:00:00');

function calculateUptime(): TimeData {
  const now = new Date();
  const diff = now.getTime() - SITE_START_DATE.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

export default function SiteUptime() {
  const [timeData, setTimeData] = useState<TimeData>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 初始计算
    setTimeData(calculateUptime());
    
    // 每秒更新
    const timer = setInterval(() => {
      setTimeData(calculateUptime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="site-uptime">
      <div className="uptime-header">
        <span className="uptime-icon">⏱️</span>
        <span className="uptime-label">本站已运行</span>
      </div>
      <div className="uptime-display">
        <div className="time-unit">
          <span className="time-value">{timeData.days}</span>
          <span className="time-label">天</span>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <span className="time-value">{formatNumber(timeData.hours)}</span>
          <span className="time-label">时</span>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <span className="time-value">{formatNumber(timeData.minutes)}</span>
          <span className="time-label">分</span>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <span className="time-value">{formatNumber(timeData.seconds)}</span>
          <span className="time-label">秒</span>
        </div>
      </div>
      <div className="uptime-since">
        自 {SITE_START_DATE.toLocaleDateString('zh-CN')} 起
      </div>
    </div>
  );
}
