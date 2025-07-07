import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Face } from '../types';
import { User, Eye, EyeOff, Smile, Frown, Meh, Heart, AlertCircle, Glasses, Shield } from 'lucide-react';

interface FaceOverlayProps {
  faces: Face[];
  imageUrl: string;
  className?: string;
  showTooltips?: boolean;
  onFaceClick?: (face: Face, index: number) => void;
}

const FaceOverlay: React.FC<FaceOverlayProps> = ({ 
  faces, 
  imageUrl, 
  className = '',
  showTooltips = true,
  onFaceClick
}) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
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
    };
    img.onerror = () => {
      console.warn('Failed to load image for face overlay:', imageUrl);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Debounced dimension update function
  const updateDimensions = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (imageRef.current && containerRef.current) {
        // Get the actual rendered size of the image element
        const imageRect = imageRef.current.getBoundingClientRect();
        
        // Use the actual rendered image size (this is what we see on screen)
        const newDimensions = {
          width: imageRect.width,
          height: imageRect.height
        };
        
        // Only update if dimensions actually changed significantly (avoid micro-updates)
        if (Math.abs(newDimensions.width - imageDimensions.width) > 0.5 || 
            Math.abs(newDimensions.height - imageDimensions.height) > 0.5) {
          setImageDimensions(newDimensions);
        }
        
        // Mark as ready when we have valid dimensions
        if (newDimensions.width > 0 && newDimensions.height > 0 && 
            originalDimensions.width > 0 && originalDimensions.height > 0) {
          setIsReady(true);
        }
      }
    }, 10); // Small debounce delay
  }, [imageDimensions.width, imageDimensions.height, originalDimensions.width, originalDimensions.height]);

  // Set up resize observer for this specific image container
  useEffect(() => {
    if (containerRef.current) {
      // Clean up previous observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create new observer for this container
      resizeObserverRef.current = new ResizeObserver((entries) => {
        // Use requestAnimationFrame to ensure DOM is fully updated
        requestAnimationFrame(() => {
          updateDimensions();
        });
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
  }, [imageLoaded, updateDimensions]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    
    // Update dimensions immediately when image loads
    requestAnimationFrame(() => {
      updateDimensions();
    });
    
    // Additional update after a short delay to ensure everything is rendered
    setTimeout(() => {
      updateDimensions();
    }, 50);
  }, [updateDimensions]);

  // Reset state when image URL changes
  useEffect(() => {
    setImageLoaded(false);
    setIsReady(false);
    setImageDimensions({ width: 0, height: 0 });
    setHoveredFace(null);
  }, [imageUrl]);

  const getEmotionIcon = (emotion: string, confidence?: number) => {
    const iconProps = { className: "h-3 w-3" };
    
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
        return <Smile {...iconProps} className="h-3 w-3 text-green-500" />;
      case 'sad':
        return <Frown {...iconProps} className="h-3 w-3 text-blue-500" />;
      case 'angry':
        return <AlertCircle {...iconProps} className="h-3 w-3 text-red-500" />;
      case 'surprise':
        return <Heart {...iconProps} className="h-3 w-3 text-yellow-500" />;
      case 'fear':
        return <AlertCircle {...iconProps} className="h-3 w-3 text-purple-500" />;
      case 'disgust':
        return <Frown {...iconProps} className="h-3 w-3 text-orange-500" />;
      case 'neutral':
        return <Meh {...iconProps} className="h-3 w-3 text-gray-500" />;
      default:
        return <Heart {...iconProps} className="h-3 w-3 text-pink-500" />;
    }
  };

  const getQualityColor = (quality?: number) => {
    if (!quality) return 'text-gray-500';
    if (quality > 0.8) return 'text-green-500';
    if (quality > 0.6) return 'text-yellow-500';
    if (quality > 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-green-500';
    if (confidence > 0.7) return 'text-yellow-500';
    if (confidence > 0.5) return 'text-orange-500';
    return 'text-red-500';
  };

  // Calculate face position using backend coordinates directly with proper object-fit: cover handling
  const calculateFacePosition = useCallback((face: Face) => {
    if (
      originalDimensions.width === 0 || originalDimensions.height === 0 ||
      imageDimensions.width === 0 || imageDimensions.height === 0 ||
      !face.box || face.box.length !== 4
    ) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    // Use backend coordinates directly - [x1, y1, x2, y2] in original image pixels
    const [x1, y1, x2, y2] = face.box;

    // Calculate scale and offset for object-fit: cover
    const widthScale = imageDimensions.width / originalDimensions.width;
    const heightScale = imageDimensions.height / originalDimensions.height;

    let scale: number, dx = 0, dy = 0;
    const containerAspect = imageDimensions.width / imageDimensions.height;
    const imageAspect = originalDimensions.width / originalDimensions.height;

    if (containerAspect > imageAspect) {
      // Container is wider than image aspect, image fills height, width cropped
      scale = heightScale;
      const usedImageWidth = originalDimensions.width * scale;
      dx = (imageDimensions.width - usedImageWidth) / 2;
    } else {
      // Container is taller than image aspect, image fills width, height cropped
      scale = widthScale;
      const usedImageHeight = originalDimensions.height * scale;
      dy = (imageDimensions.height - usedImageHeight) / 2;
    }

    // Map backend coordinates to displayed coordinates
    const left = Math.round(x1 * scale + dx);
    const top = Math.round(y1 * scale + dy);
    const width = Math.round((x2 - x1) * scale);
    const height = Math.round((y2 - y1) * scale);

    return { left, top, width, height };
  }, [originalDimensions, imageDimensions]);

  const handleFaceHover = (index: number, event: React.MouseEvent) => {
    setHoveredFace(index);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  const handleFaceLeave = () => {
    setHoveredFace(null);
  };

  const handleFaceClick = (face: Face, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onFaceClick) {
      onFaceClick(face, index);
    }
  };

  const renderTooltip = (face: Face, index: number) => {
    if (!showTooltips || hoveredFace !== index) return null;

    return (
      <div
        className="absolute z-50 bg-black/90 text-white text-xs rounded-lg p-3 pointer-events-none
                   shadow-xl border border-gray-600 min-w-[200px] max-w-[300px]"
        style={{
          left: tooltipPosition.x + 10,
          top: tooltipPosition.y - 10,
          transform: 'translateY(-100%)'
        }}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-600">
            <User className="h-4 w-4 text-blue-400" />
            <span className="font-semibold">Face Detection</span>
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Confidence:</span>
            <span className={`font-medium ${getConfidenceColor(face.confidence)}`}>
              {((face.confidence ?? 0) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Age */}
          {face.age && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Age:</span>
              <span className="font-medium text-white">
                {Math.round(face.age)} years
              </span>
            </div>
          )}

          {/* Gender */}
          {face.gender && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Gender:</span>
              <span className="font-medium text-white capitalize">
                {face.gender}
              </span>
            </div>
          )}

          {/* Emotion */}
          {face.emotion && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Emotion:</span>
              <div className="flex items-center space-x-1">
                {getEmotionIcon(face.emotion, face.emotion_confidence)}
                <span className="font-medium text-white capitalize">
                  {face.emotion}
                </span>
                {face.emotion_confidence != null && (
                  <span className="text-gray-400 text-xs">
                    ({((face.emotion_confidence ?? 0) * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Face Quality */}
          {face.face_quality && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Quality:</span>
              <span className={`font-medium ${getQualityColor(face.face_quality)}`}>
                {(face.face_quality * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Eyes Status */}
          {face.eyes_closed !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Eyes:</span>
              <div className="flex items-center space-x-1">
                {face.eyes_closed ? (
                  <EyeOff className="h-3 w-3 text-red-400" />
                ) : (
                  <Eye className="h-3 w-3 text-green-400" />
                )}
                <span className="font-medium text-white">
                  {face.eyes_closed ? 'Closed' : 'Open'}
                </span>
              </div>
            </div>
          )}

          {/* Smile */}
          {face.smile !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Smile:</span>
              <div className="flex items-center space-x-1">
                <Smile className="h-3 w-3 text-yellow-400" />
                <span className="font-medium text-white">
                  {(face.smile * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Accessories */}
          <div className="flex items-center space-x-3 pt-1">
            {face.glasses && (
              <div className="flex items-center space-x-1">
                <Glasses className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-gray-300">Glasses</span>
              </div>
            )}
            {face.mask && (
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-300">Mask</span>
              </div>
            )}
          </div>

          {/* Head Pose */}
          {face.headpose && (
            <div className="pt-2 border-t border-gray-600">
              <div className="text-gray-300 text-xs mb-1">Head Pose:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Yaw:</span>
                  <span className="text-white ml-1">{face.headpose.yaw.toFixed(1)}°</span>
                </div>
                <div>
                  <span className="text-gray-400">Pitch:</span>
                  <span className="text-white ml-1">{face.headpose.pitch.toFixed(1)}°</span>
                </div>
                <div>
                  <span className="text-gray-400">Roll:</span>
                  <span className="text-white ml-1">{face.headpose.roll.toFixed(1)}°</span>
                </div>
              </div>
            </div>
          )}

          {/* Person Group */}
          {face.same_person_group && (
            <div className="pt-2 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Person ID:</span>
                <span className="font-mono text-xs text-blue-400">
                  {face.same_person_group.slice(-8)}
                </span>
              </div>
              {face.is_duplicate && (
                <div className="text-orange-400 text-xs mt-1">
                  ⚠ Duplicate face detected
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!faces || faces.length === 0) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="No faces detected"
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face detection"
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
      />
      
      {/* Face bounding boxes - only render when everything is ready */}
      {isReady && faces.map((face, index) => {
        const position = calculateFacePosition(face);
        
        // Only render if we have valid position with minimum size
        if (position.width <= 1 || position.height <= 1) {
          return null;
        }
        
        return (
          <div key={`${imageUrl}-face-${index}-${imageDimensions.width}-${imageDimensions.height}`}>
            {/* Face bounding box */}
            <div 
              className="absolute border-2 border-red-500 bg-red-500/10 cursor-pointer
                         hover:border-red-400 hover:bg-red-400/20 transition-all duration-200
                         group"
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
                height: `${position.height}px`
              }}
              onMouseEnter={(e) => handleFaceHover(index, e)}
              onMouseMove={(e) => handleFaceHover(index, e)}
              onMouseLeave={handleFaceLeave}
              onClick={(e) => handleFaceClick(face, index, e)}
            >
              {/* Face index indicator - only show if box is large enough */}
              {position.width > 20 && position.height > 20 && (
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1.5 py-0.5
                              rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </div>
              )}

              {/* Quick info overlay - only show if box is large enough */}
              {position.width > 30 && position.height > 30 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1
                              opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {face.emotion && getEmotionIcon(face.emotion)}
                      {face.age && <span>{Math.round(face.age)}y</span>}
                      {face.gender && <span className="capitalize">{face.gender}</span>}
                    </div>
                    <div className="flex items-center space-x-1">
                      {face.eyes_closed && <EyeOff className="h-3 w-3 text-red-400" />}
                      {face.glasses && <Glasses className="h-3 w-3 text-blue-400" />}
                      {face.mask && <Shield className="h-3 w-3 text-green-400" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Landmarks - using backend coordinates directly */}
              {face.landmarks && face.landmarks.length > 0 && hoveredFace === index && position.width > 40 && position.height > 40 && (
                <>
                  {face.landmarks.map((landmark, landmarkIndex) => {
                    // Backend provides landmarks in original image coordinates
                    // Calculate their position using the same scaling as face boxes
                    const [landmarkX, landmarkY] = landmark;
                    
                    // Apply same transformation as face box
                    const widthScale = imageDimensions.width / originalDimensions.width;
                    const heightScale = imageDimensions.height / originalDimensions.height;
                    
                    let scale: number, dx = 0, dy = 0;
                    const containerAspect = imageDimensions.width / imageDimensions.height;
                    const imageAspect = originalDimensions.width / originalDimensions.height;

                    if (containerAspect > imageAspect) {
                      scale = heightScale;
                      const usedImageWidth = originalDimensions.width * scale;
                      dx = (imageDimensions.width - usedImageWidth) / 2;
                    } else {
                      scale = widthScale;
                      const usedImageHeight = originalDimensions.height * scale;
                      dy = (imageDimensions.height - usedImageHeight) / 2;
                    }
                    
                    const scaledX = landmarkX * scale + dx;
                    const scaledY = landmarkY * scale + dy;
                    
                    return (
                      <div
                        key={landmarkIndex}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                        style={{
                          left: `${scaledX - position.left}px`,
                          top: `${scaledY - position.top}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    );
                  })}
                </>
              )}
            </div>

            {/* Tooltip - only show for larger boxes to avoid clutter */}
            {position.width > 25 && position.height > 25 && renderTooltip(face, index)}
          </div>
        );
      })}
    </div>
  );
};

export default FaceOverlay;