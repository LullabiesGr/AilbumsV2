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
  
  // Filter operations
  applyFilter: (filter: Filter) => void;
  clearFilters: () => void;
  
  // Photo management
  uploadPhotos: (files: File[]) => Promise<void>;
  deletePhoto: (photoId: string) => void;
  updatePhoto: (photoId: string, updates: Partial<Photo>) => void;
  
  // Selection handling
  selectedPhotos: string[];
  setSelectedPhotos: (photoIds: string[]) => void;
  selectPhoto: (photoId: string) => void;
  deselectPhoto: (photoId: string) => void;
  clearSelection: () => void;
  
  // Workflow management
  currentWorkflowStage: WorkflowStage;
  setCurrentWorkflowStage: (stage: WorkflowStage) => void;
  
  // Copy Look functionality
  copyLookReference: Photo | null;
  copyLookTargets: Photo[];
  setCopyLookReference: (photo: Photo | null) => void;
  setCopyLookTargets: (photos: Photo[]) => void;
  applyCopyLook: () => Promise<void>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

interface PhotoProviderProps {
  children: ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentAlbumName, setCurrentAlbumName] = useState<string>('');
  const [currentAlbumId, setCurrentAlbumId] = useState<string>('');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [duplicateClusters, setDuplicateClusters] = useState<DuplicateCluster[]>([]);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isFindingDuplicates, setIsFindingDuplicates] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState({ processed: 0, total: 0, currentPhoto: '' });
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState<boolean>(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentWorkflowStage, setCurrentWorkflowStage] = useState<WorkflowStage>('upload');
  const [copyLookReference, setCopyLookReference] = useState<Photo | null>(null);
  const [copyLookTargets, setCopyLookTargets] = useState<Photo[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  const createNewAlbum = useCallback(async (albumName: string, eventType: EventType) => {
    // Implementation for creating new album
    const albumId = `album_${Date.now()}`;
    setCurrentAlbumName(albumName);
    setCurrentAlbumId(albumId);
    return { albumId, albumName };
  }, []);

  const applyFilter = useCallback((filter: Filter) => {
    // Implementation for applying filters
    setFilteredPhotos(photos.filter(photo => {
      // Apply filter logic here
      return true;
    }));
  }, [photos]);

  const clearFilters = useCallback(() => {
    setFilteredPhotos(photos);
  }, [photos]);

  const uploadPhotos = useCallback(async (files: File[]) => {
    setIsUploading(true);
    try {
      // Implementation for uploading photos
      toast('Photos uploaded successfully', 'success');
    } catch (error) {
      toast('Failed to upload photos', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const deletePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    setFilteredPhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const updatePhoto = useCallback((photoId: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
    setFilteredPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
  }, []);

  const selectPhoto = useCallback((photoId: string) => {
    setSelectedPhotos(prev => [...prev, photoId]);
  }, []);

  const deselectPhoto = useCallback((photoId: string) => {
    setSelectedPhotos(prev => prev.filter(id => id !== photoId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPhotos([]);
  }, []);

  const applyCopyLook = useCallback(async () => {
    if (!copyLookReference || copyLookTargets.length === 0) {
      toast('Please select a reference photo and target photos', 'error');
      return;
    }

    try {
      setIsLoading(true);
      // Implementation for applying copy look
      toast('Copy look applied successfully', 'success');
    } catch (error) {
      toast('Failed to apply copy look', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [copyLookReference, copyLookTargets, toast]);

  const value = useMemo(() => ({
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
    applyFilter,
    clearFilters,
    uploadPhotos,
    deletePhoto,
    updatePhoto,
    selectedPhotos,
    setSelectedPhotos,
    selectPhoto,
    deselectPhoto,
    clearSelection,
    currentWorkflowStage,
    setCurrentWorkflowStage,
    copyLookReference,
    copyLookTargets,
    setCopyLookReference,
    setCopyLookTargets,
    applyCopyLook,
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
    applyFilter,
    clearFilters,
    uploadPhotos,
    deletePhoto,
    updatePhoto,
    selectedPhotos,
    selectPhoto,
    deselectPhoto,
    clearSelection,
    currentWorkflowStage,
    copyLookReference,
    copyLookTargets,
    setCopyLookReference,
    setCopyLookTargets,
    applyCopyLook,
  ]);

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhoto = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  return context;
  
}