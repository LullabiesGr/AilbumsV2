import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Photo, Filter, Album, ColorLabel, EventType, CullingMode, WorkflowStage, DuplicateCluster, PersonGroup } from '../types';
import { analyzePhotosSingle, deepAnalyzePhotosSingle, cullPhotos, findDuplicatesAPI, convertRawFile, saveAlbumAndTrain, createAlbumAPI } from '../lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { findDuplicates } from '../lib/similarity';

interface PhotoContextType {
  photos: Photo[];
  filteredPhotos: Photo[];
  duplicateClusters: DuplicateCluster[];
  personGroups: PersonGroup[];
  albums: Album[];
  currentAlbum: Album | null;
  selectedPhotos: Photo[];
  isLoading: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  isFindingDuplicates: boolean;
  analysisProgress: { processed: number; total: number; currentPhoto: string };
  showAnalysisOverlay: boolean;
  setShowAnalysisOverlay: (show: boolean) => void;
  
  // Workflow
  workflowStage: WorkflowStage;
  setWorkflowStage: (stage: WorkflowStage) => void;
  eventType: EventType | null;
  setEventType: (type: EventType | null) => void;
  cullingMode: CullingMode | null;
  setCullingMode: (mode: CullingMode | null) => void;
  
  // Filter state
  filterOption: Filter;
  setFilterOption: (filter: Filter) => void;
  viewMode: 'grid' | 'list' | 'compact';
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  captionFilter: string;
  setCaptionFilter: (filter: string) => void;
  starRatingFilter: { min: number | null; max: number | null };
  setStarRatingFilter: (min: number | null, max: number | null) => void;
  selectedPersonGroup: string | null;
  setSelectedPersonGroup: (groupId: string | null) => void;
  
  // Copy Look functionality
  copyLookMode: boolean;
  setCopyLookMode: (enabled: boolean) => void;
  referencePhoto: Photo | null;
  setReferencePhoto: (photo: Photo | null) => void;
  copyLookTargets: Photo[];
  toggleCopyLookTarget: (photoId: string) => void;
  clearCopyLookTargets: () => void;
  
  // Photo operations
  uploadPhotos: (files: File[]) => Promise<void>;
  deletePhoto: (photoId: string) => void;
  cullPhoto: (photoId: string) => void;
  cullAllPhotos: () => void;
  togglePhotoSelection: (photoId: string) => void;
  selectAllPhotos: () => void;
  deselectAllPhotos: () => void;
  updatePhotoScore: (photoId: string, score: number) => void;
  updatePhotoUrl: (photoId: string, url: string) => void;
  updatePhotoColorLabel: (photoId: string, label: ColorLabel | undefined) => void;
  
  // Analysis operations
  startAnalysis: (albumName?: string, eventType?: EventType) => Promise<void>;
  startBackgroundAnalysis: () => Promise<void>;
  resetWorkflow: () => void;
  
  // Advanced operations
  findDuplicates: () => Promise<void>;
  groupPeopleByFaces: () => void;
  saveAlbumAndTrainAI: (albumTitle: string) => Promise<void>;
  
  // Album operations
  createAlbum: (name: string, description?: string) => void;
  deleteAlbum: (albumId: string) => void;
  updateAlbum: (albumId: string, updates: Partial<Album>) => void;
  addPhotosToAlbum: (photoIds: string[], albumId: string) => void;
  removePhotosFromAlbum: (photoIds: string[], albumId: string) => void;
  
  // Manual culling
  markPhotoAsKeep: (photoId: string) => void;
  markPhotoAsReject: (photoId: string) => void;
  markDuplicateAsKeep: (filename: string, duplicateGroup: string[]) => void;
  deleteDuplicateGroup: (duplicateGroup: string[]) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const usePhoto = () => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  return context;
};

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [duplicateClusters, setDuplicateClusters] = useState<DuplicateCluster[]>([]);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFindingDuplicates, setIsFindingDuplicates] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ processed: 0, total: 0, currentPhoto: '' });
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  
  // Workflow state
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('upload');
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [cullingMode, setCullingMode] = useState<CullingMode | null>(null);
  
  // Filter state
  const [filterOption, setFilterOption] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [captionFilter, setCaptionFilter] = useState('');
  const [starRatingFilter, setStarRatingFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [selectedPersonGroup, setSelectedPersonGroup] = useState<string | null>(null);
  
  // Copy Look state
  const [copyLookMode, setCopyLookMode] = useState(false);
  const [referencePhoto, setReferencePhoto] = useState<Photo | null>(null);
  const [copyLookTargets, setCopyLookTargets] = useState<Photo[]>([]);
  
  const { showToast } = useToast();
  const { user } = useAuth();

  // Filter photos based on current filters
  const filteredPhotos = photos.filter(photo => {
    // Apply filter option
    switch (filterOption) {
      case 'selected':
        return selectedPhotos.some(p => p.id === photo.id);
      case 'high-score':
        return photo.ai_score >= 7;
      case 'approved':
        return photo.approved === true;
      case 'not-approved':
        return photo.approved === false;
      case 'blurry':
        return photo.tags?.includes('blurry');
      case 'eyes-closed':
        return photo.tags?.includes('closed_eyes');
      case 'duplicates':
        return photo.tags?.includes('duplicate');
      case 'warnings':
        return photo.tags?.some(tag => ['blurry', 'closed_eyes', 'duplicate'].includes(tag));
      case 'highlights':
        return photo.blip_highlights && photo.blip_highlights.length > 0;
      case 'flagged':
        return photo.blip_flags && photo.blip_flags.length > 0;
      case 'green':
      case 'red':
      case 'yellow':
      case 'blue':
      case 'purple':
        return photo.color_label === filterOption;
      case 'people':
        return photo.faces && photo.faces.length > 0;
      case 'emotions':
        return photo.faces?.some(face => face.emotion);
      case 'quality-issues':
        return photo.tags?.some(tag => ['blurry', 'closed_eyes'].includes(tag));
      default:
        return true;
    }
  }).filter(photo => {
    // Apply caption filter
    if (captionFilter) {
      const searchLower = captionFilter.toLowerCase();
      return photo.caption?.toLowerCase().includes(searchLower) ||
             photo.filename.toLowerCase().includes(searchLower) ||
             photo.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    }
    return true;
  }).filter(photo => {
    // Apply star rating filter
    if (starRatingFilter.min !== null || starRatingFilter.max !== null) {
      if (photo.ai_score === 0) return false;
      const stars = photo.ai_score / 2;
      
      if (starRatingFilter.min !== null && stars < starRatingFilter.min) return false;
      if (starRatingFilter.max !== null && stars > starRatingFilter.max) return false;
    }
    return true;
  }).filter(photo => {
    // Apply person group filter
    if (selectedPersonGroup) {
      return photo.faces?.some(face => face.same_person_group === selectedPersonGroup);
    }
    return true;
  });

  const uploadPhotos = useCallback(async (files: File[]) => {
    setIsUploading(true);
    try {
      const newPhotos: Photo[] = [];
      
      for (const file of files) {
        let processedFile = file;
        
        // Check if it's a RAW file and convert it
        const isRawFile = /\.(cr2|cr3|nef|arw|dng|orf|raf|pef|rw2|srw|x3f)$/i.test(file.name);
        if (isRawFile) {
          try {
            showToast(`Converting RAW file: ${file.name}`, 'info');
            const convertedBlob = await convertRawFile(file);
            processedFile = new File([convertedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
          } catch (error) {
            console.error(`Failed to convert RAW file ${file.name}:`, error);
            showToast(`Failed to convert RAW file: ${file.name}`, 'error');
            continue;
          }
        }
        
        const photo: Photo = {
          id: Math.random().toString(36).substring(2, 11),
          filename: file.name,
          file: processedFile,
          url: URL.createObjectURL(processedFile),
          score: null,
          ai_score: 0,
          score_type: 'base',
          tags: isRawFile ? ['raw'] : [],
          faces: [],
          dateCreated: new Date().toISOString(),
          selected: false
        };
        
        newPhotos.push(photo);
      }
      
      setPhotos(prev => [...prev, ...newPhotos]);
      showToast(`Uploaded ${newPhotos.length} photo${newPhotos.length !== 1 ? 's' : ''}`, 'success');
      
      // Move to configure stage if we have photos
      if (newPhotos.length > 0 && workflowStage === 'upload') {
        setWorkflowStage('configure');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      showToast(error.message || 'Failed to upload photos', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [showToast, workflowStage]);

  const deletePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  const cullPhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, tags: [...(p.tags || []), 'culled'] }
        : p
    ));
  }, []);

  const cullAllPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const culledPhotos = await cullPhotos(photos);
      setPhotos(culledPhotos);
      showToast('Photos culled successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to cull photos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [photos, showToast]);

  const togglePhotoSelection = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, selected: !p.selected }
        : p
    ));
    
    setSelectedPhotos(prev => {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return prev;
      
      const isSelected = prev.some(p => p.id === photoId);
      if (isSelected) {
        return prev.filter(p => p.id !== photoId);
      } else {
        return [...prev, { ...photo, selected: true }];
      }
    });
  }, [photos]);

  const selectAllPhotos = useCallback(() => {
    setPhotos(prev => prev.map(p => ({ ...p, selected: true })));
    setSelectedPhotos(photos.map(p => ({ ...p, selected: true })));
  }, [photos]);

  const deselectAllPhotos = useCallback(() => {
    setPhotos(prev => prev.map(p => ({ ...p, selected: false })));
    setSelectedPhotos([]);
  }, []);

  const updatePhotoScore = useCallback((photoId: string, score: number) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, ai_score: score, score: score }
        : p
    ));
  }, []);

  const updatePhotoUrl = useCallback((photoId: string, url: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, url }
        : p
    ));
  }, []);

  const updatePhotoColorLabel = useCallback((photoId: string, label: ColorLabel | undefined) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, color_label: label }
        : p
    ));
  }, []);

  const startAnalysis = useCallback(async (albumName?: string, selectedEventType?: EventType) => {
    if (photos.length === 0) {
      showToast('No photos to analyze', 'warning');
      return;
    }

    if (!cullingMode) {
      showToast('Please select a culling mode first', 'warning');
      return;
    }

    if (cullingMode !== 'manual' && !selectedEventType && !eventType) {
      showToast('Please select an event type first', 'warning');
      return;
    }

    const finalEventType = selectedEventType || eventType || 'event';
    const userEmail = user?.email || 'guest@ailbums.pro';

    try {
      setIsAnalyzing(true);
      setWorkflowStage('analyzing');
      setShowAnalysisOverlay(true);
      setAnalysisProgress({ processed: 0, total: photos.length, currentPhoto: '' });

      // Create album if name provided
      let albumId: string | undefined;
      if (albumName && albumName.trim()) {
        try {
          const albumData = {
            user_email: userEmail,
            album_id: `${albumName.trim().replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
            title: albumName.trim(),
            event_type: finalEventType,
            date_created: new Date().toISOString()
          };
          
          const result = await createAlbumAPI(albumData);
          albumId = result.album_id || albumData.album_id;
          showToast(`Album "${albumName}" created successfully`, 'success');
        } catch (error: any) {
          console.error('Failed to create album:', error);
          showToast(`Warning: ${error.message}. Continuing with analysis...`, 'warning');
        }
      }

      let analyzedPhotos: Photo[];
      
      if (cullingMode === 'manual') {
        // Manual mode - no analysis, just proceed to review
        analyzedPhotos = photos;
        setAnalysisProgress({ processed: photos.length, total: photos.length, currentPhoto: '' });
      } else {
        // AI analysis modes
        const analysisFunction = cullingMode === 'deep' ? deepAnalyzePhotosSingle : analyzePhotosSingle;
        
        analyzedPhotos = await analysisFunction(
          photos,
          userEmail,
          finalEventType,
          (processedCount, currentPhoto, updatedPhoto) => {
            setAnalysisProgress({ processed: processedCount, total: photos.length, currentPhoto });
            
            // Update photo in real-time if provided
            if (updatedPhoto) {
              setPhotos(prev => prev.map(p => 
                p.id === updatedPhoto.id ? updatedPhoto : p
              ));
            }
          },
          2, // concurrency
          albumId
        );
      }

      setPhotos(analyzedPhotos);
      setWorkflowStage('review');
      showToast(`Analysis complete! ${analyzedPhotos.length} photos processed.`, 'success');
      
    } catch (error: any) {
      console.error('Analysis failed:', error);
      showToast(error.message || 'Analysis failed', 'error');
      setWorkflowStage('configure');
    } finally {
      setIsAnalyzing(false);
    }
  }, [photos, cullingMode, eventType, user, showToast]);

  const startBackgroundAnalysis = useCallback(async () => {
    if (!eventType || !cullingMode || cullingMode === 'manual') return;
    
    setShowAnalysisOverlay(true);
    await startAnalysis();
  }, [eventType, cullingMode, startAnalysis]);

  const resetWorkflow = useCallback(() => {
    setPhotos([]);
    setSelectedPhotos([]);
    setDuplicateClusters([]);
    setPersonGroups([]);
    setWorkflowStage('upload');
    setEventType(null);
    setCullingMode(null);
    setFilterOption('all');
    setCaptionFilter('');
    setStarRatingFilter({ min: null, max: null });
    setSelectedPersonGroup(null);
    setAnalysisProgress({ processed: 0, total: 0, currentPhoto: '' });
    setShowAnalysisOverlay(false);
    setCopyLookMode(false);
    setReferencePhoto(null);
    setCopyLookTargets([]);
  }, []);

  const findDuplicatesFunc = useCallback(async () => {
    if (photos.length === 0) {
      showToast('No photos to analyze for duplicates', 'warning');
      return;
    }

    setIsFindingDuplicates(true);
    try {
      const photosWithVectors = photos.filter(p => p.clip_vector && p.clip_vector.length > 0);
      
      if (photosWithVectors.length === 0) {
        showToast('Photos need to be analyzed first to find duplicates', 'warning');
        return;
      }

      const filenames = photosWithVectors.map(p => p.filename);
      const clipEmbeddings = photosWithVectors.map(p => p.clip_vector!);
      const phashes = photosWithVectors.map(p => p.phash || '');

      const clusters = await findDuplicatesAPI(filenames, clipEmbeddings, phashes);
      setDuplicateClusters(clusters);
      
      // Mark photos as duplicates
      const duplicateFilenames = new Set<string>();
      clusters.forEach(cluster => {
        duplicateFilenames.add(cluster.filename);
        cluster.clip_duplicates.forEach(filename => duplicateFilenames.add(filename));
        cluster.phash_duplicates.forEach(filename => duplicateFilenames.add(filename));
      });

      setPhotos(prev => prev.map(p => ({
        ...p,
        isDuplicate: duplicateFilenames.has(p.filename),
        tags: duplicateFilenames.has(p.filename) 
          ? [...(p.tags || []), 'duplicate'].filter((tag, index, arr) => arr.indexOf(tag) === index)
          : p.tags
      })));

      showToast(`Found ${clusters.length} duplicate groups`, 'success');
    } catch (error: any) {
      console.error('Find duplicates failed:', error);
      showToast(error.message || 'Failed to find duplicates', 'error');
    } finally {
      setIsFindingDuplicates(false);
    }
  }, [photos, showToast]);

  const groupPeopleByFaces = useCallback(() => {
    const photosWithFaces = photos.filter(p => p.faces && p.faces.length > 0);
    
    if (photosWithFaces.length === 0) {
      showToast('No faces detected in photos', 'warning');
      return;
    }

    // Group faces by same_person_group
    const groups: Record<string, PersonGroup> = {};
    
    photosWithFaces.forEach(photo => {
      photo.faces?.forEach(face => {
        if (face.same_person_group) {
          const groupId = face.same_person_group;
          
          if (!groups[groupId]) {
            groups[groupId] = {
              group_id: groupId,
              photos: [],
              faces: [],
              photo_count: 0
            };
          }
          
          if (!groups[groupId].photos.some(p => p.id === photo.id)) {
            groups[groupId].photos.push(photo);
            groups[groupId].photo_count++;
          }
          
          groups[groupId].faces.push(face);
        }
      });
    });

    // Set representative face for each group (highest quality)
    Object.values(groups).forEach(group => {
      const bestFace = group.faces.reduce((best, current) => 
        (current.face_quality || 0) > (best.face_quality || 0) ? current : best
      );
      group.representative_face = bestFace;
    });

    setPersonGroups(Object.values(groups));
  }, [photos, showToast]);

  const saveAlbumAndTrainAI = useCallback(async (albumTitle: string) => {
    if (!user?.email) {
      showToast('Please log in to save albums', 'error');
      return;
    }

    if (!eventType) {
      showToast('Please select an event type', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get approved photos (either selected or green labeled or backend approved)
      const approvedPhotos = photos.filter(p => 
        selectedPhotos.some(sp => sp.id === p.id) || 
        p.color_label === 'green' || 
        p.approved === true
      );

      if (approvedPhotos.length === 0) {
        showToast('No approved photos to save', 'warning');
        return;
      }

      const trainingData = {
        user_email: user.email,
        event: albumTitle,
        approved_paths: approvedPhotos.map(p => p.filename),
        ratings: approvedPhotos.map(p => p.ai_score || 0)
      };

      await saveAlbumAndTrain(trainingData);
      showToast(`Album "${albumTitle}" saved with ${approvedPhotos.length} photos!`, 'success');
      
    } catch (error: any) {
      console.error('Save album failed:', error);
      showToast(error.message || 'Failed to save album', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, eventType, photos, selectedPhotos, showToast]);

  // Copy Look functionality
  const toggleCopyLookTarget = useCallback((photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    setCopyLookTargets(prev => {
      const isAlreadyTarget = prev.some(target => target.id === photoId);
      if (isAlreadyTarget) {
        return prev.filter(target => target.id !== photoId);
      } else {
        return [...prev, photo];
      }
    });
  }, [photos]);

  const clearCopyLookTargets = useCallback(() => {
    setCopyLookTargets([]);
  }, []);

  // Album operations
  const createAlbum = useCallback((name: string, description?: string) => {
    const newAlbum: Album = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAlbums(prev => [...prev, newAlbum]);
    setCurrentAlbum(newAlbum);
  }, []);

  const deleteAlbum = useCallback((albumId: string) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId));
    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(null);
    }
    // Remove album association from photos
    setPhotos(prev => prev.map(p => 
      p.albumId === albumId 
        ? { ...p, albumId: undefined, albumName: undefined }
        : p
    ));
  }, [currentAlbum]);

  const updateAlbum = useCallback((albumId: string, updates: Partial<Album>) => {
    setAlbums(prev => prev.map(a => 
      a.id === albumId 
        ? { ...a, ...updates, updatedAt: new Date().toISOString() }
        : a
    ));
    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  }, [currentAlbum]);

  const addPhotosToAlbum = useCallback((photoIds: string[], albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (!album) return;

    setPhotos(prev => prev.map(p => 
      photoIds.includes(p.id)
        ? { ...p, albumId, albumName: album.name }
        : p
    ));
  }, [albums]);

  const removePhotosFromAlbum = useCallback((photoIds: string[], albumId: string) => {
    setPhotos(prev => prev.map(p => 
      photoIds.includes(p.id) && p.albumId === albumId
        ? { ...p, albumId: undefined, albumName: undefined }
        : p
    ));
  }, []);

  // Manual culling operations
  const markPhotoAsKeep = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, color_label: 'green' as ColorLabel }
        : p
    ));
  }, []);

  const markPhotoAsReject = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId 
        ? { ...p, color_label: 'red' as ColorLabel }
        : p
    ));
  }, []);

  const markDuplicateAsKeep = useCallback((filename: string, duplicateGroup: string[]) => {
    setPhotos(prev => prev.map(p => {
      if (duplicateGroup.includes(p.filename)) {
        if (p.filename === filename) {
          // Mark as keep
          return { ...p, color_label: 'green' as ColorLabel };
        } else {
          // Mark others as reject
          return { ...p, color_label: 'red' as ColorLabel };
        }
      }
      return p;
    }));
  }, []);

  const deleteDuplicateGroup = useCallback((duplicateGroup: string[]) => {
    setPhotos(prev => prev.filter(p => !duplicateGroup.includes(p.filename)));
  }, []);

  const value: PhotoContextType = {
    photos,
    filteredPhotos,
    duplicateClusters,
    personGroups,
    albums,
    currentAlbum,
    selectedPhotos,
    isLoading,
    isUploading,
    isAnalyzing,
    isFindingDuplicates,
    analysisProgress,
    showAnalysisOverlay,
    setShowAnalysisOverlay,
    
    // Workflow
    workflowStage,
    setWorkflowStage,
    eventType,
    setEventType,
    cullingMode,
    setCullingMode,
    
    // Filter state
    filterOption,
    setFilterOption,
    viewMode,
    setViewMode,
    captionFilter,
    setCaptionFilter,
    starRatingFilter,
    setStarRatingFilter,
    selectedPersonGroup,
    setSelectedPersonGroup,
    
    // Copy Look functionality
    copyLookMode,
    setCopyLookMode,
    referencePhoto,
    setReferencePhoto,
    copyLookTargets,
    toggleCopyLookTarget,
    clearCopyLookTargets,
    
    // Photo operations
    uploadPhotos,
    deletePhoto,
    cullPhoto,
    cullAllPhotos,
    togglePhotoSelection,
    selectAllPhotos,
    deselectAllPhotos,
    updatePhotoScore,
    updatePhotoUrl,
    updatePhotoColorLabel,
    
    // Analysis operations
    startAnalysis,
    startBackgroundAnalysis,
    resetWorkflow,
    
    // Advanced operations
    findDuplicates: findDuplicatesFunc,
    groupPeopleByFaces,
    saveAlbumAndTrainAI,
    
    // Album operations
    createAlbum,
    deleteAlbum,
    updateAlbum,
    addPhotosToAlbum,
    removePhotosFromAlbum,
    
    // Manual culling
    markPhotoAsKeep,
    markPhotoAsReject,
    markDuplicateAsKeep,
    deleteDuplicateGroup
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
};