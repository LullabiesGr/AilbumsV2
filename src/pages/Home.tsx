import React from 'react';
import Header from '../components/Header';
import Gallery from '../components/Gallery';
import ActionBar from '../components/ActionBar';
import UploadButton from '../components/UploadButton';
import WorkflowSteps from '../components/WorkflowSteps';
import CopyLookInterface from './components/CopyLookInterface';
import WorkflowNavigation from '../components/WorkflowNavigation';
import EventTypeSelector from '../components/EventTypeSelector';
import CullingModeSelector from '../components/CullingModeSelector';
import AnalysisProgress from '../components/AnalysisProgress';
import ManualCullingControls from '../components/ManualCullingControls';
import DuplicateManager from '../components/DuplicateManager';
import PeopleGroupManager from '../components/PeopleGroupManager';
import FacesGrid from '../components/FacesGrid';
import { usePhoto } from '../context/PhotoContext';
import AlbumSelector from '../components/AlbumSelector';
import AnalysisOverlay from '../components/AnalysisOverlay';
import Sidebar from '../components/Sidebar';
import FaceRetouchModal from '../components/FaceRetouchModal';
import { Play, RotateCcw, Brain, Copy, Users, Grid, List, Sparkles, ArrowLeft, Wand2 } from 'lucide-react';

const Home: React.FC = () => {
  const { 
    photos, 
    duplicateClusters,
    personGroups,
    isLoading, 
    isAnalyzing,
    analysisProgress,
    showAnalysisOverlay,
    setShowAnalysisOverlay,
    workflowStage,
    setWorkflowStage,
    eventType,
    cullingMode,
    setEventType,
    setCullingMode,
    startAnalysis,
    startBackgroundAnalysis,
    resetWorkflow
  } = usePhoto();
  
  const [activeTab, setActiveTab] = React.useState<'gallery' | 'duplicates' | 'people'>('gallery');
  
  // Album creation state
  const [albumName, setAlbumName] = React.useState('');
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);
  const [albumCreated, setAlbumCreated] = React.useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  const hasAnalyzedPhotos = photos.some(p => p.ai_score > 0);

  const getEventTypeLabel = (type: EventType | null) => {
    const eventLabels = {
      wedding: 'Wedding',
      baptism: 'Baptism',
      portrait: 'Portrait',
      family: 'Family',
      corporate: 'Corporate',
      event: 'General Event',
      landscape: 'Landscape'
    };
    return type ? eventLabels[type] : null;
  };

  // Validation function
  const validateBeforeAnalysis = () => {
    const errors: string[] = [];
    
    if (photos.length === 0) {
      errors.push('Please upload photos first');
    }
    
    if (!albumName || !albumName.trim()) {
      errors.push('Please enter album name');
    }
    
    if (!selectedEventType) {
      errors.push('Please select event type');
    }
    
    if (!cullingMode) {
      errors.push('Please select culling mode');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle analyze with validation
  const handleAnalyze = async () => {
    if (!validateBeforeAnalysis()) {
      return;
    }
    
    // Set event type in context
    setEventType(selectedEventType!);
    
    // Start analysis with album name and event type
    await startAnalysis(albumName.trim(), selectedEventType!);
  };
  
  const renderWorkflowContent = () => {
    switch (workflowStage) {
      case 'upload':
        return (
          <div className="space-y-6">
            {/* Step 1: Upload Photos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Upload Photos</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Start by uploading your photos. You'll set album details before analysis.
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <UploadButton />
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>Standard: JPEG, PNG, TIFF, WebP, BMP</p>
                  <p>RAW: CR2, CR3, NEF, ARW, DNG, ORF, RAF, PEF, and more</p>
                </div>
              </div>
              
              {photos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Uploaded Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto">
                    {photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Step 2: Album Configuration (only show if photos uploaded) */}
            {photos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Album Configuration</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set album name and event type before analysis
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Album Name Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Album Name *
                    </label>
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      placeholder="e.g. Wedding of John & Mary 2024"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border 
                               border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent"
                    />
                  </div>
                  
                  {/* Event Type Selector */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Type *
                    </label>
                    <select
                      value={selectedEventType || ''}
                      onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border 
                               border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent"
                    >
                      <option value="">Select event type...</option>
                      <option value="wedding">Wedding</option>
                      <option value="baptism">Baptism</option>
                      <option value="portrait">Portrait</option>
                      <option value="family">Family</option>
                      <option value="corporate">Corporate</option>
                      <option value="event">General Event</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  
                  {/* Culling Mode Selector */}
                  <CullingModeSelector 
                    selectedMode={cullingMode} 
                    onSelect={setCullingMode} 
                  />
                  
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        Please fix the following issues:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Album Preview */}
                  {albumName.trim() && selectedEventType && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Album Preview:
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <p><strong>Name:</strong> {albumName.trim()}</p>
                        <p><strong>Event Type:</strong> {getEventTypeLabel(selectedEventType)}</p>
                        <p><strong>Photos:</strong> {photos.length} files</p>
                        <p><strong>Culling Mode:</strong> {cullingMode || 'Not selected'}</p>
                        <p><strong>Backend Path:</strong> /albums/{albumName.trim().replace(/[^a-zA-Z0-9]/g, '_')}/</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Analyze Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleAnalyze}
                      disabled={!albumName.trim() || !selectedEventType || !cullingMode || photos.length === 0}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                               hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 
                               disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                               flex items-center space-x-3 transition-all duration-200 font-medium text-lg
                               shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <Brain className="h-6 w-6" />
                      <span>
                        {isAnalyzing 
                          ? 'Analyzing...' 
                          : `Start Analysis (${photos.length} photos)`
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <WorkflowNavigation currentStage={workflowStage} onStageChange={setWorkflowStage} />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Configure Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {photos.length} photos uploaded. Configure your analysis settings below.
              </p>
            </div>

            {/* Show uploaded photos as thumbnails */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Album: "{albumName}" ({photos.length} photos)
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <EventTypeSelector 
              selectedType={selectedEventType} 
              onSelect={setEventType} 
              required={cullingMode !== 'manual'}
            />
            
            {hasAnalyzedPhotos && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Photos have been analyzed. Changing event type will offer to re-analyze with new context.
                  </span>
                </div>
              </div>
            )}

            <CullingModeSelector 
              selectedMode={cullingMode} 
              onSelect={setCullingMode} 
            />

            <div className="flex justify-center space-x-4 pt-6">
              <button
                onClick={resetWorkflow}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                         flex items-center space-x-2 transition-colors duration-200"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Start Over</span>
              </button>
              
              <button
                onClick={startAnalysis}
                disabled={!cullingMode || (cullingMode !== 'manual' && !selectedEventType)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         disabled:cursor-not-allowed text-white rounded-lg flex items-center 
                         space-x-2 transition-colors duration-200 font-medium"
              >
                <Play className="h-5 w-5" />
                <span>
                  {cullingMode === 'manual' 
                    ? 'Start Manual Review' 
                    : hasAnalyzedPhotos 
                      ? 'Re-analyze Photos' 
                      : 'Start Analysis'
                  }
                </span>
              </button>
            </div>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center">
            <AnalysisProgress 
              totalPhotos={analysisProgress.total}
              processedPhotos={analysisProgress.processed}
              currentPhoto={analysisProgress.currentPhoto}
              isDeepAnalysis={cullingMode === 'deep'}
              showRealTimeProgress={cullingMode === 'deep'}
            />
          </div>
        );

      case 'face-retouch':
        return (
          <div className="space-y-6">
            {/* Visual Separation */}
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
                    Face Retouch Studio
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Enhance faces in your photos with AI-powered retouching. Select individual faces 
                    for precise enhancement while keeping the rest of your photo untouched.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setWorkflowStage('review')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                             text-white rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Review</span>
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {photos.filter(p => p.faces && p.faces.length > 0).length} photos with faces available
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 
                              dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 
                              rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    How Face Retouch Works:
                  </h3>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Click "Retouch Faces" on any photo with detected faces</li>
                    <li>• Select which faces you want to enhance by clicking on them</li>
                    <li>• Adjust the retouch fidelity (0.0 = natural, 1.0 = enhanced)</li>
                    <li>• Click "Magic Retouch" to apply AI enhancement to selected faces only</li>
                    <li>• Preview before/after and save your enhanced photo</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlbumSelector />
            <ActionBar />
            
            {/* Enhanced Gallery for Face Retouch */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Photos with Faces ({photos.filter(p => p.faces && p.faces.length > 0).length})
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Retouch Faces" button on photos to enhance faces
                </div>
              </div>
              
              {photos.filter(p => p.faces && p.faces.length > 0).length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Photos with Faces
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyze your photos first to detect faces for retouching.
                  </p>
                </div>
              ) : (
                <Gallery />
              )}
            </div>
          </div>
        );

      case 'ai-edit':
        return (
          <div className="space-y-6">
            {/* Visual Separation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 
                            dark:from-blue-900/20 dark:via-purple-900/20 dark:to-blue-900/20 rounded-lg" />
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-2 
                            border-blue-200 dark:border-blue-800 p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full 
                                flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 
                               bg-clip-text text-transparent">
                    AI Edit & Relighting Studio
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Transform your photos with advanced AI editing and relighting powered by FAL.AI. 
                    Remove backgrounds, enhance lighting, and apply creative effects with simple text prompts.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setWorkflowStage('review')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                             text-white rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Review</span>
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {photos.length} photos available for AI editing
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 
                              dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 
                              rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    How AI Edit & Relight Works:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                    <div>
                      <h4 className="font-medium mb-1">AI Edit Mode:</h4>
                      <ul className="space-y-1">
                        <li>• Remove or change backgrounds</li>
                        <li>• Enhance colors and contrast</li>
                        <li>• Apply artistic effects</li>
                        <li>• Creative transformations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">AI Relight Mode:</h4>
                      <ul className="space-y-1">
                        <li>• Change lighting conditions</li>
                        <li>• Add golden hour effects</li>
                        <li>• Adjust mood and atmosphere</li>
                        <li>• Professional lighting setups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AlbumSelector />
            <ActionBar />
            
            {/* Enhanced Gallery for AI Editing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Photos Available for AI Editing ({photos.length})
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Click "AI Edit" button on any photo to start
                </div>
              </div>
              
              {photos.length === 0 ? (
                <div className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Photos Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload photos first to start AI editing and relighting.
                  </p>
                </div>
              ) : (
                <Gallery />
              )}
            </div>
          </div>
        );

      case 'copy-look':
        return (
          <div className="space-y-6">
            {/* Visual Separation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 
                            dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-lg" />
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-2 
                            border-orange-200 dark:border-orange-800 p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full 
                                flex items-center justify-center mx-auto mb-4">
                    <Copy className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-yellow-600 
                               bg-clip-text text-transparent">
                    Copy Look Studio
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Transfer color grading and lighting style from one photo to others. 
                    Select a reference photo and apply its look to multiple target photos.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setWorkflowStage('review')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                             text-white rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Review</span>
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {photos.length} photos available for color transfer
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 
                              dark:to-yellow-900/30 border border-orange-200 dark:border-orange-700 
                              rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    How Copy Look Works:
                  </h3>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Select one reference photo with the desired look/style</li>
                    <li>• Select multiple target photos to receive the new look</li>
                    <li>• Click "Apply Look Transfer" to process the color transfer</li>
                    <li>• Preview results side-by-side and download or update dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            <CopyLookInterface />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <WorkflowNavigation currentStage={workflowStage} onStageChange={setWorkflowStage} />
            
            {/* Analysis Control Bar */}
            {!photos.some(p => p.ai_score > 0) && cullingMode !== 'manual' && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                            border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Ready for AI Analysis
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start analyzing your {photos.length} photos with {cullingMode === 'deep' ? 'deep' : 'fast'} AI analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startBackgroundAnalysis}
                    disabled={isAnalyzing}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                             text-white rounded-lg flex items-center space-x-2 transition-colors 
                             duration-200 font-medium disabled:cursor-not-allowed"
                  >
                    <Brain className="h-5 w-5" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                  </button>
                </div>
              </div>
            )}
            
            {selectedEventType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Event Type:
                    </span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                      {getEventTypeLabel(selectedEventType)}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    AI analysis optimized for {getEventTypeLabel(selectedEventType)?.toLowerCase()} photography
                  </div>
                </div>
              </div>
            )}
            
            <AlbumSelector />
            <ActionBar />
            
            {/* Face Retouch Step Button */}
            {photos.filter(p => p.faces && p.faces.length > 0).length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 
                            dark:to-pink-900/20 border-2 border-dashed border-purple-300 
                            dark:border-purple-700 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full 
                                flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Ready for Face Retouching
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {photos.filter(p => p.faces && p.faces.length > 0).length} photos with faces detected
                    </p>
                  </div>
                  <button
                    onClick={() => setWorkflowStage('face-retouch')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700 text-white rounded-lg 
                             flex items-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Enter Face Retouch Mode</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* AI Edit & Relight Step Button */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 
                          dark:to-purple-900/20 border-2 border-dashed border-blue-300 
                          dark:border-blue-700 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full 
                              flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    AI Edit & Relighting Available
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transform your photos with advanced AI editing and relighting
                  </p>
                </div>
                <button
                  onClick={() => setWorkflowStage('ai-edit')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-700 hover:to-purple-700 text-white rounded-lg 
                           flex items-center space-x-2 transition-all duration-200 font-medium"
                >
                  <Wand2 className="h-5 w-5" />
                  <span>Enter AI Edit Mode</span>
                </button>
              </div>
            </div>
            
            {/* Copy Look Step Button */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 
                          dark:to-yellow-900/20 border-2 border-dashed border-orange-300 
                          dark:border-orange-700 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full 
                              flex items-center justify-center">
                  <Copy className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Copy Look Available
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transfer color grading and lighting style between photos
                  </p>
                </div>
                <button
                  onClick={() => setWorkflowStage('copy-look')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 
                           hover:from-orange-700 hover:to-yellow-700 text-white rounded-lg 
                           flex items-center space-x-2 transition-all duration-200 font-medium"
                >
                  <Copy className="h-5 w-5" />
                  <span>Enter Copy Look Mode</span>
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'gallery'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Grid className="h-4 w-4" />
                      <span>Gallery ({photos.length})</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('duplicates')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'duplicates'
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Copy className="h-4 w-4" />
                      <span>Duplicates ({duplicateClusters.length})</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('people')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'people'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>People ({personGroups.length})</span>
                    </div>
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'gallery' && (
                  <>
                    {cullingMode === 'manual' && (
                      <ManualCullingControls 
                        currentPhotoId={photos.find(p => !p.color_label || p.color_label === 'yellow')?.id}
                      />
                    )}
                    <Gallery />
                  </>
                )}
                
                {activeTab === 'duplicates' && <DuplicateManager />}
                
                {activeTab === 'people' && (
                  <div className="space-y-8">
                    <PeopleGroupManager />
                    <FacesGrid />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 px-4 py-6 overflow-y-auto">
          <WorkflowSteps currentStage={workflowStage} />
          {renderWorkflowContent()}
        </main>
        
        {workflowStage === 'review' && <Sidebar />}
      </div>
      
      {/* Analysis Overlay */}
      <AnalysisOverlay 
        isVisible={showAnalysisOverlay}
        onClose={() => setShowAnalysisOverlay(false)}
      />
      
      <footer className="py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 Ailbums — AI Photo Culling. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;