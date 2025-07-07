import React, { useState } from 'react';
import { Eye, Scissors, Edit, Trash2, X, CheckCheck, Wand2, Check, Lightbulb, Copy,
         AlertCircle, Smile, EyeOff, Users, Sparkles, Flag, Heart, Frown, Meh } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import ImageModal from './ImageModal';
import StarRating from './StarRating';
import InpaintModal from './InpaintModal';
import ColorLabelIndicator from './ColorLabelIndicator';
import FaceOverlay from './FaceOverlay';
import { Photo } from '../types';
import { getPhotoTip } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface ImageCardProps {
  photo: Photo;
  viewMode: 'grid' | 'list' | 'compact';
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInpaintModal, setShowInpaintModal] = useState(false);
  const { deletePhoto, cullPhoto, togglePhotoSelection, updatePhotoScore } = usePhoto();
  const { showToast } = useToast();
  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showFaceOverlay, setShowFaceOverlay] = useState(false);

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'blurry':
        return <AlertCircle className="h-4 w-4 text-red-500\" title="Blurry" />;
      case 'smiling':
        return <Smile className="h-4 w-4 text-green-500\" title="Smiling" />;
      case 'closed_eyes':
        return <EyeOff className="h-4 w-4 text-amber-500\" title="Eyes Closed" />;
      case 'multiple_faces':
        return <Users className="h-4 w-4 text-blue-500\" title="Multiple Faces" />;
      default:
        return null;
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
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
        return <Heart className="h-3 w-3 text-pink-500" title={emotion} />;
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePhotoSelection(photo.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletePhoto(photo.id);
  };

  const handleCull = (e: React.MouseEvent) => {
    e.stopPropagation();
    cullPhoto(photo.id);
  };

  const handleGetTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tip) {
      setShowTip(true);
      return;
    }
    try {
      setIsLoadingTip(true);
      setShowTip(false);
      const photoTip = await getPhotoTip(photo.file);
      setTip(photoTip);
      setShowTip(true);
    } catch (error: any) {
      showToast(error.message || 'Failed to get photo tip', 'error');
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleFaceClick = (face: Face, index: number) => {
    console.log('Face clicked:', face, 'Index:', index);
    // You can add custom logic here, like showing face details or filtering by person
  };

  // Get face summary badges
  const getFaceSummaryBadges = () => {
    if (!photo.face_summary) return null;
    
    const badges = [];
    
    if (photo.face_summary.total_faces > 0) {
      badges.push(
        <span key="faces" className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-medium flex items-center gap-1">
          <Users className="h-3 w-3" />
          {photo.face_summary.total_faces}
        </span>
      );
    }
    
    if (photo.face_summary.issues?.closed_eyes && photo.face_summary.issues.closed_eyes > 0) {
      badges.push(
        <span key="closed-eyes" className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded font-medium flex items-center gap-1">
          <EyeOff className="h-3 w-3" />
          {photo.face_summary.issues.closed_eyes}
        </span>
      );
    }
    
    if (photo.face_summary.quality_stats?.average_quality && photo.face_summary.quality_stats.average_quality < 0.5) {
      badges.push(
        <span key="low-quality" className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded font-medium">
          Low Quality
        </span>
      );
    }
    
    return badges;
  };

  const renderCardContent = () => (
    <>
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute top-2 left-2 z-10">
          <button
            className={`p-1.5 rounded-full transition-colors ${
              photo.selected
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 text-white hover:bg-black/75'
            }`}
            onClick={handleSelect}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
        
        {/* Toggle between normal image and face overlay */}
        <div 
          className="w-full h-full cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {photo.faces && photo.faces.length > 0 ? (
            <FaceOverlay
              faces={photo.faces}
              imageUrl={photo.url}
              className="w-full h-full"
              showTooltips={isHovered}
              onFaceClick={handleFaceClick}
              debugMode={true}
            />
          ) : (
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {isHovered && (
          <>
          {tip && showTip && (
            <div className="absolute top-2 left-14 z-20 bg-black/75 text-white text-sm p-2 rounded-lg max-w-xs">
              {tip}
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200">
            <div className="flex space-x-2">
              <button className="p-1.5 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors" onClick={() => setShowModal(true)}>
                <Eye className="h-5 w-5" />
              </button>
              <button 
                className={`p-1.5 rounded-full transition-all duration-300 relative group ${
                  showTip 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 animate-glow' 
                    : 'bg-white text-gray-900 hover:bg-yellow-100'
                }`}
                onClick={handleGetTip}
                title="Get AI Tip"
                disabled={isLoadingTip}
              >
                {isLoadingTip ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
                ) : (
                  <Lightbulb className={`h-5 w-5 transition-transform duration-300 ${showTip ? 'text-white' : 'group-hover:scale-110'}`} />
                )}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs py-1 px-2 rounded 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {tip ? 'Show AI Tip' : 'Get AI Tip'}
                </div>
              </button>
              <button className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors" onClick={handleCull}>
                <Scissors className="h-5 w-5" />
              </button>
              <button 
                className="p-1.5 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInpaintModal(true);
                }}
              >
                <Wand2 className="h-5 w-5" />
              </button>
              <button className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors" onClick={handleDelete}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          </>
        )}
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm flex flex-col items-center gap-1">
            {photo.isDuplicate && (
              <div className="p-1 bg-orange-500 rounded-full" title="Duplicate detected">
                <Copy className="h-3 w-3 text-white" />
              </div>
            )}
            {photo.blip_highlights && photo.blip_highlights.length > 0 && (
              <div className="p-1 bg-yellow-500 rounded-full\" title={`Event highlights: ${photo.blip_highlights.join(', ')}`}>
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            {photo.blip_flags && photo.blip_flags.length > 0 && (
              <div className="p-1 bg-red-500 rounded-full" title={`Issues detected: ${photo.blip_flags.join(', ')}`}>
                <Flag className="h-3 w-3 text-white" />
              </div>
            )}
            <ColorLabelIndicator 
              colorLabel={photo.color_label} 
              size="md" 
              photoId={photo.id}
              editable={true}
              position="left"
            />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium" title={photo.filename}>{photo.filename}</p>
        {photo.ai_score > 0 && (
          <div className="mt-1">
            <StarRating 
              score={photo.ai_score} 
              size="sm" 
              photoId={photo.id}
              readonly={false}
              showLabel={false}
            />
          </div>
        )}
        {photo.caption && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2" title={photo.caption}>
            {photo.caption}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          <ColorLabelIndicator 
            colorLabel={photo.color_label} 
            size="sm" 
            showText 
            photoId={photo.id}
            editable={true}
          />
          {getFaceSummaryBadges()}
          {photo.blip_highlights && photo.blip_highlights.map((highlight, index) => (
            <span 
              key={`highlight-${index}`}
              className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded font-medium flex items-center gap-1"
              title="Event highlight"
            >
              <Sparkles className="h-3 w-3" />
              {highlight}
            </span>
          ))}
          {photo.blip_flags && photo.blip_flags.map((flag, index) => (
            <span 
              key={`flag-${index}`}
              className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded font-medium flex items-center gap-1"
              title="Issue detected"
            >
              <Flag className="h-3 w-3" />
              {flag}
            </span>
          ))}
          {photo.ai_categories && photo.ai_categories.map((category, index) => (
            <span 
              key={`category-${index}`}
              className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded font-medium"
              title="AI Category"
            >
              {category}
            </span>
          ))}
          {photo.tags?.map((tag, index) => {
            const icon = getTagIcon(tag);
            return icon ? (
              <div key={index} className="flex items-center gap-1">
                {icon}
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {tag.replace('_', ' ')}
                </span>
              </div>
            ) : (
              <span 
                key={index} 
                className={`px-1.5 py-0.5 text-xs rounded truncate max-w-full ${
                  tag === 'raw' 
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-medium' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {tag === 'raw' ? 'RAW' : tag}
              </span>
            );
          })}
          {(photo.score_type === 'personalized' || photo.score_type === 'ai') && (
            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs rounded font-medium">
              {photo.score_type === 'ai' ? 'Deep AI' : 'Personalized'}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const renderListCard = () => (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 left-2 z-10">
        <button
          className={`p-1.5 rounded-full transition-colors ${
            photo.selected
              ? 'bg-blue-600 text-white'
              : 'bg-black/50 text-white hover:bg-black/75'
          }`}
          onClick={handleSelect}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
      <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden">
        <div 
          className="w-full h-full cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {photo.faces && photo.faces.length > 0 ? (
            <FaceOverlay
              faces={photo.faces}
              imageUrl={photo.url}
              className="w-full h-full"
              showTooltips={false}
              onFaceClick={handleFaceClick}
              debugMode={true}
            />
          ) : (
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover"
            />
          )}
        </div>
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
            <ColorLabelIndicator 
              colorLabel={photo.color_label} 
              size="sm" 
              showText 
              photoId={photo.id}
              editable={true}
            />
            {photo.ai_score > 0 && (
              <StarRating 
                score={photo.ai_score} 
                size="sm" 
                photoId={photo.id}
                readonly={false}
              />
            )}
            {photo.isDuplicate && (
              <div className="flex items-center gap-1">
                <Copy className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600 dark:text-orange-400">Duplicate</span>
              </div>
            )}
            {photo.blip_highlights && photo.blip_highlights.length > 0 && (
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Highlight</span>
              </div>
            )}
            {photo.blip_flags && photo.blip_flags.length > 0 && (
              <div className="flex items-center gap-1">
                <Flag className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400">Flagged</span>
              </div>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {getFaceSummaryBadges()}
            {photo.tags?.map((tag, index) => {
              const icon = getTagIcon(tag);
              return icon ? (
                <div key={index} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  {icon}
                  <span className="text-xs capitalize">
                    {tag.replace('_', ' ')}
                  </span>
                </div>
              ) : (
                <span 
                  key={index} 
                  className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded truncate max-w-[100px]"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center pr-3 space-x-1">
        <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setShowModal(true)}><Eye className="h-4 w-4" /></button>
        <button className="p-1.5 text-blue-500 hover:text-blue-700" onClick={handleCull}><Scissors className="h-4 w-4" /></button>
        <button
          className={`p-1.5 relative group ${
            showTip 
              ? 'text-yellow-500 hover:text-yellow-600 animate-glow' 
              : 'text-gray-500 hover:text-yellow-500'
          }`}
          onClick={handleGetTip}
          disabled={isLoadingTip}
        >
          {isLoadingTip ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          ) : (
            <Lightbulb className={`h-4 w-4 transition-transform duration-300 ${showTip ? '' : 'group-hover:scale-110'}`} />
          )}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs py-1 px-2 rounded 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {tip ? 'Show AI Tip' : 'Get AI Tip'}
          </div>
        </button>
        <button 
          className="p-1.5 text-purple-500 hover:text-purple-700" 
          onClick={(e) => {
            e.stopPropagation();
            setShowInpaintModal(true);
          }}
        >
          <Wand2 className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-red-500 hover:text-red-700" onClick={handleDelete}><Trash2 className="h-4 w-4" /></button>
      </div>
      {tip && showTip && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-black/75 text-white text-sm p-2 rounded-lg max-w-xs z-10">
          {tip}
        </div>
      )}
    </div>
  );

  const renderCompactCard = () => (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-1 left-1 z-10">
        <button
          className={`p-1 rounded transition-colors ${
            photo.selected
              ? 'bg-blue-600 text-white'
              : 'bg-black/50 text-white hover:bg-black/75'
          }`}
          onClick={handleSelect}
        >
          <Check className="h-3 w-3" />
        </button>
      </div>
      <div className="aspect-square relative overflow-hidden">
        <div 
          className="w-full h-full cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {photo.faces && photo.faces.length > 0 ? (
            <FaceOverlay
              faces={photo.faces}
              imageUrl={photo.url}
              className="w-full h-full"
              showTooltips={false}
              onFaceClick={handleFaceClick}
              debugMode={true}
            />
          ) : (
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col max-w-[80%]">
            <span className="text-white text-xs truncate">{photo.filename}</span>
            {photo.caption && (
              <span className="text-white/80 text-[10px] truncate mt-0.5" title={photo.caption}>
                {photo.caption}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {photo.isDuplicate && (
              <div className="p-0.5 bg-orange-500 rounded-full" title="Duplicate">
                <Copy className="h-2 w-2 text-white" />
              </div>
            )}
            <ColorLabelIndicator 
              colorLabel={photo.color_label} 
              size="sm" 
              photoId={photo.id}
              editable={true}
              position="top"
            />
            {photo.ai_score > 0 && (
              <StarRating 
                score={photo.ai_score} 
                size="sm" 
                photoId={photo.id}
                readonly={false}
              />
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 flex gap-1">
        {photo.tags?.map((tag, index) => {
          const icon = getTagIcon(tag);
          return icon ? (
            <div key={index} className="p-1 rounded-full bg-black/50 backdrop-blur-sm">
              {icon}
            </div>
          ) : null;
        })}
        {photo.face_summary && photo.face_summary.total_faces > 0 && (
          <div className="p-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center">
            <Users className="h-2 w-2 text-white" />
            <span className="text-white text-[10px] ml-0.5">{photo.face_summary.total_faces}</span>
          </div>
        )}
      </div>
      {isHovered && (
        <div className="absolute top-1 right-1">
          <button className="p-1 bg-red-600 rounded text-white text-xs hover:bg-red-700 transition-colors" onClick={handleDelete}><X className="h-3 w-3" /></button>
        </div>
      )}
      {tip && showTip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black/75 text-white text-xs p-1.5 rounded-lg max-w-[150px] z-10 text-center">
          {tip}
        </div>
      )}
      {isHovered && (
        <div className="absolute top-1 left-1">
          <button className="p-1 bg-blue-600 rounded text-white text-xs hover:bg-blue-700 transition-colors" onClick={handleCull}><CheckCheck className="h-3 w-3" /></button>
          <button 
            className={`p-1 rounded text-white text-xs transition-all duration-300 ml-1 relative group ${
              showTip 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-glow' 
                : 'bg-white/20 hover:bg-yellow-500/50'
            }`} 
            onClick={handleGetTip}
            disabled={isLoadingTip}
          >
            {isLoadingTip ? (
              <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white border-t-transparent" />
            ) : (
              <Lightbulb className={`h-3 w-3 transition-transform duration-300 ${showTip ? '' : 'group-hover:scale-110'}`} />
            )}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[10px] py-1 px-1.5 rounded 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {tip ? 'Show AI Tip' : 'Get AI Tip'}
            </div>
          </button>
          <button 
            className="p-1 bg-purple-600 rounded text-white text-xs hover:bg-purple-700 transition-colors ml-1" 
            onClick={(e) => {
              e.stopPropagation();
              setShowInpaintModal(true);
            }}
          >
            <Wand2 className="h-3 w-3" />
          </button>
        </div>
      )}
      {showModal && <ImageModal photo={photo} onClose={() => setShowModal(false)} />}
      {showInpaintModal && <InpaintModal photo={photo} onClose={() => setShowInpaintModal(false)} />}
    </div>
  );

  switch (viewMode) {
    case 'list': return renderListCard();
    case 'compact': return renderCompactCard();
    case 'grid':
    default: return (
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderCardContent()}
        {showModal && <ImageModal photo={photo} onClose={() => setShowModal(false)} />}
        {showInpaintModal && <InpaintModal photo={photo} onClose={() => setShowInpaintModal(false)} />}
      </div>
    );
  }
};

export default ImageCard;