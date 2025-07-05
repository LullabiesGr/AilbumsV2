import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, Clock, Zap, Eye, Sparkles } from 'lucide-react';

interface AnalysisProgressProps {
  totalPhotos: number;
  processedPhotos: number;
  currentPhoto?: string;
  isDeepAnalysis?: boolean;
  showRealTimeProgress?: boolean;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ 
  totalPhotos, 
  processedPhotos, 
  currentPhoto,
  isDeepAnalysis = false,
  showRealTimeProgress = false
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const actualProgress = totalPhotos > 0 ? (processedPhotos / totalPhotos) * 100 : 0;
  const isComplete = processedPhotos >= totalPhotos;

  // Analysis steps for visual feedback
  const basicSteps = [
    { icon: Eye, label: 'Detecting faces and objects', color: 'text-blue-500' },
    { icon: Zap, label: 'Analyzing image quality', color: 'text-yellow-500' },
    { icon: Brain, label: 'AI scoring and classification', color: 'text-purple-500' },
    { icon: Sparkles, label: 'Generating captions', color: 'text-green-500' }
  ];
  
  const deepSteps = [
    { icon: Eye, label: 'Detecting faces and objects', color: 'text-blue-500' },
    { icon: Zap, label: 'Analyzing image quality', color: 'text-yellow-500' },
    { icon: Brain, label: 'AI scoring and classification', color: 'text-purple-500' },
    { icon: Sparkles, label: 'Event-specific analysis', color: 'text-green-500' },
    { icon: Brain, label: 'Advanced categorization', color: 'text-indigo-500' },
    { icon: Sparkles, label: 'Smart color labeling', color: 'text-pink-500' }
  ];
  
  const analysisSteps = isDeepAnalysis ? deepSteps : basicSteps;

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev < actualProgress) {
          return Math.min(prev + 0.5, actualProgress);
        }
        return actualProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [actualProgress]);

  // Cycle through analysis steps
  useEffect(() => {
    if (!isComplete && totalPhotos > 0) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % analysisSteps.length);
      }, 2000);

      return () => clearInterval(stepInterval);
    }
  }, [isComplete, totalPhotos, analysisSteps.length]);

  const CurrentStepIcon = analysisSteps[currentStep]?.icon || Brain;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
      <div className="text-center">
        <div className="mb-6">
          {isComplete ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <div className="relative">
              <Brain className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
              <div className="absolute -bottom-2 -right-2">
                <CurrentStepIcon className={`h-6 w-6 ${analysisSteps[currentStep]?.color} animate-bounce`} />
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {isComplete ? 'Analysis Complete!' : 'Analyzing Photos...'}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isComplete 
            ? 'Your photos have been analyzed and are ready for review.'
            : showRealTimeProgress
              ? isDeepAnalysis 
                ? 'Processing photos one by one with deep AI analysis. Each photo receives comprehensive evaluation with event-specific insights.'
                : 'Our AI is analyzing your photos for quality, composition, and content.'
              : isDeepAnalysis 
                ? 'Our AI is performing deep analysis with event-specific prompts and advanced categorization.'
                : 'Our AI is analyzing your photos for quality, composition, and content.'
          }
        </p>
        
        {!isComplete && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CurrentStepIcon className={`h-5 w-5 ${analysisSteps[currentStep]?.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {analysisSteps[currentStep]?.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {analysisSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 scale-105' 
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <StepIcon className={`h-4 w-4 mb-1 ${
                      isActive 
                        ? step.color 
                        : isCompleted
                        ? 'text-green-500'
                        : 'text-gray-400'
                    } ${isActive ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs text-center ${
                      isActive 
                        ? 'text-gray-900 dark:text-gray-100 font-medium' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label.split(' ').slice(0, 2).join(' ')}
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
            <span>{processedPhotos} of {totalPhotos} photos</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="h-4 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${animatedProgress}%`,
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
              {Math.round(animatedProgress)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">complete</span>
          </div>
        </div>
        
        {currentPhoto && !isComplete && (
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            <span>{isDeepAnalysis ? 'Processing: ' : 'Analyzing: '}</span>
            <span className="font-medium ml-1 max-w-xs truncate">{currentPhoto}</span>
          </div>
        )}
        
        {!isComplete && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                {isDeepAnalysis ? 'Deep Analysis Mode' : 'Fast Analysis Mode'}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Processing up to 2 photos simultaneously for optimal performance
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-blue-700 dark:text-blue-300">
                  {isDeepAnalysis ? 'Event Analysis' : 'Quality Check'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse animation-delay-200" />
                <span className="text-yellow-700 dark:text-yellow-300">
                  {isDeepAnalysis ? 'Categorization' : 'Face Detection'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-400" />
                <span className="text-purple-700 dark:text-purple-300">
                  {isDeepAnalysis ? 'Smart Labeling' : 'AI Scoring'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              {isDeepAnalysis 
                ? 'Deep analysis complete! Your photos have been thoroughly analyzed with event-specific insights and advanced categorization.'
                : 'Analysis complete! You can now review your photos and use the color labels to organize them.'
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
                <span>{isDeepAnalysis ? 'Deep insights generated' : 'Content analyzed'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisProgress;