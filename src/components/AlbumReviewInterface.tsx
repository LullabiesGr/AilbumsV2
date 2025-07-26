import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Eye, Download, Trash2, Check, X, Grid, List, Minimize2, 
         Filter, Search, Users, Copy, Sparkles, Flag, AlertCircle, EyeOff, Heart } from 'lucide-react';
import { SavedAlbum, SavedPhoto } from './MyAilbumsModal';
import { Photo, Face } from '../types';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import { useToast } from '../context/ToastContext';

// API URL configuration
export const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://1a2a91471606.ngrok-free.app";

interface AlbumReviewInterfaceProps {
  album: SavedAlbum;
  userId: string;
  onBack: () => void;
}

type ViewMode = 'grid' | 'list' | 'compact';
type FilterMode = 'all' | 'approved' | 'high-score' | 'flagged' | 'highlights' | 'faces';

const AlbumReviewInterface: React.FC<AlbumReviewInterfaceProps> = ({ album, userId, onBack }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const { showToast } = useToast();

  // Convert SavedPhoto to Photo format for compatibility with existing components
  useEffect(() => {
    const convertedPhotos: Photo[] = album.results.map((savedPhoto, index) => {
      const photoUrl = getPhotoUrl(savedPhoto.filename);
      
      return {
        id: `${album.id}-${index}`,
        filename: savedPhoto.filename,
        file: new File([], savedPhoto.filename), // Dummy file object
        url: photoUrl,
        score: savedPhoto.ai_score,
        basic_score: savedPhoto.basic_score,
        ml_score: savedPhoto.ml_score,
        ai_score: savedPhoto.ai_score,
        score_type: savedPhoto.score_type || 'ai',
        blur_score: savedPhoto.blur_score,
        tags: savedPhoto.tags || [],
        faces: savedPhoto.faces || [],
        face_summary: savedPhoto.face_summary,
        caption: savedPhoto.caption,
        event_type: album.event_type,
        blip_flags: savedPhoto.blip_flags || [],
        blip_highlights: savedPhoto.blip_highlights || [],
        ai_categories: savedPhoto.ai_categories || [],
        approved: savedPhoto.approved,
        color_label: savedPhoto.color_label,
        dateCreated: album.date_created,
        selected: selectedPhotos.has(`${album.id}-${index}`)
      };
    });
    
    setPhotos(convertedPhotos);
  }, [album, selectedPhotos]);

  const getPhotoUrl = (filename: string) => {
    if (!album.album_dir) {
      console.error('Album missing album_dir:', album);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1pc3NpbmcgRGlyZWN0b3J5PC90ZXh0Pjwvc3ZnPg==';
    }
    
    // Clean album_dir: remove albums/ or ./albums/ prefix, then normalize Windows paths
    const cleanedAlbumDir = album.album_dir
      .replace(/^(\.\/)?albums[\\/]/, '') // Remove albums/ or ./albums/ prefix
      .replace(/\\/g, '/'); // Normalize Windows paths to forward slashes
    
    // Create photo URL using cleaned album_dir (without albums/ prefix)
    return `${API_URL}/album-photo?album_dir=${encodeURIComponent(cleanedAlbumDir)}&filename=${encodeURIComponent(filename)}`;
  };

  const getEventTypeIcon = (type: string) => {
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

  // Filter photos based on current filter mode and search term
  const filteredPhotos = photos.filter(photo => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesFilename = photo.filename.toLowerCase().includes(searchLower);
      const matchesCaption = photo.caption?.toLowerCase().includes(searchLower);
      const matchesTags = photo.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesHighlights = photo.blip_highlights?.some(h => h.toLowerCase().includes(searchLower));
      
      if (!matchesFilename && !matchesCaption && !matchesTags && !matchesHighlights) {
        return false;
      }
    }

    // Apply filter mode
    switch (filterMode) {
      case 'approved':
        return photo.approved === true;
      case 'high-score':
        return photo.ai_score >= 7;
      case 'flagged':
        return photo.blip_flags && photo.blip_flags.length > 0;
      case 'highlights':
        return photo.blip_highlights && photo.blip_highlights.length > 0;
      case 'faces':
        return photo.faces && photo.faces.length > 0;
      case 'all':
      default:
        return true;
    }
  });

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowImageModal(true);
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)));
    }
  };

  const handleDownloadSelected = () => {
    if (selectedPhotos.size === 0) {
      showToast('Please select photos to download', 'warning');
      return;
    }
    
    showToast(`Downloading ${selectedPhotos.size} photos...`, 'info');
    
    // Download each selected photo
    selectedPhotos.forEach(photoId => {
      const photo = photos.find(p => p.id === photoId);
      if (photo) {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = photo.filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const getFilterCount = (filter: FilterMode) => {
    switch (filter) {
      case 'approved':
        return photos.filter(p => p.approved === true).length;
      case 'high-score':
        return photos.filter(p => p.ai_score >= 7).length;
      case 'flagged':
        return photos.filter(p => p.blip_flags && p.blip_flags.length > 0).length;
      case 'highlights':
        return photos.filter(p => p.blip_highlights && p.blip_highlights.length > 0).length;
      case 'faces':
        return photos.filter(p => p.faces && p.faces.length > 0).length;
      case 'all':
      default:
        return photos.length;
    }
  };

  const renderPhotoGrid = () => {
    const getGalleryClassName = () => {
      switch (viewMode) {
        case 'grid':
          return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
        case 'list':
          return 'flex flex-col gap-3';
        case 'compact':
          return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2';
        default:
          return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
      }
    };

    if (filteredPhotos.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Photos Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No photos match the current filter'}
          </p>
        </div>
      );
    }

    return (
      <div className={getGalleryClassName()}>
        {filteredPhotos.map((photo) => (
          <AlbumPhotoCard
            key={photo.id}
            photo={photo}
            viewMode={viewMode}
            isSelected={selectedPhotos.has(photo.id)}
            onSelect={() => handlePhotoSelect(photo.id)}
            onClick={() => handlePhotoClick(photo)}
          />
        ))}
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
            {getEventTypeIcon(album.event_type)} {album.event_type} • Review Mode
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedPhotos.size} selected
          </span>
          {selectedPhotos.size > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filter Dropdown */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Photos ({getFilterCount('all')})</option>
            <option value="approved">Approved ({getFilterCount('approved')})</option>
            <option value="high-score">High Score ({getFilterCount('high-score')})</option>
            <option value="highlights">Highlights ({getFilterCount('highlights')})</option>
            <option value="flagged">Flagged ({getFilterCount('flagged')})</option>
            <option value="faces">With Faces ({getFilterCount('faces')})</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                       dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent w-64"
            />
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-md flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                     transition-colors duration-200 text-sm"
          >
            {selectedPhotos.size === filteredPhotos.length ? (
              <Check className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4 border border-gray-400 rounded" />
            )}
            <span>{selectedPhotos.size === filteredPhotos.length ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            {[
              { value: 'grid', icon: Grid },
              { value: 'list', icon: List },
              { value: 'compact', icon: Minimize2 }
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as ViewMode)}
                className={`flex items-center px-3 py-2 ${
                  viewMode === value 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={value.charAt(0).toUpperCase() + value.slice(1)}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <span className="text-sm font-medium py-2 px-3 bg-gray-200 dark:bg-gray-800 rounded-md">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {renderPhotoGrid()}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedPhoto && (
        <ImageModal 
          photo={selectedPhoto} 
          onClose={() => setShowImageModal(false)} 
        />
      )}
    </div>
  );
};

// Simplified photo card component for album review
interface AlbumPhotoCardProps {
  photo: Photo;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

const AlbumPhotoCard: React.FC<AlbumPhotoCardProps> = ({ 
  photo, 
  viewMode, 
  isSelected, 
  onSelect, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'blurry':
        return <AlertCircle className="h-3 w-3 text-red-500" title="Blurry" />;
      case 'smiling':
        return <Heart className="h-3 w-3 text-green-500" title="Smiling" />;
      case 'closed_eyes':
        return <EyeOff className="h-3 w-3 text-amber-500" title="Eyes Closed" />;
      case 'multiple_faces':
        return <Users className="h-3 w-3 text-blue-500" title="Multiple Faces" />;
      default:
        return null;
    }
  };

  const cleanTagLabel = (tag: string) => {
    return tag
      .replace(/_/g, ' ')
      .replace('_in_photo', '')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  if (viewMode === 'compact') {
    return (
      <div
        className="relative bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden 
                 transition-all duration-200 hover:shadow-md group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div className="absolute top-1 left-1 z-10">
          <button
            className={`p-1 rounded transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 text-white hover:bg-black/75'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
        
        <div className="aspect-square relative overflow-hidden">
          <img
            src={photo.url}
            alt={photo.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
          <div className="flex justify-between items-center">
            <span className="text-white text-xs truncate">{photo.filename}</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-white text-xs">{(photo.ai_score / 2).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
                 transition-all duration-200 hover:shadow-lg flex cursor-pointer"
        onClick={onClick}
      >
        <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden">
          <button
            className={`absolute top-1 left-1 z-10 p-1 rounded transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 text-white hover:bg-black/75'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Check className="h-3 w-3" />
          </button>
          
          <img
            src={photo.url}
            alt={photo.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="truncate text-sm font-medium" title={photo.filename}>{photo.filename}</p>
            {photo.caption && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1" title={photo.caption}>
                {photo.caption}
              </p>
            )}
            <div className="mt-1 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-xs">{(photo.ai_score / 2).toFixed(1)}</span>
              </div>
              {photo.approved && (
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  Approved
                </span>
              )}
              {photo.faces && photo.faces.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {photo.faces.length} faces
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-200 
               hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <div className="absolute top-2 left-2 z-10">
          <button
            className={`p-1.5 rounded-full transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 text-white hover:bg-black/75'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
        
        <img
          src={photo.url}
          alt={photo.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm flex flex-col items-center gap-1">
            {photo.blip_highlights && photo.blip_highlights.length > 0 && (
              <div className="p-1 bg-yellow-500 rounded-full" title={`Highlights: ${photo.blip_highlights.join(', ')}`}>
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            {photo.blip_flags && photo.blip_flags.length > 0 && (
              <div className="p-1 bg-red-500 rounded-full" title={`Issues: ${photo.blip_flags.join(', ')}`}>
                <Flag className="h-3 w-3 text-white" />
              </div>
            )}
            {photo.approved && (
              <div className="p-1 bg-green-500 rounded-full" title="Approved">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="truncate text-sm font-medium" title={photo.filename}>{photo.filename}</p>
        
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">{(photo.ai_score / 2).toFixed(1)}</span>
          </div>
          
          {photo.faces && photo.faces.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{photo.faces.length}</span>
            </div>
          )}
        </div>
        
        {photo.caption && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2" title={photo.caption}>
            {photo.caption}
          </p>
        )}
        
        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag, index) => {
              const icon = getTagIcon(tag);
              return (
                <span 
                  key={index} 
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                           text-xs rounded flex items-center gap-1"
                >
                  {icon}
                  <span>{cleanTagLabel(tag)}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumReviewInterface;