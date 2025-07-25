import React, { useState } from 'react';
import { Camera, Calendar, Tag, Star, Eye, MessageSquare, Users, Flag, Sparkles } from 'lucide-react';
import { SavedAlbum, SavedPhoto } from './MyAilbumsModal'; // Import interfaces
import { EventType } from '../types'; // Import EventType

// API URL configuration
export const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://36f5ddfd52c2.ngrok-free.app";

interface AlbumCardProps {
  album: SavedAlbum;
  userId: string;
  onViewDetail: (album: SavedAlbum) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, userId, onViewDetail }) => {
  const [hoveredPhoto, setHoveredPhoto] = useState<SavedPhoto | null>(null);


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

  const getPhotoUrl = (filename: string) => {
    // Use exact album_dir from backend response
    if (!album.album_dir) {
      console.error('Album missing album_dir:', album);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1pc3NpbmcgRGlyZWN0b3J5PC90ZXh0Pjwvc3ZnPg==';
    }
    
    // Clean album_dir: remove albums/ or ./albums/ prefix, then normalize Windows paths
    const cleanedAlbumDir = album.album_dir
      .replace(/^(\.\/)?albums[\\/]/, '') // Remove albums/ or ./albums/ prefix
      .replace(/\\/g, '/'); // Normalize Windows paths to forward slashes
    
    // Create photo URL using cleaned album_dir (without albums/ prefix)
    return `${API_URL}/album-photo?album_dir=${encodeURIComponent(cleanedAlbumDir)}&filename=${encodeURIComponent(filename)}`;
  };

  const getUniqueTags = (photos: SavedPhoto[]) => {
    const allTags = new Set<string>();
    photos.forEach(photo => {
      photo.tags?.forEach(tag => allTags.add(tag));
      photo.blip_highlights?.forEach(tag => allTags.add(tag));
      photo.blip_flags?.forEach(tag => allTags.add(tag));
      photo.ai_categories?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).slice(0, 5); // Limit to 5 unique tags for display
  };

  const uniqueTags = getUniqueTags(album.results);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 
                 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200
                 transform hover:scale-105 cursor-pointer"
      onClick={() => onViewDetail(album)}
    >
      {/* Cover Photo / Thumbnails */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {album.photos.length > 0 ? (
          <div className="w-full h-full relative">
            {/* Main cover photo */}
            <img
              src={getPhotoUrl(album.photos[0])}
              alt={album.photos[0]}
              className="w-full h-full object-cover transition-opacity duration-200"
              loading="lazy"
              onError={(e) => {
                console.warn('Failed to load cover image:', getPhotoUrl(album.photos[0]));
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                e.currentTarget.style.opacity = '0.7';
              }}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            />
            
            {/* Photo count overlay */}
            {album.photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded-full">
                +{album.photos.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Alternative grid view for multiple photos */}
        {false && album.photos.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-full">
            {album.photos.slice(0, 4).map((filename, index) => {
              const photoData = album.results.find(r => r.filename === filename);
              return (
                <div
                  key={index}
                  className="relative w-full h-full overflow-hidden"
                  onMouseEnter={() => setHoveredPhoto(photoData || null)}
                  onMouseLeave={() => setHoveredPhoto(null)}
                >
                  <img
                    src={getPhotoUrl(filename)}
                    alt={filename}
                    className="w-full h-full object-cover transition-opacity duration-200"
                    onError={(e) => {
                      console.warn('Failed to load image:', getPhotoUrl(filename));
                      // Set a placeholder image
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                  {hoveredPhoto && hoveredPhoto.filename === filename && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-white text-xs opacity-100 transition-opacity duration-200">
                      <p className="font-medium truncate w-full text-center">{hoveredPhoto.filename}</p>
                      {hoveredPhoto.ai_score !== undefined && (
                        <p className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{(hoveredPhoto.ai_score / 2).toFixed(1)}</span>
                        </p>
                      )}
                      {hoveredPhoto.caption && (
                        <p className="mt-1 text-center line-clamp-2">{hoveredPhoto.caption}</p>
                      )}
                      {hoveredPhoto.tags && hoveredPhoto.tags.length > 0 && (
                        <div className="flex flex-wrap justify-center mt-1">
                          {hoveredPhoto.tags.slice(0, 2).map((tag, tagIdx) => (
                            <span key={tagIdx} className="bg-gray-700 px-1 py-0.5 rounded-full text-xs mr-1 mb-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
            {album.results.filter(p => p.approved).length}/{album.photos.length} approved
          </span>
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {album.name || album.id}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{new Date(album.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Album Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {album.photos.length} photos
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {album.results.filter(p => p.ai_score && p.ai_score >= 7).length} high score
            </span>
          </div>
        </div>

        {/* Tags/Highlights */}
        {uniqueTags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1">
              <Tag className="h-4 w-4 text-gray-500" />
              <span>Key Tags:</span>
            </h4>
            <div className="flex flex-wrap gap-1">
              {uniqueTags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetail(album)}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                     rounded-lg flex items-center justify-center space-x-1 
                     transition-colors duration-200 text-sm"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default AlbumCard;