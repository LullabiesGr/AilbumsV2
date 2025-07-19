export interface Photo {
  id: string;
  filename: string;
  file: File;
  url: string;
  score: number | null;
  basic_score?: number;
  ml_score?: number;
  ai_score: number;
  score_type: 'base' | 'basic' | 'ai' | 'manual' | 'personalized';
  blur_score?: number;
  personalized_similarity?: number;
  tags?: string[];
  faces?: Face[];
  face_summary?: FaceSummary;
  clip_vector?: number[];
  phash?: string;
  caption?: string;
  event_type?: EventType;
  blip_flags?: string[];
  blip_highlights?: string[];
  deep_prompts?: Record<string, string>; // Dynamic prompts from backend
  ai_categories?: string[];
  approved?: boolean; // Backend-determined approval status
  dateCreated: string;
  selected?: boolean;
  albumId?: string;
  color_label?: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  duplicateGroup?: string[];
  isDuplicate?: boolean;
}

export interface Face {
  box: [number, number, number, number]; // [x1, y1, x2, y2] absolute coordinates
  confidence: number;
  face_crop_b64?: string; // Base64-encoded cropped face image
  face_crop_b64?: string; // Base64-encoded cropped face image
  landmarks?: number[][];
  age?: number;
  gender?: 'male' | 'female';
  emotion?: string;
  emotion_confidence?: number;
  headpose?: {
    yaw: number;
    pitch: number;
    roll: number;
  };
  glasses?: boolean;
  mask?: boolean;
  occlusion?: number;
  face_quality?: number;
  embedding?: number[];
  same_person_group?: string;
  is_duplicate?: boolean;
  eyes_closed?: boolean;
  smile?: number;
}

export interface FaceSummary {
  total_faces: number;
  emotions?: Record<string, number>;
  age_groups?: Record<string, number>;
  gender_distribution?: Record<string, number>;
  quality_stats?: {
    average_quality: number;
    high_quality_faces: number;
  };
  issues?: {
    closed_eyes: number;
    occluded_faces: number;
    low_quality: number;
  };
}

export interface DuplicateCluster {
  filename: string;
  clip_duplicates: string[];
  phash_duplicates: string[];
}

export interface PersonGroup {
  group_id: string;
  photos: Photo[];
  faces: Face[];
  representative_face?: Face;
  photo_count: number;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AITrainingData {
  user_id: string;
  event: string;
  approved_paths: string[];
  ratings: number[];
}

export interface FocusMapResponse {
  focus_x: number;
  focus_y: number;
  heatmap_png_base64: string;
  width: number;
  height: number;
}

export interface EditProfile {
  id: string;
  name: string;
  params: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    gamma: number;
    grayscale: boolean;
    invert: boolean;
    rotate: number;
    flip_horizontal: boolean;
    flip_vertical: boolean;
    temperature: number;
    vignette: number;
  };
}

export interface AnalysisResult {
  filename: string;
  basic_score?: number;
  ml_score?: number;
  ai_score: number;
  score_type: 'base' | 'basic' | 'ai' | 'manual' | 'personalized';
  blur_score?: number;
  personalized_similarity?: number;
  tags: string[];
  faces: Face[];
  face_summary: FaceSummary;
  clip_vector: number[];
  phash?: string;
}

export type Filter = 'all' | 'selected' | 'high-score' | 'blurry' | 'eyes-closed' | 'duplicates' | 'warnings' | 'highlights' | 'flagged' | 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'people' | 'emotions' | 'quality-issues';

export type ColorLabel = 'green' | 'red' | 'yellow' | 'blue' | 'purple';

export type CullingMode = 'fast' | 'slow' | 'manual';

export type EventType = 'wedding' | 'baptism' | 'portrait' | 'event' | 'landscape' | 'family' | 'corporate';

export type WorkflowStage = 'upload' | 'configure' | 'analyzing' | 'review' | 'face-retouch' | 'ai-edit';

export interface ColorLabelConfig {
  color: ColorLabel;
  label: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export interface SavedAlbum {
  id: string;
  user_id: string;
  album_title: string;
  event_type: EventType;
  created_date: string;
  approved_count: number;
  total_count: number;
  thumbnails: string[]; // Base64 encoded thumbnails
  tags: Record<string, string[]>; // filename -> tags
  highlights: Record<string, string[]>; // filename -> highlights
  ratings: Record<string, number>; // filename -> rating
  color_labels: Record<string, ColorLabel>; // filename -> color label
  edits: Record<string, any>; // filename -> edit history
}

export interface SaveAlbumData {
  user_id: string;
  album_title: string;
  event_type: EventType;
  created_date: string;
  approved_paths: string[];
  ratings: Record<string, number>;
  tags: Record<string, string[]>;
  highlights: Record<string, string[]>;
  color_labels: Record<string, ColorLabel>;
  edits: Record<string, any>;
  thumbnails: string[];
}