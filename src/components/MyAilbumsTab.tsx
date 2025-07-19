import React, { useState, useEffect } from 'react';
import { Folder, Calendar, Camera, Users, Star, Eye, Download, Trash2, Edit, Play, ArrowRight } from 'lucide-react';
import { SavedAlbum, EventType } from '../types';
import { getUserAlbums, loadAlbumFromBackend } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePhoto } from '../context/PhotoContext';

const MyAilbumsTab: React.FC = () => {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<SavedAlbum | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setWorkflowStage, uploadPhotos } = usePhoto();

  useEffect(() => {
    loadUserAlbums();
  }, [user]);

  const loadUserAlbums = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userAlbums = await getUserAlbums(user.id);
      setAlbums(userAlbums.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()));
    } catch (error: any) {
      console.error('Failed to load albums:', error);
      showToast('Failed to load albums', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeLabel = (eventType: EventType) => {
    const labels = {
      wedding: 'Wedding',
      baptism: 'Baptism',
      portrait: 'Portrait',
      family: 'Family',
      corporate: 'Corporate',
      event: 'General Event',
      landscape: 'Landscape'
    };
    return labels[eventType] || eventType;
  };

  const getEventTypeIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'wedding':
        return '💒';
      case 'baptism':
        return '⛪';
      case 'portrait':
        return '👤';
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'corporate':
        return '🏢';
      case 'landscape':
        return '🏔️';
      default:
        return '📸';
    }
  };

  const handleOpenAlbum = async (album: SavedAlbum) => {
    try {
      setIsLoading(true);
      const fullAlbum = await loadAlbumFromBackend(album.id, user!.id);
      
      // Here you would reconstruct the photos from the album data
      // For now, we'll show the album details modal
      setSelectedAlbum(fullAlbum);
      setShowAlbumModal(true);
      
      showToast(`Album "${album.album_title}" loaded successfully`, 'success');
    } catch (error: any) {
      console.error('Failed to load album:', error);
      showToast('Failed to load album details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderAlbumCard = (album: SavedAlbum) => (
    <div
      key={album.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 
               overflow-hidden hover:shadow-lg transition-all duration-200 group"
    >
      {/* Album Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getEventTypeIcon(album.event_type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]" 
                  title={album.album_title}>
                {album.album_title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(album.created_date)}</span>
                <span>•</span>
                <span>{getEventTypeLabel(album.event_type)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleOpenAlbum(album)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                       rounded-lg transition-colors duration-200"
              title="Open Album"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 
                       rounded-lg transition-colors duration-200"
              title="Edit Album"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Album Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <Star className="h-4 w-4" />
            <span>{album.approved_count} approved</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Camera className="h-4 w-4" />
            <span>{album.total_count} total</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {Math.round((album.approved_count / album.total_count) * 100)}% kept
          </div>
        </div>
      </div>

      {/* Thumbnails Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {album.thumbnails.slice(0, 8).map((thumbnail, index) => (
            <div key={index} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={`data:image/jpeg;base64,${thumbnail}`}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
          {album.thumbnails.length > 8 && (
            <div className="aspect-square rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                +{album.thumbnails.length - 8}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenAlbum(album)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                     flex items-center justify-center space-x-2 transition-colors duration-200 text-sm"
          >
            <Play className="h-4 w-4" />
            <span>Open Album</span>
          </button>
          <button
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md 
                     transition-colors duration-200 text-sm"
            title="Download Album"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAlbumModal = () => {
    if (!selectedAlbum) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getEventTypeIcon(selectedAlbum.event_type)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedAlbum.album_title}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedAlbum.created_date)}</span>
                    <span>•</span>
                    <span>{getEventTypeLabel(selectedAlbum.event_type)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Album Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {selectedAlbum.approved_count}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Approved</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedAlbum.total_count}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Photos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(selectedAlbum.highlights).length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">With Highlights</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {Math.round((selectedAlbum.approved_count / selectedAlbum.total_count) * 100)}%
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Keep Rate</div>
              </div>
            </div>

            {/* Thumbnails Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {selectedAlbum.thumbnails.map((thumbnail, index) => (
                <div key={index} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={`data:image/jpeg;base64,${thumbnail}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Album saved on {formatDate(selectedAlbum.created_date)}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAlbumModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 
                           dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                           flex items-center space-x-2 transition-colors duration-200"
                >
                  <Play className="h-4 w-4" />
                  <span>Continue Editing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading your albums...</p>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Folder className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Albums Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Start by uploading photos and completing the culling process. 
          Your saved albums will appear here for easy access and continued editing.
        </p>
        <button
          onClick={() => setWorkflowStage('upload')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                   flex items-center space-x-2 mx-auto transition-colors duration-200"
        >
          <Camera className="h-5 w-5" />
          <span>Create Your First Album</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Ailbums
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {albums.length} saved album{albums.length !== 1 ? 's' : ''} • 
            {albums.reduce((sum, album) => sum + album.total_count, 0)} total photos
          </p>
        </div>
        
        <button
          onClick={() => setWorkflowStage('upload')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                   flex items-center space-x-2 transition-colors duration-200"
        >
          <Camera className="h-5 w-5" />
          <span>New Album</span>
        </button>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(album => renderAlbumCard(album))}
      </div>

      {/* Album Detail Modal */}
      {showAlbumModal && renderAlbumModal()}
    </div>
  );
};

export default MyAilbumsTab;