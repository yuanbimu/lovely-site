import { useState, useEffect } from 'react';

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

interface Props {
  initialPage?: number;
  itemsPerPage?: number;
}

export default function DynamicsList({ initialPage = 1, itemsPerPage = 10 }: Props) {
  const [dynamics, setDynamics] = useState<Dynamic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDynamics = dynamics.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    async function fetchDynamics() {
      try {
        // Fetch enough data for current page + next page to check hasMore
        const limit = currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE;
        const res = await fetch(`/api/dynamics?limit=${limit}&offset=0`);
        const data = await res.json();
        
        if (data.data) {
          // Map D1 results to expected format
          const mapped = data.data.map((item: any) => ({
            id: item.id,
            type: item.type,
            content: item.content,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []),
            local_images: typeof item.local_images === 'string' ? JSON.parse(item.local_images) : (item.local_images || []),
            author: item.author || '东爱璃Lovely',
            publish_time: item.publish_time,
            likes: item.likes || 0,
            comments: item.comments || 0,
            reposts: item.reposts || 0,
          }));
          
          setDynamics(mapped);
          setTotalCount(mapped.length); // Approximate - real implementation would need total count
        }
      } catch (err) {
        console.error('[Dynamics] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDynamics();
  }, []);

  // Reset to page 1 if currentPage becomes invalid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  function getPageUrl(page: number) {
    if (page === 1) return '/dynamics';
    return `/dynamics?page=${page}`;
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }

  if (loading) {
    return (
      <div className="dynamics-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .dynamics-page {
          padding-top: 70px;
          min-height: 100vh;
          background: linear-gradient(180deg, #FFF8F0 0%, #F5EDE3 100%);
        }

        .dynamics-section {
          padding: 80px 20px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-tag {
          display: inline-block;
          background: linear-gradient(135deg, #9d84b7 0%, #6a4c93 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 15px;
        }

        .section-header h2 {
          font-size: 36px;
          color: #6B5637;
          margin: 0 0 10px 0;
        }

        .section-desc {
          color: #8B6F47;
          font-size: 14px;
        }

        .dynamics-list {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .dynamic-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(139, 111, 71, 0.1);
        }

        .dynamic-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .dynamic-avatar {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          object-fit: cover;
        }

        .dynamic-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .dynamic-author {
          font-weight: 600;
          color: #6B5637;
          font-size: 16px;
        }

        .dynamic-time {
          font-size: 13px;
          color: #8B6F47;
        }

        .forward-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          background: rgba(196, 167, 125, 0.1);
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 14px;
          color: #6B5637;
        }

        .forward-icon {
          font-size: 16px;
        }

        .origin-content {
          padding: 15px;
          background: rgba(196, 167, 125, 0.05);
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 14px;
          color: #6B5637;
          line-height: 1.6;
        }

        .dynamic-content {
          margin-bottom: 15px;
        }

        .content-text {
          color: #6B5637;
          line-height: 1.7;
          font-size: 15px;
          margin: 0;
          white-space: pre-wrap;
        }

        .dynamic-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }

        .dynamic-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .dynamic-image:hover {
          transform: scale(1.02);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 50px;
          padding: 20px 0;
        }

        .page-numbers {
          display: flex;
          gap: 8px;
        }

        .page-number,
        .page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 15px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .page-number {
          background: rgba(255, 255, 255, 0.9);
          color: #6B5637;
          border: 2px solid transparent;
        }

        .page-number.active {
          background: linear-gradient(135deg, #9d84b7 0%, #6a4c93 100%);
          color: white;
        }

        .page-number:hover:not(.active),
        .page-btn:hover {
          background: rgba(157, 132, 183, 0.2);
          color: #6a4c93;
        }

        .page-btn {
          background: rgba(255, 255, 255, 0.9);
          color: #6B5637;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #8B6F47;
        }

        .btn-back {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background: linear-gradient(135deg, #9d84b7 0%, #6a4c93 100%);
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 500;
          transition: transform 0.3s ease;
        }

        .btn-back:hover {
          transform: translateY(-2px);
        }

        .dynamics-loading {
          text-align: center;
          padding: 60px 20px;
          color: #8B6F47;
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

        @media (max-width: 768px) {
          .section-header h2 {
            font-size: 28px;
          }

          .dynamics-list {
            gap: 20px;
          }

          .dynamic-card {
            padding: 20px;
          }

          .pagination {
            flex-wrap: wrap;
          }

          .page-numbers {
            order: -1;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="dynamics-page">
        <section className="dynamics-section">
          <div className="container-cute">
            <div className="section-header text-center">
              <span className="section-tag">Dynamics</span>
              <h2>全部动态</h2>
              <p className="section-desc">共 {totalCount} 条动态</p>
            </div>

            {paginatedDynamics.length > 0 ? (
              <>
                <div className="dynamics-list">
                  {paginatedDynamics.map((dynamic) => (
                    <div className="dynamic-card" key={dynamic.id}>
                      <div className="dynamic-header">
                        <img 
                          src="/images/Lovely.webp" 
                          alt="东爱璃Lovely 头像" 
                          className="dynamic-avatar" 
                          width="50" 
                          height="50" 
                          loading="lazy" 
                          decoding="async" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/C4A77D/FFFFFF?text=Lovely';
                          }} 
                        />
                        <div className="dynamic-info">
                          <span className="dynamic-author">{dynamic.author}</span>
                          <span className="dynamic-time">{formatTime(dynamic.publish_time)}</span>
                        </div>
                      </div>

                      <div className="dynamic-content">
                        <p className="content-text">{dynamic.content}</p>
                      </div>

                      {dynamic.images && dynamic.images.length > 0 && (
                        <div className="dynamic-images">
                          {dynamic.images.map((img, index) => (
                            <img 
                              key={index}
                              src={img} 
                              alt={`动态图片 ${index + 1}`} 
                              className="dynamic-image" 
                              width="150" 
                              height="150" 
                              loading="lazy" 
                              decoding="async" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    {currentPage > 1 && (
                      <a href={getPageUrl(currentPage - 1)} className="page-btn">
                        ← 上一页
                      </a>
                    )}

                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <a
                          key={page}
                          href={getPageUrl(page)}
                          className={`page-number ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </a>
                      ))}
                    </div>

                    {currentPage < totalPages && (
                      <a href={getPageUrl(currentPage + 1)} className="page-btn">
                        下一页 →
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>暂无动态</p>
                <a href="/" className="btn-back">返回首页</a>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
