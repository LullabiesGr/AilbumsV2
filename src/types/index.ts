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
  faces?: FaceBox[];
  clip_vector?: number[];
  caption?: string;
  event_type?: EventType;
  blip_flags?: string[];
  blip_highlights?: string[];
  prompt_answers?: Record<string, string>;
  ai_categories?: string[];
  dateCreated: string;
  selected?: boolean;
  albumId?: string;
  color_label?: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
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

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
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
  faces: FaceBox[];
  clip_vector: number[];
}

export type Filter = 'all' | 'selected' | 'high-score' | 'blurry' | 'eyes-closed' | 'duplicates' | 'warnings' | 'highlights' | 'flagged' | 'green' | 'red' | 'yellow' | 'blue' | 'purple';

export type ColorLabel = 'green' | 'red' | 'yellow' | 'blue' | 'purple';

export type CullingMode = 'fast' | 'slow' | 'manual';

export type EventType = 'wedding' | 'baptism' | 'portrait' | 'event' | 'landscape' | 'family' | 'corporate';

export type WorkflowStage = 'upload' | 'configure' | 'analyzing' | 'review';

export interface ColorLabelConfig {
  color: ColorLabel;
  label: string;
  bgColor: string;
  textColor: string;
  description: string;
}