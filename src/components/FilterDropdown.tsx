import React, { useState } from 'react';
import { Filter, ChevronDown, Star, AlertCircle, EyeOff, Copy, Users, Heart, AlertTriangle, Check, X } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { EVENT_HIGHLIGHT_TAGS } from '../types';

type FilterOption = 'all' | 'high-score' | 'approved' | 'not-approved' | 'blurry' | 'eyes-closed' | 'duplicates' | 'people' | 'emotions' | 'quality-issues';

interface FilterItem {
  value: FilterOption;
  label: string;
  icon: React.ReactNode;
}

const filterOptions: FilterItem[] = [
  { value: 'all', label: 'Show All', icon: <Filter className="h-4 w-4" /> },
  { value: 'high-score', label: 'High Score (7+)', icon: <Star className="h-4 w-4" /> },
  { value: 'approved', label: 'Backend Approved', icon: <Check className="h-4 w-4" /> },
  { value: 'not-approved', label: 'Not Approved', icon: <X className="h-4 w-4" /> },
  { value: 'people', label: 'With People', icon: <Users className="h-4 w-4" /> },
  { value: 'emotions', label: 'With Emotions', icon: <Heart className="h-4 w-4" /> },
  { value: 'blurry', label: 'Blurry', icon: <AlertCircle className="h-4 w-4" /> },
  { value: 'eyes-closed', label: 'Eyes Closed', icon: <EyeOff className="h-4 w-4" /> },
  { value: 'duplicates', label: 'Duplicates', icon: <Copy className="h-4 w-4" /> },
  { value: 'quality-issues', label: 'Quality Issues', icon: <AlertTriangle className="h-4 w-4" /> }
];

const FilterDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filterOption, setFilterOption, eventType, photos } = usePhoto();
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleFilterChange = (option: FilterOption) => {
    setFilterOption(option);
    setIsOpen(false);
  };
  
  const currentFilter = filterOptions.find(option => option.value === filterOption)?.label || 'Show All';
  
  // Get event-specific highlight counts
  const getEventHighlightCount = (tag: string) => {
    return photos.filter(p => 
      p.blip_highlights?.some(highlight => 
        highlight.toLowerCase().includes(tag.toLowerCase())
      )
    ).length;
  };
  
  return (
    <div className="relative z-20">
      <button 
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 rounded-md flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <Filter className="h-4 w-4" />
        <span>{currentFilter}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200
                      dark:border-gray-700 rounded-md shadow-lg">
          <ul className="py-1">
            {filterOptions.map((option) => (
              <li key={option.value}>
                <button
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                            ${filterOption === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                  onClick={() => handleFilterChange(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
            
            {/* Event-specific highlight filters */}
            {eventType && EVENT_HIGHLIGHT_TAGS[eventType] && (
              <>
                <li className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <li className="px-4 py-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {EVENT_HIGHLIGHT_TAGS[eventType].icon} {EVENT_HIGHLIGHT_TAGS[eventType].label}
                  </div>
                </li>
                {EVENT_HIGHLIGHT_TAGS[eventType].tags.map((tag) => {
                  const count = getEventHighlightCount(tag);
                  if (count === 0) return null;
                  
                  const displayName = tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  
                  return (
                    <li key={tag}>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                                 flex items-center justify-between"
                        onClick={() => {
                          // Set event highlight filter in context
                          setFilterOption('highlights');
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <span>{displayName}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;