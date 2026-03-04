import { useState, useEffect } from 'react';
import './DynamicsList.css';

interface Dynamic {
  id: string;
  type: string;
  content: string;
  images: string[];
  local_images?: string[];
  author: string;
  publish_time: number;
  likes: number;
  comments: number;
  reposts: number;
}

interface DynamicsResponse {
  data: Dynamic[];
  hasMore: boolean;
  total: number;
  error?: string;
}

export function DynamicsList() {
  const [dynamics, setDynamics] = useState<Dynamic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadDynamics = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/dynamics?limit=20&offset=${currentOffset}`);
      const data: DynamicsResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (reset) {
        setDynamics(data.data);
      } else {
        setDynamics(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.hasMore);
      setOffset(currentOffset + data.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDynamics();
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    
    if (diff < minute) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    if (diff < month) return `${Math.floor(diff / day)}天前`;
    
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadDynamics(false);
    }
  };

  if (error) {
    return (
      <div className="dynamics-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={() => loadDynamics(true)}>重试</button>
      </div>
    );
  }

  return (
    <div className="dynamics-list">
      <h2 className="dynamics-title">最新动态</h2>
      
      {dynamics.length === 0 && !loading ? (
        <div className="dynamics-empty">
          <p>暂无动态</p>
        </div>
      ) : (
        <>
          <div className="dynamics-container">
            {dynamics.map(dynamic => (
              <article key={dynamic.id} className="dynamic-item">
                <header className="dynamic-header">
                  <div className="dynamic-author">
                    <span className="author-name">{dynamic.author}</span>
                    <span className="dynamic-time">{formatTime(dynamic.publish_time)}</span>
                  </div>
                  <span className="dynamic-type-badge">{dynamic.type}</span>
                </header>
                
                {dynamic.content && (
                  <p className="dynamic-content">{dynamic.content}</p>
                )}
                
                {(dynamic.local_images?.length || dynamic.images?.length) > 0 && (
                  <div className="dynamic-images">
                    {(dynamic.local_images?.length ? dynamic.local_images : dynamic.images).map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`动态图片 ${idx + 1}`}
                        loading="lazy"
                        className="dynamic-image"
                      />
                    ))}
                  </div>
                )}
                
                <footer className="dynamic-footer">
                  <div className="dynamic-stats">
                    <span className="stat-item">
                      <span className="stat-icon">👍</span>
                      {dynamic.likes || 0}
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">💬</span>
                      {dynamic.comments || 0}
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">🔄</span>
                      {dynamic.reposts || 0}
                    </span>
                  </div>
                </footer>
              </article>
            ))}
          </div>
          
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>加载中...</p>
            </div>
          )}
          
          {hasMore && !loading && (
            <button className="load-more-btn" onClick={handleLoadMore}>
              加载更多
            </button>
          )}
          
          {!hasMore && dynamics.length > 0 && (
            <p className="no-more">没有更多动态了</p>
          )}
        </>
      )}
    </div>
  );
}
