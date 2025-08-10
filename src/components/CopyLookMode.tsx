import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, RotateCcw, Eye, EyeOff, Check, X, Palette, ArrowLeftRight } from 'lucide-react';
import { Photo, ColorTransferResult } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { colorTransfer } from '../lib/api';
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from './ui/ImageComparison';

interface CopyLookModeProps {
  onBack: () => void;
}

const CopyLookMode: React.FC<CopyLookModeProps> = ({ onBack }) => {
  const { photos } = usePhoto();
  const { showToast } = useToast();
  
  const [referencePhoto, setReferencePhoto] = useState<Photo | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ColorTransferResult[]>([]);
  const [viewMode, setViewMode] = useState<Map<string, 'before' | 'after' | 'comparison'>>(new Map());

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

  const handleApplyCopyLook = async () => {
  if (!referencePhoto || targetPhotos.size === 0) {
    showToast('Please select a reference photo and target photos', 'warning');
    return;
  }

  setIsProcessing(true);
  try {
    const targetPhotoObjects = photos.filter(p => targetPhotos.has(p.id));
    const targetFiles = targetPhotoObjects.map(p => p.file);

    console.log('Starting color transfer:', {
      reference: referencePhoto.filename,
      targets: targetPhotoObjects.map(p => p.filename)
    });

    const formData = new FormData();
    formData.append('reference', referencePhoto.file);
    targetFiles.forEach((file, idx) => {
      formData.append('targets', file);
    });

    const response = await fetch('/api/color-transfer', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LUT and Apply failed: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const transferResults = data.results || data;

    setResults(transferResults);
    showToast(`Color transfer completed for ${transferResults.length} photos!`, 'success');
  } catch (error: any) {
    console.error('CopyLook error detail:', error);
    showToast(error.message || 'Color transfer failed', 'error');
  } finally {
    setIsProcessing(false);
  }
};

  const handleDownload = (result: ColorTransferResult) => {
    if (!result) return;

    try {
      const byteCharacters = atob(result.image_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copy_look_${result.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Photo downloaded!', 'success');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-red-100 to-orange-100 
                      dark:from-orange-900/20 dark:via-red-900/20 dark:to-orange-900/20 rounded-lg" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-2 
                      border-orange-200 dark:border-orange-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full 
                          flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 
                         bg-clip-text text-transparent">
              Copy Look Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Transfer the color grading and look from one photo to multiple target photos. 
              Select a reference photo and then choose which photos should receive its look.
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
              {photos.length} photos available for color transfer
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 
                        dark:to-red-900/30 border border-orange-200 dark:border-orange-700 
                        rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              How Copy Look Works:
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Click on one photo to set it as the <strong>reference</strong> (source of the look)</li>
              <li>• Click on multiple photos to select them as <strong>targets</strong> (will receive the look)</li>
              <li>• Click "Apply Copy Look" to transfer the color grading</li>
              <li>• View before/after comparisons and download the results</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Selection Summary
          </h3>
          <div className="flex items-center space-x-3">
            {canApply && (
              <button
                onClick={handleApplyCopyLook}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 
                         hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                <Copy className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Apply Copy Look'}</span>
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3">
              Reference Photo (Source Look)
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
                    This photo's look will be copied to targets
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Click on a photo below to select it as reference
              </p>
            )}
          </div>

          {/* Target Photos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
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
              <p className="text-blue-700 dark:text-blue-300 text-sm">
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
            Color Transfer Results ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const originalPhoto = photos.find(p => p.filename === result.filename);
              if (!originalPhoto) return null;
              
              const currentViewMode = viewMode.get(result.filename) || 'after';
              
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
                          src={`data:image/jpeg;base64,${result.image_base64}`}
                          alt={`Copy Look Result ${result.filename}`}
                          position="right"
                        />
                        <ImageComparisonSlider className="w-1 bg-gradient-to-b from-orange-500 to-red-500 shadow-lg">
                          <div className="absolute left-1/2 top-1/2 h-8 w-6 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl border-2 border-orange-500 flex items-center justify-center">
                            <ArrowLeftRight className="w-3 h-3 text-orange-600" />
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
                        src={`data:image/jpeg;base64,${result.image_base64}`}
                        alt={`Copy Look Result ${result.filename}`}
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
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={result.filename}>
                      {result.filename}
                    </h4>
                    
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
            Select Photos for Color Transfer
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click to select reference (orange) or targets (blue)
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Photos Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload photos first to start color transfer.
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
                      ? 'border-orange-500 ring-2 ring-orange-300 shadow-lg'
                      : isTarget
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
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
                            ? 'bg-orange-500 text-white cursor-default'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isTarget ? '✓ Target' : 'Add Target'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2">
                    {isReference && (
                      <div className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                        Reference
                      </div>
                    )}
                    {isTarget && (
                      <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
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
                  
                  {/* Filenamee */}
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

export default CopyLookMode;