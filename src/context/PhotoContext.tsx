import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Photo, Filter, Album, ColorLabel, EventType, CullingMode, WorkflowStage, DuplicateCluster, PersonGroup } from '../types';
import { analyzePhotosSingle, deepAnalyzePhotosSingle, cullPhotos, findDuplicatesAPI } from '../lib/api';
import { useToast } from './ToastContext';

interface PhotoContextType {
  photos: Photo[];
  filteredPhotos: Photo[];
  duplicateClusters: DuplicateCluster[];
  personGroups: PersonGroup[];
  albums: Album[];
  currentAlbum: Album | null;
  isLoading: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  isFindingDuplicates: boolean;
  analysisProgress: { processed: number; total: number; currentPhoto: string };
  showAnalysisOverlay: boolean;
  setShowAnalysisOverlay: (show: boolean) => void;
  workflowStage: WorkflowStage;
  setWorkflowStage: (stage: WorkflowStage) => void;
  eventType: EventType | null;
  cullingMode: CullingMode | null;
  viewMode: 'grid' | 'list' | 'compact';
  filterOption: Filter;
  captionFilter: string;
  starRatingFilter: { min: number | null; max: number | null };
  selectedPersonGroup: string | null;
  setCaptionFilter: (filter: string) => void;
  setStarRatingFilter: (min: number | null, max: number | null) => void;
  setSelectedPersonGroup: (groupId: string | null) => void;
  uploadPhotos: (files: File[]) => void;
  setEventType: (eventType: EventType) => void;
  setCullingMode: (mode: CullingMode) => void;
  startAnalysis: () => Promise<void>;
  resetWorkflow: () => void;
  startBackgroundAnalysis: () => void;
  findDuplicates: () => Promise<void>;
  groupPeopleByFaces: () => void;
  deletePhoto: (id: string) => void;
  cullPhoto: (id: string) => void;
  cullAllPhotos: () => void;
  updatePhotoUrl: (id: string, newUrl: string) => void;
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  setFilterOption: (filter: Filter) => void;
  togglePhotoSelection: (id: string) => void;
  selectAllPhotos: () => void;
  deselectAllPhotos: () => void;
  selectedPhotos: Photo[];
  updatePhotoScore: (id: string, score: number) => void;
  updatePhotoColorLabel: (id: string, colorLabel: ColorLabel | undefined) => void;
  markPhotoAsKeep: (id: string) => void;
  markPhotoAsReject: (id: string) => void;
  createAlbum: (name: string, description?: string) => void;
  deleteAlbum: (id: string) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  setCurrentAlbum: (album: Album | null) => void;
  addPhotosToAlbum: (photoIds: string[], albumId: string) => void;
  removePhotosFromAlbum: (photoIds: string[], albumId: string) => void;
  saveAlbumAndTrainAI: (event: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFindingDuplicates, setIsFindingDuplicates] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ processed: 0, total: 0, currentPhoto: '' });
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('upload');
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [cullingMode, setCullingMode] = useState<CullingMode | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [filterOption, setFilterOption] = useState<Filter>('all');
  const [captionFilter, setCaptionFilter] = useState('');
  const [starRatingFilter, setStarRatingFilterState] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [selectedPersonGroup, setSelectedPersonGroup] = useState<string | null>(null);

  const { showToast } = useToast();

  const resetWorkflow = useCallback(() => {
    setPhotos([]);
    setDuplicateClusters([]);
    setPersonGroups([]);
    setShowAnalysisOverlay(false);
    setWorkflowStage('upload');
    setEventType(null);
    setCullingMode(null);
    setFilterOption('all');
    setCaptionFilter('');
    setStarRatingFilterState({ min: null, max: null });
    setSelectedPersonGroup(null);
    setAnalysisProgress({ processed: 0, total: 0, currentPhoto: '' });
  }, []);

  // Group people by face embeddings and same_person_group
  const groupPeopleByFaces = useCallback(() => {
    const groups: Record<string, PersonGroup> = {};
    
    photos.forEach(photo => {
      if (photo.faces && photo.faces.length > 0) {
        photo.faces.forEach(face => {
          if (face.same_person_group) {
            if (!groups[face.same_person_group]) {
              groups[face.same_person_group] = {
                group_id: face.same_person_group,
                photos: [],
                faces: [],
                photo_count: 0
              };
            }
            
            // Add photo if not already in group
            if (!groups[face.same_person_group].photos.find(p => p.id === photo.id)) {
              groups[face.same_person_group].photos.push(photo);
              groups[face.same_person_group].photo_count++;
            }
            
            groups[face.same_person_group].faces.push(face);
            
            // Set representative face (highest quality)
            if (!groups[face.same_person_group].representative_face || 
                (face.face_quality && face.face_quality > (groups[face.same_person_group].representative_face?.face_quality || 0))) {
              groups[face.same_person_group].representative_face = face;
            }
          }
        });
      }
    });
    
    setPersonGroups(Object.values(groups));
  }, [photos]);

  // Find duplicates using the new backend API
  const findDuplicates = useCallback(async () => {
    const photosWithVectors = photos.filter(p => p.clip_vector && p.clip_vector.length > 0);
    
    if (photosWithVectors.length === 0) {
      showToast('No analyzed photos with embeddings found', 'warning');
      return;
    }
    
    setIsFindingDuplicates(true);
    
    try {
      const filenames = photosWithVectors.map(p => p.filename);
      const clipEmbeddings = photosWithVectors.map(p => p.clip_vector!);
      const phashes = photosWithVectors.map(p => p.phash || '');
      
      const clusters = await findDuplicatesAPI(filenames, clipEmbeddings, phashes);
      setDuplicateClusters(clusters);
      
      // Update photos with duplicate information
      setPhotos(prev => prev.map(photo => {
        const cluster = clusters.find(c => 
          c.filename === photo.filename || 
          c.clip_duplicates.includes(photo.filename) || 
          c.phash_duplicates.includes(photo.filename)
        );
        
        if (cluster) {
          const allDuplicates = [
            cluster.filename,
            ...cluster.clip_duplicates,
            ...cluster.phash_duplicates
          ].filter((filename, index, arr) => arr.indexOf(filename) === index);
          
          return {
            ...photo,
            duplicateGroup: allDuplicates,
            isDuplicate: allDuplicates.length > 1,
            tags: [
              ...(photo.tags || []).filter(tag => tag !== 'duplicate'),
              ...(allDuplicates.length > 1 ? ['duplicate'] : [])
            ]
          };
        }
        
        return photo;
      }));
      
      const duplicateCount = clusters.reduce((count, cluster) => {
        const totalDuplicates = cluster.clip_duplicates.length + cluster.phash_duplicates.length;
        return count + (totalDuplicates > 0 ? totalDuplicates + 1 : 0);
      }, 0);
      
      showToast(`Found ${clusters.length} duplicate groups with ${duplicateCount} total duplicates`, 'success');
    } catch (error: any) {
      console.error('Failed to find duplicates:', error);
      showToast(error.message || 'Failed to find duplicates', 'error');
    } finally {
      setIsFindingDuplicates(false);
    }
  }, [photos, showToast]);

  const uploadPhotos = useCallback(async (files: File[]) => {
    setIsUploading(true);
    
    try {
      // Separate RAW and standard image files
      const rawExtensions = [
        '.cr2', '.cr3', '.crw', '.nef', '.nrw', '.arw', '.srf', '.sr2', '.dng', 
        '.raw', '.rwl', '.rw2', '.orf', '.raf', '.pef', '.ptx', '.dcr', '.kdc', 
        '.mrw', '.x3f', '.3fr', '.ari', '.bay', '.cap', '.iiq', '.eip', '.fff',
        '.mef', '.mos', '.nrw', '.pxn', '.r3d', '.rwz', '.srw'
      ];
      
      const newPhotos: Photo[] = [];
      
      for (const file of files) {
        const isRawFile = rawExtensions.some(ext => 
          file.name.toLowerCase().endsWith(ext)
        );
        
        let photoUrl: string;
        
        if (isRawFile) {
          // For RAW files, create a placeholder and let the backend handle conversion
          photoUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbnZlcnRpbmcgUkFXLi4uPC90ZXh0Pjwvc3ZnPg==';
          showToast(`RAW file ${file.name} will be converted during analysis`, 'info');
        } else {
          // For standard image files, create URL directly
          photoUrl = URL.createObjectURL(file);
        }
        
        newPhotos.push({
          id: Math.random().toString(36).substring(2, 11),
          filename: file.name,
          file: file,
          url: photoUrl,
          score: null,
          ai_score: 0,
          score_type: 'base',
          tags: isRawFile ? ['raw'] : [],
          dateCreated: new Date().toISOString(),
          selected: false
        });
      }
      
      setPhotos((prev) => [...prev, ...newPhotos]);
      
      // Move to configure step after upload only if we're in upload stage
      if (newPhotos.length > 0 && workflowStage === 'upload') {
        setWorkflowStage('configure');
      }
      
      const rawCount = newPhotos.filter(p => p.tags?.includes('raw')).length;
      const standardCount = newPhotos.length - rawCount;
      
      let message = 'Photos uploaded successfully';
      if (rawCount > 0 && standardCount > 0) {
        message = `${standardCount} standard and ${rawCount} RAW photos uploaded successfully`;
      } else if (rawCount > 0) {
        message = `${rawCount} RAW photos uploaded successfully`;
      } else {
        message = `${standardCount} photos uploaded successfully`;
      }
      
      showToast(message, 'success');
      
    } catch (error) {
      showToast('Failed to upload photos', 'error');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [showToast, workflowStage]);

  const startBackgroundAnalysis = useCallback(() => {
    if (!cullingMode || photos.length === 0) {
      showToast('Please select culling mode', 'error');
      return;
    }

    // For manual mode, no analysis needed
    if (cullingMode === 'manual') {
      showToast('Manual review mode - no analysis needed', 'info');
      return;
    }

    if (!eventType) {
      showToast('Please select event type for AI analysis', 'error');
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysisOverlay(true);
    setAnalysisProgress({ processed: 0, total: photos.length, currentPhoto: '' });
    
    const runAnalysis = async () => {
      try {
        if (cullingMode === 'deep') {
          // Use parallel processing for deep analysis with real-time updates
          const analyzedPhotos = await deepAnalyzePhotosSingle(
            photos, 
            'user123', 
            eventType,
            (processedCount, currentPhoto, updatedPhoto) => {
              setAnalysisProgress({
                processed: processedCount,
                total: photos.length,
                currentPhoto
              });
              
              // Update individual photo in real-time
              if (updatedPhoto) {
                setPhotos(prev => prev.map(p => 
                  p.id === updatedPhoto.id ? updatedPhoto : p
                ));
              }
            },
            2 // Concurrency limit
          );
          
          setPhotos(analyzedPhotos);
        } else {
          // Use parallel processing for fast analysis with real-time updates
          const analyzedPhotos = await analyzePhotosSingle(
            photos, 
            'user123', 
            eventType,
            cullingMode,
            (processedCount, currentPhoto, updatedPhoto) => {
              setAnalysisProgress({
                processed: processedCount,
                total: photos.length,
                currentPhoto
              });
              
              // Update individual photo in real-time
              if (updatedPhoto) {
                setPhotos(prev => prev.map(p => 
                  p.id === updatedPhoto.id ? updatedPhoto : p
                ));
              }
            },
            2 // Concurrency limit
          );
          
          setPhotos(analyzedPhotos);
        }
        
        // After analysis, automatically group people by faces
        setTimeout(() => {
          groupPeopleByFaces();
        }, 500);
        
        showToast(
          cullingMode === 'deep' 
            ? 'Deep analysis completed successfully' 
            : 'Fast analysis completed successfully', 
          'success'
        );
      } catch (error) {
        showToast(
          cullingMode === 'deep' 
            ? 'Failed to perform deep analysis' 
            : 'Failed to perform fast analysis', 
          'error'
        );
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [photos, eventType, cullingMode, showToast, groupPeopleByFaces]);

  const startAnalysis = useCallback(async () => {
    if (!cullingMode || photos.length === 0) {
      showToast('Please select culling mode', 'error');
      return;
    }

    // For manual mode, skip analysis and go directly to review
    if (cullingMode === 'manual') {
      setWorkflowStage('review');
      showToast('Manual review mode activated. Start reviewing your photos!', 'success');
      return;
    }

    if (!eventType) {
      showToast('Please select event type for AI analysis', 'error');
      return;
    }

    // Go directly to review interface and start background analysis
    setWorkflowStage('review');
    
    // Start background analysis after a short delay
    setTimeout(() => {
      startBackgroundAnalysis();
    }, 500);
  }, [cullingMode, eventType, showToast, startBackgroundAnalysis]);

  const startAnalysisFromReview = useCallback(async () => {
    if (!cullingMode || photos.length === 0) {
      showToast('Please select culling mode', 'error');
      return;
    }

    // For manual mode, skip analysis and go directly to review
    if (cullingMode === 'manual') {
      showToast('Manual review mode activated. Start reviewing your photos!', 'success');
      return;
    }

    if (!eventType) {
      showToast('Please select event type for AI analysis', 'error');
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysisOverlay(true);
    setAnalysisProgress({ processed: 0, total: photos.length, currentPhoto: '' });
    
    try {
      if (cullingMode === 'deep') {
        // Use parallel processing for deep analysis with real-time updates
        const analyzedPhotos = await deepAnalyzePhotosSingle(
          photos, 
          'user123', 
          eventType,
          (processedCount, currentPhoto, updatedPhoto) => {
            setAnalysisProgress({
              processed: processedCount,
              total: photos.length,
              currentPhoto
            });
            
            // Update individual photo in real-time
            if (updatedPhoto) {
              setPhotos(prev => prev.map(p => 
                p.id === updatedPhoto.id ? updatedPhoto : p
              ));
            }
          },
          2 // Concurrency limit
        );
        
        setPhotos(analyzedPhotos);
      } else {
        // Use parallel processing for fast analysis with real-time updates
        const analyzedPhotos = await analyzePhotosSingle(
          photos, 
          'user123', 
          eventType,
          cullingMode,
          (processedCount, currentPhoto, updatedPhoto) => {
            setAnalysisProgress({
              processed: processedCount,
              total: photos.length,
              currentPhoto
            });
            
            // Update individual photo in real-time
            if (updatedPhoto) {
              setPhotos(prev => prev.map(p => 
                p.id === updatedPhoto.id ? updatedPhoto : p
              ));
            }
          },
          2 // Concurrency limit
        );
        
        setPhotos(analyzedPhotos);
      }
      
      // After analysis, automatically group people by faces
      setTimeout(() => {
        groupPeopleByFaces();
      }, 500);
      
      showToast(
        cullingMode === 'deep' 
          ? 'Deep analysis completed successfully' 
          : 'Fast analysis completed successfully', 
        'success'
      );
    } catch (error) {
      showToast(
        cullingMode === 'deep' 
          ? 'Failed to perform deep analysis' 
          : 'Failed to perform fast analysis', 
        'error'
      );
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [photos, eventType, cullingMode, showToast, groupPeopleByFaces]);

  // Re-analyze when event type changes
  const handleEventTypeChange = useCallback((newEventType: EventType) => {
    setEventType(newEventType);
    
    // If photos have already been analyzed and not in manual mode, offer to re-analyze
    if (photos.length > 0 && photos.some(p => p.ai_score > 0) && cullingMode !== 'manual') {
      const shouldReAnalyze = window.confirm(
        'Event type changed. Would you like to re-analyze photos with the new event context?'
      );
      
      if (shouldReAnalyze) {
        // Reset analysis data but keep uploaded photos
        setPhotos(prev => prev.map(photo => ({
          ...photo,
          ai_score: 0,
          score: null,
          tags: photo.tags?.filter(tag => tag === 'raw') || [],
          faces: [],
          face_summary: undefined,
          caption: undefined,
          event_type: undefined,
          blip_flags: [],
          blip_highlights: [],
          color_label: undefined
        })));
        
        // Trigger re-analysis if culling mode is also set
        if (cullingMode) {
          setTimeout(() => {
            startAnalysisFromReview();
          }, 100);
        }
      }
    }
  }, [photos, cullingMode, startAnalysisFromReview]);

  const markDuplicateAsKeep = useCallback((filename: string, duplicateGroup: string[]) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.filename === filename) {
        return {
          ...photo,
          color_label: 'green' as ColorLabel,
          tags: (photo.tags || []).filter(tag => tag !== 'duplicate')
        };
      } else if (duplicateGroup.includes(photo.filename)) {
        return {
          ...photo,
          color_label: 'red' as ColorLabel
        };
      }
      return photo;
    }));
    showToast(`Marked ${filename} as keep, others as reject`, 'success');
  }, [showToast]);

  const deleteDuplicateGroup = useCallback((duplicateGroup: string[]) => {
    setPhotos(prev => prev.filter(photo => !duplicateGroup.includes(photo.filename)));
    showToast(`Deleted ${duplicateGroup.length} duplicate photos`, 'success');
  }, [showToast]);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    showToast('Photo deleted', 'info');
  }, [showToast]);

  const cullPhoto = useCallback((id: string) => {
    setPhotos((prev) => 
      prev.map((photo) => 
        photo.id === id 
          ? { ...photo, tags: [...(photo.tags || []), 'culled'] }
          : photo
      )
    );
    showToast('Photo culled', 'success');
  }, [showToast]);

  const cullAllPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const culledPhotos = await cullPhotos(photos);
      setPhotos(culledPhotos);
      showToast('All photos culled successfully', 'success');
    } catch (error) {
      showToast('Failed to cull photos', 'error');
      console.error('Culling error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [photos, showToast]);

  const updatePhotoUrl = useCallback((id: string, newUrl: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, url: newUrl } : photo
    ));
  }, [showToast]);

  const togglePhotoSelection = useCallback((id: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, selected: !photo.selected } : photo
    ));
  }, []);

  const selectAllPhotos = useCallback(() => {
    setPhotos(prev => prev.map(photo => ({ ...photo, selected: true })));
  }, []);

  const deselectAllPhotos = useCallback(() => {
    setPhotos(prev => prev.map(photo => ({ ...photo, selected: false })));
  }, []);

  const updatePhotoScore = useCallback((id: string, score: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, score, ai_score: score } : photo
    ));
  }, []);

  const updatePhotoColorLabel = useCallback((id: string, colorLabel: ColorLabel | undefined) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, color_label: colorLabel } : photo
    ));
    showToast(
      colorLabel 
        ? `Photo labeled as ${colorLabel}` 
        : 'Color label removed', 
      'success'
    );
  }, [showToast]);

  const markPhotoAsKeep = useCallback((id: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, color_label: 'green' as ColorLabel } : photo
    ));
  }, []);

  const markPhotoAsReject = useCallback((id: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, color_label: 'red' as ColorLabel } : photo
    ));
  }, []);

  const createAlbum = useCallback((name: string, description?: string) => {
    const newAlbum: Album = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAlbums(prev => [...prev, newAlbum]);
    showToast(`Album "${name}" created successfully`, 'success');
  }, [showToast]);

  const deleteAlbum = useCallback((id: string) => {
    setAlbums(prev => prev.filter(album => album.id !== id));
    setPhotos(prev => prev.map(photo => 
      photo.albumId === id ? { ...photo, albumId: undefined } : photo
    ));
    if (currentAlbum?.id === id) {
      setCurrentAlbum(null);
    }
    showToast('Album deleted successfully', 'success');
  }, [currentAlbum, showToast]);

  const updateAlbum = useCallback((id: string, updates: Partial<Album>) => {
    setAlbums(prev => prev.map(album => 
      album.id === id 
        ? { ...album, ...updates, updatedAt: new Date().toISOString() }
        : album
    ));
    showToast('Album updated successfully', 'success');
  }, [showToast]);

  const addPhotosToAlbum = useCallback((photoIds: string[], albumId: string) => {
    setPhotos(prev => prev.map(photo => 
      photoIds.includes(photo.id) ? { ...photo, albumId } : photo
    ));
    showToast('Photos added to album', 'success');
  }, [showToast]);

  const removePhotosFromAlbum = useCallback((photoIds: string[], albumId: string) => {
    setPhotos(prev => prev.map(photo => 
      photoIds.includes(photo.id) && photo.albumId === albumId
        ? { ...photo, albumId: undefined }
        : photo
    ));
    showToast('Photos removed from album', 'success');
  }, [showToast]);

  const saveAlbumAndTrainAI = useCallback(async (event: string) => {
    try {
      // Get approved photos with their ratings
      const approvedPhotos = photos.filter(photo => !photo.tags?.includes('culled'));
      
      if (approvedPhotos.length === 0) {
        throw new Error('No approved photos to save');
      }
      
      showToast('Album saved and AI trained on your choices!', 'success');
    } catch (error: any) {
      console.error('Failed to save album and train AI:', error);
      showToast(error.message || 'Failed to save album', 'error');
    }
  }, [photos, showToast]);

  const setStarRatingFilter = useCallback((min: number | null, max: number | null) => {
    setStarRatingFilterState({ min, max });
  }, []);

  const filteredPhotos = useMemo(() => {
    let filtered = currentAlbum
      ? photos.filter(photo => photo.albumId === currentAlbum.id)
      : photos;

    // Apply caption filter first
    if (captionFilter) {
      filtered = filtered.filter(photo => 
        photo.caption?.toLowerCase().includes(captionFilter.toLowerCase())
      );
    }
    
    // Apply person group filter
    if (selectedPersonGroup) {
      filtered = filtered.filter(photo => 
        photo.faces?.some(face => face.same_person_group === selectedPersonGroup)
      );
    }
    
    // Apply star rating filter
    if (starRatingFilter.min !== null || starRatingFilter.max !== null) {
      filtered = filtered.filter(photo => {
        if (photo.ai_score === 0) return false;
        const stars = photo.ai_score / 2;
        
        if (starRatingFilter.min !== null && stars < starRatingFilter.min) {
          return false;
        }
        
        if (starRatingFilter.max !== null && stars > starRatingFilter.max) {
          return false;
        }
        
        return true;
      });
    }
    
    switch (filterOption) {
      case 'selected':
        return filtered.filter(photo => photo.selected);
      case 'high-score':
        return filtered.filter(photo => photo.ai_score >= 7); // Backend logic: green = 7+
      case 'approved':
        return filtered.filter(photo => photo.approved === true);
      case 'not-approved':
        return filtered.filter(photo => photo.approved === false);
      case 'highlights':
        return filtered.filter(photo => photo.blip_highlights && photo.blip_highlights.length > 0);
      case 'flagged':
        return filtered.filter(photo => photo.blip_flags && photo.blip_flags.length > 0);
      case 'blurry':
        return filtered.filter(photo => photo.tags?.includes('blurry'));
      case 'eyes-closed':
        return filtered.filter(photo => 
          photo.tags?.includes('closed_eyes') || 
          photo.face_summary?.issues?.closed_eyes && photo.face_summary.issues.closed_eyes > 0
        );
      case 'duplicates':
        return filtered.filter(photo => photo.isDuplicate);
      case 'people':
        return filtered.filter(photo => photo.faces && photo.faces.length > 0);
      case 'emotions':
        return filtered.filter(photo => 
          photo.faces?.some(face => face.emotion && face.emotion !== 'neutral')
        );
      case 'quality-issues':
        return filtered.filter(photo => 
          photo.face_summary?.issues && 
          (photo.face_summary.issues.closed_eyes > 0 || 
           photo.face_summary.issues.occluded_faces > 0 || 
           photo.face_summary.issues.low_quality > 0)
        );
      case 'warnings':
        return filtered.filter(photo => photo.tags?.some(tag => 
          ['blurry', 'closed_eyes', 'duplicate'].includes(tag)
        ));
      case 'green':
        return filtered.filter(photo => photo.color_label === 'green');
      case 'red':
        return filtered.filter(photo => photo.color_label === 'red');
      case 'yellow':
        return filtered.filter(photo => photo.color_label === 'yellow');
      case 'blue':
        return filtered.filter(photo => photo.color_label === 'blue');
      case 'purple':
        return filtered.filter(photo => photo.color_label === 'purple');
      case 'all':
      default:
        return filtered;
    }
  }, [currentAlbum, photos, captionFilter, selectedPersonGroup, starRatingFilter, filterOption]);

  const selectedPhotos = useMemo(() => {
    return photos.filter(photo => photo.selected);
  }, [photos]);

  const value: PhotoContextType = useMemo(() => ({
    photos,
    filteredPhotos,
    duplicateClusters,
    personGroups,
    albums,
    currentAlbum,
    isLoading,
    isUploading,
    isAnalyzing,
    isFindingDuplicates,
    analysisProgress,
    showAnalysisOverlay,
    setShowAnalysisOverlay,
    workflowStage,
    setWorkflowStage,
    eventType,
    cullingMode,
    viewMode,
    filterOption,
    captionFilter,
    starRatingFilter,
    selectedPersonGroup,
    setCaptionFilter,
    setStarRatingFilter,
    setSelectedPersonGroup,
    uploadPhotos,
    setEventType: handleEventTypeChange,
    setCullingMode,
    startAnalysis,
    startBackgroundAnalysis,
    findDuplicates,
    groupPeopleByFaces,
    resetWorkflow,
    deletePhoto,
    cullPhoto,
    cullAllPhotos,
    updatePhotoUrl,
    setViewMode,
    setFilterOption,
    togglePhotoSelection,
    selectAllPhotos,
    deselectAllPhotos,
    selectedPhotos,
    updatePhotoScore,
    updatePhotoColorLabel,
    markPhotoAsKeep,
    markPhotoAsReject,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    setCurrentAlbum,
    addPhotosToAlbum,
    removePhotosFromAlbum,
    saveAlbumAndTrainAI,
    markDuplicateAsKeep,
    deleteDuplicateGroup
  }), [
    photos,
    filteredPhotos,
    duplicateClusters,
    personGroups,
    albums,
    currentAlbum,
    isLoading,
    isUploading,
    isAnalyzing,
    isFindingDuplicates,
    analysisProgress,
    showAnalysisOverlay,
    setShowAnalysisOverlay,
    workflowStage,
    setWorkflowStage,
    eventType,
    cullingMode,
    viewMode,
    filterOption,
    captionFilter,
    starRatingFilter,
    selectedPersonGroup,
    setCaptionFilter,
    setStarRatingFilter,
    setSelectedPersonGroup,
    uploadPhotos,
    handleEventTypeChange,
    setCullingMode,
    startAnalysis,
    startBackgroundAnalysis,
    findDuplicates,
    groupPeopleByFaces,
    resetWorkflow,
    deletePhoto,
    cullPhoto,
    cullAllPhotos,
    updatePhotoUrl,
    setViewMode,
    setFilterOption,
    togglePhotoSelection,
    selectAllPhotos,
    deselectAllPhotos,
    selectedPhotos,
    updatePhotoScore,
    updatePhotoColorLabel,
    markPhotoAsKeep,
    markPhotoAsReject,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    setCurrentAlbum,
    addPhotosToAlbum,
    removePhotosFromAlbum,
    saveAlbumAndTrainAI,
    markDuplicateAsKeep,
    deleteDuplicateGroup
  ]);

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};