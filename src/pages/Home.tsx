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
import { Play, RotateCcw, Brain, Copy, Users, Grid, List } from 'lucide-react';
import { EventType } from '../types';
import { EventType } from '../types';

const Home: React.FC = () => {
  const { 
    photos, 
    duplicateClusters,
    personGroups,
    selectedPersonGroup,
    setSelectedPersonGroup,
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
  
  const renderWorkflowContent = () => {
    switch (workflowStage) {
      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Welcome to AI Photo Culling</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your photos (JPEG, PNG, RAW formats) to get started with intelligent photo analysis and culling
            </p>
            <UploadButton />
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium mb-1">Supported formats:</p>
              <p>Standard: JPEG, PNG, TIFF, WebP, BMP</p>
              <p>RAW: CR2, CR3, NEF, ARW, DNG, ORF, RAF, PEF, and more</p>
            </div>
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
              <h3 className="text-lg font-semibold mb-4">Uploaded Photos ({photos.length})</h3>
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
            
            {/* Person Group Filter Status */}
            {selectedPersonGroup && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      Filtered by Person:
                    </span>
                    <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full font-medium">
                      ID: {String(selectedPersonGroup).slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">
                      {photos.filter(p => p.faces?.some(f => f.same_person_group === selectedPersonGroup)).length} photos shown
                    </span>
                    <button
                      onClick={() => setSelectedPersonGroup(null)}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 
                               text-sm rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <AlbumSelector />
            <ActionBar />
            
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