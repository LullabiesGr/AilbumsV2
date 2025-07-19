import React, { useState } from 'react';
import FilterDropdown from './FilterDropdown';
import ColorLabelFilter from './ColorLabelFilter';
import CaptionSearch from './CaptionSearch';
import ViewToggle from './ViewToggle';
import { Download, Sparkles, Zap, Save, Brain, Upload, Users, Copy } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import { batchAutocorrect, batchAutofix } from '../lib/api';
import { useToast } from '../context/ToastContext';
import UploadButton from './UploadButton';

const ActionBar: React.FC = () => {
  const { 
    photos, 
    cullingMode,
    cullAllPhotos, 
    saveAlbumAndTrainAI,
    selectAllPhotos, 
    deselectAllPhotos, 
    selectedPhotos,
    updatePhotoUrl,
    findDuplicates,
    isFindingDuplicates,
    groupPeopleByFaces
  } = usePhoto();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventType, setEventType] = useState('');
  
  // Don't show AI-related buttons in manual mode
  const showAIFeatures = cullingMode !== 'manual';
  
  const handleCullAllPhotos = () => {
    if (photos.length > 0) {
      cullAllPhotos();
    }
  };

  const handleSaveAndTrain = async () => {
    if (!eventType) {
      setShowEventDialog(true);
      return;
    }
    
    // If we already have event type, save directly
    try {
      await saveAlbumAndTrainAI(eventType);
    } catch (error: any) {
      console.error('Failed to save album:', error);
      showToast(error.message || 'Failed to save album', 'error');
    }
  };

  const handleBatchProcess = async (processor: 'autocorrect' | 'autofix') => {
    if (selectedPhotos.length === 0) {
      showToast('Please select photos to process', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const files = selectedPhotos.map(p => p.file);
      const results = await (processor === 'autocorrect' ? batchAutocorrect(files) : batchAutofix(files));

      // Update each photo with its processed version
      results.forEach(result => {
        const photo = selectedPhotos.find(p => p.filename === result.filename);
        if (photo) {
          const imageUrl = `data:image/png;base64,${result.image_base64}`;
          updatePhotoUrl(photo.id, imageUrl);
        }
      });

      showToast(`Batch ${processor} complete!`, 'success');
    } catch (error: any) {
      console.error(`Batch ${processor} failed:`, error);
      showToast(error.message || `Failed to ${processor} photos`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFindDuplicates = async () => {
    try {
      await findDuplicates();
    } catch (error: any) {
      showToast(error.message || 'Failed to find duplicates', 'error');
    }
  };

  const handleGroupPeople = () => {
    groupPeopleByFaces();
    showToast('People grouped by face similarity', 'success');
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <FilterDropdown />
        <ColorLabelFilter />
        <CaptionSearch />
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
        <button
          onClick={() => selectedPhotos.length === photos.length ? deselectAllPhotos() : selectAllPhotos()}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                   rounded-md flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                   transition-colors duration-200"
        >
          {selectedPhotos.length === photos.length ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          <span>{selectedPhotos.length === photos.length ? 'Deselect All' : 'Select All'}</span>
        </button>
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
        <ViewToggle />
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
        <UploadButton variant="secondary" />
      </div>
      
      <div className="flex gap-3">
        <span className="text-sm font-medium py-2 px-3 bg-gray-200 dark:bg-gray-800 rounded-md">
          {selectedPhotos.length} selected
        </span>

        {/* Advanced Features */}
        <button
          onClick={handleFindDuplicates}
          disabled={isFindingDuplicates || photos.filter(p => p.clip_vector).length === 0}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 
                   text-white font-medium rounded-md flex items-center space-x-2 
                   transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <Copy className="h-5 w-5" />
          <span>{isFindingDuplicates ? 'Finding...' : 'Find Duplicates'}</span>
        </button>

        <button
          onClick={handleGroupPeople}
          disabled={photos.filter(p => p.faces && p.faces.length > 0).length === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 
                   text-white font-medium rounded-md flex items-center space-x-2 
                   transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <Users className="h-5 w-5" />
          <span>Group People</span>
        </button>

        {showAIFeatures && (
          <>
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md
                        flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50
                        disabled:cursor-not-allowed disabled:hover:bg-purple-600"
              onClick={() => handleBatchProcess('autocorrect')}
              disabled={selectedPhotos.length === 0 || isProcessing}
            >
              <Zap className="h-5 w-5" />
              <span>Batch Auto-Correct</span>
            </button>

            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md
                        flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50
                        disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              onClick={() => handleBatchProcess('autofix')}
              disabled={selectedPhotos.length === 0 || isProcessing}
            >
              <Sparkles className="h-5 w-5" />
              <span>Batch Auto-Fix</span>
            </button>

            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md
                        flex items-center space-x-2 transition-colors duration-200"
              onClick={handleSaveAndTrain}
            >
              <Brain className="h-5 w-5" />
              <span>Save & Train AI</span>
            </button>
          </>
        )}

        <span className="text-sm font-medium py-2 px-3 bg-gray-200 dark:bg-gray-800 rounded-md">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
        
        {showAIFeatures && (
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md 
                      flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 
                      disabled:cursor-not-allowed disabled:hover:bg-red-600"
            onClick={handleCullAllPhotos}
            disabled={photos.length === 0}
          >
            <Trash2 className="h-5 w-5" />
            <span>Cull All Photos</span>
          </button>
        )}
      </div>
      
      {showEventDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Δημιουργία Άλμπουμ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Τίτλος Άλμπουμ</label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="π.χ. Γάμος Μιχάλη & Άννας 2024"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Φωτογραφίες προς Αποθήκευση:
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>• Επιλεγμένες: {selectedPhotos.length}</p>
                  <p>• Εγκεκριμένες (πράσινες): {photos.filter(p => p.color_label === 'green').length}</p>
                  <p>• Backend Approved: {photos.filter(p => p.approved === true).length}</p>
                  <p>• Σύνολο: {Math.max(selectedPhotos.length, photos.filter(p => p.color_label === 'green' || p.approved === true).length)} φωτογραφίες</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEventDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 
                         dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndTrain}
                onClick={async () => {
                  if (!eventType.trim()) {
                    showToast('Please enter album title', 'error');
                    return;
                  }
                  
                  setShowEventDialog(false);
                  
                  try {
                    await saveAlbumAndTrainAI(eventType.trim());
                  } catch (error: any) {
                    console.error('Failed to save album:', error);
                    showToast(error.message || 'Failed to save album', 'error');
                  }
                }}
                disabled={!eventType.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Δημιουργία Άλμπουμ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionBar;