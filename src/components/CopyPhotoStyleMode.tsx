import React, { useState, useEffect } from 'react';
import { ArrowLeft, Palette, Download, RotateCcw, Eye, EyeOff, Check, X, Sparkles } from 'lucide-react';
import { Photo, PhotoWithPreviews, LUTPreview } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { applyLUTFull } from '../lib/api';

interface CopyPhotoStyleModeProps {
  onBack: () => void;
}

// API URL configuration
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://e2d5f43272e5.ngrok-free.app";

const CopyPhotoStyleMode: React.FC<CopyPhotoStyleModeProps> = ({ onBack }) => {
  const { photos, currentAlbumName } = usePhoto();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [photosWithPreviews, setPhotosWithPreviews] = useState<PhotoWithPreviews[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(true);
  const [isApplyingLUTs, setIsApplyingLUTs] = useState(false);
  const [selectedLUTs, setSelectedLUTs] = useState<Map<string, string>>(new Map());
  const [processedPhotos, setProcessedPhotos] = useState<Set<string>>(new Set());

  // Load LUT previews for all photos
  useEffect(() => {
    loadLUTPreviews();
  }, []);

  const loadLUTPreviews = async () => {
    if (!user?.email || !currentAlbumName) {
      showToast('Missing user or album information', 'error');
      return;
    }

    setIsLoadingPreviews(true);
    try {
      const photosWithPreviewsData: PhotoWithPreviews[] = [];

      for (const photo of photos) {
        try {
          // Construct preview directory path
          const previewDir = `albums/${user.email}/${currentAlbumName}/previews`;
          
          // Get available LUT previews for this photo
          const previews = await fetchPhotoLUTPreviews(photo.filename, previewDir);
          
          photosWithPreviewsData.push({
            photo,
            original_path: `albums/${user.email}/${currentAlbumName}/${photo.filename}`,
            previews,
            selected_lut: undefined
          });
        } catch (error) {
          console.warn(`Failed to load previews for ${photo.filename}:`, error);
          // Add photo without previews
          photosWithPreviewsData.push({
            photo,
            original_path: `albums/${user.email}/${currentAlbumName}/${photo.filename}`,
            previews: [],
            selected_lut: undefined
          });
        }
      }

      setPhotosWithPreviews(photosWithPreviewsData);
      showToast(`Loaded LUT previews for ${photosWithPreviewsData.length} photos`, 'success');
    } catch (error: any) {
      console.error('Failed to load LUT previews:', error);
      showToast('Failed to load LUT previews', 'error');
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  const fetchPhotoLUTPreviews = async (filename: string, previewDir: string): Promise<LUTPreview[]> => {
    // Mock implementation - in real scenario, you'd call an API to get available previews
    // For now, we'll simulate common LUT names
    const commonLUTs = [
      'Colorist_Factory_Severn_LUT',
      'justyndigitalphotography',
      'Cinematic_Blue_Orange',
      'Vintage_Film_Look',
      'Modern_Portrait',
      'Wedding_Warm'
    ];

    const previews: LUTPreview[] = commonLUTs.map(lutName => {
      const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Remove extension
      const previewFilename = `${baseFilename}_${lutName}.jpg`;
      
      return {
        path: `${previewDir}/${previewFilename}`,
        lut_name: `${lutName}.cube`,
        preview_url: `${API_URL}/album-photo?album_dir=${encodeURIComponent(previewDir)}&filename=${encodeURIComponent(previewFilename)}`
      };
    });

    return previews;
  };

  const handleLUTSelection = (photoId: string, lutName: string) => {
    setSelectedLUTs(prev => {
      const newMap = new Map(prev);
      if (newMap.get(photoId) === lutName) {
        // Deselect if already selected
        newMap.delete(photoId);
      } else {
        newMap.set(photoId, lutName);
      }
      return newMap;
    });
  };

  const handleApplySelectedLUTs = async () => {
    if (selectedLUTs.size === 0) {
      showToast('Please select LUTs for photos first', 'warning');
      return;
    }

    if (!user?.email || !currentAlbumName) {
      showToast('Missing user or album information', 'error');
      return;
    }

    setIsApplyingLUTs(true);
    const newProcessedPhotos = new Set(processedPhotos);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const [photoId, lutName] of selectedLUTs.entries()) {
        const photoData = photosWithPreviews.find(p => p.photo.id === photoId);
        if (!photoData) continue;

        try {
          showToast(`Applying ${lutName} to ${photoData.photo.filename}...`, 'info');
          
          await applyLUTFull(
            user.email,
            currentAlbumName,
            photoData.photo.filename,
            lutName
          );

          newProcessedPhotos.add(photoId);
          successCount++;
          
          showToast(`✅ Applied ${lutName} to ${photoData.photo.filename}`, 'success');
        } catch (error: any) {
          console.error(`Failed to apply LUT to ${photoData.photo.filename}:`, error);
          errorCount++;
          showToast(`❌ Failed to apply LUT to ${photoData.photo.filename}`, 'error');
        }
      }

      setProcessedPhotos(newProcessedPhotos);
      
      if (successCount > 0) {
        showToast(`Successfully applied LUTs to ${successCount} photos!`, 'success');
      }
      
      if (errorCount > 0) {
        showToast(`Failed to apply LUTs to ${errorCount} photos`, 'error');
      }

    } catch (error: any) {
      console.error('LUT application failed:', error);
      showToast('Failed to apply LUTs', 'error');
    } finally {
      setIsApplyingLUTs(false);
    }
  };

  const handleReset = () => {
    setSelectedLUTs(new Map());
    setProcessedPhotos(new Set());
  };

  const extractLUTNameFromPreview = (previewPath: string): string => {
    // Extract LUT name from preview filename
    // Example: "wedding_Colorist_Factory_Severn_LUT.jpg" → "Colorist_Factory_Severn_LUT.cube"
    const filename = previewPath.split('/').pop() || '';
    const parts = filename.split('_');
    
    if (parts.length > 1) {
      // Remove the first part (original filename) and extension
      const lutPart = parts.slice(1).join('_').replace('.jpg', '');
      return `${lutPart}.cube`;
    }
    
    return filename.replace('.jpg', '.cube');
  };

  if (isLoadingPreviews) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading LUT Previews
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generating style previews for your photos...
          </p>
        </div>
      </div>
    );
  }

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
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 
                         bg-clip-text text-transparent">
              Copy Photo Style
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Apply professional LUT styles to your photos. Preview different looks and apply your favorites 
              to the full resolution images.
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
              {photosWithPreviews.length} photos with LUT previews
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 
                        dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 
                        rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              How Copy Photo Style Works:
            </h3>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Browse LUT style previews for each photo</li>
              <li>• Click on a preview to select that style for the photo</li>
              <li>• Selected styles will be highlighted with a border</li>
              <li>• Click "Apply Selected Styles" to process full resolution images</li>
              <li>• Download or save the styled photos to your gallery</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Style Selection Summary
          </h3>
          <div className="flex items-center space-x-3">
            {selectedLUTs.size > 0 && (
              <button
                onClick={handleApplySelectedLUTs}
                disabled={isApplyingLUTs}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                <Palette className="h-5 w-5" />
                <span>{isApplyingLUTs ? 'Applying...' : `Apply Selected Styles (${selectedLUTs.size})`}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              Total Photos
            </h4>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {photosWithPreviews.length}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Styles Selected
            </h4>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {selectedLUTs.size}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Processed
            </h4>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {processedPhotos.size}
            </p>
          </div>
        </div>
      </div>

      {/* Photos with LUT Previews */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Choose Styles for Your Photos
        </h3>
        
        {photosWithPreviews.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Photos Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload photos first to generate LUT style previews.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {photosWithPreviews.map((photoData, index) => {
              const selectedLUT = selectedLUTs.get(photoData.photo.id);
              const isProcessed = processedPhotos.has(photoData.photo.id);
              
              return (
                <div key={photoData.photo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={photoData.photo.url}
                          alt={photoData.photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {photoData.photo.filename}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {photoData.previews.length} style previews available
                        </p>
                        {selectedLUT && (
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Selected: {selectedLUT.replace('.cube', '').replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isProcessed && (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <Check className="h-5 w-5" />
                        <span className="text-sm font-medium">Processed</span>
                      </div>
                    )}
                  </div>

                  {/* LUT Previews Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {photoData.previews.map((preview, previewIndex) => {
                      const isSelected = selectedLUT === preview.lut_name;
                      const lutDisplayName = preview.lut_name.replace('.cube', '').replace(/_/g, ' ');
                      
                      return (
                        <div
                          key={previewIndex}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer 
                                   transition-all duration-200 border-2 ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                          }`}
                          onClick={() => handleLUTSelection(photoData.photo.id, preview.lut_name)}
                        >
                          <img
                            src={preview.preview_url}
                            alt={`${lutDisplayName} style`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.warn('Failed to load preview:', preview.preview_url);
                              e.currentTarget.src = photoData.photo.url; // Fallback to original
                            }}
                          />
                          
                          {/* Style Name Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2">
                            <p className="text-white text-xs font-medium truncate">
                              {lutDisplayName}
                            </p>
                          </div>
                          
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full 
                                          flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
                                        transition-opacity duration-200 flex items-center justify-center">
                            <div className="bg-white/90 rounded-lg px-3 py-1">
                              <span className="text-sm font-medium text-gray-900">
                                {isSelected ? 'Selected' : 'Click to Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {photoData.previews.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No LUT previews available for this photo</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyPhotoStyleMode;