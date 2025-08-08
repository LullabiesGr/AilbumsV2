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

        // For subsequent faces, use the result from the previous enhancement
        if (finalImageBlob) {
          currentImageFile = new File([finalImageBlob], photo.file.name, { type: photo.file.type });
        }

        // Prepare form data exactly as specified for CodeFormer backend
        const formData = new FormData();
        
        // Send the FULL original image (not cropped) - this is critical for CodeFormer
        formData.append('file', currentImageFile);
        
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
        const response = await fetch('https://3a202ff8dda3.ngrok-free.app/enhance', {
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
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded 
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
              Click on face boxes in the image to select faces for CodeFormer enhancement
            </p>
            
            {selectedFaceIndices.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                            rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                  {selectedFaceIndices.length} face(s) selected for enhancement:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFaceIndices.map((index) => (
                    <span key={index} className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 
                                                text-sm rounded-md font-medium">
                      Face {index + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>CodeFormer Settings</span>
            </h4>
            
            <div className="space-y-4">
              {/* Fidelity Slider */}
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
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>More Natural (0.0)</span>
                  <span>More Enhanced (1.0)</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Lower values preserve more original features, higher values apply stronger enhancement
                </p>
              </div>

              {/* Process Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Process:</strong> Full image → <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">./inputs/whole_imgs/</code> → CodeFormer w={settings.fidelity}
                </p>
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
                         font-medium"
              >
                <Sparkles className="h-5 w-5" />
                <span>
                  {isProcessing 
                    ? `Processing ${selectedFaceIndices.length} face(s)...` 
                    : `Enhance with CodeFormer ${selectedFaceIndices.length > 0 ? `(${selectedFaceIndices.length} face${selectedFaceIndices.length > 1 ? 's' : ''})` : ''}`
                  }
                </span>
              </button>

              {retouchedImageUrl && (
                <div className="flex space-x-3">
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
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FaceRetouchOverlay component for displaying faces with selection
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
  className = ""
}) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const updateDisplayDimensions = () => {
      if (imageRef.current && containerRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setDisplayDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDisplayDimensions();
    window.addEventListener('resize', updateDisplayDimensions);
    return () => window.removeEventListener('resize', updateDisplayDimensions);
  }, [imageUrl]);

  const getScaledCoordinates = (box: number[]) => {
    if (!imageDimensions || !displayDimensions) return null;

    const [x1, y1, x2, y2] = box;
    const scaleX = displayDimensions.width / imageDimensions.width;
    const scaleY = displayDimensions.height / imageDimensions.height;

    return {
      left: x1 * scaleX,
      top: y1 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY
    };
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Photo with face detection"
        className="w-full h-full object-contain"
        onLoad={() => {
          if (imageRef.current && containerRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            setDisplayDimensions({ width: rect.width, height: rect.height });
          }
        }}
      />
      
      {faces.map((face, index) => {
        const coords = getScaledCoordinates(face.box);
        if (!coords) return null;

        const isSelected = selectedFaceIndices.includes(index);

        return (
          <div
            key={index}
            className={`absolute border-2 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-green-400 bg-green-400/20 shadow-lg'
                : 'border-blue-400 bg-blue-400/10 hover:border-blue-500 hover:bg-blue-500/20'
            }`}
            style={{
              left: coords.left,
              top: coords.top,
              width: coords.width,
              height: coords.height
            }}
            onClick={() => onFaceClick(face, index)}
          >
            {/* Face number label */}
            <div
              className={`absolute -top-6 -left-1 px-2 py-1 text-xs font-bold rounded ${
                isSelected
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {index + 1}
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FaceRetouchModal;