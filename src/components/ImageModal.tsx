import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Wand2, Save, Sparkles, Eye, EyeOff, Zap, Bookmark, Trash2, Folder, Check, Settings, Palette, Crop, RotateCw, FlipHorizontal, FlipVertical, Sun, Contrast, Droplets, Focus, Thermometer, Cigarette as Vignette } from 'lucide-react';
import { Photo, EditProfile } from '../types';
import StarRating from './StarRating';
import { editPhoto, autofixPhoto, autocorrectPhoto, getFocusMap } from '../lib/api';
import FaceOverlay from './FaceOverlay';
import { loadProfiles, saveProfile, deleteProfile } from '../lib/editProfiles';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { Album } from '../types';

interface ImageModalProps {
  photo: Photo;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ photo, onClose }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [editParams, setEditParams] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    sharpness: 1,
    gamma: 1,
    grayscale: false,
    invert: false,
    rotate: 0,
    flip_horizontal: false,
    flip_vertical: false,
    temperature: 0,
    vignette: 0
  });
  const [cropBox, setCropBox] = useState({
    left: 0,
    upper: 0,
    right: 0,
    lower: 0
  });
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAutofixing, setIsAutofixing] = useState(false);
  const [isAutocorrecting, setIsAutocorrecting] = useState(false);
  const [focusMapData, setFocusMapData] = useState<FocusMapResponse | null>(null);
  const [showFocusMap, setShowFocusMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'profiles'>('basic');
  const { updatePhotoUrl } = usePhoto();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<EditProfile[]>([]);
  const [showSaveProfile, setShowSaveProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);
  const { albums, addPhotosToAlbum, removePhotosFromAlbum } = usePhoto();
  const [showFaceOverlay, setShowFaceOverlay] = useState(false);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      showToast('Please enter a profile name', 'error');
      return;
    }

    try {
      const profile: EditProfile = {
        id: Math.random().toString(36).substring(2, 11),
        name: profileName.trim(),
        params: { ...editParams }
      };
      
      saveProfile(profile);
      setProfiles(loadProfiles());
      setShowSaveProfile(false);
      setProfileName('');
      showToast('Profile saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save profile', 'error');
    }
  };

  const handleLoadProfile = (profile: EditProfile) => {
    setEditParams(profile.params);
    showToast(`Applied profile: ${profile.name}`, 'success');
  };

  const handleDeleteProfile = (id: string) => {
    try {
      deleteProfile(id);
      setProfiles(loadProfiles());
      showToast('Profile deleted', 'success');
    } catch (error) {
      showToast('Failed to delete profile', 'error');
    }
  };

  useEffect(() => {
    if (imgRef.current) {
      const update = () => {
        setDimensions({
          width: imgRef.current!.offsetWidth,
          height: imgRef.current!.offsetHeight
        });
      };
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, [imgRef]);

  const handleApplyEdits = async () => {
    try {
      setIsEditing(true);
      
      const params = {
        ...editParams,
        ...(cropBox.right > 0 ? {
          crop_left: cropBox.left,
          crop_upper: cropBox.upper,
          crop_right: cropBox.right,
          crop_lower: cropBox.lower
        } : {})
      };
      
      const editedBlob = await editPhoto(photo.file, params);
      
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
      
      const newUrl = URL.createObjectURL(editedBlob);
      setEditedImageUrl(newUrl);
    } catch (error: any) {
      console.error('Failed to edit photo:', error);
      showToast(error.message || 'Failed to apply edits', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleAutofix = async () => {
    try {
      setIsAutofixing(true);
      const editedBlob = await autofixPhoto(photo.file);
      
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
      
      const newUrl = URL.createObjectURL(editedBlob);
      setEditedImageUrl(newUrl);
      showToast('Photo enhanced successfully', 'success');
    } catch (error: any) {
      console.error('Failed to enhance photo:', error);
      showToast(error.message || 'Failed to enhance photo', 'error');
    } finally {
      setIsAutofixing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedImageUrl) return;
    
    try {
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], photo.file.name, { type: photo.file.type });
      
      const newUrl = URL.createObjectURL(file);
      updatePhotoUrl(photo.id, newUrl);
      onClose();
    } catch (error: any) {
      console.error('Failed to save changes:', error);
      showToast(error.message || 'Failed to save changes', 'error');
    }
  };

  const handleDownload = async () => {
    const url = editedImageUrl || photo.url;
    const response = await fetch(url);
    try {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `edited_${photo.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error('Download failed:', error);
      showToast('Failed to download image', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
    };
  }, [editedImageUrl]);

  const handleAutocorrect = async () => {
    try {
      setIsAutocorrecting(true);
      const editedBlob = await autocorrectPhoto(photo.file);
      
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
      
      const newUrl = URL.createObjectURL(editedBlob);
      setEditedImageUrl(newUrl);
      showToast('Photo auto-corrected successfully', 'success');
    } catch (error: any) {
      console.error('Failed to auto-correct photo:', error);
      showToast(error.message || 'Failed to auto-correct photo', 'error');
    } finally {
      setIsAutocorrecting(false);
    }
  };

  const handleToggleFocusMap = async () => {
    if (showFocusMap) {
      setShowFocusMap(false);
      setFocusMapData(null);
      return;
    }

    try {
      if (!focusMapData) {
        const data = await getFocusMap(photo.file);
        setFocusMapData(data);
      }
      setShowFocusMap(true);
    } catch (error: any) {
      console.error('Failed to generate focus map:', error);
      showToast(error.message || 'Failed to generate focus map', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (focusMapData) {
        setFocusMapData(null);
      }
    };
  }, [focusMapData]);

  const resetEdits = () => {
    setEditParams({
      brightness: 1,
      contrast: 1,
      saturation: 1,
      sharpness: 1,
      gamma: 1,
      grayscale: false,
      invert: false,
      rotate: 0,
      flip_horizontal: false,
      flip_vertical: false,
      temperature: 0,
      vignette: 0
    });
    setCropBox({ left: 0, upper: 0, right: 0, lower: 0 });
    setEditedImageUrl(null);
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    min: number,
    max: number,
    step: number = 0.1,
    icon?: React.ReactNode,
    unit?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                   slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                   slider-thumb:bg-blue-600 slider-thumb:rounded-full slider-thumb:cursor-pointer
                   hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );

  const renderBasicControls = () => (
    <div className="space-y-6">
      {renderSlider(
        'Brightness',
        editParams.brightness,
        (value) => setEditParams(prev => ({ ...prev, brightness: value })),
        0, 2, 0.1,
        <Sun className="h-4 w-4 text-yellow-500" />
      )}
      
      {renderSlider(
        'Contrast',
        editParams.contrast,
        (value) => setEditParams(prev => ({ ...prev, contrast: value })),
        0, 2, 0.1,
        <Contrast className="h-4 w-4 text-gray-600" />
      )}
      
      {renderSlider(
        'Saturation',
        editParams.saturation,
        (value) => setEditParams(prev => ({ ...prev, saturation: value })),
        0, 2, 0.1,
        <Droplets className="h-4 w-4 text-blue-500" />
      )}
      
      {renderSlider(
        'Sharpness',
        editParams.sharpness,
        (value) => setEditParams(prev => ({ ...prev, sharpness: value })),
        0, 2, 0.1,
        <Focus className="h-4 w-4 text-purple-500" />
      )}
    </div>
  );

  const renderAdvancedControls = () => (
    <div className="space-y-6">
      {renderSlider(
        'Gamma',
        editParams.gamma,
        (value) => setEditParams(prev => ({ ...prev, gamma: value })),
        0.1, 2.2, 0.1,
        <Settings className="h-4 w-4 text-gray-500" />
      )}
      
      {renderSlider(
        'Temperature',
        editParams.temperature,
        (value) => setEditParams(prev => ({ ...prev, temperature: value })),
        -100, 100, 1,
        <Thermometer className="h-4 w-4 text-orange-500" />,
        'K'
      )}
      
      {renderSlider(
        'Vignette',
        editParams.vignette,
        (value) => setEditParams(prev => ({ ...prev, vignette: value })),
        0, 1, 0.1,
        <Vignette className="h-4 w-4 text-gray-600" />
      )}
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <RotateCw className="h-4 w-4" />
          <span>Transform</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editParams.grayscale}
                onChange={(e) => setEditParams(prev => ({ ...prev, grayscale: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Grayscale</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editParams.invert}
                onChange={(e) => setEditParams(prev => ({ ...prev, invert: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Invert Colors</span>
            </label>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editParams.flip_horizontal}
                onChange={(e) => setEditParams(prev => ({ ...prev, flip_horizontal: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <FlipHorizontal className="h-4 w-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Flip H</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editParams.flip_vertical}
                onChange={(e) => setEditParams(prev => ({ ...prev, flip_vertical: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <FlipVertical className="h-4 w-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Flip V</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rotation</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 90, 180, 270].map((angle) => (
              <button
                key={angle}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  editParams.rotate === angle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setEditParams(prev => ({ ...prev, rotate: angle }))}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfilesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Profiles</h4>
        <button
          onClick={() => setShowSaveProfile(!showSaveProfile)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Current
        </button>
      </div>
      
      {showSaveProfile && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Profile name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSaveProfile}
              disabled={!profileName.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                       text-white text-sm rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.id} 
                 className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 
                          rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <button
                className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => handleLoadProfile(profile)}
              >
                {profile.name}
              </button>
              <button
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => handleDeleteProfile(profile.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No saved profiles yet. Create your first profile by adjusting settings and clicking "Save Current".
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="h-full flex"
        onClick={e => e.stopPropagation()}
      >
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative max-w-full max-h-full">
            {/* Toggle for face overlay */}
            {photo.faces && photo.faces.length > 0 && (
              <button
                onClick={() => setShowFaceOverlay(!showFaceOverlay)}
                className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/75 text-white text-sm 
                         rounded-md hover:bg-black/90 transition-colors duration-200"
              >
                {showFaceOverlay ? 'Hide Faces' : `Show Faces (${photo.faces.length})`}
              </button>
            )}
            
            {showFaceOverlay && photo.faces && photo.faces.length > 0 ? (
              <FaceOverlay
                faces={photo.faces}
                imageUrl={editedImageUrl || photo.url}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                showTooltips={true}
                onFaceClick={(face, index) => {
                  console.log('Face clicked in modal:', face, index);
                  // You can add custom logic here
                }}
              />
            ) : (
              <img 
                src={editedImageUrl || photo.url}
                ref={imgRef}
                alt={photo.filename} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
            
            {showFocusMap && focusMapData && (
              <>
                <img
                  src={`data:image/png;base64,${focusMapData.heatmap_png_base64}`}
                  alt="Focus map"
                  className="absolute inset-0 w-full h-full object-contain mix-blend-overlay opacity-75 rounded-lg"
                />
                <div
                  className="absolute w-4 h-4 border-2 border-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${focusMapData.focus_x * 100}%`,
                    top: `${focusMapData.focus_y * 100}%`,
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.5)'
                  }}
                />
              </>
            )}

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                      flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Photo Editor
              </h2>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={photo.filename}>
                {photo.filename}
              </h3>
              
              {photo.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  "{photo.caption}"
                </p>
              )}
              
              <div className="flex items-center space-x-4">
                <StarRating 
                  score={photo.ai_score || 0} 
                  photoId={photo.id}
                  readonly={false}
                  size="md"
                  showLabel={true}
                />
                
                <div className="relative">
                  <button
                    onClick={() => setShowAlbumSelector(!showAlbumSelector)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                             rounded-md text-sm flex items-center space-x-1 hover:bg-gray-200 
                             dark:hover:bg-gray-700 transition-colors"
                  >
                    <Folder className="h-4 w-4" />
                    <span>
                      {photo.albumId 
                        ? albums.find(a => a.id === photo.albumId)?.name || 'Album'
                        : 'Add to Album'}
                    </span>
                  </button>
                  
                  {showAlbumSelector && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 
                                  rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      {albums.map(album => (
                        <button
                          key={album.id}
                          onClick={() => {
                            if (photo.albumId === album.id) {
                              removePhotosFromAlbum([photo.id], album.id);
                            } else {
                              addPhotosToAlbum([photo.id], album.id);
                            }
                            setShowAlbumSelector(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 
                                   dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <span>{album.name}</span>
                          {photo.albumId === album.id && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md 
                         flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                onClick={handleAutocorrect}
                disabled={isAutocorrecting}
              >
                <Zap className="h-4 w-4" />
                <span>{isAutocorrecting ? 'Processing...' : 'Auto Correct'}</span>
              </button>
              
              <button
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                         flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                onClick={handleAutofix}
                disabled={isAutofixing}
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAutofixing ? 'Processing...' : 'Auto Enhance'}</span>
              </button>
              
              <button
                className={`px-3 py-2 text-sm rounded-md flex items-center justify-center space-x-2 
                         transition-colors ${
                  showFocusMap 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={handleToggleFocusMap}
              >
                {showFocusMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>Focus Map</span>
              </button>
              
              <button
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                         text-sm rounded-md flex items-center justify-center space-x-2 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Edit Controls Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {[
                { id: 'basic', label: 'Basic', icon: Palette },
                { id: 'advanced', label: 'Advanced', icon: Settings },
                { id: 'profiles', label: 'Profiles', icon: Bookmark }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                           flex items-center justify-center space-x-2 ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Controls Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' && renderBasicControls()}
            {activeTab === 'advanced' && renderAdvancedControls()}
            {activeTab === 'profiles' && renderProfilesTab()}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <button
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 
                         dark:hover:text-gray-200 transition-colors"
                onClick={resetEdits}
              >
                Reset All
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                           flex items-center space-x-2 transition-colors disabled:opacity-50"
                  onClick={handleApplyEdits}
                  disabled={isEditing}
                >
                  <Wand2 className="h-4 w-4" />
                  <span>{isEditing ? 'Applying...' : 'Preview'}</span>
                </button>
                
                {editedImageUrl && (
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md 
                             flex items-center space-x-2 transition-colors"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Photo Metadata */}
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              {photo.event_type && (
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    {photo.event_type.charAt(0).toUpperCase() + photo.event_type.slice(1)} Event
                  </span>
                </div>
              )}
              
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {photo.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;