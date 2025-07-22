import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Calendar, Camera, Star, Eye, Download, Trash2, Edit3, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Photo, Album as AlbumType, EventType } from '../types';
import { loadUserAlbums } from '../lib/api';

interface SavedAlbum {
  id: string;
  title: string;
  event_type: EventType;
  date_created: string;
  date_updated: string;
  total_photos: number;
  approved_photos: number;
  cover_photo_url?: string;
  photos: SavedPhoto[];
  metadata: {
    user_id: string;
    culling_mode: string;
    analysis_complete: boolean;
  };
}

interface SavedPhoto {
  filename: string;
  path: string; // Local path instead of URL
  ai_score: number;
  approved: boolean;
  color_label?: string;
  tags: string[];
  blip_highlights: string[];
  blip_flags: string[];
  faces?: any[];
  caption?: string;
  edited_versions?: {
    autocorrect?: boolean;
    autofix?: boolean;
    face_retouch?: boolean;
    ai_edit?: boolean;
  };
}

interface MyAilbumsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = 'https://a7b0ec6a0aa5.ngrok-free.app';

const MyAilbumsModal: React.FC<MyAilbumsModalProps> = ({ isOpen, onClose }) => {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<SavedAlbum | null>(null);
  const [showAlbumDetail, setShowAlbumDetail] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load albums from backend
  const loadAlbums = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Loading albums for user:', user.id);
      const albumsData = await loadUserAlbums(user.id);
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

  // Load albums when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadAlbums();
    }
  }, [isOpen, user]);
  
  // Refresh albums when modal opens (to show newly created albums)
  useEffect(() => {
    if (isOpen && user) {
      // Small delay to ensure any pending saves are complete
      const timer = setTimeout(() => {
        loadAlbums();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Refresh albums when modal opens (to show newly created albums)
  useEffect(() => {
    if (isOpen && user) {
      // Small delay to ensure any pending saves are complete
      const timer = setTimeout(() => {
        loadAlbums();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Delete album
  const handleDeleteAlbum = async (albumId: string) => {
    if (!window.confirm('Are you sure you want to delete this album?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to delete album');
      }

      setAlbums(prev => prev.filter(album => album.id !== albumId));
      showToast('Album deleted successfully', 'success');
    } catch (error: any) {
      console.error('Failed to delete album:', error);
      showToast(error.message || 'Failed to delete album', 'error');
    }
  };

  // Get event type label
  const getEventTypeLabel = (type: EventType) => {
    const eventLabels = {
      wedding: 'Wedding',
      baptism: 'Baptism',
      portrait: 'Portrait',
      family: 'Family',
      corporate: 'Corporate',
      event: 'General Event',
      landscape: 'Landscape'
    };
    return eventLabels[type] || type;
  };

  // Get event type icon
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'wedding': return '💒';
      case 'baptism': return '⛪';
      case 'portrait': return '👤';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'corporate': return '🏢';
      case 'landscape': return '🏞️';
      default: return '📸';
    }
  };

  // Render album grid
  const renderAlbumGrid = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by uploading and analyzing photos, then save your first album!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700 text-white rounded-lg 
                     flex items-center space-x-2 mx-auto transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Album</span>
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 
                     dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200
                     transform hover:scale-105"
          >
            {/* Cover Photo */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              {album.photos.length > 0 ? (
                <img
                  src={`${API_URL}/photo/?photo_path=${encodeURIComponent(album.photos[0].path)}`}
                  alt={album.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if path doesn't work
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Event Type Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-black/75 text-white text-sm rounded-full 
                               font-medium flex items-center space-x-1">
                  <span>{getEventTypeIcon(album.event_type)}</span>
                  <span>{getEventTypeLabel(album.event_type)}</span>
                </span>
              </div>
              
              {/* Stats Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-green-500/90 text-white text-xs rounded-full font-medium">
                  {album.approved_photos}/{album.total_photos} approved
                </span>
              </div>
            </div>

            {/* Album Info */}
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {album.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(album.date_created).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Photo Thumbnails */}
              {album.photos.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-4 gap-1">
                    {album.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img
                          src={`${API_URL}/photo/?photo_path=${encodeURIComponent(photo.path)}`}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {album.photos.length > 4 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      +{album.photos.length - 4} more photos
                    </p>
                  )}
                </div>
              )}

              {/* Album Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {album.total_photos} photos
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {album.approved_photos} approved
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedAlbum(album);
                    setShowAlbumDetail(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg flex items-center justify-center space-x-1 
                           transition-colors duration-200 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                           transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render album detail view
  const renderAlbumDetail = () => {
    if (!selectedAlbum) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAlbumDetail(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                     text-white rounded-lg transition-colors duration-200"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to Albums</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedAlbum.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getEventTypeIcon(selectedAlbum.event_type)} {getEventTypeLabel(selectedAlbum.event_type)} • {new Date(selectedAlbum.date_created).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              <Download className="h-4 w-4" />
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Album Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {selectedAlbum.total_photos}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Photos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {selectedAlbum.approved_photos}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {selectedAlbum.photos.filter(p => p.blip_highlights.length > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Highlights</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(selectedAlbum.photos.reduce((sum, p) => sum + p.ai_score, 0) / selectedAlbum.photos.length / 2).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Album Photos ({selectedAlbum.photos.length})
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedAlbum.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={`${API_URL}/photo/?photo_path=${encodeURIComponent(photo.path)}`}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                
                {/* Photo Info Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                              transition-opacity duration-200 rounded-lg flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1">
                      {photo.blip_highlights.map((highlight, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    {photo.approved && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-white">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs">{(photo.ai_score / 2).toFixed(1)}</span>
                    </div>
                    <p className="text-xs truncate">{photo.filename}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                            flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                             bg-clip-text text-transparent">
                  My Ailbums
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {showAlbumDetail ? 'Album Details' : `${albums.length} saved albums`}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showAlbumDetail ? renderAlbumDetail() : renderAlbumGrid()}
        </div>
      </div>
    </div>
  );
};

export default MyAilbumsModal;