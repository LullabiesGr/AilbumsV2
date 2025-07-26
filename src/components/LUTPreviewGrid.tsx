import React, { useState } from 'react';
import { Palette, Download, Check, Eye, EyeOff } from 'lucide-react';
import { PhotoWithLUTs, LUTPreview, LUTApplyResult } from '../types';
import { applyLUT } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface LUTPreviewGridProps {
  photo: PhotoWithLUTs;
  onLUTSelect: (lutName: string) => void;
  onPhotoUpdate?: (photoId: string, newUrl: string) => void;
}

const LUTPreviewGrid: React.FC<LUTPreviewGridProps> = ({ 
  photo, 
  onLUTSelect, 
  onPhotoUpdate 
}) => {
  const [selectedLUT, setSelectedLUT] = useState<string | null>(photo.selected_lut || null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedResult, setAppliedResult] = useState<LUTApplyResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { showToast } = useToast();

  // If no LUT previews available, don't render anything
  if (!photo.lut_previews || photo.lut_previews.length === 0) {
    return null;
  }

  const handleLUTSelect = (lutName: string) => {
    const newSelection = selectedLUT === lutName ? null : lutName;
    setSelectedLUT(newSelection);
    onLUTSelect(newSelection || '');
  };

  const handleApplyLUT = async () => {
    if (!selectedLUT) {
      showToast('Please select a LUT first', 'warning');
      return;
    }

    setIsApplying(true);
    try {
      console.log('Applying LUT:', selectedLUT, 'to photo:', photo.filename);
      
      const response = await applyLUT([photo.file], selectedLUT);
      const result = response.results[0];
      
      if (result) {
        setAppliedResult(result);
        setShowPreview(true);
        showToast(`LUT "${selectedLUT}" applied successfully!`, 'success');
      }
    } catch (error: any) {
      console.error('LUT application failed:', error);
      showToast(error.message || 'Failed to apply LUT', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = () => {
    if (!appliedResult) return;

    try {
      const byteCharacters = atob(appliedResult.image_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedLUT}_${photo.filename}`;
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

  const handleSaveToGallery = () => {
    if (!appliedResult || !onPhotoUpdate) return;

    try {
      const imageUrl = `data:image/jpeg;base64,${appliedResult.image_base64}`;
      onPhotoUpdate(photo.id, imageUrl);
      showToast('Photo updated in gallery with LUT applied!', 'success');
    } catch (error) {
      console.error('Save to gallery failed:', error);
      showToast('Failed to update photo in gallery', 'error');
    }
  };

  const cleanLUTName = (lutName: string) => {
    return lutName
      .replace(/\.cube$/, '') // Remove .cube extension
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .trim()
      .replace(/\s+/g, ' '); // Normalize multiple spaces
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            LUT Previews ({photo.lut_previews.length})
          </h4>
        </div>
        
        {selectedLUT && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 
                           text-sm rounded-full font-medium">
              {cleanLUTName(selectedLUT)}
            </span>
          </div>
        )}
      </div>

      {/* LUT Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {photo.lut_previews.map((lutPreview, index) => (
          <div
            key={index}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedLUT === lutPreview.lut_name
                ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
            onClick={() => handleLUTSelect(lutPreview.lut_name)}
          >
            {/* Preview Image */}
            <div className="aspect-square relative overflow-hidden">
              <img
                src={lutPreview.preview_url}
                alt={`LUT Preview: ${lutPreview.lut_name}`}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                onError={(e) => {
                  console.warn('Failed to load LUT preview:', lutPreview.preview_url);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxVVCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Selection Indicator */}
              {selectedLUT === lutPreview.lut_name && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 
                            flex items-center justify-center">
                <div className="text-white text-xs font-medium text-center px-2">
                  Click to Select
                </div>
              </div>
            </div>
            
            {/* LUT Name */}
            <div className="p-2 bg-white dark:bg-gray-700">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate text-center" 
                 title={cleanLUTName(lutPreview.lut_name)}>
                {cleanLUTName(lutPreview.lut_name)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedLUT ? `Ready to apply "${cleanLUTName(selectedLUT)}"` : 'Select a LUT style above'}
        </div>
        
        <div className="flex items-center space-x-2">
          {appliedResult && (
            <>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                         flex items-center space-x-1 transition-colors duration-200"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPreview ? 'Hide Result' : 'Show Result'}</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md 
                         flex items-center space-x-1 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              
              {onPhotoUpdate && (
                <button
                  onClick={handleSaveToGallery}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md 
                           flex items-center space-x-1 transition-colors duration-200"
                >
                  <Check className="h-4 w-4" />
                  <span>Save to Gallery</span>
                </button>
              )}
            </>
          )}
          
          <button
            onClick={handleApplyLUT}
            disabled={!selectedLUT || isApplying}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 
                     disabled:cursor-not-allowed text-white text-sm rounded-md 
                     flex items-center space-x-2 transition-colors duration-200 font-medium"
          >
            <Palette className="h-4 w-4" />
            <span>
              {isApplying 
                ? 'Applying LUT...' 
                : selectedLUT 
                  ? `Apply "${cleanLUTName(selectedLUT)}"` 
                  : 'Select LUT First'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Result Preview */}
      {appliedResult && showPreview && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 dark:text-gray-100">
              LUT Applied Result
            </h5>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 
                           text-xs rounded-full font-medium">
              ✓ {cleanLUTName(appliedResult.lut_name)}
            </span>
          </div>
          
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={`data:image/jpeg;base64,${appliedResult.image_base64}`}
              alt={`LUT Applied: ${appliedResult.filename}`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>File:</strong> {appliedResult.filename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              LUT "{cleanLUTName(appliedResult.lut_name)}" applied successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LUTPreviewGrid;