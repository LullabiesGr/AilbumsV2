import React, { useState } from 'react';
import { ArrowLeft, Palette, Download, RotateCcw, Eye, EyeOff, Check, X, Sparkles, ArrowLeftRight } from 'lucide-react';
import { Photo, AIStyleResult } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { aiStyleTransfer } from '../lib/api';
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from './ui/ImageComparison';

interface AIStyleModeProps {
  onBack: () => void;
}

const AIStyleMode: React.FC<AIStyleModeProps> = ({ onBack }) => {
  const { photos } = usePhoto();
  const { showToast } = useToast();
  
  const [referencePhoto, setReferencePhoto] = useState<Photo | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AIStyleResult[]>([]);
  const [viewMode, setViewMode] = useState<Map<string, 'before' | 'after' | 'comparison'>>(new Map());
  const [strength, setStrength] = useState(0.5);

  const handleReferenceSelect = (photo: Photo) => {
    setReferencePhoto(photo);
    // Remove from targets if it was selected
    const newTargets = new Set(targetPhotos);
    newTargets.delete(photo.id);
    setTargetPhotos(newTargets);
  };

  const handleTargetToggle = (photo: Photo) => {
    // Can't select reference as target
    if (referencePhoto?.id === photo.id) return;
    
    const newTargets = new Set(targetPhotos);
    if (newTargets.has(photo.id)) {
      newTargets.delete(photo.id);
    } else {
      newTargets.add(photo.id);
    }
    setTargetPhotos(newTargets);
  };

  const handleApplyAIStyle = async () => {
    if (!referencePhoto || targetPhotos.size === 0) {
      showToast('Please select a reference photo and target photos', 'warning');
      return;
    }
    
    console.log('🎨 Starting AI Style Transfer with:', {
      reference: { id: referencePhoto.id, filename: referencePhoto.filename },
      targets: Array.from(targetPhotos).map(id => {
        const photo = photos.find(p => p.id === id);
        return { id, filename: photo?.filename };
      }),
      strength
    });
    
    setIsProcessing(true);
    try {
      const targetPhotoObjects = photos.filter(p => targetPhotos.has(p.id));
      const targetFiles = targetPhotoObjects.map(p => p.file);
      
      console.log('📁 Files prepared for AI style transfer:', {
        referenceFile: { name: referencePhoto.file.name, type: referencePhoto.file.type, size: referencePhoto.file.size },
        targetFiles: targetFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
        strength
      });
      
      const response = await aiStyleTransfer(referencePhoto.file, targetFiles, strength);
      const transferResults = response.results || response;
      
      console.log('✅ AI Style transfer completed:', transferResults);
      setResults(transferResults);
      showToast(`AI Style transfer completed for ${transferResults.length} photos!`, 'success');
    } catch (e: any) {
      const msg = e?.message || 'AI Style transfer failed';
      console.error('❌ AI Style error detail:', {
        message: msg,
        error: e,
        stack: e?.stack,
        referencePhoto: referencePhoto ? { id: referencePhoto.id, filename: referencePhoto.filename } : null,
        targetCount: targetPhotos.size,
        strength
      });
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: AIStyleResult) => {
    if (!result) return;

    try {
      // Download the result image from the backend
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'https://b455dac5621c.ngrok-free.app'}/${result.result_image_file}`;
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ai_style_${result.filename}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      showToast('AI Style result downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download photo', 'error');
    }
  };

  const handleReset = () => {
    setReferencePhoto(null);
    setTargetPhotos(new Set());
    setResults([]);
    setViewMode(new Map());
    setStrength(0.5);
  };

  const toggleViewMode = (filename: string) => {
    const newViewMode = new Map(viewMode);
    const current = newViewMode.get(filename) || 'after';
    
    // Cycle through: after -> before -> comparison -> after
    const nextMode = current === 'after' ? 'before' : 
                    current === 'before' ? 'comparison' : 'after';
    
    newViewMode.set(filename, nextMode);
    setViewMode(newViewMode);
  };

  const canApply = referencePhoto && targetPhotos.size > 0 && !isProcessing;

  // Get result image URL
  const getResultImageUrl = (result: AIStyleResult) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://b455dac5621c.ngrok-free.app';
    return `${baseUrl}/${result.result_image_file}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 
                      dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-lg" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-2 
                      border-indigo-200 dark:border-indigo-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full 
                          flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 
                         bg-clip-text text-transparent">
              AI Style Transfer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Transfer the artistic style and color grading from one photo to multiple target photos using AI-powered LUT generation.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                       text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Review</span>
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {photos.length} photos available for style transfer
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 
                        dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-700 
                        rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
              How AI Style Transfer Works:
            </h3>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• Click on one photo to set it as the <strong>reference</strong> (style source)</li>
              <li>• Click on multiple photos to select them as <strong>targets</strong> (will receive the style)</li>
              <li>• Adjust the strength slider to control how much style to apply</li>
              <li>• Click "Apply AI Style" to generate and apply custom LUTs</li>
              <li>• View before/after comparisons and download the results</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Style Transfer Settings
          </h3>
          <div className="flex items-center space-x-3">
            {/* Strength Slider */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Strength:
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={strength}
                onChange={(e) => setStrength(parseFloat(e.target.value))}
                className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono w-8">
                {strength.toFixed(1)}
              </span>
            </div>
            
            {canApply && (
              <button
                onClick={handleApplyAIStyle}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                         hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                <Sparkles className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Apply AI Style'}</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                       flex items-center space-x-2 transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reference Photo */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-3">
              Reference Photo (Style Source)
            </h4>
            {referencePhoto ? (
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={referencePhoto.url}
                    alt={referencePhoto.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {referencePhoto.filename}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This photo's style will be transferred to targets
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Click on a photo below to select it as reference
              </p>
            )}
          </div>

          {/* Target Photos */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3">
              Target Photos ({targetPhotos.size})
            </h4>
            {targetPhotos.size > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(targetPhotos).map(photoId => {
                  const photo = photos.find(p => p.id === photoId);
                  if (!photo) return null;
                  
                  return (
                    <div key={photoId} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                        {photo.filename}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Click on photos below to select them as targets
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI Style Transfer Results ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const originalPhoto = photos.find(p => p.filename === result.filename);
              if (!originalPhoto) return null;
              
              const currentViewMode = viewMode.get(result.filename) || 'after';
              const resultImageUrl = getResultImageUrl(result);
              
              return (
                <div key={`${result.filename}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 relative bg-gray-200 dark:bg-gray-600">
                    {currentViewMode === 'comparison' ? (
                      <ImageComparison className="w-full h-full">
                        <ImageComparisonImage
                          src={originalPhoto.url}
                          alt={`Original ${result.filename}`}
                          position="left"
                        />
                        <ImageComparisonImage
                          src={resultImageUrl}
                          alt={`AI Style Result ${result.filename}`}
                          position="right"
                        />
                        <ImageComparisonSlider className="w-1 bg-gradient-to-b from-indigo-500 to-purple-500 shadow-lg">
                          <div className="absolute left-1/2 top-1/2 h-8 w-6 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl border-2 border-indigo-500 flex items-center justify-center">
                            <ArrowLeftRight className="w-3 h-3 text-indigo-600" />
                          </div>
                        </ImageComparisonSlider>
                      </ImageComparison>
                    ) : currentViewMode === 'before' ? (
                      <img
                        src={originalPhoto.url}
                        alt={`Original ${result.filename}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={resultImageUrl}
                        alt={`AI Style Result ${result.filename}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* View Mode Toggle */}
                    <button
                      onClick={() => toggleViewMode(result.filename)}
                      className="absolute top-2 left-2 px-2 py-1 bg-black/75 text-white text-xs 
                               rounded hover:bg-black/90 transition-colors duration-200 flex items-center space-x-1"
                    >
                      {currentViewMode === 'before' ? <EyeOff className="h-3 w-3" /> : 
                       currentViewMode === 'after' ? <Eye className="h-3 w-3" /> : 
                       <ArrowLeftRight className="h-3 w-3" />}
                      <span>
                        {currentViewMode === 'before' ? 'Before' : 
                         currentViewMode === 'after' ? 'After' : 
                         'Compare'}
                      </span>
                    </button>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      ✓ Complete
                    </div>
                    
                    {/* Strength Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-500 text-white text-xs rounded">
                      Strength: {result.strength_used.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={result.filename}>
                      {result.filename}
                    </h4>
                    
                    {result.info && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {result.info}
                      </p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleViewMode(result.filename)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                 text-sm rounded-md flex items-center justify-center space-x-1 
                                 transition-colors duration-200"
                      >
                        {currentViewMode === 'before' ? <Eye className="h-4 w-4" /> : 
                         currentViewMode === 'after' ? <EyeOff className="h-4 w-4" /> : 
                         <ArrowLeftRight className="h-4 w-4" />}
                        <span>
                          {currentViewMode === 'before' ? 'Show After' : 
                           currentViewMode === 'after' ? 'Show Compare' : 
                           'Show Before'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleDownload(result)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white 
                                 text-sm rounded-md flex items-center justify-center space-x-1 
                                 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Photos for AI Style Transfer
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click to select reference (indigo) or targets (purple)
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Photos Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload photos first to start AI style transfer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {photos.map((photo) => {
              const isReference = referencePhoto?.id === photo.id;
              const isTarget = targetPhotos.has(photo.id);
              const hasResult = results.some(r => r.filename === photo.filename);
              
              return (
                <div
                  key={photo.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer 
                           transition-all duration-200 border-2 ${
                    isReference
                      ? 'border-indigo-500 ring-2 ring-indigo-300 shadow-lg'
                      : isTarget
                      ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
                                transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-white/90 rounded-lg p-2 space-y-1">
                      <button
                        onClick={() => handleReferenceSelect(photo)}
                        disabled={isReference}
                        className={`w-full px-3 py-1.5 text-xs rounded transition-colors ${
                          isReference
                            ? 'bg-indigo-500 text-white cursor-default'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {isReference ? '✓ Reference' : 'Set Reference'}
                      </button>
                      
                      <button
                        onClick={() => handleTargetToggle(photo)}
                        disabled={isReference}
                        className={`w-full px-3 py-1.5 text-xs rounded transition-colors ${
                          isReference
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isTarget
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {isTarget ? '✓ Target' : 'Add Target'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2">
                    {isReference && (
                      <div className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium">
                        Reference
                      </div>
                    )}
                    {isTarget && (
                      <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
                        Target
                      </div>
                    )}
                  </div>
                  
                  {/* Result Indicator */}
                  {hasResult && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Filename */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.filename}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStyleMode;