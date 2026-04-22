import type { TimelineEvent } from '../types';

interface AdminTimelineTabProps {
  events: TimelineEvent[];
  editingEvent: TimelineEvent | null;
  importText: string;
  onEditEvent: (event: TimelineEvent | null) => void;
  onSaveEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  onImport: () => void;
  onImportTextChange: (value: string) => void;
  onUpdateEditingEvent: (event: TimelineEvent) => void;
}

export default function AdminTimelineTab({
  events,
  editingEvent,
  importText,
  onEditEvent,
  onSaveEvent,
  onDeleteEvent,
  onImport,
  onImportTextChange,
  onUpdateEditingEvent
}: AdminTimelineTabProps) {
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
          <button onClick={() => onEditEvent({ id: '', date: '', title: '', content: '' })}>
            + 新建
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>標題</th>
              <th>內容</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.date}</td>
                <td>{event.title}</td>
                <td>{event.content?.substring(0, 50)}...</td>
                <td className="actions">
                  <button onClick={() => onEditEvent(event)}>編輯</button>
                  <button className="btn-danger" onClick={() => onDeleteEvent(event.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 批量导入 */}
      <div className="section import-section">
        <h3>批量导入</h3>
        <textarea
          value={importText}
          onChange={e => onImportTextChange(e.target.value)}
          placeholder="格式: 日期|標題|內容&#10;示例: 2024-01-01|新年|新年快乐"
          rows={5}
        />
        <div className="form-actions">
          <button onClick={onImport}>导入</button>
        </div>
      </div>
    </div>
  );
}
