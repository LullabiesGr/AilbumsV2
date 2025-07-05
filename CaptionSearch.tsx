import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';

const CaptionSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { setCaptionFilter, captionFilter } = usePhoto();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCaptionFilter(value.trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCaptionFilter('');
    setIsActive(false);
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setIsActive(false);
    }
  };

  return (
    <div className={`relative transition-all duration-200 ${
      isActive || searchTerm ? 'w-64' : 'w-40'
    }`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search captions..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                   dark:border-gray-700 rounded-md text-sm placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 z-20">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Searching for: <span className="font-medium">"{searchTerm}"</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CaptionSearch;