import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Eye, EyeOff, Download, Save, RotateCcw, Settings, Users, Check, Minimize2, Maximize2 } from 'lucide-react';
import { Photo, Face } from '../types';
import { useToast } from '../context/ToastContext';

interface FaceRetouchModalProps {
  photo: Photo;
  onClose: () => void;
  onSave?: (retouchedImageUrl: string) => void;
}

interface RetouchSettings {
  fidelity: number; // CodeFormer 'w' parameter (0.0 to 1.0)
  keepOriginalResolution: boolean;
  showPreview: boolean;
}

const FaceRetouchModal: React.FC<FaceRetouchModalProps> = ({ photo, onClose, onSave }) => {
  const [selectedFaceIndices, setSelectedFaceIndices] = useState<number[]>([]);
  const [settings, setSettings] = useState<RetouchSettings>({
    fidelity: 0.7, // Default CodeFormer fidelity
    keepOriginalResolution: true,
    showPreview: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [retouchedImageUrl, setRetouchedImageUrl] = useState<string | null>(null);
  const [retouchedImageBlob, setRetouchedImageBlob] = useState<Blob | null>(null);
  const [originalImageUrl] = useState(photo.url);
  const [processingProgress, setProcessingProgress] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(true);
  const { showToast } = useToast();

  const handleFaceClick = (face: Face, index: number) => {
    setSelectedFaceIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAllFaces = () => {
    if (!photo.faces) return;
    
    if (selectedFaceIndices.length === photo.faces.length) {
      // Deselect all
      setSelectedFaceIndices([]);
    } else {
      // Select all
      setSelectedFaceIndices(photo.faces.map((_, index) => index));
    }
  };

  const handleCodeFormerEnhancement = async () => {
    if (selectedFaceIndices.length === 0 || !photo.faces) {
      showToast('Please select at least one face to enhance', 'warning');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress('Preparing image for CodeFormer...');
    
    try {
      // Always send the full original image file (not cropped)
      // This is the key requirement for CodeFormer integration
      const originalImageFile = photo.file;
      
      console.log('CodeFormer Enhancement Started:', {
        filename: photo.filename,
        originalFileSize: originalImageFile.size,
        selectedFaces: selectedFaceIndices.length,
        fidelity: settings.fidelity,
        facesToProcess: selectedFaceIndices.map(index => ({
          faceIndex: index + 1,
          box: photo.faces![index].box
        }))
      });

      let finalImageBlob = null;
      let currentImageFile = originalImageFile;

      // Process each selected face sequentially
      // CodeFormer will handle face detection and enhancement on the full image
      for (let i = 0; i < selectedFaceIndices.length; i++) {
        const faceIndex = selectedFaceIndices[i];
        const selectedFace = photo.faces[faceIndex];
        
        // Face coordinates from AI analysis (already in original image coordinates)
        const [x1, y1, x2, y2] = selectedFace.box;
        
        setProcessingProgress(`Enhancing face ${i + 1} of ${selectedFaceIndices.length} with CodeFormer...`);

        // Prepare form data exactly as specified for CodeFormer backend
        const formData = new FormData();
        
        // For subsequent faces, use the result from the previous enhancement
        if (finalImageBlob) {
          // Create a proper File object from the blob with correct MIME type
          const enhancedFile = new File([finalImageBlob], photo.filename, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          formData.append('file', enhancedFile);
        } else {
          // For the first face, convert the original photo URL to a proper file
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const imageFile = new File([blob], photo.filename, { 
              type: blob.type || 'image/jpeg',
              lastModified: Date.now()
            });
            formData.append('file', imageFile);
          } catch (error) {
            console.error('Failed to convert photo URL to file:', error);
            // Fallback to original file
            formData.append('file', photo.file);
          }
        }
        
        // Include the user's selected retouch fidelity value (w parameter for CodeFormer)
        formData.append('w', settings.fidelity.toString());
        
        // Optional: Include face coordinates if backend supports targeted enhancement
        // These coordinates are in original image resolution
        formData.append('x1', Math.round(x1).toString());
        formData.append('y1', Math.round(y1).toString());
        formData.append('x2', Math.round(x2).toString());
        formData.append('y2', Math.round(y2).toString());

        console.log(`CodeFormer API Call ${i + 1}/${selectedFaceIndices.length}:`, {
          filename: photo.filename,
          faceIndex: faceIndex + 1,
          faceBox: [Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)],
          fidelity: settings.fidelity,
          fileSize: currentImageFile.size,
          fileType: currentImageFile.type
        });

        // Call the /enhance endpoint for CodeFormer processing
        const response = await fetch('https://b455dac5621c.ngrok-free.app/enhance', {
          method: 'POST',
          body: formData,
          mode: 'cors',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('CodeFormer Enhancement API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            faceIndex: faceIndex + 1,
            requestDetails: {
              filename: photo.filename,
              fidelity: settings.fidelity,
              faceBox: [x1, y1, x2, y2]
            }
          });
          throw new Error(`CodeFormer enhancement failed for face ${faceIndex + 1}: ${errorText || `HTTP ${response.status}`}`);
        }

        finalImageBlob = await response.blob();
        if (!finalImageBlob || finalImageBlob.size === 0) {
          throw new Error(`CodeFormer returned empty response for face ${faceIndex + 1}`);
        }

        console.log(`CodeFormer face ${i + 1} enhanced successfully:`, {
          originalSize: currentImageFile.size,
          enhancedSize: finalImageBlob.size,
          faceIndex: faceIndex + 1
        });

        // Update progress
        showToast(`CodeFormer enhanced face ${i + 1} of ${selectedFaceIndices.length}`, 'info');
      }

      if (finalImageBlob) {
        // Store the blob for download functionality
        setRetouchedImageBlob(finalImageBlob);
        
        // Clean up previous retouched image URL
        if (retouchedImageUrl) {
          URL.revokeObjectURL(retouchedImageUrl);
        }
        
        const retouchedUrl = URL.createObjectURL(finalImageBlob);
        setRetouchedImageUrl(retouchedUrl);
        setSettings(prev => ({ ...prev, showPreview: true }));
        
        console.log('CodeFormer Enhancement Complete:', {
          originalFilename: photo.filename,
          facesEnhanced: selectedFaceIndices.length,
          finalImageSize: finalImageBlob.size,
          fidelity: settings.fidelity
        });
        
        showToast(
          `Successfully enhanced ${selectedFaceIndices.length} face(s) with fidelity ${settings.fidelity}!`, 
          'success'
        );
      }
    } catch (error: any) {
      console.error('CodeFormer enhancement error:', error);
      showToast(error.message || 'Face enhancement failed', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingProgress('');
    }
  };

  const handleSave = () => {
    if (!retouchedImageUrl || !retouchedImageBlob) {
      showToast('No enhanced image available to save', 'warning');
      return;
    }
    
    try {
      // Call the onSave callback to update the dashboard
      if (onSave) {
        onSave(retouchedImageUrl);
        onClose();
      } else {
        showToast('Save function not available', 'error');
      }
    } catch (error) {
      console.error('Failed to save enhanced image:', error);
      showToast('Failed to update dashboard', 'error');
    }
  };

  const handleDownload = async () => {
    if (!retouchedImageBlob) {
      showToast('No enhanced image to download', 'warning');
      return;
    }
    
    try {
      const url = URL.createObjectURL(retouchedImageBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ailbums_enhanced_${photo.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Enhanced image downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download enhanced image', 'error');
    }
  };

  const handleReset = () => {
    if (retouchedImageUrl) {
      URL.revokeObjectURL(retouchedImageUrl);
    }
    setRetouchedImageUrl(null);
    setRetouchedImageBlob(null);
    setSelectedFaceIndices([]);
    setSettings({
      fidelity: 0.7,
      keepOriginalResolution: true,
      showPreview: false
    });
    setProcessingProgress('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retouchedImageUrl) {
        URL.revokeObjectURL(retouchedImageUrl);
      }
    };
  }, [retouchedImageUrl, retouchedImageBlob]);

  const currentImageUrl = settings.showPreview && retouchedImageUrl ? retouchedImageUrl : originalImageUrl;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ailbums Face Enhancement
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
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {photo.filename} • {photo.faces?.length || 0} faces
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          
          {!isProcessing && selectedFaceIndices.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleCodeFormerEnhancement}
                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md"
              >
                Enhance {selectedFaceIndices.length} Face(s)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact mode - smaller modal
  if (isCompactMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Compact Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Ailbums Face Enhancement
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {photo.filename} • {photo.faces?.length || 0} faces detected
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCompactMode(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                  title="Expand to full view"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Image Area - Compact */}
            <div className="flex-1 p-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <FaceRetouchOverlay
                  faces={photo.faces || []}
                  imageUrl={currentImageUrl}
                  onFaceClick={handleFaceClick}
                  selectedFaceIndices={selectedFaceIndices}
                  className="w-full h-full"
                />
                
                {/* Preview Toggle */}
                {retouchedImageUrl && (
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showPreview: !prev.showPreview }))}
                    className="absolute top-2 left-2 px-2 py-1 bg-black/75 text-white text-xs 
                             rounded hover:bg-black/90 transition-colors duration-200 flex items-center space-x-1"
                  >
                    {settings.showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{settings.showPreview ? 'Original' : 'Enhanced'}</span>
                  </button>
                )}
                
                {/* Processing Progress */}
                {isProcessing && processingProgress && (
                  <div className="absolute bottom-2 left-2 right-2 bg-purple-600/90 text-white text-xs p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingProgress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Sidebar - Compact */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Face Selection - Compact */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Face Selection
                  </h4>
                  <div className="flex items-center space-x-2">
                    {selectedFaceIndices.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 
                                     text-xs rounded-full font-medium">
                        {selectedFaceIndices.length} selected
                      </span>
                    )}
                    {photo.faces && photo.faces.length > 1 && (
                      <button
                        onClick={handleSelectAllFaces}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded 
                                 flex items-center space-x-1 transition-colors duration-200"
                      >
                        <Users className="h-3 w-3" />
                        <span>
                          {selectedFaceIndices.length === photo.faces.length ? 'Deselect All' : 'All'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Click face boxes to select for Enhancement
                </p>
                
                {selectedFaceIndices.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                                rounded p-2">
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                      {selectedFaceIndices.length} face(s) selected:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFaceIndices.map((index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 
                                                    text-xs rounded font-medium">
                          Face {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings - Compact */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Ailbums Settings</span>
                </h4>
                
                <div className="space-y-3">
                  {/* Fidelity Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Fidelity (w)
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {settings.fidelity.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={settings.fidelity}
                      onChange={(e) => setSettings(prev => ({ ...prev, fidelity: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Natural</span>
                      <span>Enhanced</span>
                    </div>
                  </div>

                  {/* Process Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Full image → <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">./inputs/whole_imgs/</code> → CodeFormer w={settings.fidelity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions - Compact */}
              <div className="flex-1 flex flex-col justify-end p-4">
                <div className="space-y-2">
                  <button
                    onClick={handleCodeFormerEnhancement}
                    disabled={selectedFaceIndices.length === 0 || isProcessing}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 
                             disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded 
                             flex items-center justify-center space-x-2 transition-all duration-200 
                             font-medium text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {isProcessing 
                        ? `Processing...` 
                        : `CodeFormer Enhance ${selectedFaceIndices.length > 0 ? `(${selectedFaceIndices.length})` : ''}`
                      }
                    </span>
                  </button>

                  {retouchedImageUrl && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                 rounded flex items-center justify-center space-x-1 transition-colors duration-200 text-sm"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save & Update</span>
                      </button>
                      
                      <button
                        onClick={handleDownload}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                                 rounded flex items-center justify-center space-x-1 transition-colors duration-200 text-sm"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download Only</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded 
                             flex items-center justify-center space-x-2 transition-colors duration-200 text-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode - original large modal
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full flex" onClick={e => e.stopPropagation()}>
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative max-w-full max-h-full">
            <div className="relative">
              <FaceRetouchOverlay
                faces={photo.faces || []}
                imageUrl={currentImageUrl}
                onFaceClick={handleFaceClick}
                selectedFaceIndices={selectedFaceIndices}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Preview Toggle */}
              {retouchedImageUrl && (
                <button
                  onClick={() => setSettings(prev => ({ ...prev, showPreview: !prev.showPreview }))}
                  className="absolute top-4 left-4 px-3 py-1.5 bg-black/75 text-white text-sm 
                           rounded-md hover:bg-black/90 transition-colors duration-200 flex items-center space-x-2"
                >
                  {settings.showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{settings.showPreview ? 'Show Original' : 'Show CodeFormer Enhanced'}</span>
                </button>
              )}
              
              {/* Compact Mode Toggle */}
              <button
                onClick={() => setIsCompactMode(true)}
                className="absolute top-4 right-4 px-3 py-1.5 bg-black/75 text-white text-sm 
                         rounded-md hover:bg-black/90 transition-colors duration-200 flex items-center space-x-2"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Compact View</span>
              </button>
              
              {/* Processing Progress */}
              {isProcessing && processingProgress && (
                <div className="absolute bottom-4 left-4 right-4 bg-purple-600/90 text-white text-sm p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{processingProgress}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                      flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>CodeFormer Face Enhancement</span>
              </h2>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={photo.filename}>
                {photo.filename}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {photo.faces?.length || 0} face(s) detected • Original image will be sent to Ailbums
              </p>
            </div>
          </div>

          {/* CodeFormer Info Banner */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-purple-800 dark:text-purple-200 font-medium mb-1">
                  Ailbums AI Face Restoration
                </p>
                <p className="text-purple-700 dark:text-purple-300">
                  Select faces to enhance with CodeFormer. The full original image is sent to the backend, 
                  which saves it to <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">./inputs/whole_imgs/</code> 
                  and runs CodeFormer inference with your selected fidelity setting.
                </p>
              </div>
            </div>
          </div>

          {/* Face Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Face Selection
              </h4>
              <div className="flex items-center space-x-2">
                {selectedFaceIndices.length > 0 && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 
                                 text-sm rounded-full font-medium">
                    {selectedFaceIndices.length} selected
                  </span>
                )}
                {photo.faces && photo.faces.length > 1 && (
                  <button
                    onClick={handleSelectAllFaces}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                             flex items-center space-x-1 transition-colors duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedFaceIndices.length === photo.faces.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click on face boxes in the image to select them. CodeFormer will enhance the selected faces in the full image.
            </p>
            
            {selectedFaceIndices.length > 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                            rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                  {selectedFaceIndices.length} face(s) selected for CodeFormer enhancement:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedFaceIndices.map((index) => (
                    <span key={index} className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 
                                                text-xs rounded-full font-medium">
                      Face {index + 1}
                    </span>
                  ))}
                </div>
                {selectedFaceIndices.length > 1 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Faces will be enhanced sequentially by Ailbums
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                            rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  No faces selected. Click on face boxes in the image to select them for Ailbums enhancement.
                </p>
              </div>
            )}
          </div>

          {/* CodeFormer Settings */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Face Enhance Settings</span>
            </h4>
            
            <div className="space-y-4">
              {/* Fidelity Slider (CodeFormer 'w' parameter) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fidelity (w parameter)
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {settings.fidelity.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={settings.fidelity}
                  onChange={(e) => setSettings(prev => ({ ...prev, fidelity: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                           slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                           slider-thumb:bg-purple-600 slider-thumb:rounded-full slider-thumb:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Natural (0.0)</span>
                  <span>Enhanced (1.0)</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Ailbums fidelity: 0.0 = more natural/original details, 1.0 = stronger enhancement/less original details
                </p>
              </div>

              {/* Backend Process Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backend Process:
                </h5>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Full image saved to <code>./inputs/whole_imgs/</code></li>
                  <li>• Ailbums inference with w={settings.fidelity}</li>
                  <li>• Enhanced result returned from <code>./results</code></li>
                  <li>• Face upsampling enabled</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex flex-col justify-end p-6">
            <div className="space-y-3">
              <button
                onClick={handleCodeFormerEnhancement}
                disabled={selectedFaceIndices.length === 0 || isProcessing}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center justify-center space-x-2 transition-all duration-200 
                         font-medium text-lg"
              >
                <Sparkles className="h-5 w-5" />
                <span>
                  {isProcessing 
                    ? `Ailbums Processing...` 
                    : `Magic Retouch ${selectedFaceIndices.length > 0 ? `(${selectedFaceIndices.length})` : ''}`
                  }
                </span>
              </button>

              {retouchedImageUrl && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                             rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Update Dashboard</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                             rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Only</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                         flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Face Overlay with Always Visible Face Boxes
interface FaceRetouchOverlayProps {
  faces: Face[];
  imageUrl: string;
  onFaceClick: (face: Face, index: number) => void;
  selectedFaceIndices: number[];
  className?: string;
}

const FaceRetouchOverlay: React.FC<FaceRetouchOverlayProps> = ({
  faces,
  imageUrl,
  onFaceClick,
  selectedFaceIndices,
  className = ''
}) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load original image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      console.log('Face Retouch: Original image dimensions loaded:', {
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      console.error('Face Retouch: Failed to load image for face overlay');
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update container dimensions with debouncing
  const updateDimensions = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
        
        if (newDimensions.width > 0 && newDimensions.height > 0) {
          setContainerDimensions(prev => {
            const widthDiff = Math.abs(prev.width - newDimensions.width);
            const heightDiff = Math.abs(prev.height - newDimensions.height);
            
            if (widthDiff > 1 || heightDiff > 1) {
              return newDimensions;
            }
            return prev;
          });
          
          const ready = newDimensions.width > 0 && newDimensions.height > 0 && 
                       originalDimensions.width > 0 && originalDimensions.height > 0;
          
          if (ready !== isReady) {
            setIsReady(ready);
          }
        }
      }
    }, 16);
  }, [originalDimensions, isReady]);

  useEffect(() => {
    if (containerRef.current) {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });

      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateDimensions]);

  const handleImageLoad = useCallback(() => {
    requestAnimationFrame(updateDimensions);
    setTimeout(updateDimensions, 50);
    setTimeout(updateDimensions, 150);
    setTimeout(updateDimensions, 300);
  }, [updateDimensions]);

  // Calculate face position with object-fit: contain
  const calculateFacePosition = useCallback((face: Face, faceIndex: number) => {
    if (!isReady || !face.box || face.box.length !== 4) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const [x1, y1, x2, y2] = face.box;
    
    // Calculate scale for object-fit: contain
    const scale = Math.min(
      containerDimensions.width / originalDimensions.width,
      containerDimensions.height / originalDimensions.height
    );

    const imageDisplayWidth = originalDimensions.width * scale;
    const imageDisplayHeight = originalDimensions.height * scale;
    const offsetX = (containerDimensions.width - imageDisplayWidth) / 2;
    const offsetY = (containerDimensions.height - imageDisplayHeight) / 2;

    const left = Math.round(x1 * scale + offsetX);
    const top = Math.round(y1 * scale + offsetY);
    const width = Math.round((x2 - x1) * scale);
    const height = Math.round((y2 - y1) * scale);

    // Clamp to visible area
    const clampedLeft = Math.max(0, Math.min(left, containerDimensions.width));
    const clampedTop = Math.max(0, Math.min(top, containerDimensions.height));
    const clampedWidth = Math.max(0, Math.min(width, containerDimensions.width - clampedLeft));
    const clampedHeight = Math.max(0, Math.min(height, containerDimensions.height - clampedTop));

    return { 
      left: clampedLeft, 
      top: clampedTop, 
      width: clampedWidth, 
      height: clampedHeight 
    };
  }, [isReady, containerDimensions, originalDimensions]);

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="CodeFormer face enhancement"
        className="w-full h-full object-contain"
        onLoad={handleImageLoad}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
      
      {/* Always show face boxes when ready */}
      {isReady && faces.length > 0 && faces.map((face, index) => {
        const position = calculateFacePosition(face, index);
        const isSelected = selectedFaceIndices.includes(index);
        const isHovered = hoveredFace === index;
        
        // Only skip if position is too small
        if (position.width <= 4 || position.height <= 4) {
          return null;
        }
        
        return (
          <div
            key={`face-${index}-${containerDimensions.width}x${containerDimensions.height}`}
            className={`absolute border-2 cursor-pointer transition-all duration-200 group ${
              isSelected 
                ? 'border-green-500 bg-green-500/20 shadow-lg ring-2 ring-green-300' 
                : isHovered
                ? 'border-purple-400 bg-purple-400/20 shadow-md ring-1 ring-purple-200'
                : 'border-blue-500 bg-blue-500/10 hover:border-purple-400 hover:bg-purple-400/20 hover:shadow-md'
            }`}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
              height: `${position.height}px`,
              zIndex: 5, // Lower z-index to not interfere with UI buttons
              boxSizing: 'border-box'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFaceClick(face, index);
            }}
            onMouseEnter={() => setHoveredFace(index)}
            onMouseLeave={() => setHoveredFace(null)}
          >
            {/* Selection indicator - always visible */}
            <div className={`absolute -top-8 left-0 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              isSelected 
                ? 'bg-green-500 text-white opacity-100 scale-105' 
                : 'bg-blue-500 text-white opacity-90 group-hover:bg-purple-500 group-hover:opacity-100'
            }`}
            style={{ pointerEvents: 'none' }}>
              {isSelected ? '✓ Selected for CodeFormer' : 'Click to select'}
            </div>
            
            {/* Face number - always visible */}
            <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              isSelected 
                ? 'bg-green-500 text-white scale-125 ring-2 ring-green-300' 
                : 'bg-blue-500 text-white group-hover:bg-purple-500 group-hover:scale-110'
            }`}
            style={{ pointerEvents: 'none' }}>
              {index + 1}
            </div>

            {/* Face quality indicator for larger faces */}
            {position.width > 40 && position.height > 40 && face.face_quality && (
              <div className={`absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center transition-opacity duration-200 ${
                isSelected || isHovered ? 'opacity-100' : 'opacity-70'
              }`}
              style={{ pointerEvents: 'none' }}>
                Quality: {Math.round(face.face_quality * 100)}%
              </div>
            )}

            {/* Selection checkmark */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        );
      })}

      {/* Instructions overlay */}
      {faces.length > 0 && selectedFaceIndices.length === 0 && (
        <div className="absolute top-4 right-4 bg-black/75 text-white text-sm p-3 rounded-lg max-w-xs"
             style={{ zIndex: 20, pointerEvents: 'none' }}>
          <p className="font-medium mb-1">CodeFormer Face Selection</p>
          <p>Click on any blue face box to select it for enhancement. The full image will be processed.</p>
        </div>
      )}

      {/* Selected faces info */}
      {selectedFaceIndices.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-green-500/90 text-white text-sm p-3 rounded-lg"
             style={{ zIndex: 20, pointerEvents: 'none' }}>
          <p className="font-medium">
            {selectedFaceIndices.length} Face(s) Selected
          </p>
          <p className="text-xs opacity-90">
            Ready for enhancement
          </p>
          {selectedFaceIndices.length > 1 && (
            <p className="text-xs opacity-90 mt-1">
              Will be processed sequentially
            </p>
          )}
        </div>
      )}

      {/* No faces detected message */}
      {faces.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/75 text-white text-sm p-4 rounded-lg text-center"
             style={{ zIndex: 20, pointerEvents: 'none' }}>
          <p className="font-medium mb-1">No Faces Detected</p>
          <p>This photo doesn't have any detected faces to enhance.</p>
        </div>
      )}
    </div>
  );
};

export default FaceRetouchModal;