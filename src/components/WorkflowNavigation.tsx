import React from 'react';
import { ArrowLeft, RotateCcw, Settings, Upload } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { WorkflowStage } from '../types';

interface WorkflowNavigationProps {
  currentStage: WorkflowStage;
  onStageChange?: (stage: WorkflowStage) => void;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({ 
  currentStage, 
  onStageChange 
}) => {
  const { resetWorkflow, photos, setWorkflowStage } = usePhoto();

  const handleBackToUpload = () => {
    if (onStageChange) {
      onStageChange('upload');
    } else {
      setWorkflowStage('upload');
    }
  };

  const handleBackToConfigure = () => {
    if (onStageChange) {
      onStageChange('configure');
    } else {
      setWorkflowStage('configure');
    }
  };

  const getBackButton = () => {
    switch (currentStage) {
      case 'configure':
        return (
          <button
            onClick={handleBackToUpload}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                     text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Upload</span>
          </button>
        );
      
      case 'review':
        return (
          <button
            onClick={handleBackToConfigure}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                     text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Configure</span>
          </button>
        );
      
      case 'face-retouch':
        return (
          <button
            onClick={() => {
              if (onStageChange) {
                onStageChange('review');
              } else {
                setWorkflowStage('review');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                     text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Review</span>
          </button>
        );
      
      case 'ai-edit':
        return (
          <button
            onClick={() => {
              if (onStageChange) {
                onStageChange('review');
              } else {
                setWorkflowStage('review');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                     text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Review</span>
          </button>
        );
      
      default:
        return null;
    }
  };

  const getAdditionalActions = () => {
    if (currentStage === 'upload') return null;

    return (
      <div className="flex items-center space-x-3">
        {currentStage !== 'upload' && (
          <button
            onClick={handleBackToUpload}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 
                     text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 
                     rounded-lg transition-colors duration-200 text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Add More Photos</span>
          </button>
        )}
        
        <button
          onClick={resetWorkflow}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                   rounded-lg transition-colors duration-200 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start Over</span>
        </button>
      </div>
    );
  };

  if (currentStage === 'upload') {
    return null;
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 
                  rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {getBackButton()}
        
        {photos.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{photos.length} photos loaded</span>
          </div>
        )}
      </div>
      
      {getAdditionalActions()}
    </div>
  );
};

export default WorkflowNavigation;