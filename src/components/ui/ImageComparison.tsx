import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ImageComparisonProps {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  springOptions?: {
    bounce: number;
    duration: number;
  };
}

interface ImageComparisonImageProps {
  src: string;
  alt: string;
  position: 'left' | 'right';
  className?: string;
}

interface ImageComparisonSliderProps {
  children?: ReactNode;
  className?: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  children, 
  className = '',
  enableHover = false,
  springOptions = { bounce: 0.2, duration: 0.4 }
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    if (isDragging || enableHover) {
      setSliderPosition(percentage);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'ew-resize' : 'pointer' }}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            sliderPosition,
            isDragging,
            springOptions
          });
        }
        return child;
      })}
    </div>
  );
};

export const ImageComparisonImage: React.FC<ImageComparisonImageProps & {
  sliderPosition?: number;
  isDragging?: boolean;
  springOptions?: { bounce: number; duration: number };
}> = ({ 
  src, 
  alt, 
  position, 
  className = '',
  sliderPosition = 50,
  isDragging = false,
  springOptions = { bounce: 0.2, duration: 0.4 }
}) => {
  const clipPath = position === 'left' 
    ? `inset(0 ${100 - sliderPosition}% 0 0)`
    : `inset(0 0 0 ${sliderPosition}%)`;

  return (
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      style={{
        clipPath,
        transition: isDragging ? 'none' : `clip-path ${springOptions.duration}s cubic-bezier(0.4, 0.0, 0.2, 1)`
      }}
      draggable={false}
    />
  );
};

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps & {
  sliderPosition?: number;
  isDragging?: boolean;
  springOptions?: { bounce: number; duration: number };
}> = ({ 
  children, 
  className = '',
  sliderPosition = 50,
  isDragging = false,
  springOptions = { bounce: 0.2, duration: 0.4 }
}) => {
  return (
    <div
      className={`absolute top-0 bottom-0 ${className}`}
      style={{
        left: `${sliderPosition}%`,
        transform: 'translateX(-50%)',
        transition: isDragging ? 'none' : `left ${springOptions.duration}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {children || (
        <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg border-2 border-blue-500 flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-blue-500"></div>
            <div className="w-0.5 h-4 bg-blue-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};