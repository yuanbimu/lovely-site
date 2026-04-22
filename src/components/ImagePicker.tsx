import { useState, useEffect, useCallback } from 'react';
import './ImagePicker.css';

interface R2Folder {
  name: string;
  key: string;
}

interface R2File {
  type: string;
  key: string;
  url: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    folders?: R2Folder[];
    files?: R2File[];
  };
  error?: string;
}

interface UploadResponse {
  success: boolean;
  data?: {
    key: string;
    url: string;
  };
  error?: string;
}

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  type: 'cover' | 'image';
  showcaseFolder?: string;
}

function toR2Path(folder: string): string {
  return folder ? `showcase/${folder}` : '';
}

export default function ImagePicker({ isOpen, onClose, onSelect, type, showcaseFolder }: ImagePickerProps) {
  const [folders, setFolders] = useState<R2Folder[]>([]);
  const [files, setFiles] = useState<R2File[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async (folder: string) => {
    if (!folder) {
      setFiles([]);
      return;
    }
    try {
      const prefix = folder + '/';
      const res = await fetch(`/api/r2-files?prefix=${encodeURIComponent(prefix)}`, { credentials: 'include' });
      const data = (await res.json()) as ApiResponse;
      if (data.success && data.data) {
        setFiles(data.data.files || []);
      } else {
        setFiles([]);
      }
    } catch {
      setError('加载文件失败');
      setFiles([]);
    }
  }, []);

  // 初始化：加载目录和默认文件
  useEffect(() => {
    if (!isOpen) return;

    async function init() {
      try {
        setError(null);
        setFiles([]);
        setFolders([]);

        // 橱窗图片：强制使用 showcaseFolder
        if (type === 'image') {
          if (!showcaseFolder) {
            setError('请先保存橱窗的目录名称');
            return;
          }
          const r2Path = toR2Path(showcaseFolder);
          setCurrentFolder(r2Path);
          await loadFiles(r2Path);
          setFolders([{ name: r2Path, key: r2Path + '/' }]);
          return;
        }

        // 封面图片：加载所有 showcase/ 目录
        const res = await fetch('/api/r2-files?prefix=showcase/', { credentials: 'include' });
        const data = (await res.json()) as ApiResponse;
        if (!data.success) {
          setError('获取文件列表失败');
          return;
        }

        const loadedFolders: R2Folder[] = (data.data?.folders || []).map((f) => ({
          name: f.name.startsWith('showcase/') ? f.name : toR2Path(f.name),
          key: f.key
        }));

        setFolders(loadedFolders);

        if (loadedFolders.length > 0) {
          setCurrentFolder(loadedFolders[0].name);
          await loadFiles(loadedFolders[0].name);
        } else {
          setFiles([]);
        }
      } catch {
        setError('获取文件列表失败');
      }
    }

    init();
  }, [isOpen, type, showcaseFolder, loadFiles]);

  const handleFolderChange = useCallback((folder: string) => {
    setCurrentFolder(folder);
    loadFiles(folder);
  }, [loadFiles]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    const targetFolder = type === 'image' && showcaseFolder
      ? toR2Path(showcaseFolder)
      : currentFolder;

    if (!targetFolder) {
      setError('请先选择目录');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', targetFolder);

      const res = await fetch('/api/r2-upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = (await res.json()) as UploadResponse;
      if (data.success) {
        await loadFiles(targetFolder);
      } else {
        setError(data.error || '上传失败');
      }
    } catch {
      setError('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const imageFiles = files.filter(
    (f) => f.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !f.key.endsWith('.folder')
  );

  if (!isOpen) return null;

  return (
    <div className="image-picker-overlay" onClick={onClose}>
      <div className="image-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="image-picker-header">
          <h3>选择图片</h3>
          <button className="image-picker-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        {/* Upload Area */}
        <div className="image-picker-upload">
          <div className="image-picker-upload-row">
            <label className="image-picker-upload-btn">
              <span>📤</span>
              <span>上传图片</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>

            {type === 'cover' && (
              <select
                value={currentFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="image-picker-folder-select"
              >
                <option value="">选择目录</option>
                {folders.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            {uploading && <span className="image-picker-uploading">上传中...</span>}
          </div>

          {currentFolder && (
            <div className="image-picker-current-folder">
              当前目录: <strong>{currentFolder}</strong>
            </div>
          )}

          {error && <div className="image-picker-error">{error}</div>}
        </div>

        {/* Folder tags for cover type */}
        {type === 'cover' && folders.length > 0 && (
          <div className="image-picker-folders">
            <div className="image-picker-section-label">📁 目录</div>
            <div className="image-picker-folder-tags">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => handleFolderChange(folder.name)}
                  className={`image-picker-folder-tag ${currentFolder === folder.name ? 'active' : ''}`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Grid */}
        <div className="image-picker-content">
          <div className="image-picker-grid">
            {imageFiles.map((file) => (
              <div
                key={file.key}
                onClick={() => onSelect(file.url)}
                className="image-picker-item"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(file.url);
                  }
                }}
              >
                <img src={file.url} alt={file.key} loading="lazy" />
                <div className="image-picker-item-name">{file.key.split('/').pop()}</div>
              </div>
            ))}
          </div>

          {imageFiles.length === 0 && !error && (
            <div className="image-picker-empty">
              {currentFolder ? '暂无图片文件，请上传' : '请选择目录'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
