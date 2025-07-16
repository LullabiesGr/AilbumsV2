import React from 'react';
import { X, Brain, CheckCircle, Clock, Zap, Eye, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';

interface AnalysisOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ isVisible, onClose }) => {
  const { 
    isAnalyzing, 
    analysisProgress, 
    cullingMode, 
    photos 
  } = usePhoto();
  
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  // Analysis steps for visual feedback
  const basicSteps = [
    { icon: Eye, label: 'Detecting faces', color: 'text-blue-500' },
    { icon: Zap, label: 'Quality analysis', color: 'text-yellow-500' },
    { icon: Brain, label: 'AI scoring', color: 'text-purple-500' },
    { icon: Sparkles, label: 'Generating captions', color: 'text-green-500' }
  ];
  
  const deepSteps = [
    { icon: Eye, label: 'Face detection', color: 'text-blue-500' },
    { icon: Zap, label: 'Quality analysis', color: 'text-yellow-500' },
    { icon: Brain, label: 'AI scoring', color: 'text-purple-500' },
    { icon: Sparkles, label: 'Event analysis', color: 'text-green-500' },
    { icon: Brain, label: 'Categorization', color: 'text-indigo-500' },
    { icon: Sparkles, label: 'Smart labeling', color: 'text-pink-500' }
  ];
  
  const analysisSteps = cullingMode === 'deep' ? deepSteps : basicSteps;
  const actualProgress = analysisProgress.total > 0 ? (analysisProgress.processed / analysisProgress.total) * 100 : 0;
  const isComplete = analysisProgress.processed >= analysisProgress.total && !isAnalyzing;

  // Cycle through analysis steps
  React.useEffect(() => {
    if (!isComplete && analysisProgress.total > 0 && isAnalyzing) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % analysisSteps.length);
      }, 2000);

      return () => clearInterval(stepInterval);
    }
  }, [isComplete, analysisProgress.total, isAnalyzing, analysisSteps.length]);
  
  if (!isVisible) return null;

  const CurrentStepIcon = analysisSteps[currentStep]?.icon || Brain;

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <CurrentStepIcon className={`h-5 w-5 ${analysisSteps[currentStep]?.color} animate-pulse`} />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isComplete ? 'Analysis Complete' : 'Analyzing Photos...'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${actualProgress}%`,
                background: isComplete 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : 'linear-gradient(90deg, #3b82f6, #1d4ed8, #7c3aed)'
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{analysisProgress.processed} of {analysisProgress.total}</span>
            <span>{Math.round(actualProgress)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isComplete ? 'Analysis Complete!' : 'AI Analysis in Progress'}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {!isComplete && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <CurrentStepIcon className={`h-5 w-5 ${analysisSteps[currentStep]?.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {analysisSteps[currentStep]?.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {analysisSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 scale-105' 
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <StepIcon className={`h-4 w-4 mr-2 ${
                      isActive 
                        ? step.color 
                        : isCompleted
                        ? 'text-green-500'
                        : 'text-gray-400'
                    } ${isActive ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs ${
                      isActive 
                        ? 'text-gray-900 dark:text-gray-100 font-medium' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{analysisProgress.processed} of {analysisProgress.total} photos</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${actualProgress}%`,
                background: isComplete 
                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                  : 'linear-gradient(90deg, #3b82f6, #1d4ed8, #7c3aed)'
              }}
            >
              {!isComplete && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="text-center mt-2">
            <span className={`text-lg font-bold ${
              isComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {Math.round(actualProgress)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">complete</span>
          </div>
        </div>
        
        {analysisProgress.currentPhoto && !isComplete && (
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            <span>Processing: </span>
            <span className="font-medium ml-1 max-w-xs truncate">{analysisProgress.currentPhoto}</span>
          </div>
        )}
        
        {!isComplete && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
            <div className="text-center mb-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                {cullingMode === 'deep' ? 'Deep Analysis Mode' : 'Fast Analysis Mode'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Processing up to 2 photos simultaneously
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-blue-700 dark:text-blue-300">
                  {cullingMode === 'deep' ? 'Event Analysis' : 'Quality Check'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse animation-delay-200" />
                <span className="text-yellow-700 dark:text-yellow-300">
                  {cullingMode === 'deep' ? 'Categorization' : 'Face Detection'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2 text-center">
              {cullingMode === 'deep' 
                ? 'Deep analysis complete! Photos analyzed with event-specific insights.'
                : 'Analysis complete! Photos are ready for review and culling.'
              }
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-green-600 dark:text-green-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Quality scored</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Faces detected</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{cullingMode === 'deep' ? 'Deep insights' : 'Content analyzed'}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Live stats */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {photos.filter(p => p.ai_score >= 7).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">High Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {photos.filter(p => p.approved === true).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Approved</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {photos.filter(p => p.faces && p.faces.length > 0).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">With Faces</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisOverlay;