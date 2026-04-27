import { useState, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  url?: string;
  release_date?: string;
  tag?: string;
}

export default function SongsList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch('/api/songs');
        const data = await res.json();
        if (data.success && data.data) {
          setSongs(data.data);
        }
      } catch (err) {
        console.error('[Songs] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const categories = [
    { name: '全部', key: 'all', count: songs.length },
    { name: '中文', key: '中文', count: songs.filter(s => s.tag === '中文').length },
    { name: '日文', key: '日文', count: songs.filter(s => s.tag === '日文').length },
    { name: '翻唱', key: '翻唱', count: songs.filter(s => s.tag === '翻唱').length },
    { name: '原創', key: '原創', count: songs.filter(s => s.tag === '原創').length },
  ];

  const filteredSongs = activeCategory === 'all'
    ? songs
    : songs.filter(s => s.tag === activeCategory);

  if (loading) {
    return (
      <div className="songs-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎵</div>
        <h3 className="empty-title">歌单正在整理中</h3>
        <p className="empty-desc">这里将会收录东爱璃Lovely唱过的歌曲</p>
        <p className="empty-hint">敬请期待...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .songs-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .song-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(107, 86, 55, 0.08);
          transition: all 0.3s ease;
        }
        .song-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .song-cover {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4A90D9, #6B5637);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          flex-shrink: 0;
        }
        .song-number {
          font-size: 0.9rem;
          color: #8B7355;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
        .song-info {
          flex: 1;
        }
        .song-title {
          font-size: 1.1rem;
          color: #6B5637;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .song-artist {
          font-size: 0.9rem;
          color: #8B7355;
        }
        .song-date {
          font-size: 0.8rem;
          color: #999;
          margin-top: 4px;
        }
        .play-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #4A90D9, #6B5637);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .play-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4);
        }
        .play-icon {
          font-size: 1.2rem;
        }
        .songs-loading {
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
          margin-bottom: 8px;
        }
        .empty-hint {
          font-size: 0.9rem;
          color: #999;
        }
        @media (max-width: 768px) {
          .song-card {
            padding: 16px;
            gap: 12px;
          }
          .song-cover {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
          .song-number {
            min-width: 30px;
          }
          .song-title {
            font-size: 1rem;
          }
          .play-btn {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      <div className="category-tabs" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '10px 20px',
              background: activeCategory === cat.key ? '#6B5637' : 'white',
              borderRadius: '25px',
              fontSize: '0.9rem',
              color: activeCategory === cat.key ? 'white' : '#6B5637',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(107, 86, 55, 0.15)',
            }}
          >
            {cat.name}
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              background: activeCategory === cat.key ? 'rgba(255,255,255,0.2)' : 'rgba(107, 86, 55, 0.1)',
              borderRadius: '12px',
            }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      <div className="songs-grid">
        {filteredSongs.map((song, index) => (
          <div key={song.id} className="song-card">
            <div className="song-number">{String(index + 1).padStart(2, '0')}</div>
            <div className="song-cover">🎵</div>
            <div className="song-info">
              <h3 className="song-title">{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
              {song.release_date && <p className="song-date">{song.release_date}</p>}
              {song.tag && (
                <span className="song-tag" style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 10px',
                  fontSize: '0.75rem',
                  color: '#6B5637',
                  background: 'rgba(107, 86, 55, 0.08)',
                  borderRadius: '12px',
                }}>
                  {song.tag}
                </span>
              )}
            </div>
            {song.url && (
              <a href={song.url} target="_blank" rel="noopener noreferrer" className="play-btn">
                <span className="play-icon">▶</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}