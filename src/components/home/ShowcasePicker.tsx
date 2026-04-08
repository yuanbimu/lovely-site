import { useState, useEffect } from 'react';

interface Showcase {
  id: string;
  name: string;
  description?: string;
  folder?: string;
  image_url?: string;
  sort_order?: number;
}

interface ShowcasePickerProps {
  onSelect: (imageUrl: string, showcaseName: string) => void;
  className?: string;
}

export default function ShowcasePicker({ onSelect, className = '' }: ShowcasePickerProps) {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentName, setCurrentName] = useState<string>('');

  // 加载橱窗数据
  useEffect(() => {
    async function fetchShowcases() {
      try {
        const res = await fetch('/api/showcases');
        const data = await res.json();
        if (data.success && data.data) {
          // 按 sort_order 排序
          const sorted = [...data.data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setShowcases(sorted);
          
          // 默认选中第一个
          if (sorted.length > 0) {
            setSelectedId(sorted[0].id);
            setCurrentImage(sorted[0].image_url || '');
            setCurrentName(sorted[0].name);
            onSelect(sorted[0].image_url || '', sorted[0].name);
          }
        }
      } catch (err) {
        console.error('[ShowcasePicker] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchShowcases();
  }, [onSelect]);

  // 处理选择变化
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const showcase = showcases.find(s => s.id === id);
    if (showcase) {
      setSelectedId(id);
      setCurrentImage(showcase.image_url || '');
      setCurrentName(showcase.name);
      onSelect(showcase.image_url || '', showcase.name);
    }
  };

  // 随机选择
  const handleRandom = () => {
    if (showcases.length === 0) return;
    const randomIndex = Math.floor(Math.random() * showcases.length);
    const randomShowcase = showcases[randomIndex];
    setSelectedId(randomShowcase.id);
    setCurrentImage(randomShowcase.image_url || '');
    setCurrentName(randomShowcase.name);
    onSelect(randomShowcase.image_url || '', randomShowcase.name);
  };

  if (loading) {
    return (
      <div className={`showcase-picker ${className}`}>
        <style>{`
          .showcase-picker-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #8B7355;
          }
          .showcase-picker-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(107, 86, 55, 0.1);
            border-left-color: #6B5637;
            border-radius: 50%;
            margin-bottom: 12px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="showcase-picker-loading">
          <div className="showcase-picker-spinner"></div>
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (showcases.length === 0) {
    return (
      <div className={`showcase-picker ${className}`}>
        <style>{`
          .showcase-picker-empty {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 16px;
            border: 1px dashed rgba(107, 86, 55, 0.2);
          }
          .showcase-picker-empty-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
            opacity: 0.5;
          }
          .showcase-picker-empty-title {
            font-size: 1rem;
            color: #6B5637;
            margin-bottom: 6px;
          }
          .showcase-picker-empty-desc {
            font-size: 0.85rem;
            color: #8B7355;
          }
        `}</style>
        <div className="showcase-picker-empty">
          <div className="showcase-picker-empty-icon">🖼️</div>
          <div className="showcase-picker-empty-title">暂无数窗</div>
          <div className="showcase-picker-empty-desc">请在后台添加橱窗数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`showcase-picker ${className}`}>
      <style>{`
        .showcase-picker {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .showcase-picker-select {
          flex: 1;
          min-width: 180px;
          padding: 12px 16px;
          font-size: 15px;
          color: #6B5637;
          background: white;
          border: 2px solid rgba(107, 86, 55, 0.15);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B5637' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .showcase-picker-select:hover {
          border-color: rgba(107, 86, 55, 0.3);
        }
        .showcase-picker-select:focus {
          border-color: #6B5637;
          box-shadow: 0 0 0 3px rgba(107, 86, 55, 0.1);
        }
        .showcase-picker-select option {
          padding: 10px;
          color: #6B5637;
          background: white;
        }
        .showcase-picker-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6B5637 0%, #8B7355 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(107, 86, 55, 0.25);
        }
        .showcase-picker-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 86, 55, 0.35);
        }
        .showcase-picker-btn:active {
          transform: translateY(0);
        }
        .showcase-picker-btn-icon {
          font-size: 16px;
        }
        .showcase-picker-preview {
          display: none;
        }
        
        @media (max-width: 600px) {
          .showcase-picker {
            flex-direction: column;
            align-items: stretch;
          }
          .showcase-picker-select {
            width: 100%;
            min-width: unset;
          }
          .showcase-picker-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <select 
        className="showcase-picker-select"
        value={selectedId}
        onChange={handleSelectChange}
        aria-label="选择橱窗"
      >
        {showcases.map(showcase => (
          <option key={showcase.id} value={showcase.id}>
            {showcase.name}
          </option>
        ))}
      </select>

      <button 
        type="button"
        className="showcase-picker-btn"
        onClick={handleRandom}
        aria-label="随机选择橱窗"
      >
        <span className="showcase-picker-btn-icon">🎲</span>
        <span>随机</span>
      </button>

      {/* 隐藏的预览图，用于辅助调试 */}
      {currentImage && (
        <div className="showcase-picker-preview">
          <img src={currentImage} alt={currentName} />
        </div>
      )}
    </div>
  );
}