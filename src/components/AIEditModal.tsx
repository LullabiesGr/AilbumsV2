import React, { useState, useRef, useEffect } from 'react';
import { X, Wand2, Sun, Download, Save, RotateCcw, Eye, EyeOff, Lightbulb, Palette, ArrowLeft, ArrowRight } from 'lucide-react';
import { Photo } from '../types';
import { falEdit, falRelight } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface AIEditModalProps {
  photo: Photo;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
}

type EditMode = 'edit' | 'relight';

interface EditResult {
  result_url: string;
  full_response: any;
  mode: EditMode;
  prompt: string;
}

const AIEditModal: React.FC<AIEditModalProps> = ({ photo, onClose, onSave }) => {
  const [editMode, setEditMode] = useState<EditMode>('edit');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editResult, setEditResult] = useState<EditResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [processingProgress, setProcessingProgress] = useState('');
  const { showToast } = useToast();

  // Predefined prompts for quick selection
  const editPrompts = [
    'Remove background',
    'Make it brighter',
    'Enhance colors',
    'Add dramatic lighting',
    'Make it vintage style',
    'Increase contrast',
    'Add warm tones',
    'Make it black and white'
  ];

  const relightPrompts = [
    'Golden hour lighting',
    'Sunlight from left',
    'Soft studio lighting',
    'Dramatic side lighting',
    'Warm sunset glow',
    'Cool blue lighting',
    'Natural window light',
    'Cinematic lighting'
  ];

  const currentPrompts = editMode === 'edit' ? editPrompts : relightPrompts;

  const handleProcess = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt', 'warning');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(`Processing ${editMode === 'edit' ? 'AI edit' : 'AI relight'}...`);
    
    try {
      let result;
      
      if (editMode === 'edit') {
        setProcessingProgress('Sending to FAL.AI for creative editing...');
        result = await falEdit(photo.file, prompt.trim());
      } else {
        setProcessingProgress('Sending to FAL.AI for relighting...');
        result = await falRelight(photo.file, prompt.trim());
      }
      
      setEditResult({
        ...result,
        mode: editMode,
        prompt: prompt.trim()
      });
      
      setShowComparison(true);
      setProcessingProgress('');
      
      showToast(
        `${editMode === 'edit' ? 'AI edit' : 'AI relight'} completed successfully!`, 
        'success'
      );
    } catch (error: any) {
      console.error(`${editMode} error:`, error);
      showToast(error.message || `Failed to process ${editMode}`, 'error');
      setProcessingProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!editResult?.result_url) {
      showToast('No edited image available to save', 'warning');
      return;
    }
    
    try {
      if (onSave) {
        onSave(editResult.result_url);
        onClose();
      } else {
        showToast('Save function not available', 'error');
      }
    } catch (error) {
      console.error('Failed to save edited image:', error);
      showToast('Failed to update dashboard', 'error');
    }
  };

  const handleDownload = async () => {
    if (!editResult?.result_url) {
      showToast('No edited image to download', 'warning');
      return;
    }
    
    try {
      const response = await fetch(editResult.result_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_${editResult.mode}_${photo.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Edited image downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download edited image', 'error');
    }
  };

  const handleReset = () => {
    setEditResult(null);
    setShowComparison(false);
    setPrompt('');
    setSliderPosition(50);
    setProcessingProgress('');
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full flex" onClick={e => e.stopPropagation()}>
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative max-w-full max-h-full">
            {showComparison && editResult ? (
              // Before/After Comparison
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg shadow-2xl" style={{ maxWidth: '90vw', maxHeight: '80vh' }}>
                  {/* Original Image */}
                  <img
                    src={photo.url}
                    alt="Original"
                    className="w-full h-full object-contain"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                    }}
                  />
                  
                  {/* Edited Image */}
                  <img
                    src={editResult.result_url}
                    alt="Edited"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{
                      clipPath: `inset(0 0 0 ${sliderPosition}%)`
                    }}
                  />
                  
                  {/* Slider */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="flex space-x-0.5">
                        <div className="w-0.5 h-4 bg-gray-400"></div>
                        <div className="w-0.5 h-4 bg-gray-400"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Slider Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  />
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1 rounded-md text-sm">
                    Original
                  </div>
                  <div className="absolute top-4 right-4 bg-black/75 text-white px-3 py-1 rounded-md text-sm">
                    {editResult.mode === 'edit' ? 'AI Edited' : 'AI Relit'}
                  </div>
                </div>
                
                {/* Comparison Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Drag to compare</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ) : (
              // Original Image
              <div className="relative">
                <img 
                  src={photo.url}
                  alt={photo.filename} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                
                {/* Processing Progress */}
                {isProcessing && processingProgress && (
                  <div className="absolute bottom-4 left-4 right-4 bg-blue-600/90 text-white text-sm p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingProgress}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                      flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-500" />
                <span>AI Edit & Relight</span>
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
                Powered by FAL.AI for advanced image editing and relighting
              </p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              Choose Edit Mode
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setEditMode('edit')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  editMode === 'edit'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Palette className={`h-6 w-6 ${
                    editMode === 'edit' ? 'text-blue-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    editMode === 'edit' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    AI Edit
                  </span>
                  <span className={`text-xs text-center ${
                    editMode === 'edit' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'
                  }`}>
                    Creative edits, backgrounds, effects
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setEditMode('relight')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  editMode === 'relight'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Sun className={`h-6 w-6 ${
                    editMode === 'relight' ? 'text-orange-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    editMode === 'relight' ? 'text-orange-900 dark:text-orange-100' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    AI Relight
                  </span>
                  <span className={`text-xs text-center ${
                    editMode === 'relight' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-500'
                  }`}>
                    Lighting, mood, atmosphere
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              {editMode === 'edit' ? 'Edit Prompt' : 'Lighting Prompt'}
            </h4>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={editMode === 'edit' 
                ? 'Describe the edit you want (e.g., "remove background", "make it brighter")' 
                : 'Describe the lighting you want (e.g., "golden hour", "dramatic side lighting")'
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            
            {/* Quick Prompts */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Prompts:
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentPrompts.slice(0, 6).map((quickPrompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(quickPrompt)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-colors duration-200"
                  >
                    {quickPrompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Info */}
          {editResult && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Processing Result
              </h4>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                            rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {editResult.mode === 'edit' ? 'AI Edit' : 'AI Relight'} Complete
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                  Prompt: "{editResult.prompt}"
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Use the slider above to compare before and after
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex-1 flex flex-col justify-end p-6">
            <div className="space-y-3">
              {!editResult ? (
                <button
                  onClick={handleProcess}
                  disabled={!prompt.trim() || isProcessing}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 
                           disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                           flex items-center justify-center space-x-2 transition-all duration-200 
                           font-medium text-lg"
                >
                  {editMode === 'edit' ? <Palette className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>
                    {isProcessing 
                      ? 'Processing...' 
                      : editMode === 'edit' 
                        ? 'Apply AI Edit' 
                        : 'Apply AI Relight'
                    }
                  </span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                             rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Update</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
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

export default AIEditModal;