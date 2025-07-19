import React from 'react';
import Header from '../components/Header';
import Gallery from '../components/Gallery';
import ActionBar from '../components/ActionBar';
import UploadButton from '../components/UploadButton';
import WorkflowSteps from '../components/WorkflowSteps';
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
    currentAlbumName,
    currentAlbumId,
    createNewAlbum,
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

  const [showFaceRetouchStep, setShowFaceRetouchStep] = React.useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = React.useState(false);
  const [newAlbumName, setNewAlbumName] = React.useState('');
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);

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
  
  const hasAnalyzedPhotos = photos.some(p => p.ai_score > 0);
  
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      showToast('Please enter album name', 'error');
      return;
    }
    
    if (!selectedEventType) {
      showToast('Please select event type', 'error');
      return;
    }
    
    try {
      await createNewAlbum(newAlbumName.trim(), selectedEventType);
      setShowCreateAlbumModal(false);
      setNewAlbumName('');
      setSelectedEventType(null);
      setWorkflowStage('configure');
    } catch (error) {
      // Error already handled in createNewAlbum
    }
  };
  
  const renderWorkflowContent = () => {
    switch (workflowStage) {
      case 'upload':
        return (
          <div className="space-y-6">
            {!currentAlbumName ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Create Your Album First</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Before uploading photos, please create an album to organize your work
                </p>
                <button
                  onClick={() => setShowCreateAlbumModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                           flex items-center space-x-2 transition-colors duration-200 font-medium"
                >
                  <span>Create New Album</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Album Ready: "{currentAlbumName}"
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Event Type: {getEventTypeLabel(eventType)} • ID: {currentAlbumId.slice(-8)}
                  </p>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Upload Photos to Album</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your photos (JPEG, PNG, RAW formats) to "{currentAlbumName}"
                </p>
                <UploadButton />
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>Standard: JPEG, PNG, TIFF, WebP, BMP</p>
                  <p>RAW: CR2, CR3, NEF, ARW, DNG, ORF, RAF, PEF, and more</p>
                </div>
              </div>
            )}
            
            {/* Create Album Modal */}
            {showCreateAlbumModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Create New Album</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Album Name *</label>
                      <input
                        type="text"
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        placeholder="e.g. Wedding of John & Mary 2024"
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Type *</label>
                      <select
                        value={selectedEventType || ''}
                        onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
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
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> All photos will be saved locally in this album. 
                        No cloud storage is used.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateAlbumModal(false);
                        setNewAlbumName('');
                        setSelectedEventType(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 
                               dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAlbum}
                      disabled={!newAlbumName.trim() || !selectedEventType}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Album
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
                {photos.length} photos uploaded to "{currentAlbumName}". Configure your analysis settings below.
              </p>
            </div>

            {/* Show uploaded photos as thumbnails */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Album: "{currentAlbumName}" ({photos.length} photos)
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
              selectedType={eventType} 
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
                disabled={!cullingMode || (cullingMode !== 'manual' && !eventType)}
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
            
            {eventType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Event Type:
                    </span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                      {getEventTypeLabel(eventType)}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    AI analysis optimized for {getEventTypeLabel(eventType)?.toLowerCase()} photography
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
          © 2025 AftershootKiller — AI Photo Culling. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;