import { useState } from 'react';
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

function extractBvid(url: string): string | null {
  const match = url.match(/BV\w+/);
  return match ? match[0] : null;
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
  const [fetchingCover, setFetchingCover] = useState(false);
  const [coverMsg, setCoverMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  async function fetchBilibiliCover() {
    if (!editingSong?.url) {
      setCoverMsg({ type: 'error', text: '请先填写歌曲链接' });
      return;
    }
    const bvid = extractBvid(editingSong.url);
    if (!bvid) {
      setCoverMsg({ type: 'error', text: '未检测到有效的 B站 BV 号' });
      return;
    }
    setFetchingCover(true);
    setCoverMsg(null);
    try {
      const res = await fetch(`/api/bilibili-cover?bvid=${bvid}`);
      const json = (await res.json()) as { code: number; message?: string; data?: { pic?: string; title?: string } };
      if (json.code !== 0) {
        setCoverMsg({ type: 'error', text: `B站API错误: ${json.message || '未知错误'}` });
        return;
      }
      const pic = json.data?.pic;
      if (!pic) {
        setCoverMsg({ type: 'error', text: '未能获取到封面' });
        return;
      }
      // B站返回的封面URL是http://，在HTTPS站点上会被浏览器阻止，需要升级为https://
      const securePic = pic.replace(/^http:/, 'https:');
      onUpdateEditingSong({ ...editingSong, cover_url: securePic });
      setCoverMsg({ type: 'success', text: '封面获取成功！' });
    } catch (err) {
      setCoverMsg({ type: 'error', text: '获取封面失败，请检查网络或链接' });
    } finally {
      setFetchingCover(false);
    }
  }

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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '0.5rem 0' }}>
              {['中文', '日文', '翻唱', '原创'].map(t => {
                const checked = editingSong.tag?.includes(t) ?? false;
                return (
                  <label key={t} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${checked ? '#4A90D9' : '#ddd'}`,
                    background: checked ? 'rgba(74, 144, 217, 0.1)' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: checked ? '#4A90D9' : '#666',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = editingSong.tag || [];
                        const next = checked
                          ? current.filter(x => x !== t)
                          : [...current, t];
                        onUpdateEditingSong({ ...editingSong, tag: next.length > 0 ? next : undefined });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {t}
                  </label>
                );
              })}
            </div>
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: coverMsg ? '0.5rem' : '1rem' }}>
            <input
              type="text"
              value={editingSong.url || ''}
              onChange={e => {
                onUpdateEditingSong({...editingSong, url: e.target.value});
                if (coverMsg) setCoverMsg(null);
              }}
              placeholder="歌曲链接 (Bilibili/网易云 等)"
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button
              type="button"
              onClick={fetchBilibiliCover}
              disabled={fetchingCover}
              className="btn-bilibili"
              style={{
                padding: '0.75rem 1rem',
                background: fetchingCover ? '#ccc' : '#FB7299',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: fetchingCover ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
              }}
            >
              {fetchingCover ? '获取中...' : '📷 获取B站封面'}
            </button>
          </div>
          {coverMsg && (
            <div
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                background: coverMsg.type === 'success' ? '#e8f5e9' : '#ffebee',
                color: coverMsg.type === 'success' ? '#2e7d32' : '#c62828',
                border: `1px solid ${coverMsg.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
              }}
            >
              {coverMsg.text}
            </div>
          )}
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
                <td>{song.tag?.join('、') || '-'}</td>
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
