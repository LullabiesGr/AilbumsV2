import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Eye, EyeOff, Download, Save, RotateCcw, Settings } from 'lucide-react';
import { Photo, Face } from '../types';
import FaceOverlay from './FaceOverlay';
import { useToast } from '../context/ToastContext';

interface FaceRetouchModalProps {
  photo: Photo;
  onClose: () => void;
  onSave?: (retouchedImageUrl: string) => void;
}

interface RetouchSettings {
  fidelity: number;
  keepOriginalResolution: boolean;
  showPreview: boolean;
}

const FaceRetouchModal: React.FC<FaceRetouchModalProps> = ({ photo, onClose, onSave }) => {
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<RetouchSettings>({
    fidelity: 0.7,
    keepOriginalResolution: true,
    showPreview: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [retouchedImageUrl, setRetouchedImageUrl] = useState<string | null>(null);
  const [originalImageUrl] = useState(photo.url);
  const { showToast } = useToast();

  const handleFaceClick = (face: Face, index: number) => {
    setSelectedFaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAllFaces = () => {
    if (selectedFaces.size === (photo.faces?.length || 0)) {
      setSelectedFaces(new Set());
    } else {
      setSelectedFaces(new Set(Array.from({ length: photo.faces?.length || 0 }, (_, i) => i)));
    }
  };

  const handleMagicRetouch = async () => {
    if (selectedFaces.size === 0) {
      showToast('Please select at least one face to retouch', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      // Get selected face coordinates
      const selectedFaceBoxes = Array.from(selectedFaces).map(index => {
        const face = photo.faces![index];
        return face.box;
      });

      // Prepare form data for the backend
      const formData = new FormData();
      formData.append('file', photo.file);
      formData.append('face_boxes', JSON.stringify(selectedFaceBoxes));
      formData.append('fidelity', settings.fidelity.toString());
      formData.append('keep_original_resolution', settings.keepOriginalResolution.toString());

      // Call the backend API
      const response = await fetch('https://ddc6-5-54-157-17.ngrok-free.app/enhance_face_in_image', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to retouch faces');
      }

      const blob = await response.blob();
      const retouchedUrl = URL.createObjectURL(blob);
      setRetouchedImageUrl(retouchedUrl);
      setSettings(prev => ({ ...prev, showPreview: true }));
      
      showToast(`Successfully retouched ${selectedFaces.size} face(s)!`, 'success');
    } catch (error: any) {
      console.error('Face retouch error:', error);
      showToast(error.message || 'Failed to retouch faces', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (retouchedImageUrl && onSave) {
      onSave(retouchedImageUrl);
      showToast('Retouched photo saved!', 'success');
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!retouchedImageUrl) return;
    
    try {
      const response = await fetch(retouchedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `retouched_${photo.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast('Failed to download image', 'error');
    }
  };

  const handleReset = () => {
    if (retouchedImageUrl) {
      URL.revokeObjectURL(retouchedImageUrl);
    }
    setRetouchedImageUrl(null);
    setSelectedFaces(new Set());
    setSettings({
      fidelity: 0.7,
      keepOriginalResolution: true,
      showPreview: false
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retouchedImageUrl) {
        URL.revokeObjectURL(retouchedImageUrl);
      }
    };
  }, [retouchedImageUrl]);

  const currentImageUrl = settings.showPreview && retouchedImageUrl ? retouchedImageUrl : originalImageUrl;
  const facesWithSelection = photo.faces?.map((face, index) => ({
    ...face,
    isSelected: selectedFaces.has(index)
  })) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full flex" onClick={e => e.stopPropagation()}>
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative max-w-full max-h-full">
            <div className="relative">
              <FaceRetouchOverlay
                faces={facesWithSelection}
                imageUrl={currentImageUrl}
                onFaceClick={handleFaceClick}
                selectedFaces={selectedFaces}
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
                  <span>{settings.showPreview ? 'Show Original' : 'Show Retouched'}</span>
                </button>
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
                <span>Face Retouch</span>
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
                {photo.faces?.length || 0} face(s) detected
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  AI Face Enhancement
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Select the faces you want to retouch. Adjust the retouch fidelity if needed. 
                  When ready, click 'Magic Retouch' to enhance only the selected faces using AI, 
                  while keeping the rest of the photo untouched and at full resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Face Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Face Selection ({selectedFaces.size} of {photo.faces?.length || 0})
              </h4>
              <button
                onClick={handleSelectAllFaces}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 
                         dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-colors duration-200"
              >
                {selectedFaces.size === (photo.faces?.length || 0) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click on faces in the image to select/deselect them for retouching.
            </p>
            
            {selectedFaces.size > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                            rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {selectedFaces.size} face(s) selected for enhancement
                </p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Retouch Settings</span>
            </h4>
            
            <div className="space-y-4">
              {/* Fidelity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Retouch Fidelity
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
                  Lower values preserve more original features, higher values apply stronger enhancement.
                </p>
              </div>

              {/* Keep Original Resolution */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Keep Original Resolution
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maintain the original image size and quality
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.keepOriginalResolution}
                  onChange={(e) => setSettings(prev => ({ ...prev, keepOriginalResolution: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-1 flex flex-col justify-end p-6">
            <div className="space-y-3">
              <button
                onClick={handleMagicRetouch}
                disabled={selectedFaces.size === 0 || isProcessing}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center justify-center space-x-2 transition-all duration-200 
                         font-medium text-lg"
              >
                <Sparkles className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Magic Retouch'}</span>
              </button>

              {retouchedImageUrl && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white 
                             rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                             rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
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

// Custom Face Overlay for Retouch Mode
interface FaceRetouchOverlayProps {
  faces: (Face & { isSelected?: boolean })[];
  imageUrl: string;
  onFaceClick: (face: Face, index: number) => void;
  selectedFaces: Set<number>;
  className?: string;
}

const FaceRetouchOverlay: React.FC<FaceRetouchOverlayProps> = ({
  faces,
  imageUrl,
  onFaceClick,
  selectedFaces,
  className = ''
}) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load original image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update container dimensions
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
      
      if (newDimensions.width > 0 && newDimensions.height > 0) {
        setContainerDimensions(newDimensions);
        
        const ready = newDimensions.width > 0 && newDimensions.height > 0 && 
                     originalDimensions.width > 0 && originalDimensions.height > 0;
        setIsReady(ready);
      }
    }
  }, [originalDimensions]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  const handleImageLoad = useCallback(() => {
    requestAnimationFrame(updateDimensions);
    setTimeout(updateDimensions, 50);
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

    return { left, top, width, height };
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
        alt="Face retouch"
        className="w-full h-full object-contain"
        onLoad={handleImageLoad}
      />
      
      {/* Face selection overlays */}
      {isReady && faces.map((face, index) => {
        const position = calculateFacePosition(face, index);
        const isSelected = selectedFaces.has(index);
        
        if (position.width <= 2 || position.height <= 2) return null;
        
        return (
          <div
            key={index}
            className={`absolute border-2 cursor-pointer transition-all duration-200 group ${
              isSelected 
                ? 'border-green-500 bg-green-500/20' 
                : 'border-blue-500 bg-blue-500/10 hover:border-blue-400 hover:bg-blue-400/20'
            }`}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
              height: `${position.height}px`,
              zIndex: 10
            }}
            onClick={() => onFaceClick(face, index)}
          >
            {/* Selection indicator */}
            <div className={`absolute -top-6 left-0 px-2 py-1 rounded-full text-xs font-medium ${
              isSelected 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white opacity-0 group-hover:opacity-100'
            } transition-opacity`}>
              {isSelected ? '✓ Selected' : 'Click to select'}
            </div>
            
            {/* Face number */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isSelected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaceRetouchModal;