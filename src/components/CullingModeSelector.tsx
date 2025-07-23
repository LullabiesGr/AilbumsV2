import React from 'react';
import { Zap, Clock, Hand } from 'lucide-react';
import { CullingMode } from '../types';

interface CullingModeSelectorProps {
  selectedMode: CullingMode | null;
  onSelect: (mode: CullingMode) => void;
}

const CullingModeSelector: React.FC<CullingModeSelectorProps> = ({ selectedMode, onSelect }) => {
  const cullingModes = [
    {
      id: 'fast',
      label: 'Fast Culling',
      icon: Zap,
      description: 'Quick analysis using basic analytics only',
      features: ['Basic blur detection', 'Exposure analysis', 'Face/eyes detection', 'Quick tagging', 'Real-time progress', '~30 seconds per 100 photos'],
      color: 'green'
    },
    {
      id: 'deep',
      label: 'Deep Analysis',
      icon: Clock,
      description: 'Advanced AI analysis with event-specific prompts',
      features: ['All basic analytics', 'AI model scoring', 'Event-specific BLIP prompts', 'Smart color labeling', 'Advanced categorization', 'Real-time progress', '~3 minutes per 100 photos'],
      color: 'blue'
    },
    {
      id: 'manual',
      label: 'Manual Review',
      icon: Hand,
      description: 'Manual culling with optional AI suggestions',
      features: ['No auto-scoring', 'Manual keep/reject', 'Optional AI suggestions', 'Full user control'],
      color: 'purple'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Select Culling Mode
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Choose how you want to analyze and cull your photos.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cullingModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id as CullingMode)}
              className={`
                p-6 rounded-lg border-2 transition-all duration-200 text-left h-full
                ${isSelected
                  ? `border-${mode.color}-500 bg-${mode.color}-50 dark:bg-${mode.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`
                    p-3 rounded-lg
                    ${isSelected 
                      ? `bg-${mode.color}-500 text-white` 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className={`
                      font-semibold text-lg
                      ${isSelected 
                        ? `text-${mode.color}-900 dark:text-${mode.color}-100` 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}>
                      {mode.label}
                    </h4>
                  </div>
                </div>
                
                <p className={`
                  text-sm mb-4 flex-1
                  ${isSelected 
                    ? `text-${mode.color}-700 dark:text-${mode.color}-300` 
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {mode.description}
                </p>
                
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className={`
                      text-sm flex items-center
                      ${isSelected 
                        ? `text-${mode.color}-600 dark:text-${mode.color}-400` 
                        : 'text-gray-500 dark:text-gray-500'
                      }
                    `}>
                      <div className={`
                        w-1.5 h-1.5 rounded-full mr-2
                        ${isSelected 
                          ? `bg-${mode.color}-500` 
                          : 'bg-gray-400'
                        }
                      `} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CullingModeSelector;