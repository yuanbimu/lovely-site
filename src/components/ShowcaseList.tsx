import { useState, useEffect } from 'react';

interface Showcase {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  image_url?: string;
  sort_order?: number;
}

export default function ShowcaseList() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderImages, setFolderImages] = useState<Record<string, string[]>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  // 加载所有橱窗的图片
  useEffect(() => {
    async function fetchShowcases() {
      try {
        const res = await fetch('/api/showcases');
        const data = await res.json();
        if (data.success && data.data) {
          setShowcases(data.data);
          
          // 获取每个有 folder 的橱窗的图片列表
          const foldersWithShowcases = data.data.filter((s: Showcase) => s.folder);
          if (foldersWithShowcases.length > 0) {
            // 获取 R2 文件列表
            try {
              const r2Res = await fetch('/api/r2-files');
              const r2Data = await r2Res.json();
              if (r2Data.success && r2Data.data) {
                const imagesByFolder: Record<string, string[]> = {};
                r2Data.data.files.forEach((file: { key: string, url: string }) => {
                  const parts = file.key.split('/');
                  if (parts.length >= 2) {
                    const folder = parts[0];
                    if (!imagesByFolder[folder]) imagesByFolder[folder] = [];
                    if (file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                      imagesByFolder[folder].push(file.url);
                    }
                  }
                });
                setFolderImages(imagesByFolder);
              }
            } catch (err) {
              console.error('[Showcase] Fetch R2 files error:', err);
            }
          }
        }
      } catch (err) {
        console.error('[Showcase] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchShowcases();
  }, []);

  const getCurrentImage = (showcase: Showcase): string => {
    if (showcase.image_url) return showcase.image_url;
    if (showcase.folder && folderImages[showcase.folder]?.length > 0) {
      const idx = currentImageIndex[showcase.id] || 0;
      return folderImages[showcase.folder][idx];
    }
    return '';
  };

  const getTotalImages = (showcase: Showcase): number => {
    if (showcase.folder && folderImages[showcase.folder]) {
      return folderImages[showcase.folder].length;
    }
    return showcase.image_url ? 1 : 0;
  };

  const nextImage = (showcase: Showcase) => {
    if (!showcase.folder || !folderImages[showcase.folder]) return;
    const total = folderImages[showcase.folder].length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [showcase.id]: ((prev[showcase.id] || 0) + 1) % total
    }));
  };

  const prevImage = (showcase: Showcase) => {
    if (!showcase.folder || !folderImages[showcase.folder]) return;
    const total = folderImages[showcase.folder].length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [showcase.id]: ((prev[showcase.id] || 0) - 1 + total) % total
    }));
  };

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
          position: relative;
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
        .image-nav {
          position: absolute;
          bottom: 12px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }
        .image-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        .image-nav-btn:hover {
          background: #fff;
          transform: scale(1.1);
        }
        .image-dots {
          display: flex;
          gap: 6px;
        }
        .image-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .image-dot.active {
          background: #fff;
          transform: scale(1.2);
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
        {showcases.map((item) => {
          const totalImages = getTotalImages(item);
          const currentImage = getCurrentImage(item);
          
          return (
            <div key={item.id} className="model-card">
              <div className="model-img">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={item.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#C4A77D;">🖼️</div>';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#C4A77D' }}>
                    🖼️
                  </div>
                )}
                
                {/* 切换按钮 - 只有多张图片时显示 */}
                {totalImages > 1 && (
                  <div className="image-nav">
                    <button className="image-nav-btn" onClick={(e) => { e.stopPropagation(); prevImage(item); }}>
                      ‹
                    </button>
                    <div className="image-dots">
                      {Array.from({ length: totalImages }).map((_, idx) => (
                        <button
                          key={idx}
                          className={`image-dot ${(currentImageIndex[item.id] || 0) === idx ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => ({ ...prev, [item.id]: idx })); }}
                        />
                      ))}
                    </div>
                    <button className="image-nav-btn" onClick={(e) => { e.stopPropagation(); nextImage(item); }}>
                      ›
                    </button>
                  </div>
                )}
              </div>
              <div className="model-info">
                <h4>{item.name}</h4>
                {item.description && <p className="credit">{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}