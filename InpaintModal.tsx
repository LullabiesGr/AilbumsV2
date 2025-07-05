import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import { X, Download, Eraser, Paintbrush } from 'lucide-react';
import { Photo } from '../types';
import { inpaintPhoto } from '../lib/api';

interface InpaintModalProps {
  photo: Photo;
  onClose: () => void;
}

const InpaintModal: React.FC<InpaintModalProps> = ({ photo, onClose }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<any[]>([]);
  const [brushSize, setBrushSize] = useState(20);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = photo.url;
    img.onload = () => {
      imageRef.current = img;
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.7;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      setDimensions({
        width: img.width * scale,
        height: img.height * scale
      });
    };
  }, [photo.url]);

  const handleMouseDown = () => {
    setIsDrawing(true);
    setLines([...lines, []]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    setLines([...lines.slice(0, -1), [...lastLine, point.x, point.y]]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    setLines([]);
    setError(null);
  };

  const generateMaskImage = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d')!;
      
      // Draw black background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw white lines
      ctx.strokeStyle = 'white';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      
      lines.forEach(line => {
        if (line.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(line[0], line[1]);
        for (let i = 2; i < line.length; i += 2) {
          ctx.lineTo(line[i], line[i + 1]);
        }
        ctx.stroke();
      });
      
      canvas.toBlob(blob => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const handleInpaint = async () => {
    setError(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (lines.length === 0) {
      setError('Please draw a mask on the area you want to edit');
      return;
    }

    try {
      setIsLoading(true);
      const maskBlob = await generateMaskImage();
      
      // Validate mask size
      if (maskBlob.size === 0) {
        throw new Error('Failed to generate mask image');
      }

      const result = await inpaintPhoto(
        photo.file,
        new File([maskBlob], 'mask.png', { type: 'image/png' }),
        prompt.trim()
      );
      
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
      
      const url = URL.createObjectURL(result);
      setEditedImageUrl(url);
      setError(null);
    } catch (error: any) {
      console.error('Inpainting failed:', error);
      setError(error.message || 'Failed to process image. Please try again.');
      setEditedImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!editedImageUrl) return;
    
    try {
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${photo.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download the image. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] bg-gray-900 rounded-xl p-4"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white 
                   transition-colors duration-200 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col gap-4">
          <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
            {!editedImageUrl ? (
              <Stage
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                ref={stageRef}
              >
                <Layer>
                  {imageRef.current && (
                    <KonvaImage
                      image={imageRef.current}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  )}
                  {lines.map((line, i) => (
                    <Line
                      key={i}
                      points={line}
                      stroke="rgba(255, 0, 0, 0.3)"
                      strokeWidth={brushSize}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                    />
                  ))}
                </Layer>
              </Stage>
            ) : (
              <img
                src={editedImageUrl}
                alt="Edited result"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-black/50 text-white p-4 rounded-lg">
            {!editedImageUrl ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5" />
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  <button
                    onClick={clearMask}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md"
                  >
                    <Eraser className="h-4 w-4" />
                    Clear
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Describe what you want to change..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
                  />
                  
                  <button
                    onClick={handleInpaint}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                             disabled:cursor-not-allowed rounded-md text-white font-medium"
                  >
                    {isLoading ? 'Processing...' : 'Apply AI Edit'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setEditedImageUrl(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                >
                  Try Again
                </button>
                
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white 
                           flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Result
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InpaintModal;