import React, { useEffect, useState } from 'react';
import { Check, X, SkipForward, ArrowLeft, ArrowRight, Keyboard } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import StarRating from './StarRating';

interface ManualCullingControlsProps {
  currentPhotoId?: string;
}

const ManualCullingControls: React.FC<ManualCullingControlsProps> = ({ currentPhotoId }) => {
  const { 
    markPhotoAsKeep, 
    markPhotoAsReject, 
    photos, 
    cullingMode, 
    filteredPhotos,
    setFilterOption 
  } = usePhoto();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Only show manual controls in manual mode
  if (cullingMode !== 'manual') {
    return null;
  }

  const unprocessedPhotos = photos.filter(p => !p.color_label || p.color_label === 'yellow');
  const keepCount = photos.filter(p => p.color_label === 'green').length;
  const rejectCount = photos.filter(p => p.color_label === 'red').length;
  const remainingCount = unprocessedPhotos.length;
  
  const currentPhoto = unprocessedPhotos[currentIndex];

  const handleKeep = () => {
    if (currentPhoto) {
      markPhotoAsKeep(currentPhoto.id);
      // Move to next photo
      if (currentIndex < unprocessedPhotos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleReject = () => {
    if (currentPhoto) {
      markPhotoAsReject(currentPhoto.id);
      // Move to next photo
      if (currentIndex < unprocessedPhotos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < unprocessedPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < unprocessedPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          handleKeep();
          break;
        case 'r':
          event.preventDefault();
          handleReject();
          break;
        case 'arrowright':
        case ' ':
          event.preventDefault();
          handleSkip();
          break;
        case 'arrowleft':
          event.preventDefault();
          handlePrevious();
          break;
        case '?':
          event.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, unprocessedPhotos.length, showKeyboardHelp]);

  if (remainingCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Manual Review Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have reviewed all photos. {keepCount} kept, {rejectCount} rejected.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setFilterOption('green')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              View Kept Photos ({keepCount})
            </button>
            <button
              onClick={() => setFilterOption('red')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              View Rejected Photos ({rejectCount})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Manual Review Mode
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review each photo individually and decide to keep or reject
          </p>
        </div>
        <button
          onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                   hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Keyboard shortcuts"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </div>

      {/* Progress and Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">
            Photo {currentIndex + 1} of {unprocessedPhotos.length}
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Keep: {keepCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Reject: {rejectCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Remaining: {remainingCount}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / unprocessedPhotos.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Photo Preview */}
      {currentPhoto && (
        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {currentPhoto.filename}
                </h4>
                
                {/* Star Rating */}
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                    <StarRating 
                      score={currentPhoto.ai_score || 0} 
                      photoId={currentPhoto.id}
                      readonly={false}
                      size="md"
                      showLabel={true}
                    />
                  </div>
                </div>
                
                {currentPhoto.caption && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {currentPhoto.caption}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  {currentPhoto.tags?.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                   disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg 
                   transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {unprocessedPhotos.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex >= unprocessedPhotos.length - 1}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                   disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg 
                   transition-colors duration-200"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleReject}
          disabled={!currentPhoto}
          className="flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                   transition-colors duration-200 font-medium text-lg"
        >
          <X className="h-6 w-6" />
          <span>Reject</span>
        </button>

        <button
          onClick={handleSkip}
          disabled={!currentPhoto}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 
                   disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                   transition-colors duration-200 font-medium"
        >
          <SkipForward className="h-5 w-5" />
          <span>Skip</span>
        </button>

        <button
          onClick={handleKeep}
          disabled={!currentPhoto}
          className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                   transition-colors duration-200 font-medium text-lg"
        >
          <Check className="h-6 w-6" />
          <span>Keep</span>
        </button>
      </div>

      {/* Keyboard Help */}
      {showKeyboardHelp && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">K</kbd>
              <span className="text-blue-800 dark:text-blue-200">Keep photo</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">R</kbd>
              <span className="text-blue-800 dark:text-blue-200">Reject photo</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">→</kbd>
              <span className="text-blue-800 dark:text-blue-200">Next/Skip</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">←</kbd>
              <span className="text-blue-800 dark:text-blue-200">Previous</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Space</kbd>
              <span className="text-blue-800 dark:text-blue-200">Skip photo</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">?</kbd>
              <span className="text-blue-800 dark:text-blue-200">Toggle help</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualCullingControls;