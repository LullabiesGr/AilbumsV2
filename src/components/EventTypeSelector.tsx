import React from 'react';
import { Camera, Heart, Baby, User, Building, Users, Briefcase } from 'lucide-react';
import { EventType } from '../types';

interface EventTypeSelectorProps {
  selectedType: EventType | null;
  onSelect: (type: EventType) => void;
  required?: boolean;
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ 
  selectedType, 
  onSelect, 
  required = true 
}) => {
  const eventTypes = [
    { id: 'wedding', label: 'Wedding', icon: Heart, description: 'Wedding ceremonies and receptions' },
    { id: 'baptism', label: 'Baptism', icon: Baby, description: 'Religious ceremonies and celebrations' },
    { id: 'portrait', label: 'Portrait', icon: User, description: 'Individual and group portraits' },
    { id: 'family', label: 'Family', icon: Users, description: 'Family gatherings and events' },
    { id: 'corporate', label: 'Corporate', icon: Briefcase, description: 'Business events and headshots' },
    { id: 'event', label: 'General Event', icon: Camera, description: 'Parties, celebrations, and gatherings' },
    { id: 'landscape', label: 'Landscape', icon: Building, description: 'Nature and architectural photography' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Select Event Type
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {required 
          ? 'Choose the type of event to optimize AI analysis for your specific photography style.'
          : 'Optionally choose the type of event to optimize AI analysis (not required for manual review).'
        }
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id as EventType)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`
                    font-medium
                    ${isSelected 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}>
                    {type.label}
                  </h4>
                  <p className={`
                    text-sm mt-1
                    ${isSelected 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventTypeSelector;