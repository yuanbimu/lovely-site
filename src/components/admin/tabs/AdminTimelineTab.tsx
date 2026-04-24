import type { TimelineEvent } from '../types';

// 標籤系統：標籤名 -> { color, icon }
const TAG_MAP: Record<string, { color: string; icon: string }> = {
  '首播': { color: 'purple', icon: '🎤' },
  '歌回': { color: 'green', icon: '🎵' },
  '遊戲': { color: 'teal', icon: '🎮' },
  '视频投稿': { color: 'cyan', icon: '📹' },
  '3D披露': { color: 'violet', icon: '👤' },
  '新衣裝': { color: 'orange', icon: '👗' },
  '紀念回': { color: 'red', icon: '🏆' },
  '聯動': { color: 'blue', icon: '🤝' },
  '重要': { color: 'red', icon: '⭐' },
  '生日': { color: 'yellow', icon: '🎂' },
  '周年': { color: 'amber', icon: '🎉' },
  '活動': { color: 'slate', icon: '📅' },
  '日常': { color: 'gray', icon: '📝' },
};

const TAG_NAMES = Object.keys(TAG_MAP);

function resolveTag(tagName?: string): { color: string; icon: string } {
  if (tagName && TAG_MAP[tagName]) {
    return TAG_MAP[tagName];
  }
  return { color: 'blue', icon: '⭐' };
}

interface AdminTimelineTabProps {
  events: TimelineEvent[];
  editingEvent: TimelineEvent | null;
  importText: string;
  total: number;
  page: number;
  limit: number;
  onEditEvent: (event: TimelineEvent | null) => void;
  onSaveEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  onImport: () => void;
  onImportTextChange: (value: string) => void;
  onUpdateEditingEvent: (event: TimelineEvent) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function AdminTimelineTab({
  events,
  editingEvent,
  importText,
  total,
  page,
  limit,
  onEditEvent,
  onSaveEvent,
  onDeleteEvent,
  onImport,
  onImportTextChange,
  onUpdateEditingEvent,
  onPageChange,
  onLimitChange
}: AdminTimelineTabProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="tab-content">
      <h1>時間線管理</h1>

      {/* 編輯表單 */}
      {editingEvent && (
        <div className="section edit-section">
          <h3>{editingEvent.id ? '編輯事件' : '新建事件'}</h3>
          <div className="form-grid">
            <input
              type="date"
              value={editingEvent.date}
              onChange={e => onUpdateEditingEvent({...editingEvent, date: e.target.value})}
            />
            <input
              type="text"
              value={editingEvent.title}
              onChange={e => onUpdateEditingEvent({...editingEvent, title: e.target.value})}
              placeholder="標題"
            />
          </div>
          <textarea
            value={editingEvent.content || ''}
            onChange={e => onUpdateEditingEvent({...editingEvent, content: e.target.value})}
            placeholder="內容（可選）"
            rows={3}
          />
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#6B5637' }}>標籤</label>
            <select
              value={editingEvent.tag || ''}
              onChange={e => {
                const tagName = e.target.value;
                const resolved = resolveTag(tagName);
                onUpdateEditingEvent({
                  ...editingEvent,
                  tag: tagName,
                  color: resolved.color,
                  icon: resolved.icon
                });
              }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid #E8D4C0', fontSize: '14px', marginBottom: '10px', width: '100%', maxWidth: '300px' }}
            >
              <option value="">請選擇標籤</option>
              {TAG_NAMES.map(tag => (
                <option key={tag} value={tag}>
                  {TAG_MAP[tag].icon} {tag}
                </option>
              ))}
            </select>
            <div className="tag-presets" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TAG_NAMES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-preset ${editingEvent.tag === tag ? 'active' : ''}`}
                  onClick={() => {
                    const resolved = resolveTag(tag);
                    onUpdateEditingEvent({
                      ...editingEvent,
                      tag,
                      color: resolved.color,
                      icon: resolved.icon
                    });
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid #E8D4C0',
                    background: editingEvent.tag === tag ? 'linear-gradient(135deg, #9d84b7 0%, #6a4c93 100%)' : 'white',
                    color: editingEvent.tag === tag ? 'white' : '#8B6F47',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {TAG_MAP[tag].icon} {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button onClick={() => onSaveEvent(editingEvent)}>保存</button>
            <button className="btn-secondary" onClick={() => onEditEvent(null)}>取消</button>
          </div>
        </div>
      )}

      {/* 事件列表 */}
      <div className="section">
        <div className="section-header">
          <h3>事件列表 ({events.length})</h3>
          <button onClick={() => onEditEvent({ id: '', date: '', title: '', content: '', tag: '', color: 'blue', icon: '⭐' })}>
            + 新建
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>標題</th>
              <th>內容</th>
              <th>標籤</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.date}</td>
                <td>{event.title}</td>
                <td>{event.content?.substring(0, 50)}...</td>
                <td>
                  {event.tag ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'rgba(157, 132, 183, 0.1)',
                      color: '#6a4c93',
                      fontSize: '13px',
                      fontWeight: 500
                    }}>
                      {resolveTag(event.tag).icon} {event.tag}
                    </span>
                  ) : '-'}
                </td>
                <td className="actions">
                  <button onClick={() => onEditEvent(event)}>編輯</button>
                  <button className="btn-danger" onClick={() => onDeleteEvent(event.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页控件 */}
        <div className="pagination" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '12px 0',
          borderTop: '1px solid #E8D4C0',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#8B6F47' }}>
            <span>每页</span>
            <select
              value={limit}
              onChange={e => onLimitChange(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E8D4C0',
                fontSize: '14px',
                background: 'white',
                color: '#6B5637'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>条，共 {total} 条</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E8D4C0',
                background: page <= 1 ? '#F5F0EB' : 'white',
                color: page <= 1 ? '#B0A090' : '#6B5637',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              上一页
            </button>
            <span style={{ fontSize: '14px', color: '#6B5637', padding: '0 8px' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E8D4C0',
                background: page >= totalPages ? '#F5F0EB' : 'white',
                color: page >= totalPages ? '#B0A090' : '#6B5637',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 批量导入 */}
      <div className="section import-section">
        <h3>批量导入</h3>
        <textarea
          value={importText}
          onChange={e => onImportTextChange(e.target.value)}
          placeholder="格式: 日期|標題|內容|標籤&#10;示例: 2024-01-01|新年|新年快乐|重要&#10;標籤可選：首播、歌回、遊戲、3D披露、新衣裝、紀念回、聯動、重要、生日、周年、活動、日常"
          rows={5}
        />
        <div className="form-actions">
          <button onClick={onImport}>导入</button>
        </div>
      </div>
    </div>
  );
}
