import { Photo } from '../types';
import { findDuplicates } from './similarity';
import { promisePoolWithProgress } from './promisePool'; // Keep this import
import { DuplicateCluster } from '../types';

// API URL configuration for different environments
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://36f5ddfd52c2.ngrok-free.app";

// Upload photo for LUT previews
export const uploadPhotoForLUTPreviews = async (
  file: File, 
  albumName: string, 
  userEmail: string
): Promise<{ status: string; album: string; photo: string; path: string; previews: string[] }> => {
  console.log('📤 Uploading photo for LUT previews:', {
    filename: file.name,
    albumName,
    userEmail,
    fileSize: file.size
  });
  
  const formData = new FormData();
  formData.append('album_name', albumName);
  formData.append('user_id', userEmail);
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/upload-photo`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload photo API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Upload photo failed: ${response.status} ${errorText || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Photo uploaded for LUT previews:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Upload photo for LUT previews failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Apply LUT to full resolution photo
export const applyLUTFull = async (
  userEmail: string,
  albumName: string, 
  photoFilename: string,
  lutName: string
): Promise<void> => {
  console.log('🎨 Applying LUT to full resolution:', {
    userEmail,
    albumName,
    photoFilename,
    lutName
  });
  
  const formData = new URLSearchParams();
  formData.append('user_id', userEmail);
  formData.append('album_name', albumName);
  formData.append('photo_filename', photoFilename);
  formData.append('lut_name', lutName);

  try {
    const response = await fetch(`${API_URL}/apply-lut-full`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apply LUT API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Apply LUT failed: ${response.status} ${errorText || response.statusText}`);
    }

    const result = await response.text();
    console.log('✅ LUT applied successfully:', result);
  } catch (error: any) {
    console.error('❌ Apply LUT failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Log the API URL being used for debugging
console.log('🌐 Using API URL:', API_URL);

// Test function to verify backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });
    
    console.log('🔍 Health check response:', {
      status: response.status,
      statusText: response.statusText
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

// Enhanced create album function with debugging
export const createAlbumAPI = async (albumData: {
  user_email: string;
  album_id: string;
  title: string;
  event_type: EventType;
  date_created: string;
}): Promise<any> => {
  console.log('📡 createAlbumAPI called with:', albumData);
  
  try {
    // Test connection first
    const isConnected = await testBackendConnection();
    if (!isConnected) {
      throw new Error('Backend is not reachable. Please check if the server is running.');
    }
    
    console.log('📤 Sending create album request...');
    const response = await fetch(`${API_URL}/create-album`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(albumData),
      mode: 'cors',
    });

    console.log('📥 Create album response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create album API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200)
      });
      
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html>')) {
        throw new Error(`Create album endpoint returned HTML instead of JSON. Check if ${API_URL}/create-album endpoint exists.`);
      }
      
      throw new Error(`Failed to create album: ${response.status} ${errorText || response.statusText}`);
    }

    const responseText = await response.text();
    console.log('📄 Create album response text:', responseText.substring(0, 500));
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse create album response as JSON:', parseError);
      console.error('Response was:', responseText.substring(0, 200));
      throw new Error('Create album endpoint returned invalid JSON. Check backend implementation.');
    }
    
    console.log('✅ Create album successful:', result);
    return result;
    
  } catch (error: any) {
    console.error('❌ createAlbumAPI failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Utility function to compute perceptual hash on frontend (basic implementation)
export const computePerceptualHash = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to 8x8 for pHash
        canvas.width = 8;
        canvas.height = 8;
        
        ctx?.drawImage(img, 0, 0, 8, 8);
        const imageData = ctx?.getImageData(0, 0, 8, 8);
        
        if (!imageData) {
          reject(new Error('Failed to get image data'));
          return;
        }
        
        // Simple grayscale conversion and hash generation
        const pixels = imageData.data;
        const grayscale: number[] = [];
        
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          grayscale.push(gray);
        }
        
        // Calculate average
        const avg = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;
        
        // Generate hash
        let hash = '';
        for (const pixel of grayscale) {
          hash += pixel > avg ? '1' : '0';
        }
        
        // Convert binary to hex
        const hexHash = parseInt(hash, 2).toString(16).padStart(16, '0');
        resolve(hexHash);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

// Find duplicates using the new backend endpoint
export const findDuplicatesAPI = async (
  filenames: string[],
  clipEmbeddings: number[][],
  phashes: string[]
): Promise<DuplicateCluster[]> => {
  try {
    const response = await fetch(`${API_URL}/find-duplicates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filenames,
        clip_embeddings: clipEmbeddings,
        phashes
      }),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to find duplicates');
    }

    const clusters = await response.json();
    return clusters;
  } catch (error: any) {
    console.error('Find duplicates error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

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

export const saveAlbumAndTrain = async (trainingData: { user_email: string; event: string; approved_paths: string[]; ratings: number[] }): Promise<void> => {
  const formData = new FormData();
  formData.append('user_id', trainingData.user_email);
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

// Load user albums
export const fetchAlbums = async (userEmail: string): Promise<any[]> => {
  try {
    console.log('🔍 Loading albums for user:', userEmail);
    console.log('🌐 API URL:', `${API_URL}/albums?user_id=${userEmail}`);
    
    const response = await fetch(`${API_URL}/albums?user_id=${userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    console.log('📥 Albums API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Albums API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });
      
      // Check if we got HTML instead of JSON
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html>')) {
        throw new Error(`Albums endpoint returned HTML instead of JSON. Check if ${API_URL}/albums endpoint exists.`);
      }
      
      throw new Error(`Albums API Error: ${response.status} ${errorText || response.statusText}`);
    }

    const responseText = await response.text();
    console.log('📄 Albums Response Text (first 1000 chars):', responseText.substring(0, 1000));
    
    let albums;
    try {
      albums = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse albums JSON:', parseError);
      console.error('📄 Full response was:', responseText);
      throw new Error('Albums endpoint returned invalid JSON');
    }
    
    console.log('✅ Successfully loaded albums:', albums);
    console.log('📊 Albums count:', Array.isArray(albums) ? albums.length : 'Not an array');
    
    // Ensure we return an array
    if (Array.isArray(albums)) {
      return albums;
    } else if (albums && albums.albums && Array.isArray(albums.albums)) {
      return albums.albums;
    } else if (albums && albums.results && Array.isArray(albums.results)) {
      return albums.results;
    } else {
      console.warn('⚠️ Unexpected albums response structure:', albums);
      return [];
    }
    return albums || [];
  } catch (error: any) {
    console.error('❌ Load albums error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Load album analysis results and update photos
export const loadAlbumAnalysisResults = async (albumId: string, userEmail: string): Promise<any[]> => {
  try {
    console.log('Loading analysis results for album:', albumId);
    
    const response = await fetch(`${API_URL}/album/${albumId}/results?user_id=${userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analysis results API error:', {
        status: response.status,
        errorText: errorText.substring(0, 200)
      });
      throw new Error(`Failed to load analysis results: ${response.status}`);
    }

    const results = await response.json();
    console.log('Analysis results loaded:', results);
    return results || [];
  } catch (error: any) {
    console.error('Load analysis results error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};
export const analyzePhotos = async (photos: Photo[], userEmail: string, eventType: EventType, cullingMode: CullingMode): Promise<Photo[]> => {
  // This function is now replaced by analyzeSinglePhoto for better UX
  throw new Error('Use analyzeSinglePhoto instead for serial processing');
};

// New function to analyze a single photo for fast mode
export const analyzeSinglePhoto = async (photo: Photo, userEmail: string, eventType: EventType, cullingMode: CullingMode, albumId?: string): Promise<Photo> => {
  console.log(`📡 Analyzing single photo: ${photo.filename} with ${cullingMode} mode`);
  
  const formData = new FormData();
  formData.append('user_id', userEmail);
  formData.append('event', eventType);
  formData.append('culling_mode', cullingMode);
  if (albumId) {
    console.log(`📁 Using album name for analysis: ${albumId}`);
    formData.append('album_id', albumId); // This should be the user's album name
    formData.append('album_name', albumId); // Send as both fields
  }
  formData.append('files', photo.file);

  try {
    // Use the correct endpoint based on culling mode
    const endpoint = cullingMode === 'deep' ? '/deep-analyze' : '/analyze';
    console.log(`📤 Sending to ${endpoint} endpoint for ${photo.filename}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: { 
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${cullingMode} Analysis API Error:`, {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`${cullingMode} Analysis API Error: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    const result = results.results && results.results.length > 0 ? results.results[0] : null;
    
    // Debug: Log the raw API response to see what we're getting
    console.log(`${cullingMode} Analysis API Response for`, photo.filename, ':', {
      result,
      faces: result?.faces,
      firstFace: result?.faces?.[0],
      hasFaceCrop: result?.faces?.[0]?.face_crop_b64 ? 'YES' : 'NO',
      faceCropLength: result?.faces?.[0]?.face_crop_b64?.length || 0
    });
    
    if (result) {
      // Compute perceptual hash if not provided by backend
      let phash = result.phash;
      if (!phash) {
        try {
          phash = await computePerceptualHash(photo.url);
        } catch (error) {
          console.warn('Failed to compute perceptual hash:', error);
          phash = '';
        }
      }
      
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
        faces: result.faces?.map((face: any) => ({
          // Use backend coordinates directly - no transformation
          box: face.box,
          face_crop_b64: face.face_crop_b64,
          confidence: face.confidence || 0,
          landmarks: face.landmarks,
          age: face.age,
          gender: face.gender,
          emotion: face.emotion,
          emotion_confidence: face.emotion_confidence,
          headpose: face.headpose,
          glasses: face.glasses,
          mask: face.mask,
          occlusion: face.occlusion,
          face_quality: face.face_quality,
          embedding: face.embedding,
          same_person_group: face.same_person_group,
          is_duplicate: face.is_duplicate,
          eyes_closed: face.eyes_closed,
          smile: face.smile
        })) || [],
        face_summary: result.face_summary,
        clip_vector: result.clip_vector,
        phash,
        caption: result.caption,
        event_type: result.event_type,
        color_label: result.color_label,
        blip_flags: result.blip_flags || [],
        blip_highlights: result.blip_highlights || [],
        deep_prompts: result.deep_prompts || {}, // Dynamic prompts from backend
        approved: result.approved // Backend-determined approval
      };
    }
    
    return photo;
  } catch (error: any) {
    console.error(`${cullingMode} analysis fetch error:`, error);
    throw new Error(`Failed to ${cullingMode} analyze photo ${photo.filename}: ${error.message}`);
  }
};

// Serial processing function for fast analysis with progress callback
export const analyzePhotosSingle = async (
  photos: Photo[], 
  userEmail: string, 
  eventType: EventType,
  cullingMode: CullingMode,
  onProgress?: (processedCount: number, currentPhoto: string, updatedPhoto?: Photo) => void,
  concurrency = 2,
  albumId?: string
): Promise<Photo[]> => {
  // Create tasks for each photo
  const tasks = photos.map((photo, index) => async () => {
    try {
      const analyzedPhoto = await analyzeSinglePhoto(photo, userEmail, eventType, cullingMode, albumId);
      
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

  return analyzedPhotos;
};

export const deepAnalyzePhotos = async (photos: Photo[], userEmail: string, eventType: EventType): Promise<Photo[]> => {
  // This function is now replaced by deepAnalyzePhotosSingle for better UX
  throw new Error('Use deepAnalyzePhotosSingle instead for serial processing');
};

// New function to analyze a single photo
export const deepAnalyzeSinglePhoto = async (photo: Photo, userEmail: string, eventType: EventType, albumId?: string): Promise<Photo> => {
  console.log(`🧠 Deep analyzing single photo: ${photo.filename}`);
  
  const formData = new FormData();
  formData.append('user_id', userEmail);
  formData.append('event', eventType);
  if (albumId) {
    console.log(`📁 Using album name for deep analysis: ${albumId}`);
    formData.append('album_id', albumId); // This should be the user's album name
    formData.append('album_name', albumId); // Send as both fields
  }
  formData.append('files', photo.file);

  try {
    console.log(`📤 Sending to /deep-analyze endpoint for ${photo.filename}`);
    
    const response = await fetch(`${API_URL}/deep-analyze`, {
      method: 'POST',
      body: formData,
      headers: { 
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
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
    const result = results.results && results.results.length > 0 ? results.results[0] : null;
    
    // Debug: Log the raw API response to see what we're getting
    console.log('Deep Analysis API Response for', photo.filename, ':', {
      result,
      faces: result?.faces,
      firstFace: result?.faces?.[0],
      hasFaceCrop: result?.faces?.[0]?.face_crop_b64 ? 'YES' : 'NO',
      faceCropLength: result?.faces?.[0]?.face_crop_b64?.length || 0
    });
    
    if (result) {
      // Compute perceptual hash if not provided by backend
      let phash = result.phash;
      if (!phash) {
        try {
          phash = await computePerceptualHash(photo.url);
        } catch (error) {
          console.warn('Failed to compute perceptual hash:', error);
          phash = '';
        }
      }
      
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
        faces: result.faces?.map((face: any) => ({
          // Use backend coordinates directly - no transformation
          box: face.box,
          face_crop_b64: face.face_crop_b64,
          confidence: face.confidence || 0,
          landmarks: face.landmarks,
          age: face.age,
          gender: face.gender,
          emotion: face.emotion,
          emotion_confidence: face.emotion_confidence,
          headpose: face.headpose,
          glasses: face.glasses,
          mask: face.mask,
          occlusion: face.occlusion,
          face_quality: face.face_quality,
          embedding: face.embedding,
          same_person_group: face.same_person_group,
          is_duplicate: face.is_duplicate,
          eyes_closed: face.eyes_closed,
          smile: face.smile
        })) || [],
        face_summary: result.face_summary,
        clip_vector: result.clip_vector,
        phash,
        caption: result.caption,
        event_type: result.event_type,
        color_label: result.color_label,
        blip_flags: result.blip_flags || [],
        blip_highlights: result.blip_highlights || [],
        deep_prompts: result.deep_prompts || {}, // Dynamic prompts from backend
        approved: result.approved, // Backend-determined approval
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
  userEmail: string, 
  eventType: EventType,
  onProgress?: (processedCount: number, currentPhoto: string, updatedPhoto?: Photo) => void,
  concurrency = 2,
  albumId?: string
): Promise<Photo[]> => {
  // Create tasks for each photo
  const tasks = photos.map((photo, index) => async () => {
    try {
      const analyzedPhoto = await deepAnalyzeSinglePhoto(photo, userEmail, eventType, albumId);
      
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

  return analyzedPhotos;
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
};

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
};

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

// AI Edit & Relighting endpoints
export const falEdit = async (file: File, prompt: string): Promise<{ result_url: string; full_response: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);

  try {
    const response = await fetch(`${API_URL}/fal-edit`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process AI edit');
    }

    const result = await response.json();
    if (!result.result_url) {
      throw new Error('Invalid response: missing result_url');
    }
    
    return result;
  } catch (error: any) {
    console.error('FAL Edit error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const falRelight = async (file: File, prompt: string): Promise<{ result_url: string; full_response: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);

  try {
    const response = await fetch(`${API_URL}/fal-relight`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process AI relight');
    }

    const result = await response.json();
    if (!result.result_url) {
      throw new Error('Invalid response: missing result_url');
    }
    
    return result;
  } catch (error: any) {
    console.error('FAL Relight error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

export const colorTransfer = async (referenceFile: File, targetFiles: File[]): Promise<{ results: ColorTransferResult[] }> => {
  const formData = new FormData();
  formData.append('reference', referenceFile);
  
  targetFiles.forEach(file => {
    formData.append('targets', file);
  });

  try {
    const response = await fetch(`${API_URL}/color-transfer`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process color transfer');
    }

    const data = await response.json();
    
    // Handle both response formats: { results: [...] } or direct array
    const results = data.results || data;
    if (!Array.isArray(results)) {
      throw new Error('Invalid response format from server');
    }
    
    return { results };
  } catch (error: any) {
    console.error('Color transfer error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
}