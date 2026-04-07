import { useState, useEffect } from 'react';

interface Showcase {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
}

export default function ShowcaseList() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShowcases() {
      try {
        const res = await fetch('/api/showcases');
        const data = await res.json();
        if (data.success && data.data) {
          setShowcases(data.data);
        }
      } catch (err) {
        console.error('[Showcase] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchShowcases();
  }, []);

  if (loading) {
    return (
      <div className="showcase-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (showcases.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🖼️</div>
        <h3 className="empty-title">暂无论窗数据</h3>
        <p className="empty-desc">请在后台添加橱窗数据</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .model-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid rgba(107, 86, 55, 0.08);
          transition: all 0.3s ease;
        }
        .model-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .model-img {
          aspect-ratio: 4/5;
          overflow: hidden;
          background: linear-gradient(135deg, #FAF6F0 0%, #E8DFD3 100%);
        }
        .model-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .model-card:hover .model-img img {
          transform: scale(1.05);
        }
        .model-info {
          padding: 16px;
          text-align: center;
        }
        .model-info h4 {
          font-size: 1.1rem;
          color: #6B5637;
          margin: 0 0 8px 0;
          font-weight: 600;
        }
        .model-info .credit {
          font-size: 0.85rem;
          color: #8B7355;
          margin: 0;
        }
        .showcase-loading {
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
        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.6;
        }
        .empty-title {
          font-size: 1.5rem;
          color: #6B5637;
          margin-bottom: 12px;
        }
        .empty-desc {
          font-size: 1rem;
          color: #8B7355;
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }
        }
      `}</style>

      <div className="gallery-grid">
        {showcases.map((item) => (
          <div key={item.id} className="model-card">
            <div className="model-img">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#C4A77D' }}>
                  🖼️
                </div>
              )}
            </div>
            <div className="model-info">
              <h4>{item.name}</h4>
              {item.description && <p className="credit">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}