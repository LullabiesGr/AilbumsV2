import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Photo, Filter, Album, ColorLabel, EventType, CullingMode, WorkflowStage, DuplicateCluster, PersonGroup } from '../types';
import { analyzePhotosSingle, deepAnalyzePhotosSingle, cullPhotos, findDuplicatesAPI } from '../lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface PhotoContextType {
  photos: Photo[];
  currentAlbumName: string;
  currentAlbumId: string;
  createNewAlbum: (albumName: string, eventType: EventType) => Promise<{ albumId: string; albumName: string }>;
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
  startAnalysis: (albumName?: string, eventType?: EventType) => Promise<void>;
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
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  setCurrentAlbumName: React.Dispatch<React.SetStateAction<string>>;
  setCurrentAlbumId: React.Dispatch<React.SetStateAction<string>>;
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
  const [currentAlbumName, setCurrentAlbumName] = useState<string>('');
  const [currentAlbumId, setCurrentAlbumId] = useState<string>('');
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
  const { user } = useAuth();

  const resetWorkflow = useCallback(() => {
    setPhotos([]);
    setCurrentAlbumName('');
    setCurrentAlbumId('');
    setCurrentAlbumName('');
    setCurrentAlbumId('');
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
  }, [showToast]);

  const createNewAlbum = useCallback(async (albumName: string, eventType: EventType) => {
    console.log('🏗️ createNewAlbum called with:', { albumName, eventType });
    
    if (!user?.email) {
      throw new Error('User email is required to create album');
    }
    
    try {
      const albumId = albumName.trim();
      console.log('📝 Using album ID:', albumId);
      
      // Create FormData for backend
      console.log('📡 Sending FormData to /create-album...');
      const formData = new FormData();
      formData.append('album_name', albumName.trim());
      formData.append('album_id', albumName.trim());
      formData.append('event_type', eventType);
      formData.append('user_id', user.email);
      
      console.log('📤 FormData contents:', {
        album_name: albumName.trim(),
        event_type: eventType,
        user_id: user.email,
        album_id: albumName.trim()
      });
      
      const response = await fetch('https://438aeaff2b7a.ngrok-free.app/create-album', {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      console.log('📥 Create album response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create album API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        });
        
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html>')) {
          throw new Error(`Backend endpoint not found. Check if /create-album exists.`);
        }
        
        throw new Error(`Failed to create album: ${response.status} ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 Create album response text:', responseText.substring(0, 500));
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Backend returned invalid JSON. Check backend implementation.');
      }
      
      console.log('✅ Create album successful:', result);
      
      // Update state with backend response
      setCurrentAlbumName(albumName);
      setCurrentAlbumId(albumName.trim());
      setEventType(eventType);
      
      console.log('✅ State updated successfully');
      showToast(`Album "${albumName}" created successfully!`, 'success');
      
      return { albumId: albumName.trim(), albumName };
    } catch (error: any) {
      console.error('❌ createNewAlbum failed:', {
        error: error.message || error,
        stack: error.stack,
        albumName,
        eventType
      });
      showToast(error.message || 'Failed to create album', 'error');
      throw error;
    }
  }, [showToast, setEventType, user?.email]);
  
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

    if (!user?.email) {
      showToast('User email is required for analysis', 'error');
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
            user.email, 
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
            2, // Concurrency limit
            currentAlbumId || 'temp-album' // Album ID
          );
          
          setPhotos(analyzedPhotos);
        } else {
          // Use parallel processing for fast analysis with real-time updates
          const analyzedPhotos = await analyzePhotosSingle(
            photos, 
            user.email, 
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
            2, // Concurrency limit
            currentAlbumId || albumName?.trim() || 'temp_album'
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
  }, [photos, eventType, cullingMode, showToast, groupPeopleByFaces, currentAlbumId, user?.email]);

  const startAnalysis = useCallback(async (albumName?: string, providedEventType?: EventType) => {
    if (!cullingMode || photos.length === 0) {
      showToast('Please select culling mode', 'error');
      return;
    }

    if (!user?.email) {
      showToast('User email is required for analysis', 'error');
      return;
    }

    // Use provided event type or fallback to context event type
    const analysisEventType = providedEventType || eventType;
    
    // For manual mode, skip analysis and go directly to review
    if (cullingMode === 'manual') {
      // Store album name even in manual mode
      if (albumName && albumName.trim()) {
        setCurrentAlbumName(albumName.trim());
        setCurrentAlbumId(albumName.trim());
      }
      setWorkflowStage('review');
      showToast('Manual review mode activated. Start reviewing your photos!', 'success');
      return;
    }

    if (!analysisEventType) {
      showToast('Please select event type for AI analysis', 'error');
      return;
    }

    // Store album name if provided
    if (albumName && albumName.trim()) {
      setCurrentAlbumName(albumName.trim());
      setCurrentAlbumId(albumName.trim());
    }
    
    // Set event type
    setEventType(analysisEventType);
    
    // Upload photos for LUT previews (parallel to analysis)
    if (albumName && albumName.trim()) {
      try {
        console.log('📤 Starting LUT preview generation...');
        const uploadPromises = photos.map(photo => 
          uploadPhotoForLUTPreviews(photo.file, albumName.trim(), user.email)
            .catch(error => {
              console.warn(`Failed to upload ${photo.filename} for LUT previews:`, error);
              return null;
            })
        );
        
        // Don't wait for LUT uploads to complete - run in background
        Promise.all(uploadPromises).then(results => {
          const successCount = results.filter(r => r !== null).length;
          console.log(`✅ LUT preview generation: ${successCount}/${photos.length} photos uploaded`);
        });
      } catch (error) {
        console.warn('LUT preview generation failed:', error);
        // Don't block analysis if LUT upload fails
      }
    }
    
    // Go to analyzing stage and start analysis
    setWorkflowStage('analyzing');
    setIsAnalyzing(true);
    setShowAnalysisOverlay(true);
    setAnalysisProgress({ processed: 0, total: photos.length, currentPhoto: '' });
    
    try {
      if (cullingMode === 'deep') {
        console.log('🧠 Starting deep analysis with real-time progress...');
        // Use deep analysis with real-time updates
        const analyzedPhotos = await deepAnalyzePhotosSingle(
          photos, 
          user.email, 
          analysisEventType,
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
          2, // Concurrency limit
          albumName?.trim() || currentAlbumId || 'temp_album'
        );
        
        setPhotos(analyzedPhotos);
        showToast('Deep analysis completed successfully!', 'success');
      } else {
        console.log('⚡ Starting fast analysis with real-time progress...');
        // Use fast analysis with real-time updates
        const analyzedPhotos = await analyzePhotosSingle(
          photos, 
          user.email, 
          analysisEventType,
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
          2, // Concurrency limit
          albumName?.trim() || currentAlbumId || 'temp_album'
        );
        
        setPhotos(analyzedPhotos);
        showToast('Fast analysis completed successfully!', 'success');
      }
      
      // After analysis, automatically group people by faces
      setTimeout(() => {
        groupPeopleByFaces();
      }, 500);
      
      // Go to review stage after completion
      setWorkflowStage('review');
      
      // Upload photos for LUT previews after analysis completes
      if (albumName && albumName.trim()) {
        try {
          console.log('📤 Starting LUT preview generation after analysis...');
          const uploadPromises = photos.map(photo => 
            uploadPhotoForLUTPreviews(photo.file, albumName.trim(), user.email)
              .catch(error => {
                console.warn(`Failed to upload ${photo.filename} for LUT previews:`, error);
                return null;
              })
          );
          
          Promise.all(uploadPromises).then(results => {
            const successCount = results.filter(r => r !== null).length;
            console.log(`✅ LUT preview generation complete: ${successCount}/${photos.length} photos uploaded`);
            showToast(`LUT previews generated for ${successCount} photos`, 'success');
          });
        } catch (error) {
          console.warn('LUT preview generation failed:', error);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Analysis failed:', error);
      showToast(
        cullingMode === 'deep' 
          ? 'Failed to perform deep analysis' 
          : 'Failed to perform fast analysis', 
        'error'
      );
      // Go back to upload stage on error
      setWorkflowStage('upload');
    } finally {
      setIsAnalyzing(false);
    }
  }, [cullingMode, photos, eventType, showToast, setWorkflowStage, startBackgroundAnalysis, user?.email]);

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

    if (!user?.email) {
      showToast('User email is required for analysis', 'error');
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
          user.email, 
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
          user.email, 
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
  }, [photos, eventType, cullingMode, showToast, groupPeopleByFaces, user?.email]);

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
  }, []);

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

  const selectedPhotos = useMemo(() => {
    return photos.filter(photo => photo.selected);
  }, [photos]);

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

  const saveAlbumAndTrainAI = useCallback(async (albumTitle: string) => {
    try {
      const trimmedAlbumTitle = albumTitle.trim();
      if (!trimmedAlbumTitle) {
        throw new Error('Album title cannot be empty');
      }
      
      console.log('saveAlbumAndTrainAI called with title:', albumTitle);
      console.log('Current photos:', photos.length);
      console.log('Selected photos:', selectedPhotos.length);
      console.log('Event type:', eventType);
      
      if (!user?.email) {
        throw new Error('User email is required for album creation');
      }
      
      if (!eventType) {
        throw new Error('Event type is required for album creation');
      }

      // Get all photos that should be included in the album
      let photosToInclude = [];
      
      // Priority 1: Selected photos
      if (selectedPhotos.length > 0) {
        console.log('Using selected photos:', selectedPhotos.length);
        photosToInclude.push(...selectedPhotos);
      } else {
        // Priority 2: Green labeled photos (user approved)
        const greenPhotos = photos.filter(p => p.color_label === 'green');
        if (greenPhotos.length > 0) {
          console.log('Using green labeled photos:', greenPhotos.length);
          photosToInclude.push(...greenPhotos);
        } else {
          // Priority 3: Backend approved photos
          const backendApproved = photos.filter(p => p.approved === true);
          if (backendApproved.length > 0) {
            console.log('Using backend approved photos:', backendApproved.length);
            photosToInclude.push(...backendApproved);
          } else {
            // Fallback: ALL PHOTOS (don't filter by score)
            console.log('Using ALL photos as fallback:', photos.length);
            photosToInclude.push(...photos);
          }
        }
      }
      
      // Remove duplicates by ID
      const uniquePhotos = photosToInclude.filter((photo, index, self) => 
        self.findIndex(p => p.id === photo.id) === index
      );
      
      console.log('Final photos to include:', uniquePhotos.length);
      
      if (uniquePhotos.length === 0) {
        throw new Error('No photos selected or approved for album creation');
      }

      // Use FormData to send files to backend for local path storage
      const formData = new FormData();
      
      // Add album basic info
      const albumTitle_final = trimmedAlbumTitle; // Use the user-provided title directly
      const albumDescription = `Album created on ${new Date().toLocaleDateString()} with ${uniquePhotos.length} photos`;
      
      formData.append('user_id', user.email);
      formData.append('album_name', albumTitle_final); // Send as album_name
      formData.append('title', albumTitle_final);
      formData.append('description', albumDescription);
      formData.append('event_type', eventType);
      
      // Add album metadata as JSON
      const albumMetadata = {
        user_id: user.email,
        name: albumTitle_final, // Store user-provided name in metadata
        title: albumTitle_final, // Also store as title for compatibility
        photos: uniquePhotos.map(photo => photo.filename), // Array of ALL filenames - FIXED
        culling_mode: cullingMode || 'fast',
        analysis_complete: photos.some(p => p.ai_score > 0),
        original_total_photos: photos.length,
        album_photos_count: uniquePhotos.length,
        selected_photos: selectedPhotos.length,
        approved_photos: uniquePhotos.filter(p => p.approved || p.color_label === 'green').length,
        backend_approved: uniquePhotos.filter(p => p.approved === true).length,
        high_score_photos: uniquePhotos.filter(p => p.ai_score >= 7).length,
        event_highlights: uniquePhotos.filter(p => p.blip_highlights && p.blip_highlights.length > 0).length,
        faces_detected: uniquePhotos.filter(p => p.faces && p.faces.length > 0).length,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
        creation_source: 'ailbums_web_app'
      };
      formData.append('metadata', JSON.stringify(albumMetadata));
      
      // Add photo files and their metadata
      uniquePhotos.forEach((photo, index) => {
        // Add each photo file with unique key for backend to receive all files
        formData.append(`file_${index}`, photo.file);
        
        // Add photo metadata as separate JSON string
        const photoMetadata = {
          filename: photo.filename,
          ai_score: photo.ai_score || 0,
          basic_score: photo.basic_score,
          ml_score: photo.ml_score,
          score_type: photo.score_type || 'base',
          blur_score: photo.blur_score,
          approved: photo.approved || photo.color_label === 'green',
          color_label: photo.color_label,
          tags: photo.tags || [],
          blip_highlights: photo.blip_highlights || [],
          blip_flags: photo.blip_flags || [],
          faces: photo.faces || [],
          caption: photo.caption,
          face_summary: photo.face_summary,
          deep_prompts: photo.deep_prompts || {},
          ai_categories: photo.ai_categories || [],
          // Keep vectors for similarity analysis
          clip_vector: photo.clip_vector,
          phash: photo.phash,
          dateCreated: photo.dateCreated,
          // Edit tracking
          edited_versions: {
            autocorrect: false,
            autofix: false,
            face_retouch: false,
            ai_edit: false
          }
        };
        
        // Add as photo_metadata_0, photo_metadata_1, etc.
        formData.append(`photo_metadata_${index}`, JSON.stringify(photoMetadata));
      });
      
      console.log('Sending FormData to backend with:', {
        title: albumTitle_final,
        event_type: eventType,
        files_count: uniquePhotos.length,
        metadata_keys: Object.keys(albumMetadata),
        first_file_name: uniquePhotos[0]?.file?.name,
        first_file_size: uniquePhotos[0]?.file?.size,
        sample_photo_metadata: {
          filename: uniquePhotos[0]?.filename,
          ai_score: uniquePhotos[0]?.ai_score,
          approved: uniquePhotos[0]?.approved || uniquePhotos[0]?.color_label === 'green',
          tags_count: uniquePhotos[0]?.tags?.length || 0,
          highlights_count: uniquePhotos[0]?.blip_highlights?.length || 0,
          faces_count: uniquePhotos[0]?.faces?.length || 0
        }
      });
      
      // Send FormData to backend
      const response = await fetch('https://438aeaff2b7a.ngrok-free.app/save-album', {
        method: 'POST',
        body: formData, // FormData automatically sets correct Content-Type
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save album API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(errorText || 'Failed to save album');
      }
      
      const result = await response.json();
      console.log('Album saved successfully:', result);
      
      showToast(`Άλμπουμ "${albumTitle_final}" αποθηκεύτηκε επιτυχώς με ${uniquePhotos.length} φωτογραφίες!`, 'success');
      
      // Optional: Clear selections after successful save
      deselectAllPhotos();
      
    } catch (error: any) {
      console.error('Failed to save album:', error);
      showToast(error.message || 'Αποτυχία αποθήκευσης άλμπουμ', 'error');
    }
  }, [photos, selectedPhotos, eventType, cullingMode, showToast, deselectAllPhotos, user?.email]);

  // Legacy function for backward compatibility
  const saveAlbumAndTrainAILegacy = useCallback(async (event: string) => {
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

  const value: PhotoContextType = useMemo(() => ({
    photos,
    currentAlbumName,
    currentAlbumId,
    createNewAlbum,
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
    deleteDuplicateGroup,
    setPhotos,
    setCurrentAlbumName,
    setCurrentAlbumId
  }), [
    photos,
    currentAlbumName,
    currentAlbumId,
    createNewAlbum,
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
    deleteDuplicateGroup,
    setPhotos,
    setCurrentAlbumName,
    setCurrentAlbumId
  ]);

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};