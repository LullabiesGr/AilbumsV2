import React, { useState } from 'react';
import { ChevronDown, Circle } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { ColorLabel, Filter } from '../types';
import { colorLabelConfigs } from './ColorLabelIndicator';

const ColorLabelFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filterOption, setFilterOption, photos } = usePhoto();
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleFilterChange = (option: Filter) => {
    setFilterOption(option);
    setIsOpen(false);
  };

  // Count photos by color label
  const colorCounts = Object.keys(colorLabelConfigs).reduce((acc, color) => {
    acc[color as ColorLabel] = photos.filter(p => p.color_label === color).length;
    return acc;
  }, {} as Record<ColorLabel, number>);

  const isColorFilter = ['green', 'red', 'yellow', 'blue', 'purple'].includes(filterOption);
  const currentLabel = isColorFilter ? filterOption as ColorLabel : null;
  
  return (
    <div className="relative z-20">
      <button 
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 rounded-md flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <Circle className="h-4 w-4" />
        <span>
          {currentLabel ? colorLabelConfigs[currentLabel].label : 'Color Labels'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200
                      dark:border-gray-700 rounded-md shadow-lg">
          <ul className="py-1">
            <li>
              <button
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                          ${!isColorFilter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                <div className="flex items-center justify-between">
                  <span>All Colors</span>
                  <span className="text-xs text-gray-500">{photos.length}</span>
                </div>
              </button>
            </li>
            {Object.entries(colorLabelConfigs).map(([color, config]) => (
              <li key={color}>
                <button
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                            ${filterOption === color ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                  onClick={() => handleFilterChange(color as Filter)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${config.bgColor} rounded-full`} />
                      <span>{config.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{colorCounts[color as ColorLabel]}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ColorLabelFilter;