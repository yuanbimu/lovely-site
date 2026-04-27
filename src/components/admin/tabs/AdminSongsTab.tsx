import type { Song } from '../types';

interface AdminSongsTabProps {
  songs: Song[];
  editingSong: Song | null;
  onEditSong: (song: Song | null) => void;
  onUpdateEditingSong: (song: Song) => void;
  onSaveSong: () => void;
  onDeleteSong: (id: string) => void;
  onOpenImagePicker: () => void;
}

export default function AdminSongsTab({
  songs,
  editingSong,
  onEditSong,
  onUpdateEditingSong,
  onSaveSong,
  onDeleteSong,
  onOpenImagePicker
}: AdminSongsTabProps) {
  return (
    <div className="tab-content">
      <h1>歌单管理</h1>
      
      {editingSong && (
        <div className="section edit-section">
          <h3>{editingSong.id ? '编辑歌曲' : '新增歌曲'}</h3>
          <div className="form-grid">
            <input
              type="text"
              value={editingSong.title}
              onChange={e => onUpdateEditingSong({...editingSong, title: e.target.value})}
              placeholder="歌名 (必填)"
            />
            <input
              type="text"
              value={editingSong.artist}
              onChange={e => onUpdateEditingSong({...editingSong, artist: e.target.value})}
              placeholder="歌手"
            />
            <input
              type="date"
              value={editingSong.release_date || ''}
              onChange={e => onUpdateEditingSong({...editingSong, release_date: e.target.value})}
              placeholder="发布时间"
            />
            <select
              value={editingSong.tag || ''}
              onChange={e => onUpdateEditingSong({...editingSong, tag: e.target.value || undefined})}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="">选择标签</option>
              <option value="中文">中文</option>
              <option value="日文">日文</option>
              <option value="翻唱">翻唱</option>
              <option value="原创">原创</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>封面图片</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {editingSong.cover_url ? (
                <img src={editingSong.cover_url} alt="cover" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
              )}
              <button type="button" onClick={onOpenImagePicker} style={{ padding: '8px 16px', background: '#4A90D9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                选择图片
              </button>
            </div>
          </div>
          <input
            type="text"
            value={editingSong.url || ''}
            onChange={e => onUpdateEditingSong({...editingSong, url: e.target.value})}
            placeholder="歌曲链接 (Bilibili/网易云 等)"
            style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <div className="form-actions">
            <button onClick={onSaveSong}>保存</button>
            <button className="btn-secondary" onClick={() => onEditSong(null)}>取消</button>
          </div>
        </div>
      )}
      
      <div className="section">
        <div className="section-header">
          <h3>歌曲列表 ({songs.length})</h3>
          <button onClick={() => onEditSong({ id: '', title: '', artist: '东爱璃 Lovely' })}>
            + 新增
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>封面</th>
              <th>歌名 / 歌手</th>
              <th>标签</th>
              <th>发布日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                <td>
                  {song.cover_url ? (
                    <img src={song.cover_url} alt="cover" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
                  )}
                </td>
                <td>
                  <strong>{song.title}</strong>
                  <div style={{ fontSize: '0.85em', color: '#666' }}>{song.artist}</div>
                </td>
                <td>{song.tag || '-'}</td>
                <td>{song.release_date || '-'}</td>
                <td className="actions">
                  {song.url && <a href={song.url} target="_blank" rel="noreferrer" style={{ marginRight: '8px', color: '#8B6F47' }}>链接</a>}
                  <button onClick={() => onEditSong(song)}>编辑</button>
                  <button className="btn-danger" onClick={() => onDeleteSong(song.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
