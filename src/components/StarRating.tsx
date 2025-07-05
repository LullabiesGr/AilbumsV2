import React from 'react';
import { Star } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';

interface StarRatingProps {
  score: number | null;
  className?: string;
  photoId?: string;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  score, 
  className = '', 
  photoId,
  readonly = true,
  size = 'md',
  showLabel = false
}) => {
  const { updatePhotoScore } = usePhoto();
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  if (score === null || score === 0) {
    // In edit mode, show empty stars for rating
    if (!readonly && photoId) {
      score = 0;
    } else {
      return null;
    }
  }

  // Convert 10-point scale to 5-star scale with half-star support
  const starScore = score / 2;
  const fullStars = Math.floor(starScore);
  const hasHalfStar = starScore % 1 >= 0.5;
  
  // For display purposes, use hover rating if available
  const displayRating = hoverRating !== null ? hoverRating : starScore;
  const displayFullStars = Math.floor(displayRating);
  const displayHasHalfStar = displayRating % 1 >= 0.5;

  const handleStarClick = (index: number) => {
    if (readonly || !photoId) return;
    
    // Calculate new score based on click position
    const newStarRating = index + 1;
    const newScore = newStarRating * 2; // Convert back to 10-point scale
    updatePhotoScore(photoId, newScore);
  };

  const handleStarHalfClick = (index: number) => {
    if (readonly || !photoId) return;
    
    // Half star click
    const newStarRating = index + 0.5;
    const newScore = newStarRating * 2; // Convert back to 10-point scale
    updatePhotoScore(photoId, newScore);
  };
  
  const handleMouseEnter = (rating: number) => {
    if (!readonly && photoId) {
      setHoverRating(rating);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly && photoId) {
      setHoverRating(null);
    }
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`flex items-center gap-0.5 ${!readonly && photoId ? 'cursor-pointer' : ''}`}
        title={`${displayRating.toFixed(1)} out of 5 stars`}
        role="img"
        aria-label={`${displayRating.toFixed(1)} out of 5 stars`}
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(5)].map((_, index) => {
          let fillClass = 'text-gray-300 dark:text-gray-600';
          let fillOpacity = 'none';
          
          if (index < displayFullStars) {
            fillClass = hoverRating !== null ? 'text-yellow-500' : 'text-yellow-400';
            fillOpacity = 'currentColor';
          } else if (index === displayFullStars && displayHasHalfStar) {
            fillClass = hoverRating !== null ? 'text-yellow-500' : 'text-yellow-400';
            fillOpacity = 'currentColor';
          }
          
          return (
            <div key={index} className="relative group">
              <Star
                className={`${sizeClasses[size]} ${fillClass} ${!readonly && photoId ? 'hover:text-yellow-500 transition-colors' : ''}`}
                fill={fillOpacity}
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleMouseEnter(index + 1)}
                style={{ cursor: readonly || !photoId ? 'default' : 'pointer' }}
              />
              {index === displayFullStars && displayHasHalfStar && (
                <div className="absolute inset-0 overflow-hidden\" style={{ width: '50%' }}>
                  <Star
                    className={`${sizeClasses[size]} ${hoverRating !== null ? 'text-yellow-500' : 'text-yellow-400'}`}
                    fill="currentColor"
                  />
                </div>
              )}
              {!readonly && photoId && (
                <>
                  {/* Left half for half-star */}
                  <div 
                    className="absolute inset-0 w-1/2 cursor-pointer opacity-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarHalfClick(index);
                    }}
                    onMouseEnter={() => handleMouseEnter(index + 0.5)}
                    title={`${index + 0.5} stars`}
                  />
                  {/* Right half for full star */}
                  <div 
                    className="absolute inset-0 left-1/2 w-1/2 cursor-pointer opacity-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarClick(index);
                    }}
                    onMouseEnter={() => handleMouseEnter(index + 1)}
                    title={`${index + 1} stars`}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 ml-1`}>
          {displayRating > 0 ? `${displayRating.toFixed(displayRating % 1 === 0 ? 0 : 1)} star${displayRating !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default StarRating;