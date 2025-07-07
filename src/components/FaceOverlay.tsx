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
  // Each instance has its own state - completely independent
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  
  // Each instance has its own refs - no sharing
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  // Load original image dimensions for THIS instance
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const originalDims = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      
      console.log(`[${instanceId.current}] Original dimensions loaded:`, originalDims);
      setOriginalDimensions(originalDims);
    };
    img.onerror = () => {
      console.warn(`[${instanceId.current}] Failed to load image:`, imageUrl);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update dimensions for THIS specific image instance
  const updateDimensions = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (imageRef.current && containerRef.current) {
        // Get the ACTUAL rendered size of THIS specific image element
        const imageRect = imageRef.current.getBoundingClientRect();
        
        const newDimensions = {
          width: Math.round(imageRect.width),
          height: Math.round(imageRect.height)
        };
        
        console.log(`[${instanceId.current}] Rendered dimensions updated:`, newDimensions);
        
        // Only update if we have valid dimensions and they changed
        if (newDimensions.width > 0 && newDimensions.height > 0) {
          setImageDimensions(prev => {
            if (Math.abs(prev.width - newDimensions.width) > 1 || 
                Math.abs(prev.height - newDimensions.height) > 1) {
              return newDimensions;
            }
            return prev;
          });
        }
        
        // Set ready state when both dimensions are valid
        const ready = newDimensions.width > 0 && newDimensions.height > 0 && 
                     originalDimensions.width > 0 && originalDimensions.height > 0;
        
        console.log(`[${instanceId.current}] Ready state:`, ready, {
          rendered: newDimensions,
          original: originalDimensions
        });
        
        setIsReady(ready);
      }
    }, 50);
  }, [originalDimensions.width, originalDimensions.height]);

  // Set up ResizeObserver for THIS specific container only
  useEffect(() => {
    if (containerRef.current) {
      // Clean up any existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create observer specifically for THIS container
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === containerRef.current) {
            // Only update if this is OUR container
            requestAnimationFrame(() => {
              updateDimensions();
            });
            break;
          }
        }
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

  // Handle image load for THIS specific image
  const handleImageLoad = useCallback(() => {
    console.log(`[${instanceId.current}] Image loaded, updating dimensions`);
    // Multiple update attempts to ensure we catch the final layout
    requestAnimationFrame(() => updateDimensions());
    setTimeout(() => updateDimensions(), 100);
    setTimeout(() => updateDimensions(), 250);
  }, [updateDimensions]);

  // Reset when image changes
  useEffect(() => {
    console.log(`[${instanceId.current}] Image URL changed, resetting state`);
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

  // Calculate face position using THIS instance's dimensions with proper object-fit: cover handling
  const calculateFacePosition = useCallback((face: Face, faceIndex: number) => {
    console.log(`[${instanceId.current}] Calculating position for face ${faceIndex}:`);
    console.log(`  - Face box from backend:`, face.box);
    console.log(`  - Original dimensions:`, originalDimensions);
    console.log(`  - Rendered dimensions:`, imageDimensions);
    
    // Validate we have all required data for THIS instance
    if (
      originalDimensions.width === 0 || originalDimensions.height === 0 ||
      imageDimensions.width === 0 || imageDimensions.height === 0 ||
      !face.box || face.box.length !== 4
    ) {
      console.log(`  - Invalid data, returning zero position`);
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    // Use backend coordinates directly - [x1, y1, x2, y2] in original image pixels
    const [x1, y1, x2, y2] = face.box;
    console.log(`  - Face coordinates: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`);

    // Calculate how the original image is displayed with object-fit: cover
    const containerAspect = imageDimensions.width / imageDimensions.height;
    const imageAspect = originalDimensions.width / originalDimensions.height;
    
    console.log(`  - Container aspect: ${containerAspect.toFixed(3)}`);
    console.log(`  - Image aspect: ${imageAspect.toFixed(3)}`);

    let scale: number;
    let visibleImageWidth: number;
    let visibleImageHeight: number;
    let cropOffsetX = 0;
    let cropOffsetY = 0;

    if (containerAspect > imageAspect) {
      // Container is wider than image - image fills container width, height is cropped
      scale = imageDimensions.width / originalDimensions.width;
      visibleImageWidth = imageDimensions.width;
      visibleImageHeight = originalDimensions.height * scale;
      
      // Calculate how much of the original image is cropped from top/bottom
      const totalScaledHeight = originalDimensions.height * scale;
      const croppedHeight = totalScaledHeight - imageDimensions.height;
      cropOffsetY = croppedHeight / 2; // Equal crop from top and bottom
      
      console.log(`  - Width-constrained: scale=${scale.toFixed(3)}, cropOffsetY=${cropOffsetY.toFixed(1)}`);
    } else {
      // Container is taller than image - image fills container height, width is cropped
      scale = imageDimensions.height / originalDimensions.height;
      visibleImageWidth = originalDimensions.width * scale;
      visibleImageHeight = imageDimensions.height;
      
      // Calculate how much of the original image is cropped from left/right
      const totalScaledWidth = originalDimensions.width * scale;
      const croppedWidth = totalScaledWidth - imageDimensions.width;
      cropOffsetX = croppedWidth / 2; // Equal crop from left and right
      
      console.log(`  - Height-constrained: scale=${scale.toFixed(3)}, cropOffsetX=${cropOffsetX.toFixed(1)}`);
    }

    // Transform face coordinates from original image space to visible container space
    // First scale the coordinates
    const scaledX1 = x1 * scale;
    const scaledY1 = y1 * scale;
    const scaledX2 = x2 * scale;
    const scaledY2 = y2 * scale;
    
    // Then adjust for cropping - subtract the crop offset to get position in visible area
    const visibleX1 = scaledX1 - cropOffsetX;
    const visibleY1 = scaledY1 - cropOffsetY;
    const visibleX2 = scaledX2 - cropOffsetX;
    const visibleY2 = scaledY2 - cropOffsetY;
    
    console.log(`  - Scaled coordinates: (${scaledX1.toFixed(1)}, ${scaledY1.toFixed(1)}) to (${scaledX2.toFixed(1)}, ${scaledY2.toFixed(1)})`);
    console.log(`  - Visible coordinates: (${visibleX1.toFixed(1)}, ${visibleY1.toFixed(1)}) to (${visibleX2.toFixed(1)}, ${visibleY2.toFixed(1)})`);

    // Calculate final position and size
    const left = Math.round(Math.max(0, visibleX1));
    const top = Math.round(Math.max(0, visibleY1));
    const right = Math.round(Math.min(imageDimensions.width, visibleX2));
    const bottom = Math.round(Math.min(imageDimensions.height, visibleY2));
    
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    const finalPosition = { left, top, width, height };
    console.log(`  - Final position:`, finalPosition);

    // Check if face is actually visible (not completely cropped out)
    const isVisible = width > 2 && height > 2 && 
                     left < imageDimensions.width && top < imageDimensions.height &&
                     right > 0 && bottom > 0;
    
    console.log(`  - Face visible:`, isVisible);

    return isVisible ? finalPosition : { left: 0, top: 0, width: 0, height: 0 };
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
              {(face.confidence * 100).toFixed(1)}%
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
                {face.emotion_confidence && (
                  <span className="text-gray-400 text-xs">
                    ({(face.emotion_confidence * 100).toFixed(0)}%)
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

  // Debug log when faces prop changes
  useEffect(() => {
    console.log(`[${instanceId.current}] Faces data received:`, faces?.length || 0, 'faces');
    if (faces && faces.length > 0) {
      faces.forEach((face, index) => {
        console.log(`  Face ${index}:`, face.box);
      });
    }
  }, [faces]);

  // If no faces, just render the image
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
      
      {/* Face bounding boxes - only render when THIS instance is ready */}
      {isReady && faces.map((face, index) => {
        const position = calculateFacePosition(face, index);
        
        // Only render if we have valid position with minimum size
        if (position.width <= 2 || position.height <= 2) {
          console.log(`[${instanceId.current}] Skipping face ${index} - too small or not visible:`, position);
          return null;
        }
        
        // Use unique key that includes instance dimensions to force re-render when size changes
        const uniqueKey = `${instanceId.current}-face-${index}-${imageDimensions.width}x${imageDimensions.height}`;
        
        return (
          <div key={uniqueKey}>
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