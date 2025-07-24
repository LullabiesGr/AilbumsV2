import React, { useState } from 'react';
import { Copy, Check, X, Download, Eye, EyeOff, ArrowRight, RefreshCw, AlertCircle, Star } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { colorTransfer } from '../lib/api';
import { Photo } from '../types';

interface ColorTransferResult {
  filename: string;
  result_base64: string;
  originalPhoto: Photo;
}

const CopyLookInterface: React.FC = () => {
  const { 
    photos, 
    referencePhoto, 
    setReferencePhoto, 
    copyLookTargets, 
    toggleCopyLookTarget, 
    clearCopyLookTargets,
    updatePhotoUrl
  } = usePhoto();
  
  const { showToast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ColorTransferResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [previewMode, setPreviewMode] = useState<'side-by-side' | 'before' | 'after'>('side-by-side');
  const [selectionMode, setSelectionMode] = useState<'reference' | 'targets'>('reference');

  // Enable copy look mode when component mounts
  React.useEffect(() => {
    setCopyLookMode(true);
    return () => {
      setCopyLookMode(false);
    };
  }, [setCopyLookMode]);

  const targetPhotos = copyLookTargets;

  const handleSelectReference = (photo: Photo) => {
    if (referencePhoto?.id === photo.id) {
      setReferencePhoto(null);
    } else {
      setReferencePhoto(photo);
      // Remove from targets if it was selected
      if (copyLookTargets.some(target => target.id === photo.id)) {
        toggleCopyLookTarget(photo.id);
      }
    }
  };

  const handleToggleTarget = (photo: Photo) => {
    // Can't select reference as target
    if (referencePhoto?.id === photo.id) {
      showToast('Reference photo cannot be a target', 'warning');
      return;
    }
    toggleCopyLookTarget(photo.id);
  };

  const handleApplyLookTransfer = async () => {
    if (!referencePhoto) {
      showToast('Please select a reference photo', 'warning');
      return;
    }

    if (targetPhotos.length === 0) {
      showToast('Please select at least one target photo', 'warning');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress('Preparing photos for color transfer...');
    
    try {
      console.log('Starting color transfer:', {
        reference: referencePhoto.filename,
        targets: targetPhotos.map(p => p.filename),
        targetCount: targetPhotos.length
      });

      setProcessingProgress(`Transferring look from ${referencePhoto.filename} to ${targetPhotos.length} photos...`);
      
      const transferResults = await colorTransfer(
        referencePhoto.file,
        targetPhotos.map(p => p.file)
      );

      // Convert results to include original photo data
      const processedResults: ColorTransferResult[] = transferResults.map(result => {
        const originalPhoto = targetPhotos.find(p => p.filename === result.filename);
        if (!originalPhoto) {
          throw new Error(`Could not find original photo for ${result.filename}`);
        }
        
        return {
          ...result,
          originalPhoto
        };
      });

      setResults(processedResults);
      setShowResults(true);
      setProcessingProgress('');
      
      showToast(`Successfully applied look to ${processedResults.length} photos!`, 'success');
      
    } catch (error: any) {
      console.error('Color transfer failed:', error);
      showToast(error.message || 'Failed to apply color transfer', 'error');
      setProcessingProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResult = async (result: ColorTransferResult) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(result.result_base64);
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
      
      showToast(`Downloaded ${result.filename}`, 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download image', 'error');
    }
  };

  const handleUpdateDashboard = (result: ColorTransferResult) => {
    try {
      const imageUrl = `data:image/jpeg;base64,${result.result_base64}`;
      updatePhotoUrl(result.originalPhoto.id, imageUrl);
      showToast(`Updated ${result.filename} in dashboard!`, 'success');
    } catch (error) {
      console.error('Failed to update dashboard:', error);
      showToast('Failed to update dashboard', 'error');
    }
  };

  const handleDownloadAll = async () => {
    for (const result of results) {
      await handleDownloadResult(result);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleReset = () => {
    setReferencePhoto(null);
    clearCopyLookTargets();
    setResults([]);
    setShowResults(false);
    setProcessingProgress('');
  };


  const renderResults = () => {
    if (!showResults || results.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Color Transfer Results ({results.length})
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Preview Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('before')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode === 'before' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setPreviewMode('side-by-side')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode === 'side-by-side' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => setPreviewMode('after')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode === 'after' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                After
              </button>
            </div>
            
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                       flex items-center space-x-2 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 truncate" 
                  title={result.filename}>
                {result.filename}
              </h4>
              
              {/* Image Comparison */}
              <div className="space-y-3">
                {previewMode === 'side-by-side' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Before</p>
                      <div className="aspect-square rounded overflow-hidden">
                        <img
                          src={result.originalPhoto.url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">After</p>
                      <div className="aspect-square rounded overflow-hidden">
                        <img
                          src={`data:image/jpeg;base64,${result.result_base64}`}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {previewMode === 'before' ? 'Original' : 'Color Transferred'}
                    </p>
                    <div className="aspect-square rounded overflow-hidden">
                      <img
                        src={previewMode === 'before' 
                          ? result.originalPhoto.url 
                          : `data:image/jpeg;base64,${result.result_base64}`
                        }
                        alt={previewMode === 'before' ? 'Original' : 'Color Transferred'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateDashboard(result)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                             text-sm rounded-md flex items-center justify-center space-x-1 
                             transition-colors duration-200"
                  >
                    <Check className="h-3 w-3" />
                    <span>Update</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadResult(result)}
                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                             text-sm rounded-md flex items-center justify-center space-x-1 
                             transition-colors duration-200"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Copy Look Control Panel
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select one reference photo and multiple target photos to transfer the look
            </p>
          </div>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                     flex items-center space-x-2 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Selection Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Copy className="h-5 w-5 text-orange-500" />
              <h4 className="font-medium text-orange-800 dark:text-orange-200">Reference Photo</h4>
            </div>
            {referencePhoto ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded overflow-hidden">
                  <img
                    src={referencePhoto.url}
                    alt={referencePhoto.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200 truncate">
                    {referencePhoto.filename}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Source of the look to copy
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Click "Set as Ref" on any photo below
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Target Photos</h4>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {targetPhotos.length}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {targetPhotos.length === 0 
                ? 'Select photos to receive the new look' 
                : `Selected for color transfer`
              }
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowRight className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-green-800 dark:text-green-200">Ready to Process</h4>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {referencePhoto && targetPhotos.length > 0 ? '✓' : '✗'}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {referencePhoto && targetPhotos.length > 0 
                ? 'Ready for color transfer' 
                : 'Need reference + targets'
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleApplyLookTransfer}
            disabled={!referencePhoto || targetPhotos.length === 0 || isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 
                     hover:from-orange-700 hover:to-yellow-700 disabled:from-gray-400 
                     disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                     flex items-center space-x-3 transition-all duration-200 font-medium text-lg"
          >
            <Copy className="h-6 w-6" />
            <span>
              {isProcessing 
                ? 'Processing...' 
                : `Apply Look Transfer (${targetPhotos.length} photos)`
              }
            </span>
          </button>
        </div>

        {/* Processing Progress */}
        {isProcessing && processingProgress && (
          <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Color Transfer in Progress
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {processingProgress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {!referencePhoto && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Please select a reference photo first
              </p>
            </div>
          </div>
        )}

        {referencePhoto && targetPhotos.length === 0 && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Please select at least one target photo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Photo Selection ({photos.length} photos)
          </h3>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Reference</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Target</span>
            </div>
          </div>
        </div>
        
        {renderPhotoGrid()}
      </div>

      {/* Results */}
      {renderResults()}
    </div>
  );
};

export default CopyLookInterface;