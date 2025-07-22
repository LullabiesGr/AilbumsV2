import React, { useState } from 'react';
import { ArrowLeft, Tag, MessageSquare, Star, Users, Flag, Sparkles, Eye, EyeOff, Smile, Frown, Meh, AlertCircle, Glasses, Shield, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { SavedAlbum, SavedPhoto } from './MyAilbumsModal'; // Import interfaces
import { getAlbumFolder } from './MyAilbumsModal'; // Import helper
import { Photo, Face } from '../types'; // Import Photo and Face types for consistency

// API URL configuration
export const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://a7b0ec6a0aa5.ngrok-free.app";

interface AlbumDetailViewProps {
  album: SavedAlbum;
  userId: string;
  onBack: () => void;
}

const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ album, userId, onBack }) => {
  const albumFolder = getAlbumFolder(album.event_type, album.created_at);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const getPhotoUrl = (filename: string) => {
    // Create album directory path
    const albumDir = `albums/${userId}/${albumFolder}`;
    
    // Fix Windows paths: replace backslashes with forward slashes
    const normalizedAlbumDir = albumDir.replace(/\\/g, '/');
    
    // Create photo URL using album-photo endpoint
    return `${API_URL}/album-photo?album_dir=${encodeURIComponent(normalizedAlbumDir)}&filename=${encodeURIComponent(filename)}`;
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'blurry':
        return <AlertCircle className="h-3 w-3 text-red-500" title="Blurry" />;
      case 'smiling':
        return <Smile className="h-3 w-3 text-green-500" title="Smiling" />;
      case 'closed_eyes':
        return <EyeOff className="h-3 w-3 text-amber-500" title="Eyes Closed" />;
      case 'multiple_faces':
        return <Users className="h-3 w-3 text-blue-500" title="Multiple Faces" />;
      default:
        return null;
    }
  };

  const getHighlightIcon = (highlight: string) => {
    const lowerHighlight = highlight.toLowerCase();
    if (lowerHighlight.includes('bride')) {
      return <Sparkles className="h-3 w-3" />;
    }
    if (lowerHighlight.includes('groom')) {
      return <Sparkles className="h-3 w-3" />;
    }
    if (lowerHighlight.includes('baby') || lowerHighlight.includes('child')) {
      return <Sparkles className="h-3 w-3" />;
    }
    return <Sparkles className="h-3 w-3" />;
  };

  const cleanTagLabel = (tag: string) => {
    return tag
      .replace(/_/g, ' ')
      .replace('_in_photo', '')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
        return <Smile className="h-3 w-3 text-green-500" title="Happy" />;
      case 'sad':
        return <Frown className="h-3 w-3 text-blue-500" title="Sad" />;
      case 'angry':
        return <AlertCircle className="h-3 w-3 text-red-500" title="Angry" />;
      case 'surprise':
        return <Sparkles className="h-3 w-3 text-yellow-500" title="Surprised" />;
      case 'neutral':
        return <Meh className="h-3 w-3 text-gray-500" title="Neutral" />;
      default:
        return <Sparkles className="h-3 w-3 text-pink-500" title={emotion} />;
    }
  };

  const getHeadposeInfo = (headpose?: { yaw: number; pitch: number; roll: number }) => {
    if (!headpose) return null;
    const { yaw, pitch, roll } = headpose;
    if (Math.abs(yaw) <= 20 && Math.abs(pitch) <= 15) {
      return { type: 'frontal', label: 'Frontal', icon: <Users className="h-3 w-3 text-green-500" /> };
    } else if (Math.abs(yaw) > 45) {
      return { type: 'profile', label: 'Profile', icon: <RotateCcw className="h-3 w-3 text-yellow-500" /> };
    } else if (pitch > 20) {
      return { type: 'down', label: 'Looking Down', icon: <ArrowDown className="h-3 w-3 text-gray-500" /> };
    } else if (pitch < -20) {
      return { type: 'up', label: 'Looking Up', icon: <ArrowUp className="h-3 w-3 text-gray-500" /> };
    } else {
      return { type: 'angled', label: 'Angled', icon: <RotateCcw className="h-3 w-3 text-yellow-500" /> };
    }
  };

  const handlePhotoClick = (photo: SavedPhoto) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const renderPhotoModal = () => {
    if (!selectedPhoto) return null;
    const photoUrl = getPhotoUrl(selectedPhoto.filename);

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {selectedPhoto.filename}
            </h3>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <img src={photoUrl} alt={selectedPhoto.filename} className="w-full h-auto object-contain rounded-lg mb-4" />
            <img 
              src={photoUrl} 
              alt={selectedPhoto.filename} 
              className="w-full h-auto object-contain rounded-lg mb-4 transition-opacity duration-200" 
              onError={(e) => {
                console.warn('Failed to load image in modal:', photoUrl);
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                e.currentTarget.style.opacity = '0.7';
              }}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            />
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Caption:</strong> {selectedPhoto.caption || 'N/A'}</p>
              <p><strong>AI Score:</strong> {selectedPhoto.ai_score !== undefined ? (selectedPhoto.ai_score / 2).toFixed(1) : 'N/A'} / 5</p>
              <p><strong>Approved:</strong> {selectedPhoto.approved ? 'Yes' : 'No'}</p>
              
              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                        {cleanTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPhoto.blip_highlights && selectedPhoto.blip_highlights.length > 0 && (
                <div>
                  <strong>Highlights:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.blip_highlights.map((highlight, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                        {cleanTagLabel(highlight)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPhoto.blip_flags && selectedPhoto.blip_flags.length > 0 && (
                <div>
                  <strong>Flags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.blip_flags.map((flag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full text-xs">
                        {cleanTagLabel(flag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPhoto.faces && selectedPhoto.faces.length > 0 && (
                <div>
                  <strong>Faces ({selectedPhoto.faces.length}):</strong>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedPhoto.faces.map((face, idx) => (
                      <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs space-y-1">
                        <div className="flex items-center space-x-1">
                          {face.emotion && getEmotionIcon(face.emotion)}
                          <span>{face.emotion || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {face.age && <span>{Math.round(face.age)}y</span>}
                          {face.gender && <span className="capitalize">{face.gender}</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          {face.eyes_closed && <EyeOff className="h-3 w-3 text-red-400" />}
                          {face.glasses && <Glasses className="h-3 w-3 text-blue-400" />}
                          {face.mask && <Shield className="h-3 w-3 text-green-400" />}
                        </div>
                        {face.headpose && (
                          <div className="flex items-center space-x-1">
                            {getHeadposeInfo(face.headpose)?.icon}
                            <span>{getHeadposeInfo(face.headpose)?.label}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                   text-white rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Albums</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {album.name || album.id}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getEventTypeIcon(album.event_type)} {album.event_type} • {new Date(album.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Placeholder for future actions */}
        <div className="w-24"></div>
      </div>

      {/* Album Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {album.photos.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Photos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {album.results.filter(p => p.approved).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {album.results.filter(p => p.blip_highlights && p.blip_highlights.length > 0).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Highlights</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(album.results.reduce((sum, p) => sum + (p.ai_score || 0), 0) / album.results.length / 2).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Album Photos ({album.photos.length})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {album.results.map((photo, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={getPhotoUrl(photo.filename)}
                  alt={photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200"
                  onError={(e) => {
                    console.warn('Failed to load image in grid:', getPhotoUrl(photo.filename));
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                />
              </div>

              {/* Photo Info Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                            transition-opacity duration-200 rounded-lg flex flex-col justify-between p-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1">
                    {photo.blip_highlights && photo.blip_highlights.slice(0, 2).map((highlight, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                        {cleanTagLabel(highlight)}
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
                  {photo.caption && <p className="text-xs truncate opacity-80">{photo.caption}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showPhotoModal && renderPhotoModal()}
    </div>
  );
};

export default AlbumDetailView;