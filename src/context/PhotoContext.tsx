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
  