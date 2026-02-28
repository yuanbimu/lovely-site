import { useState, useEffect } from 'react';
import './Avatar.css';

interface AvatarResponse {
  avatarUrl: string;
  mid: string;
  lastChecked: string;
}

interface AvatarProps {
  size?: number;
  className?: string;
}

export default function Avatar({ size = 280, className = '' }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('/images/avatar.webp');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/avatar');
        const data: AvatarResponse = await response.json();
        
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch avatar');
        // Keep fallback avatar
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <div className={`avatar-wrapper ${className}`}>
      <div className="avatar-glow"></div>
      {isLoading ? (
        <div 
          className="avatar avatar-loading"
          style={{ width: size, height: size }}
        >
          <div className="avatar-spinner"></div>
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar"
          style={{ width: size, height: size }}
          loading="eager"
          decoding="async"
          onError={() => {
            setAvatarUrl('/images/avatar.webp');
          }}
        />
      )}
    </div>
  );
}
