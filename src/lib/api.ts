import { Photo } from '../types';
import { findDuplicates } from './similarity';
import { promisePoolWithProgress } from './promisePool';

const API_URL = 'https://de26-46-190-38-24.ngrok-free.app';

export const convertRawFile = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/convert-raw`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to convert RAW file');
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty response from server');
    }
    return blob;
  } catch (error: any) {
    console.error('RAW conversion error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const getPhotoTip = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/photo-tip`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to get photo tip');
    }

    const data = await response.json();
    return data.tip;
  } catch (error: any) {
    console.error('Photo tip error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const saveAlbumAndTrain = async (trainingData: AITrainingData): Promise<void> => {
  const formData = new FormData();
  formData.append('user_id', trainingData.user_id);
  formData.append('event', trainingData.event);
  formData.append('approved_paths', JSON.stringify(trainingData.approved_paths));
  formData.append('ratings', JSON.stringify(trainingData.ratings));

  try {
    const response = await fetch(`${API_URL}/save-album`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to save album and train AI');
    }
  } catch (error: any) {
    console.error('Save album error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const analyzePhotos = async (photos: Photo[], userId: string, eventType: EventType, cullingMode: CullingMode): Promise<Photo[]> => {
  // This function is now replaced by analyzeSinglePhoto for better UX
  throw new Error('Use analyzeSinglePhoto instead for serial processing');
};

// New function to analyze a single photo for fast mode
export const analyzeSinglePhoto = async (photo: Photo, userId: string, eventType: EventType, cullingMode: CullingMode): Promise<Photo> => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('event', eventType);
  formData.append('culling_mode', cullingMode);
  formData.append('files', photo.file);

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: { 
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Fast Analysis API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`Fast Analysis API Error: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    const result = Array.isArray(results) ? results[0] : results;
    
    if (result) {
      return {
        ...photo,
        score: result.ai_score || null,
        basic_score: result.basic_score,
        ml_score: result.ml_score,
        ai_score: result.ai_score || 0,
        score_type: result.score_type || 'basic',
        blur_score: result.blur_score,
        personalized_similarity: result.personalized_similarity,
        tags: result.tags || [],
        faces: result.faces || [],
        clip_vector: result.clip_vector,
        caption: result.caption,
        event_type: result.event_type,
        color_label: result.color_label,
        blip_flags: result.blip_flags || [],
        blip_highlights: result.blip_highlights || []
      };
    }
    
    return photo;
  } catch (error: any) {
    console.error('Fast analysis fetch error:', error);
    throw new Error(`Failed to analyze photo ${photo.filename}: ${error.message}`);
  }
};

// Serial processing function for fast analysis with progress callback
export const analyzePhotosSingle = async (
  photos: Photo[], 
  userId: string, 
  eventType: EventType,
  cullingMode: CullingMode,
  onProgress?: (processedCount: number, currentPhoto: string, updatedPhoto?: Photo) => void,
  concurrency = 2
): Promise<Photo[]> => {
  // Create tasks for each photo
  const tasks = photos.map((photo, index) => async () => {
    try {
      const analyzedPhoto = await analyzeSinglePhoto(photo, userId, eventType, cullingMode);
      
      // Call progress callback with the updated photo for real-time UI updates
      if (onProgress) {
        onProgress(index + 1, analyzedPhoto.filename, analyzedPhoto);
      }
      
      return analyzedPhoto;
    } catch (error) {
      console.error(`Failed to analyze ${photo.filename}:`, error);
      // Return the original photo with error flag
      const errorPhoto = {
        ...photo,
        tags: [...(photo.tags || []), 'analysis_failed']
      };
      
      // Call progress callback even for failed photos
      if (onProgress) {
        onProgress(index + 1, photo.filename, errorPhoto);
      }
      
      return errorPhoto;
    }
  });

  // Process with concurrency control and progress tracking
  const results = await promisePoolWithProgress(
    tasks,
    concurrency,
    () => {} // Progress is handled in individual tasks now
  );

  // Handle any errors in results and ensure we have valid photos
  const analyzedPhotos = results.map((result, index) => {
    if (result instanceof Error) {
      console.error(`Task ${index} failed:`, result);
      return {
        ...photos[index],
        tags: [...(photos[index].tags || []), 'analysis_failed']
      };
    }
    return result;
  });

  // Find duplicates and add tags
  const duplicates = findDuplicates(analyzedPhotos);
  return analyzedPhotos.map(photo => ({
    ...photo,
    tags: [
      ...(photo.tags || []),
      ...(duplicates.has(photo.id) ? ['duplicate'] : [])
    ]
  }));
};

export const deepAnalyzePhotos = async (photos: Photo[], userId: string, eventType: EventType): Promise<Photo[]> => {
  // This function is now replaced by deepAnalyzePhotosSingle for better UX
  throw new Error('Use deepAnalyzePhotosSingle instead for serial processing');
};

// New function to analyze a single photo
export const deepAnalyzeSinglePhoto = async (photo: Photo, userId: string, eventType: EventType): Promise<Photo> => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('event', eventType);
  formData.append('files', photo.file);

  try {
    const response = await fetch(`${API_URL}/deep-analyze`, {
      method: 'POST',
      body: formData,
      headers: { 
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deep Analysis API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`Deep Analysis API Error: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    const result = Array.isArray(results) ? results[0] : results;
    
    if (result) {
      return {
        ...photo,
        score: result.ai_score || null,
        basic_score: result.basic_score,
        ml_score: result.ml_score,
        ai_score: result.ai_score || 0,
        score_type: result.score_type || 'ai',
        blur_score: result.blur_score,
        personalized_similarity: result.personalized_similarity,
        tags: result.tags || [],
        faces: result.faces || [],
        clip_vector: result.clip_vector,
        caption: result.caption,
        event_type: result.event_type,
        color_label: result.color_label,
        blip_flags: result.blip_flags || [],
        blip_highlights: result.blip_highlights || [],
        prompt_answers: result.prompt_answers || {},
        ai_categories: result.ai_categories || []
      };
    }
    
    return photo;
  } catch (error: any) {
    console.error('Deep analysis fetch error:', error);
    throw new Error(`Failed to deep analyze photo ${photo.filename}: ${error.message}`);
  }
};

// Serial processing function with progress callback
export const deepAnalyzePhotosSingle = async (
  photos: Photo[], 
  userId: string, 
  eventType: EventType,
  onProgress?: (processedCount: number, currentPhoto: string, updatedPhoto?: Photo) => void,
  concurrency = 2
): Promise<Photo[]> => {
  // Create tasks for each photo
  const tasks = photos.map((photo, index) => async () => {
    try {
      const analyzedPhoto = await deepAnalyzeSinglePhoto(photo, userId, eventType);
      
      // Call progress callback with the updated photo for real-time UI updates
      if (onProgress) {
        onProgress(index + 1, analyzedPhoto.filename, analyzedPhoto);
      }
      
      return analyzedPhoto;
    } catch (error) {
      console.error(`Failed to analyze ${photo.filename}:`, error);
      // Return the original photo with error flag
      const errorPhoto = {
        ...photo,
        tags: [...(photo.tags || []), 'analysis_failed']
      };
      
      // Call progress callback even for failed photos
      if (onProgress) {
        onProgress(index + 1, photo.filename, errorPhoto);
      }
      
      return errorPhoto;
    }
  });

  // Process with concurrency control and progress tracking
  const results = await promisePoolWithProgress(
    tasks,
    concurrency,
    () => {} // Progress is handled in individual tasks now
  );

  // Handle any errors in results and ensure we have valid photos
  const analyzedPhotos = results.map((result, index) => {
    if (result instanceof Error) {
      console.error(`Task ${index} failed:`, result);
      return {
        ...photos[index],
        tags: [...(photos[index].tags || []), 'analysis_failed']
      };
    }
    return result;
  });

  // Find duplicates and add tags
  const duplicates = findDuplicates(analyzedPhotos);
  return analyzedPhotos.map(photo => ({
    ...photo,
    tags: [
      ...(photo.tags || []),
      ...(duplicates.has(photo.id) ? ['duplicate'] : [])
    ]
  }));
};

// Simulated culling (real logic is on the backend eventually)
export const cullPhotos = async (photos: Photo[]): Promise<Photo[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const culledPhotos = photos.map(photo => {
        if (photo.score !== null && photo.score < 5) {
          return {
            ...photo,
            tags: [...(photo.tags || []), 'culled']
          };
        }
        return photo;
      });
      resolve(culledPhotos);
    }, 1500);
  });
};

interface EditPhotoParams {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  gamma?: number;
  grayscale?: boolean;
  invert?: boolean;
  rotate?: number;
  flip_horizontal?: boolean;
  flip_vertical?: boolean;
  temperature?: number;
  vignette?: number;
  crop_left?: number;
  crop_upper?: number;
  crop_right?: number;
  crop_lower?: number;
}

export const editPhoto = async (file: File, params: EditPhotoParams): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Only append parameters that are different from defaults
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  try {
    const response = await fetch(`${API_URL}/edit`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status >= 500) {
        throw new Error('Server error: Please try again later');
      }
      if (!navigator.onLine) {
        throw new Error('Network error: Please check your connection');
      }
      throw new Error(errorText || 'Failed to edit photo');
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty response from server');
    }
    return blob;
  } catch (error: any) {
    console.error('Edit photo error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const inpaintPhoto = async (image: File, mask: File, prompt: string): Promise<Blob> => {
  // Validate inputs
  if (!image || !(image instanceof File)) {
    throw new Error("Invalid image file");
  }
  if (!mask || !(mask instanceof File)) {
    throw new Error("Invalid mask file");
  }
  if (!prompt || prompt.trim() === '') {
    throw new Error("Prompt is required");
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("mask", mask);
  formData.append("prompt", prompt);

  try {
    const response = await fetch(`${API_URL}/inpaint`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Inpainting API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Inpainting failed: ${response.status} ${errorText || response.statusText}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Received empty response from server");
    }

    return blob;
  } catch (error: any) {
    console.error('Inpainting error:', error);
    throw new Error(error.message || "Failed to process image");
  }
}

export const autocorrectPhoto = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/autocorrect`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to auto-correct photo');
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty response from server');
    }
    return blob;
  } catch (error: any) {
    console.error('Auto-correct error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const getFocusMap = async (file: File): Promise<FocusMapResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/focusmap`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to generate focus map');
    }

    const data = await response.json();
    if (!data || !data.heatmap_png_base64) {
      throw new Error('Invalid focus map response from server');
    }
    return data;
  } catch (error: any) {
    console.error('Focus map error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
}

export const autofixPhoto = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);


  try {
    const response = await fetch(`${API_URL}/autofix`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status >= 500) {
        throw new Error('Server error: Please try again later');
      }
      if (!navigator.onLine) {
        throw new Error('Network error: Please check your connection');
      }
      throw new Error(errorText || 'Failed to enhance photo');
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty response from server');
    }
    return blob;
  } catch (error: any) {
    console.error('Autofix error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

interface BatchResult {
  filename: string;
  image_base64: string;
}

export const batchAutocorrect = async (files: File[]): Promise<BatchResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_URL}/batch-autocorrect`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process photos');
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
      throw new Error('Invalid response format from server');
    }
    return results;
  } catch (error: any) {
    console.error('Batch autocorrect error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const batchAutofix = async (files: File[]): Promise<BatchResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_URL}/batch-autofix`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process photos');
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
      throw new Error('Invalid response format from server');
    }
    return results;
  } catch (error: any) {
    console.error('Batch autofix error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};