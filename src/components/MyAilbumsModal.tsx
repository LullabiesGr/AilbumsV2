import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventType, AnalysisResult, Face } from '../types';
import { fetchAlbums } from '../lib/api'; // Renamed from loadUserAlbums
import AlbumCard from './AlbumCard'; // New component
import AlbumDetailView from './AlbumDetailView'; // New component
import AlbumReviewInterface from './AlbumReviewInterface'; // New component for review mode

// Define interfaces for the data coming from the backend
export interface SavedPhoto extends AnalysisResult {
  filename: string;
  path?: string; // Optional: if backend sends full path, otherwise we construct it
  ai_score: number;
  approved: boolean;
  color_label?: string;
  tags?: string[];
  blip_highlights?: string[];
  blip_flags?: string[];
  faces?: Face[];
  caption?: string;
  edited_versions?: {
    autocorrect?: boolean;
    autofix?: boolean;
    face_retouch?: boolean;
    ai_edit?: boolean;
  };
}

export interface SavedAlbum {
  id: string;
  name?: string; // Assuming 'name' might be used for title
  event_type: EventType;
  date_created: string;
  user_id: string;
  album_dir: string; // Exact directory path from backend
  photos: string[]; // List of filenames
  results: SavedPhoto[]; // List of analysis results for each photo
  metadata?: { // Optional metadata from backend
    user_id: string;
    culling_mode: string;
    analysis_complete: boolean;
  };
}

interface MyAilbumsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Base URL for backend API
// API URL configuration for different environments
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://b455dac5621c.ngrok-free.app";

// Helper to construct album folder name (assuming format like event_type-deep_timestamp)
// DEPRECATED: Use album.album_dir from backend instead
// This function is kept for backward compatibility but should not be used
export const getAlbumFolder = (eventType: EventType, createdAt: string): string => {
  console.warn('getAlbumFolder is deprecated. Use album.album_dir from backend instead.');
  const timestamp = new Date(createdAt).getTime();
  return `${eventType}-deep_${Math.floor(timestamp / 1000)}`;
};

const MyAilbumsModal: React.FC<MyAilbumsModalProps> = ({ isOpen, onClose }) => {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<SavedAlbum | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'review'>('list');
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load albums from backend
  const loadAlbums = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading albums for user:', user.email);
      const albumsData = await fetchAlbums(user.email); // Use fetchAlbums
      console.log('✅ Albums loaded successfully:', albumsData);
      setAlbums(albumsData);
    } catch (error: any) {
      console.error('❌ Failed to load albums:', error);
      showToast(error.message || 'Failed to load albums', 'error');
      // Fallback to empty array
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh albums when modal opens (to show newly created albums)
  useEffect(() => {
    if (isOpen && user?.email) {
      // Small delay to ensure any pending saves are complete
      const timer = setTimeout(() => {
        loadAlbums();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle viewing album details
  const handleViewAlbumDetail = (album: SavedAlbum) => {
    setSelectedAlbum(album);
    setViewMode('detail');
  };

  // Handle opening album in review mode
  const handleOpenAlbumReview = (album: SavedAlbum) => {
    setSelectedAlbum(album);
    setViewMode('review');
  };

  // Handle loading album into main interface
  const handleLoadToMainInterface = (album: SavedAlbum) => {
    // Close the modal first
    onClose();
    
    // Load album data into main photo context
    loadAlbumIntoMainInterface(album);
  };

  const loadAlbumIntoMainInterface = async (album: SavedAlbum) => {
    try {
      showToast('Loading album into main interface...', 'info');
      
      // Convert SavedPhoto to Photo format for main interface
      const convertedPhotos: Photo[] = album.results.map((savedPhoto, index) => {
        const photoUrl = getPhotoUrl(savedPhoto.filename, album.album_dir);
        
        // Create a dummy File object since we don't have the original file
        const dummyFile = new File([''], savedPhoto.filename, { type: 'image/jpeg' });
        
        return {
          id: `${album.id}-${index}`,
          filename: savedPhoto.filename,
          file: dummyFile,
          url: photoUrl,
          score: savedPhoto.ai_score,
          basic_score: savedPhoto.basic_score,
          ml_score: savedPhoto.ml_score,
          ai_score: savedPhoto.ai_score,
          score_type: savedPhoto.score_type || 'ai',
          blur_score: savedPhoto.blur_score,
          personalized_similarity: savedPhoto.personalized_similarity,
          tags: savedPhoto.tags || [],
          faces: savedPhoto.faces || [],
          face_summary: savedPhoto.face_summary,
          clip_vector: savedPhoto.clip_vector,
          phash: savedPhoto.phash,
          caption: savedPhoto.caption,
          event_type: album.event_type,
          color_label: savedPhoto.color_label as any,
          blip_flags: savedPhoto.blip_flags || [],
          blip_highlights: savedPhoto.blip_highlights || [],
          deep_prompts: savedPhoto.deep_prompts || {},
          ai_categories: savedPhoto.ai_categories || [],
          approved: savedPhoto.approved,
          dateCreated: album.date_created,
          selected: false,
          albumId: album.id,
          albumName: album.name || album.id
        };
      });
      
      // Use the photo context to load these photos
      // We'll need to add a method to PhotoContext for this
      if (window.loadAlbumToMainInterface) {
        window.loadAlbumToMainInterface(convertedPhotos, album);
      } else {
        // Fallback: store in localStorage and reload page
        localStorage.setItem('loadAlbumData', JSON.stringify({
          photos: convertedPhotos,
          album: {
            name: album.name || album.id,
            eventType: album.event_type,
            id: album.id
          }
        }));
        
        // Reload the page to trigger loading
        window.location.reload();
      }
      
      showToast(`Album "${album.name || album.id}" loaded for editing!`, 'success');
    } catch (error: any) {
      console.error('Failed to load album to main interface:', error);
      showToast('Failed to load album for editing', 'error');
    }
  };

  const getPhotoUrl = (filename: string, albumDir: string) => {
    return `${API_URL}/album-photo?album_dir=${encodeURIComponent(albumDir)}&filename=${encodeURIComponent(filename)}`;
  };

  // Handle back from detail view
  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setViewMode('list');
  };

  // Render album list/grid
  const renderAlbumGrid = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading your albums...</p>
          </div>
        </div>
      );
    }

    if (albums.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Albums Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by uploading and analyzing photos, then save your first album!
          </p>
          {/* <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700 text-white rounded-lg 
                     flex items-center space-x-2 mx-auto transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Album</span>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            (Albums are saved automatically after analysis in the main app)
          </p> */}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => ( // Pass userId to AlbumCard
          <AlbumCard 
            key={album.id} 
            album={album} 
            userId={user!.email} 
            onViewDetail={handleViewAlbumDetail}
            onLoadToMainInterface={handleLoadToMainInterface}
          />
        ))} 
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                            flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" /> {/* Icon for My Ailbums */}
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                             bg-clip-text text-transparent">
                  My Ailbums
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {viewMode === 'list' ? `${albums.length} saved albums` : 
                   viewMode === 'detail' ? 'Album Details' : 'Album Review'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
          {viewMode === 'detail' && selectedAlbum ? (
            <AlbumDetailView 
              album={selectedAlbum} 
              userId={user!.email} 
              onBack={handleBackToAlbums}
              onOpenReview={() => setViewMode('review')}
            />
          ) : viewMode === 'review' && selectedAlbum ? (
            <AlbumReviewInterface 
              album={selectedAlbum} 
              userId={user!.email} 
              onBack={handleBackToAlbums}
            />
          ) : (
            renderAlbumGrid()
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAilbumsModal;