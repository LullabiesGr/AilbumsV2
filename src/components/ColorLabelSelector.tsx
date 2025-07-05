import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { ColorLabel } from '../types';
import { colorLabelConfigs } from './ColorLabelIndicator';

interface ColorLabelSelectorProps {
  currentLabel?: ColorLabel;
  onSelect: (label: ColorLabel | undefined) => void;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ColorLabelSelector: React.FC<ColorLabelSelectorProps> = ({ 
  currentLabel, 
  onSelect, 
  onClose,
  position = 'bottom'
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<ColorLabel | null>(null);

  const handleSelect = (label: ColorLabel | undefined) => {
    onSelect(label);
    onClose();
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} z-50 bg-white dark:bg-gray-800 
                 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 
                 p-3 min-w-[200px] animate-fade-in`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Color Label
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                   transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-2">
        {/* None option */}
        <button
          onClick={() => handleSelect(undefined)}
          onMouseEnter={() => setHoveredLabel(null)}
          onMouseLeave={() => setHoveredLabel(null)}
          className={`w-full flex items-center justify-between p-2 rounded-md 
                     transition-all duration-200 ${
            !currentLabel
              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 
                          rounded-full bg-gray-100 dark:bg-gray-700" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              None
            </span>
          </div>
          {!currentLabel && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>

        {/* Color label options */}
        {Object.entries(colorLabelConfigs).map(([color, config]) => (
          <button
            key={color}
            onClick={() => handleSelect(color as ColorLabel)}
            onMouseEnter={() => setHoveredLabel(color as ColorLabel)}
            onMouseLeave={() => setHoveredLabel(null)}
            className={`w-full flex items-center justify-between p-2 rounded-md 
                       transition-all duration-200 ${
              currentLabel === color
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div 
                className={`w-4 h-4 ${config.bgColor} rounded-full border border-white/20 
                           shadow-sm transition-transform duration-200 ${
                  hoveredLabel === color ? 'scale-110' : ''
                }`} 
              />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {config.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {config.description}
                </span>
              </div>
            </div>
            {currentLabel === color && (
              <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click a color to assign it to this photo
        </p>
      </div>
    </div>
  );
};

export default ColorLabelSelector;