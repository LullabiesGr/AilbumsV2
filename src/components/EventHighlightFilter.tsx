import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { EVENT_HIGHLIGHT_TAGS } from '../types';

const EventHighlightFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    eventType, 
    eventHighlightFilter, 
    setEventHighlightFilter, 
    photos 
  } = usePhoto();
  
  // Don't show if no event type is selected
  if (!eventType || !EVENT_HIGHLIGHT_TAGS[eventType]) {
    return null;
  }
  
  const eventConfig = EVENT_HIGHLIGHT_TAGS[eventType];
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleFilterChange = (tag: string | null) => {
    setEventHighlightFilter(tag);
    setIsOpen(false);
  };
  
  // Get count for each highlight tag
  const getHighlightCount = (tag: string) => {
    return photos.filter(p => 
      p.blip_highlights?.some(highlight => 
        highlight.toLowerCase().includes(tag.toLowerCase())
      )
    ).length;
  };
  
  const getCurrentFilterLabel = () => {
    if (!eventHighlightFilter) return 'All Highlights';
    return eventHighlightFilter.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Filter out tags with 0 photos
  const availableTags = eventConfig.tags.filter(tag => getHighlightCount(tag) > 0);
  
  if (availableTags.length === 0) {
    return null;
  }
  
  return (
    <div className="relative z-20">
      <button 
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 rounded-md flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <div className="flex items-center space-x-1">
          <span className="text-sm">{eventConfig.icon}</span>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <span className="text-sm">{getCurrentFilterLabel()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200
                      dark:border-gray-700 rounded-md shadow-lg max-h-64 overflow-y-auto">
          <div className="py-1">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {eventConfig.icon} {eventConfig.label}
              </div>
            </div>
            
            {/* All Highlights option */}
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                        transition-colors duration-200 ${
                !eventHighlightFilter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
              }`}
              onClick={() => handleFilterChange(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span>All Highlights</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {photos.filter(p => p.blip_highlights && p.blip_highlights.length > 0).length}
                </span>
              </div>
            </button>
            
            {/* Individual highlight tags */}
            {availableTags.map((tag) => {
              const isActive = eventHighlightFilter?.toLowerCase() === tag.toLowerCase();
              const count = getHighlightCount(tag);
              const displayName = tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <button
                  key={tag}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                            transition-colors duration-200 ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                  }`}
                  onClick={() => handleFilterChange(tag)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>{displayName}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventHighlightFilter;