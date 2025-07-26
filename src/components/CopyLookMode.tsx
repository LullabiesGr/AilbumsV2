import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, RotateCcw, Eye, EyeOff, Check, X, Palette, Sparkles, Upload } from 'lucide-react';
import { Photo, LutPreview, LutApplicationResult, PhotoWithLuts } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { applyLutToPhotos, getLutPreviewUrl, uploadPhotoWithLuts } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface CopyLookModeProps {
  onBack: () => void;
}

const CopyLookMode: React.FC<CopyLookModeProps> = ({ onBack }) => {
  const { photos } = usePhoto();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [selectedLut, setSelectedLut] = useState<{ lutName: string; previewUrl: string; sourcePhoto: Photo } | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LutApplicationResult[]>([]);
  const [showComparison, setShowComparison] = useState<Map<string, boolean>>(new Map());
  const [photosWithLuts, setPhotosWithLuts] = useState<PhotoWithLuts[]>([]);
  const [isUploadingForLuts, setIsUploadingForLuts] = useState(false);

  // Convert photos to PhotoWithLuts format (assuming they already have LUT previews from upload)
  React.useEffect(() => {
    const convertedPhotos: PhotoWithLuts[] = photos.map(photo => ({
      ...photo,
      lut_previews: (photo as any).lut_previews || []
    }));
    setPhotosWithLuts(convertedPhotos);
  }, [photos]);

  const handleLutSelect = (lutName: string, previewUrl: string, sourcePhoto: Photo) => {
    setSelectedLut({ lutName, previewUrl, sourcePhoto });
    // Clear target photos when selecting new LUT
    setTargetPhotos(new Set());
    setResults([]);
  };

  const handleTargetToggle = (photo: Photo) => {
    // Can't select the source photo of the selected LUT as target
    if (selectedLut && selectedLut.sourcePhoto.id === photo.id) return;
    
    const newTargets = new Set(targetPhotos);
    if (newTargets.has(photo.id)) {
      newTargets.delete(photo.id);
    } else {
      newTargets.add(photo.id);
    }
    setTargetPhotos(newTargets);
  };

  const handleApplyLut = async () => {
    if (!selectedLut || targetPhotos.size === 0) {
      showToast('Please select a LUT and target photos', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const targetPhotoObjects = photosWithLuts.filter(p => targetPhotos.has(p.id));
      const targetFiles = targetPhotoObjects.map(p => p.file);
      
      console.log('Applying LUT:', {
        lutName: selectedLut.lutName,
        targets: targetPhotoObjects.map(p => p.filename)
      });

      const response = await applyLutToPhotos(selectedLut.lutName, targetFiles);
      
      setResults(response.results);
      showToast(`LUT "${selectedLut.lutName}" applied to ${response.results.length} photos!`, 'success');
    } catch (error: any) {
      console.error('LUT application failed:', error);
      showToast(error.message || 'LUT application failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: LutApplicationResult) => {
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
      a.download = `${selectedLut?.lutName}_${result.filename}`;
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
    setSelectedLut(null);
    setTargetPhotos(new Set());
    setResults([]);
    setShowComparison(new Map());
  };

  const toggleComparison = (filename: string) => {
    const newComparison = new Map(showComparison);
    newComparison.set(filename, !newComparison.get(filename));
    setShowComparison(newComparison);
  };

  const handleUploadForLuts = async (files: File[]) => {
    if (!user?.email) {
      showToast('User authentication required', 'error');
      return;
    }

    setIsUploadingForLuts(true);
    try {
      const albumName = `lut_preview_${Date.now()}`;
      
      for (const file of files) {
        const response = await uploadPhotoWithLuts(file, albumName, user.email);
        
        // Parse LUT previews from response
        const lutPreviews: LutPreview[] = response.previews.map(previewPath => {
          const filename = previewPath.split('/').pop() || '';
          const lutName = filename.replace(`${file.name.split('.')[0]}_`, '').replace('.jpg', '');
          
          return {
            lut_name: lutName,
            preview_path: previewPath,
            preview_url: getLutPreviewUrl(previewPath)
          };
        });

        // Add photo with LUT previews to state
        const newPhoto: PhotoWithLuts = {
          id: Math.random().toString(36).substring(2, 11),
          filename: file.name,
          file: file,
          url: URL.createObjectURL(file),
          score: null,
          ai_score: 0,
          score_type: 'base',
          dateCreated: new Date().toISOString(),
          selected: false,
          lut_previews: lutPreviews
        };

        setPhotosWithLuts(prev => [...prev, newPhoto]);
      }
      
      showToast(`Uploaded ${files.length} photos with LUT previews!`, 'success');
    } catch (error: any) {
      console.error('Upload with LUTs failed:', error);
      showToast(error.message || 'Failed to upload photos', 'error');
    } finally {
      setIsUploadingForLuts(false);
    }
  };

  const canApply = selectedLut && targetPhotos.size > 0 && !isProcessing;

  // Get all unique LUT names from all photos
  const allLutNames = new Set<string>();
  photosWithLuts.forEach(photo => {
    photo.lut_previews?.forEach(preview => {
      allLutNames.add(preview.lut_name);
    });
  });

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
              LUT Copy Look Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse LUT previews from your photos, select the look you like, and apply it to other photos. 
              Each photo shows previews with all available LUTs from your collection.
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
              {photosWithLuts.length} photos • {allLutNames.size} LUTs available
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 
                        dark:to-red-900/30 border border-orange-200 dark:border-orange-700 
                        rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              How LUT Copy Look Works:
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Browse LUT previews for each photo (generated automatically on upload)</li>
              <li>• Click on a LUT preview to select that <strong>look/style</strong></li>
              <li>• Select target photos where you want to apply the same LUT</li>
              <li>• Click "Apply LUT" to process the selected photos</li>
              <li>• View before/after results and download the processed images</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Section for LUT Generation */}
      {photosWithLuts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Upload Photos for LUT Previews
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload photos to automatically generate LUT previews for all available LUTs in your collection.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleUploadForLuts(files);
                }
              }}
              className="hidden"
              id="lut-upload"
            />
            <label
              htmlFor="lut-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {isUploadingForLuts ? 'Generating LUT Previews...' : 'Upload Photos'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Click to select photos or drag and drop
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {photosWithLuts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              LUT Selection
            </h3>
            <div className="flex items-center space-x-3">
              {canApply && (
                <button
                  onClick={handleApplyLut}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 
                           hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 
                           disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                           flex items-center space-x-2 transition-all duration-200 font-medium"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>{isProcessing ? 'Applying LUT...' : 'Apply LUT'}</span>
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
            {/* Selected LUT */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3">
                Selected LUT Style
              </h4>
              {selectedLut ? (
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedLut.previewUrl}
                      alt={selectedLut.lutName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedLut.lutName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      From: {selectedLut.sourcePhoto.filename}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Click on a LUT preview below to select the style
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
                    const photo = photosWithLuts.find(p => p.id === photoId);
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
                  Select photos below to apply the LUT to them
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            LUT Application Results ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const originalPhoto = photosWithLuts.find(p => p.filename === result.filename);
              if (!originalPhoto) return null;
              
              const showBefore = !showComparison.get(result.filename);
              
              return (
                <div key={`${result.filename}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                    {showBefore ? (
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
                    
                    {/* Before/After Toggle */}
                    <button
                      onClick={() => toggleComparison(result.filename)}
                      className="absolute top-2 left-2 px-2 py-1 bg-black/75 text-white text-xs 
                               rounded hover:bg-black/90 transition-colors duration-200 flex items-center space-x-1"
                    >
                      {showBefore ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showBefore ? 'Before' : 'After'}</span>
                    </button>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      ✓ {selectedLut?.lutName}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={result.filename}>
                        {result.filename}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        LUT: {result.lut_name}
                      </p>
                    </div>
                    
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

      {/* Photos with LUT Previews Grid */}
      {photosWithLuts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Photos with LUT Previews
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Click LUT previews to select style, then click photos to apply to
            </div>
          </div>
          
          <div className="space-y-8">
            {photosWithLuts.map((photo) => (
              <div key={photo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {/* Original Photo */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {photo.filename}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {photo.lut_previews?.length || 0} LUT previews available
                    </p>
                    
                    {/* Target Selection Button */}
                    <button
                      onClick={() => handleTargetToggle(photo)}
                      disabled={!selectedLut || selectedLut.sourcePhoto.id === photo.id}
                      className={`mt-2 px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedLut && selectedLut.sourcePhoto.id === photo.id
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : targetPhotos.has(photo.id)
                          ? 'bg-blue-500 text-white'
                          : selectedLut
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedLut && selectedLut.sourcePhoto.id === photo.id
                        ? 'Source Photo'
                        : targetPhotos.has(photo.id)
                        ? '✓ Selected as Target'
                        : selectedLut
                        ? 'Select as Target'
                        : 'Select LUT first'
                      }
                    </button>
                  </div>
                </div>

                {/* LUT Previews */}
                {photo.lut_previews && photo.lut_previews.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Available LUT Styles:
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {photo.lut_previews.map((lutPreview, index) => {
                        const isSelected = selectedLut?.lutName === lutPreview.lut_name && 
                                         selectedLut?.sourcePhoto.id === photo.id;
                        const previewUrl = lutPreview.preview_url || getLutPreviewUrl(lutPreview.preview_path);
                        
                        return (
                          <div
                            key={index}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer 
                                     transition-all duration-200 border-2 ${
                              isSelected
                                ? 'border-orange-500 ring-2 ring-orange-300 shadow-lg scale-105'
                                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:scale-102'
                            }`}
                            onClick={() => handleLutSelect(lutPreview.lut_name, previewUrl, photo)}
                          >
                            <img
                              src={previewUrl}
                              alt={`${lutPreview.lut_name} preview`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Failed to load LUT preview:', previewUrl);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            
                            {/* LUT Name */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-1">
                              <p className="text-white text-xs text-center truncate" title={lutPreview.lut_name}>
                                {lutPreview.lut_name}
                              </p>
                            </div>
                            
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyLookMode;