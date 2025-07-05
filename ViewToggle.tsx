import React from 'react';
import { Grid, List, Minimize2 } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';

type ViewMode = 'grid' | 'list' | 'compact';

interface ViewOption {
  value: ViewMode;
  label: string;
  icon: React.ReactNode;
}

const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode } = usePhoto();
  
  const viewOptions: ViewOption[] = [
    { value: 'grid', label: 'Grid', icon: <Grid className="h-4 w-4" /> },
    { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
    { value: 'compact', label: 'Compact', icon: <Minimize2 className="h-4 w-4" /> }
  ];
  
  return (
    <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
      {viewOptions.map((option) => (
        <button
          key={option.value}
          className={`flex items-center px-3 py-2 ${
            viewMode === option.value 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => setViewMode(option.value)}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;