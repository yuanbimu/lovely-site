import { useState } from 'react';
import ShowcasePicker from './ShowcasePicker';

interface AboutImageBoxProps {
  initialImage: string;
  profileName: string;
}

export default function AboutImageBox({ initialImage, profileName }: AboutImageBoxProps) {
  const [currentImage, setCurrentImage] = useState(initialImage);

  const handleSelect = (imageUrl: string, showcaseName: string) => {
    setCurrentImage(imageUrl);
  };

  return (
    <div className="about-img-box">
      <img 
        src={currentImage} 
        alt={profileName} 
        loading="lazy" 
        decoding="async"
        onError={(e) => {
          const target = e.currentTarget;
          target.src = 'https://placehold.co/400x400/C4A77D/FFFFFF?text=Lovely';
        }}
      />
      <div className="img-backdrop"></div>
      
      {/* 橱窗选择器 */}
      <div className="about-picker-container">
        <ShowcasePicker onSelect={handleSelect} />
      </div>
    </div>
  );
}