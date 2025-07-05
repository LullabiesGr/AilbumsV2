import React from 'react';
import { usePhoto } from '../context/PhotoContext';
import { Filter, ChevronRight, Star, AlertCircle, Eye, Copy, AlertTriangle, Circle, ChevronDown, Sparkles, Flag } from 'lucide-react';
import StarRating from './StarRating';
import { colorLabelConfigs } from './ColorLabelIndicator';
import { ColorLabel } from '../types';

const Sidebar = () => {
  const { photos, filterOption, setFilterOption, selectedPhotos, starRatingFilter, setStarRatingFilter } = usePhoto();
  const [isStarFilterOpen, setIsStarFilterOpen] = React.useState(false);

  const filterStats = {
    all: photos.length,
    selected: selectedPhotos.length,
    'high-score': photos.filter(p => p.ai_score > 8).length,
    highlights: photos.filter(p => p.blip_highlights && p.blip_highlights.length > 0).length,
    flagged: photos.filter(p => p.blip_flags && p.blip_flags.length > 0).length,
    blurry: photos.filter(p => p.tags?.includes('blurry')).length,
    'eyes-closed': photos.filter(p => p.tags?.includes('closed_eyes')).length,
    duplicates: photos.filter(p => p.tags?.includes('duplicate')).length,
    warnings: photos.filter(p => p.tags?.some(tag => ['blurry', 'closed_eyes', 'duplicate'].includes(tag))).length,
    green: photos.filter(p => p.color_label === 'green').length,
    red: photos.filter(p => p.color_label === 'red').length,
    yellow: photos.filter(p => p.color_label === 'yellow').length,
    blue: photos.filter(p => p.color_label === 'blue').length,
    purple: photos.filter(p => p.color_label === 'purple').length,
  };

  const filterButtons = [
    { id: 'all' as const, label: 'All Photos', icon: Filter },
    { id: 'selected' as const, label: 'Selected', icon: ChevronRight },
    { id: 'high-score' as const, label: 'Highlights', icon: Star },
    { id: 'highlights' as const, label: 'Event Highlights', icon: Sparkles },
    { id: 'flagged' as const, label: 'Flagged Issues', icon: Flag },
    { id: 'blurry' as const, label: 'Blurred', icon: AlertCircle },
    { id: 'eyes-closed' as const, label: 'Closed Eyes', icon: Eye },
    { id: 'duplicates' as const, label: 'Duplicates', icon: Copy },
    { id: 'warnings' as const, label: 'Warnings', icon: AlertTriangle },
  ];

  const colorLabelButtons = Object.entries(colorLabelConfigs).map(([color, config]) => ({
    id: color as ColorLabel,
    label: config.label,
    icon: Circle,
    color: config.bgColor
  }));

  // Get unique faces from all photos
  const faces = photos.flatMap(photo => 
    photo.faces?.map(face => ({
      photoId: photo.id,
      photoUrl: photo.url,
      face
    })) || []
  ).slice(0, 6); // Limit to 6 faces

  // Get duplicate sets
  const duplicates = photos
    .filter(photo => photo.tags?.includes('duplicate'))
    .slice(0, 3); // Limit to 3 examples

  // Star filter functions
  const getPhotoCountForStars = (minStars: number, maxStars?: number) => {
    return photos.filter(photo => {
      if (photo.ai_score === 0) return false;
      const stars = photo.ai_score / 2;
      if (maxStars !== undefined) {
        return stars >= minStars && stars <= maxStars;
      }
      return stars >= minStars;
    }).length;
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => {
          let fillClass = 'text-gray-300';
          let fillOpacity = 'none';
          
          if (index < fullStars) {
            fillClass = 'text-yellow-400';
            fillOpacity = 'currentColor';
          } else if (index === fullStars && hasHalfStar) {
            fillClass = 'text-yellow-400';
            fillOpacity = 'currentColor';
          }
          
          return (
            <div key={index} className="relative">
              <Star
                className={`${sizeClass} ${fillClass}`}
                fill={fillOpacity}
              />
              {index === fullStars && hasHalfStar && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    className={`${sizeClass} text-yellow-400`}
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getCurrentFilterLabel = () => {
    if (!starRatingFilter.min && !starRatingFilter.max) {
      return 'All Ratings';
    }
    
    if (starRatingFilter.min && starRatingFilter.max) {
      if (starRatingFilter.min === starRatingFilter.max) {
        return `${starRatingFilter.min} Star${starRatingFilter.min !== 1 ? 's' : ''}`;
      }
      return `${starRatingFilter.min}-${starRatingFilter.max} Stars`;
    }
    
    if (starRatingFilter.min) {
      return `${starRatingFilter.min}+ Stars`;
    }
    
    if (starRatingFilter.max) {
      return `Up to ${starRatingFilter.max} Stars`;
    }
    
    return 'All Ratings';
  };

  const handleStarFilterChange = (minStars: number | null, maxStars: number | null) => {
    setStarRatingFilter(minStars, maxStars);
    setIsStarFilterOpen(false);
  };

  const starFilterOptions = [
    { label: 'All Ratings', min: null, max: null, count: photos.filter(p => p.ai_score > 0).length },
    { label: '5 Stars', min: 5, max: 5, count: getPhotoCountForStars(4.5, 5) },
    { label: '4+ Stars', min: 4, max: null, count: getPhotoCountForStars(4) },
    { label: '4 Stars', min: 4, max: 4, count: getPhotoCountForStars(3.5, 4.5) },
    { label: '3+ Stars', min: 3, max: null, count: getPhotoCountForStars(3) },
    { label: '3 Stars', min: 3, max: 3, count: getPhotoCountForStars(2.5, 3.5) },
    { label: '2+ Stars', min: 2, max: null, count: getPhotoCountForStars(2) },
    { label: '2 Stars', min: 2, max: 2, count: getPhotoCountForStars(1.5, 2.5) },
    { label: '1+ Stars', min: 1, max: null, count: getPhotoCountForStars(1) },
    { label: '1 Star', min: 1, max: 1, count: getPhotoCountForStars(0.5, 1.5) },
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-3">Quick Stats</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Total Photos</span>
            <span className="font-medium">{photos.length}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Selected</span>
            <span className="font-medium">{selectedPhotos.length}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Highlights</span>
           <span className="font-medium">{filterStats['high-score']}</span>
          </div>
          {(starRatingFilter.min !== null || starRatingFilter.max !== null) && (
            <div className="flex justify-between text-gray-300">
              <span>Star Filter</span>
              <span className="font-medium">
                {starRatingFilter.min && starRatingFilter.max && starRatingFilter.min === starRatingFilter.max
                  ? `${starRatingFilter.min} Star${starRatingFilter.min !== 1 ? 's' : ''}`
                  : starRatingFilter.min && starRatingFilter.max
                  ? `${starRatingFilter.min}-${starRatingFilter.max} Stars`
                  : starRatingFilter.min
                  ? `${starRatingFilter.min}+ Stars`
                  : starRatingFilter.max
                  ? `≤${starRatingFilter.max} Stars`
                  : 'All'
                }
              </span>
            </div>
          )}
         <div className="flex justify-between text-gray-300">
           <span>Avg AI Score</span>
           <span className="font-medium">
             {photos.length > 0 
               ? (photos.reduce((sum, p) => sum + (p.ai_score || 0), 0) / photos.length).toFixed(1)
               : '0.0'
             }
           </span>
         </div>
          <div className="flex justify-between text-gray-300">
            <span>Warnings</span>
            <span className="font-medium text-amber-500">{filterStats.warnings}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">Quick Filters</h2>
          <div className="space-y-2">
            {filterButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilterOption(id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm
                          transition-colors duration-200 ${
                  filterOption === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
                <span className="font-medium">{filterStats[id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">Star Rating Filter</h2>
          <div className="relative">
            <button 
              className="w-full px-3 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 
                       rounded-lg flex items-center justify-between transition-colors duration-200"
              onClick={() => setIsStarFilterOpen(!isStarFilterOpen)}
            >
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-200">{getCurrentFilterLabel()}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isStarFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isStarFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600
                            rounded-lg shadow-xl max-h-64 overflow-y-auto z-30">
                <div className="py-1">
                  {starFilterOptions.map((option, index) => {
                    const isActive = starRatingFilter.min === option.min && starRatingFilter.max === option.max;
                    
                    return (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-600
                                  transition-colors duration-200 ${
                          isActive ? 'bg-blue-600 text-white' : 'text-gray-200'
                        }`}
                        onClick={() => handleStarFilterChange(option.min, option.max)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {option.min ? (
                              <div className="flex items-center space-x-1">
                                {renderStarRating(option.min)}
                                {option.max && option.min !== option.max && (
                                  <>
                                    <span className="text-xs text-gray-400 mx-1">to</span>
                                    {renderStarRating(option.max)}
                                  </>
                                )}
                                {!option.max && option.min < 5 && (
                                  <span className="text-xs text-gray-400 ml-1">+</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">All</span>
                              </div>
                            )}
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">
                            {option.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">Color Labels</h2>
          <div className="space-y-2">
            {colorLabelButtons.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setFilterOption(id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm
                          transition-colors duration-200 ${
                  filterOption === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${color} rounded-full`} />
                  <span>{label}</span>
                </div>
                <span className="font-medium">{filterStats[id]}</span>
              </button>
            ))}
          </div>
        </div>

        {faces.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-3">Key Faces</h2>
            <div className="grid grid-cols-3 gap-2">
              {faces.map((face, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden relative cursor-pointer
                           hover:ring-2 ring-blue-500 transition-all duration-200"
                  style={{
                    backgroundImage: `url(${face.photoUrl})`,
                    backgroundPosition: `${face.face.x * 100}% ${face.face.y * 100}%`,
                    backgroundSize: `${100 / face.face.width}%`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-3">Duplicates</h2>
            <div className="space-y-2">
              {duplicates.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700
                           transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{photo.filename}</p>
                    <StarRating score={Math.round(photo.ai_score || 0)} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                   font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          Export {selectedPhotos.length > 0 ? selectedPhotos.length : 'All'} Photos
        </button>
      </div>
    </div>
  );
};

export default Sidebar;