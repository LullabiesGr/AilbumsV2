import React from 'react';
import { useState } from 'react';
import { ColorLabel, ColorLabelConfig } from '../types';
import ColorLabelSelector from './ColorLabelSelector';
import { usePhoto } from '../context/PhotoContext';

interface ColorLabelIndicatorProps {
  colorLabel?: ColorLabel;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  photoId?: string;
  editable?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const colorLabelConfigs: Record<ColorLabel, ColorLabelConfig> = {
  green: {
    color: 'green',
    label: 'High Score (7+)',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    description: 'High quality (7+ score)'
  },
  red: {
    color: 'red',
    label: 'Low Score (<4)',
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    description: 'Low quality or issues'
  },
  yellow: {
    color: 'yellow',
    label: 'Needs Review',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    description: 'Special cases (closed eyes, warnings)'
  },
  blue: {
    color: 'blue',
    label: 'Client',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    description: 'Client/Special'
  },
  purple: {
    color: 'purple',
    label: 'Duplicates',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    description: 'Duplicate photos'
  }
};

const ColorLabelIndicator: React.FC<ColorLabelIndicatorProps> = ({ 
  colorLabel, 
  size = 'md', 
  showText = false,
  className = '',
  photoId,
  editable = false,
  position = 'bottom'
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const { updatePhotoColorLabel } = usePhoto();

  const handleColorLabelChange = (newLabel: ColorLabel | undefined) => {
    if (photoId && updatePhotoColorLabel) {
      updatePhotoColorLabel(photoId, newLabel);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (editable) {
      e.stopPropagation();
      setShowSelector(!showSelector);
    }
  };

  if (!colorLabel) return null;

  const config = colorLabelConfigs[colorLabel];
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`flex items-center gap-1 relative ${className} ${
        editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`} 
      title={config?.description || (editable ? 'Click to set color label' : '')}
      onClick={handleClick}
    >
      {config ? (
        <div 
          className={`${sizeClasses[size]} ${config.bgColor} rounded-full border border-white/20 shadow-sm`}
        />
      ) : editable ? (
        <div 
          className={`${sizeClasses[size]} border-2 border-dashed border-gray-400 dark:border-gray-500 
                     rounded-full hover:border-gray-600 dark:hover:border-gray-300 transition-colors`}
        />
      ) : null}
      {showText && (
        <span className={`${textSizeClasses[size]} ${config.textColor} font-medium`}>
          {config.label}
        </span>
      )}
      
      {showSelector && editable && (
        <ColorLabelSelector
          currentLabel={colorLabel}
          onSelect={handleColorLabelChange}
          onClose={() => setShowSelector(false)}
          position={position}
        />
      )}
    </div>
  );
};

export { colorLabelConfigs };
export default ColorLabelIndicator;