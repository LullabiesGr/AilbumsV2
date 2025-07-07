import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Face } from '../types';
import { User, Eye, EyeOff, Smile, Frown, Meh, Heart, AlertCircle, Glasses, Shield } from 'lucide-react';

interface FaceOverlayProps {
  faces: Face[];
  imageUrl: string;
  className?: string;
  showTooltips?: boolean;
  onFaceClick?: (face: Face, index: number) => void;
  debugMode?: boolean; // New prop for debugging
}

const FaceOverlay: React.FC<FaceOverlayProps> = ({ 
  faces, 
  imageUrl, 
  className = '',
  showTooltips = true,
  onFaceClick,
  debugMode = false // Enable debug mode to render at original size
}) => {
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  // Load original image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const originalDims = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      
      console.log(`[${instanceId.current}] Original dimensions loaded:`, originalDims);
      setOriginalDimensions(originalDims);
      setIsReady(true);
    };
    img.onerror = () => {
      console.warn(`[${instanceId.current}] Failed to load image:`, imageUrl);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Reset when image changes
  useEffect(() => {
    console.log(`[${instanceId.current}] Image URL changed, resetting state`);
    setIsReady(false);
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

  // Calculate face position - DEBUG MODE: Use original coordinates directly
  const calculateFacePosition = useCallback((face: Face, faceIndex: number) => {
    console.log(`[${instanceId.current}] DEBUG MODE - Face ${faceIndex} original coordinates:`, {
      faceBox: face.box,
      originalDimensions
    });
    
    if (!face.box || face.box.length !== 4) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    // In debug mode, use backend coordinates directly with NO scaling
    const [x1, y1, x2, y2] = face.box;
    
    const position = {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1
    };

    console.log(`[${instanceId.current}] DEBUG - Face ${faceIndex} direct position:`, {
      originalBox: [x1, y1, x2, y2],
      finalPosition: position
    });

    return position;
  }, [originalDimensions]);

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
            <span className="font-semibold">Face Detection (DEBUG)</span>
          </div>

          {/* Debug Info */}
          <div className="bg-red-900/30 border border-red-600 rounded p-2">
            <div className="text-xs text-red-300 font-mono">
              <div>Original Box: [{face.box?.join(', ')}]</div>
              <div>Image Size: {originalDimensions.width}x{originalDimensions.height}</div>
            </div>
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
        </div>
      </div>
    );
  };

  // Debug log when faces prop changes
  useEffect(() => {
    console.log(`[${instanceId.current}] DEBUG MODE - Faces data received:`, faces?.length || 0, 'faces');
    if (faces && faces.length > 0) {
      faces.forEach((face, index) => {
        console.log(`  Face ${index}:`, face.box);
      });
    }
  }, [faces]);

  // If no faces, just render the image
  if (!faces || faces.length === 0) {
    return (
      <div 
        ref={containerRef} 
        className={debugMode ? '' : className}
        style={debugMode ? { 
          position: 'relative',
          width: originalDimensions.width || 'auto',
          height: originalDimensions.height || 'auto',
          overflow: 'visible',
          border: '2px solid red', // Debug border
          backgroundColor: '#f0f0f0'
        } : { 
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="No faces detected"
          className={debugMode ? '' : "w-full h-full object-contain"}
          style={debugMode ? {
            display: 'block',
            width: originalDimensions.width || 'auto',
            height: originalDimensions.height || 'auto',
            objectFit: 'none'
          } : {
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        {debugMode && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 z-50">
            DEBUG: {originalDimensions.width}x{originalDimensions.height} - No Faces
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={debugMode ? '' : className}
      style={debugMode ? { 
        position: 'relative',
        width: originalDimensions.width || 'auto',
        height: originalDimensions.height || 'auto',
        overflow: 'visible',
        border: '2px solid blue', // Debug border
        backgroundColor: '#f0f0f0'
      } : { 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face detection"
        className={debugMode ? '' : "w-full h-full object-contain"}
        style={debugMode ? {
          display: 'block',
          width: originalDimensions.width || 'auto',
          height: originalDimensions.height || 'auto',
          objectFit: 'none'
        } : {
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
      
      {/* Debug info overlay */}
      {debugMode && (
        <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 z-50">
          DEBUG: {originalDimensions.width}x{originalDimensions.height} - {faces.length} faces
        </div>
      )}
      
      {/* Face bounding boxes - only render when ready */}
      {isReady && faces.map((face, index) => {
        const position = calculateFacePosition(face, index);
        
        // Only render if we have valid position with minimum size
        if (position.width <= 2 || position.height <= 2) {
          console.log(`[${instanceId.current}] DEBUG - Skipping face ${index} - too small:`, position);
          return null;
        }
        
        const uniqueKey = `${instanceId.current}-face-${index}-debug`;
        
        return (
          <div key={uniqueKey}>
            {/* Face bounding box */}
            <div 
              className="absolute border-2 border-red-500 bg-red-500/10 cursor-pointer
                         hover:border-red-400 hover:bg-red-400/20 transition-all duration-200
                         group pointer-events-auto"
              style={{
                position: 'absolute',
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
                height: `${position.height}px`,
                zIndex: 10,
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => handleFaceHover(index, e)}
              onMouseMove={(e) => handleFaceHover(index, e)}
              onMouseLeave={handleFaceLeave}
              onClick={(e) => handleFaceClick(face, index, e)}
            >
              {/* Face index indicator */}
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1.5 py-0.5
                            rounded-full font-medium"
                   style={{ zIndex: 11 }}>
                {index + 1}
              </div>

              {/* Debug coordinates overlay */}
              {debugMode && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white text-xs p-1
                              pointer-events-none font-mono"
                     style={{ zIndex: 11 }}>
                  <div>Box: [{face.box?.join(',')}]</div>
                  <div>Pos: {position.left},{position.top}</div>
                  <div>Size: {position.width}x{position.height}</div>
                </div>
              )}

              {/* Quick info overlay - only show if box is large enough */}
              {position.width > 30 && position.height > 30 && (
                <div className="absolute top-0 left-0 right-0 bg-black/75 text-white text-xs p-1
                              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                     style={{ zIndex: 11 }}>
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

            {/* Tooltip */}
            {renderTooltip(face, index)}
          </div>
        );
      })}
    </div>
  );
};

export default FaceOverlay;