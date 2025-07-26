import React, { useState } from 'react';
import { ArrowLeft, Palette, Download, RotateCcw, Eye, EyeOff, Check, X } from 'lucide-react';
import { PhotoWithLUTs, LUTApplyResult } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { applyLUT } from '../lib/api';

interface LUTModeSelectorProps {
  onBack: () => void;
}

const LUTModeSelector: React.FC<LUTModeSelectorProps> = ({ onBack }) => {
  const { photos } = usePhoto();
  const { showToast } = useToast();
  
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedLUT, setSelectedLUT] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LUTApplyResult[]>([]);
  const [showComparison, setShowComparison] = useState<Map<string, boolean>>(new Map());

  // Get all available LUTs from photos that have previews
  const availableLUTs = new Set<string>();
  photos.forEach(photo => {
    photo.lut_previews?.forEach(preview => {
      availableLUTs.add(preview.lut_name);
    });
  });

  const lutList = Array.from(availableLUTs);

  const handlePhotoToggle = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const handleApplyLUT = async () => {
    if (!selectedLUT || selectedPhotos.size === 0) {
      showToast('Please select a LUT and photos to apply it to', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const targetPhotos = photos.filter(p => selectedPhotos.has(p.id));
      const targetFiles = targetPhotos.map(p => p.file);
      
      console.log('Applying LUT:', selectedLUT, 'to photos:', targetPhotos.map(p => p.filename));

      const response = await applyLUT(targetFiles, selectedLUT);
      
      setResults(response.results);
      showToast(`LUT "${selectedLUT}" applied to ${response.results.length} photos!`, 'success');
    } catch (error: any) {
      console.error('LUT application failed:', error);
      showToast(error.message || 'LUT application failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: LUTApplyResult) => {
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
      a.download = `${result.lut_name}_${result.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('LUT processed photo downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download photo', 'error');
    }
  };

  const handleReset = () => {
    setSelectedPhotos(new Set());
    setSelectedLUT(null);
    setResults([]);
    setShowComparison(new Map());
  };

  const toggleComparison = (filename: string) => {
    const newComparison = new Map(showComparison);
    newComparison.set(filename, !newComparison.get(filename));
    setShowComparison(newComparison);
  };

  const cleanLUTName = (lutName: string) => {
    return lutName
      .replace(/\.cube$/, '')
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\s+/g, ' ');
  };

  const canApply = selectedLUT && selectedPhotos.size > 0 && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 
                      dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-lg" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-2 
                      border-purple-200 dark:border-purple-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full 
                          flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 
                         bg-clip-text text-transparent">
              LUT Application Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Apply professional color grading LUTs to your photos. Select a LUT style and 
              choose which photos to apply it to.
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
              {lutList.length} LUTs available • {photos.length} photos
            </div>
          </div>
        </div>
      </div>

      {/* LUT Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select LUT Style ({lutList.length} available)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lutList.map((lutName) => {
            // Find a photo that has this LUT preview to show as example
            const examplePhoto = photos.find(p => 
              p.lut_previews?.some(preview => preview.lut_name === lutName)
            );
            const lutPreview = examplePhoto?.lut_previews?.find(p => p.lut_name === lutName);
            
            return (
              <div
                key={lutName}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedLUT === lutName
                    ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }`}
                onClick={() => setSelectedLUT(selectedLUT === lutName ? null : lutName)}
              >
                <div className="aspect-square relative overflow-hidden">
                  {lutPreview ? (
                    <img
                      src={lutPreview.preview_url}
                      alt={`LUT: ${lutName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 
                                  flex items-center justify-center">
                      <Palette className="h-8 w-8 text-white" />
                    </div>
                  )}
                  
                  {selectedLUT === lutName && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full 
                                  flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center truncate"
                     title={cleanLUTName(lutName)}>
                    {cleanLUTName(lutName)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Photos ({selectedPhotos.size} selected)
          </h3>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <Check className="h-4 w-4" />
              <span>{selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}</span>
            </button>
            
            {canApply && (
              <button
                onClick={handleApplyLUT}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                <Palette className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : `Apply "${cleanLUTName(selectedLUT!)}"`}</span>
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer 
                       transition-all duration-200 border-2 ${
                selectedPhotos.has(photo.id)
                  ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handlePhotoToggle(photo.id)}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              
              {selectedPhotos.has(photo.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full 
                              flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.filename}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            LUT Application Results ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const originalPhoto = photos.find(p => p.filename === result.filename);
              const showBefore = !showComparison.get(result.filename);
              
              return (
                <div key={`${result.filename}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                    {showBefore && originalPhoto ? (
                      <img
                        src={originalPhoto.url}
                        alt={`Original ${result.filename}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`data:image/jpeg;base64,${result.image_base64}`}
                        alt={`LUT Applied ${result.filename}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    <button
                      onClick={() => toggleComparison(result.filename)}
                      className="absolute top-2 left-2 px-2 py-1 bg-black/75 text-white text-xs 
                               rounded hover:bg-black/90 transition-colors duration-200 flex items-center space-x-1"
                    >
                      {showBefore ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showBefore ? 'Before' : 'After'}</span>
                    </button>
                    
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      ✓ {cleanLUTName(result.lut_name)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={result.filename}>
                      {result.filename}
                    </h4>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleComparison(result.filename)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                 text-sm rounded-md flex items-center justify-center space-x-1 
                                 transition-colors duration-200"
                      >
                        {showBefore ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span>{showBefore ? 'Show After' : 'Show Before'}</span>
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
    </div>
  );
};

export default LUTModeSelector;