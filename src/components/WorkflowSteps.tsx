import React from 'react';
import { Upload, Settings, Brain, Eye, Check, Sparkles } from 'lucide-react';
import { WorkflowStage } from '../types';

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ currentStage }) => {
  const steps = [
    { id: 'upload', label: 'Upload Photos', icon: Upload },
    { id: 'upload', label: 'Upload & Configure', icon: Upload },
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'analyzing', label: 'AI Analysis', icon: Brain },
    { id: 'review', label: 'Review & Cull', icon: Eye },
    { id: 'face-retouch', label: 'Face Retouch', icon: Sparkles, separated: true },
    { id: 'ai-edit', label: 'Edit & Relight', icon: Sparkles, separated: false }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStage);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : status === 'current'
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
                  }
                `}>
                  {status === 'completed' ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-300
                  ${status === 'current' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <>
                  {steps[index + 1].separated ? (
                    // Visual separation for Face Retouch step
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-6 h-0.5 transition-colors duration-300
                        ${getStepStatus(steps[index + 1].id) === 'completed' || getStepStatus(steps[index + 1].id) === 'current'
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                        }
                      `} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <div className={`
                        w-6 h-0.5 transition-colors duration-300
                        ${getStepStatus(steps[index + 1].id) === 'completed' || getStepStatus(steps[index + 1].id) === 'current'
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                        }
                      `} />
                    </div>
                  ) : (
                    <div className={`
                      w-16 h-0.5 transition-colors duration-300
                      ${getStepStatus(steps[index + 1].id) === 'completed' || getStepStatus(steps[index + 1].id) === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                      }
                    `} />
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;