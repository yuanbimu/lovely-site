import type { Showcase, FolderImage } from '../types';

interface AdminShowcaseTabProps {
  showcases: Showcase[];
  editingShowcase: Showcase | null;
  folderImages: FolderImage[];
  uploading: boolean;
  maxShowcaseSort: number;
  onEditShowcase: (showcase: Showcase | null) => void;
  onUpdateEditingShowcase: (showcase: Showcase) => void;
  onSaveShowcase: () => void;
  onDeleteShowcase: (id: string) => void;
  onDeleteR2Image: (key: string) => void;
  onOpenImagePicker: () => void;
  onUploadToFolder: (file: File) => void;
}

export default function AdminShowcaseTab({
  showcases,
  editingShowcase,
  folderImages,
  uploading,
  maxShowcaseSort,
  onEditShowcase,
  onUpdateEditingShowcase,
  onSaveShowcase,
  onDeleteShowcase,
  onDeleteR2Image,
  onOpenImagePicker,
  onUploadToFolder
}: AdminShowcaseTabProps) {
  return (
    <div className="tab-content">
      <h1>櫥窗管理</h1>
      
      {editingShowcase && (
        <div className="section edit-section">
          <h3>{editingShowcase.id ? '編輯櫥窗' : '新增櫥窗'}</h3>
          
          {/* 第一行：展示序号 */}
          <div style={{ borderBottom: '1px dashed #ddd', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#666', fontSize: '0.875rem' }}>
              展示序号
            </label>
            <input
              type="number"
              value={editingShowcase.sort_order || 0}
              onChange={e => onUpdateEditingShowcase({...editingShowcase, sort_order: parseInt(e.target.value) || 0})}
              placeholder="输入数字排序"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          
          {/* 第二行：橱窗标题 */}
          <div style={{ borderBottom: '1px dashed #ddd', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', color: '#666', fontSize: '0.875rem' }}>
              橱窗标题
            </label>
            <input
              type="text"
              value={editingShowcase.name}
              onChange={e => onUpdateEditingShowcase({...editingShowcase, name: e.target.value})}
              placeholder="请输入橱窗名称（示例：待编写）"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          
          {/* 第三行：目录 - 只在编辑现有橱窗时显示 */}
          {editingShowcase.id && (
            <div style={{ borderBottom: '1px dashed #ddd', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: '#666', fontSize: '0.875rem' }}>
                目录
              </label>
              <input
                type="text"
                value={editingShowcase.folder || ''}
                readOnly
                placeholder="输入 R2 文件夹名称（如 model-1）"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', color: '#666' }}
              />
            </div>
          )}
          
          {/* 描述字段 - 放在最后 */}
          <input
            type="text"
            value={editingShowcase.description || ''}
            onChange={e => onUpdateEditingShowcase({...editingShowcase, description: e.target.value})}
            placeholder="描述（可选）"
            style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '1rem', fontWeight: 'bold' }}>📷 橱窗图片</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {editingShowcase.image_url ? (
                <img src={editingShowcase.image_url} alt="showcase" style={{ width: '80px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '80px', height: '100px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
              )}
              <button type="button" onClick={onOpenImagePicker} style={{ padding: '8px 16px', background: '#4A90D9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                選擇圖片
              </button>
            </div>
          </div>
          
          {/* Folder images - only show when editing existing showcase with folder */}
          {editingShowcase.id && editingShowcase.folder && folderImages.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                目錄圖片 ({folderImages.length})
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {folderImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img 
                      src={img.url} 
                      alt={`${img.key}`}
                      style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => onDeleteR2Image(img.key)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload to folder - show when editing existing showcase */}
          {editingShowcase.id && editingShowcase.folder && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>上傳圖片到此目錄</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadToFolder(file);
                  e.target.value = '';
                }}
                disabled={uploading}
                style={{ width: '100%', padding: '0.5rem' }}
              />
              {uploading && <span style={{ color: '#4A90D9', fontSize: '14px' }}>上傳中...</span>}
            </div>
          )}
          <div className="form-actions">
            <button onClick={onSaveShowcase}>保存</button>
            <button className="btn-secondary" onClick={() => onEditShowcase(null)}>取消</button>
          </div>
        </div>
      )}
      
      <div className="section">
        <div className="section-header">
          <h3>櫥窗列表 ({showcases.length})</h3>
          <button onClick={() => onEditShowcase({ id: '', name: '', sort_order: maxShowcaseSort + 1 })}>
            + 新增
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>圖片</th>
              <th>名稱 / 描述</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {showcases.map(showcase => (
              <tr key={showcase.id}>
                <td>
                  {showcase.image_url ? (
                    <img src={showcase.image_url} alt={showcase.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                  )}
                </td>
                <td>
                  <strong>{showcase.name}</strong>
                  {showcase.description && <div style={{ fontSize: '0.85em', color: '#666' }}>{showcase.description}</div>}
                </td>
                <td>{showcase.sort_order || 0}</td>
                <td className="actions">
                  <button onClick={() => onEditShowcase(showcase)}>編輯</button>
                  <button className="btn-danger" onClick={() => onDeleteShowcase(showcase.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
