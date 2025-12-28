import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  className?: string;
  labelBefore?: string;
  labelAfter?: string;
  beforeImageStyle?: React.CSSProperties;
  afterImageStyle?: React.CSSProperties;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  className = "",
  labelBefore = "原图",
  labelAfter = "效果",
  beforeImageStyle,
  afterImageStyle
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e as unknown as MouseEvent).clientX - rect.left);
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = (e as unknown as TouchEvent).touches[0];
    const x = (touch.clientX - rect.left);
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    
    setSliderPosition(position);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-ew-resize group ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <img 
        src={afterUrl} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover" 
        style={afterImageStyle}
        draggable={false}
      />
      
      {/* Label After */}
      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
        {labelAfter}
      </div>

      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 h-full overflow-hidden border-r-2 border-white/80 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeUrl} 
          alt="Before" 
          className="absolute inset-0 h-full max-w-none object-cover"
          style={{ 
            ...beforeImageStyle,
            width: containerRef.current?.offsetWidth || '100%' 
          }} // Keep original aspect and apply custom style
          draggable={false}
        />
         {/* Label Before */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-20">
          {labelBefore}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-30 transition-transform duration-100 group-hover:scale-110"
        style={{ left: `${sliderPosition}%` }}
      >
        <MoveHorizontal className="text-gray-800 w-5 h-5" />
      </div>
    </div>
  );
};