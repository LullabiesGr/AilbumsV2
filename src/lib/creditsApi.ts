import { useCredits } from '../context/CreditsContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://e2d5f43272e5.ngrok-free.app");

interface CreditsResponse {
  debited: number;
  balance: number;
  plan_id: string;
  catalog_version: string;
  sync?: {
    synced: boolean;
    pending: boolean;
  };
}

interface LUTAndApplyResponse {
  lut_cube_file: string;
  result_image_file: string;
  result_image_base64?: string;
  strength_used: number;
  info: string;
  credits: CreditsResponse;
}

interface FALEditResponse {
  result_url: string;
  full_response: any;
  credits: CreditsResponse;
}

interface FALRelightResponse {
  result_url: string;
  full_response: any;
  image_mp: number;
  credits: CreditsResponse;
}

// LUT & Apply with credits
export const lutAndApplyWithCredits = async (
  referenceFile: File,
  targetFile: File,
  strength: number = 0.5,
  userId: string
): Promise<LUTAndApplyResponse> => {
  console.log('🎨 LUT & Apply with credits:', {
    reference: referenceFile.name,
    target: targetFile.name,
    strength,
    userId
  });

  const formData = new FormData();
  formData.append('reference', referenceFile, referenceFile.name);
  formData.append('source', targetFile, targetFile.name);
  formData.append('apply_on', targetFile, targetFile.name);
  formData.append('strength', strength.toString());
  formData.append('user_id', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/lut_and_apply/`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LUT & Apply failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ LUT & Apply successful:', result);

    // Convert file path to base64 if needed
    if (result.result_image_file && !result.result_image_base64) {
      try {
        const imageResponse = await fetch(`${API_BASE_URL}/${result.result_image_file}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const base64 = await blobToBase64(imageBlob);
          result.result_image_base64 = base64.split(',')[1];
        }
      } catch (error) {
        console.warn('Failed to fetch result image:', error);
      }
    }

    return result;
  } catch (error: any) {
    console.error('❌ LUT & Apply failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// FAL Edit with credits
export const falEditWithCredits = async (
  file: File,
  prompt: string,
  userId: string
): Promise<FALEditResponse> => {
  console.log('🎨 FAL Edit with credits:', {
    filename: file.name,
    prompt,
    userId
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);
  formData.append('user_id', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/fal-edit`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FAL Edit failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ FAL Edit successful:', result);
    return result;
  } catch (error: any) {
    console.error('❌ FAL Edit failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// FAL Relight with credits
export const falRelightWithCredits = async (
  file: File,
  prompt: string,
  userId: string
): Promise<FALRelightResponse> => {
  console.log('🌅 FAL Relight with credits:', {
    filename: file.name,
    prompt,
    userId
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);
  formData.append('user_id', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/fal-relight`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FAL Relight failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ FAL Relight successful:', result);
    return result;
  } catch (error: any) {
    console.error('❌ FAL Relight failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Enhance with credits (returns image stream)
export const enhanceWithCredits = async (
  file: File,
  fidelity: number = 0.7,
  faceUpsample: boolean = true,
  userId: string
): Promise<Blob> => {
  console.log('✨ Enhance with credits:', {
    filename: file.name,
    fidelity,
    faceUpsample,
    userId
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fidelity', fidelity.toString());
  formData.append('face_upsample', faceUpsample.toString());
  formData.append('user_id', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/enhance`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Enhance failed: ${response.status} ${errorText}`);
    }

    const blob = await response.blob();
    console.log('✅ Enhance successful, blob size:', blob.size);
    return blob;
  } catch (error: any) {
    console.error('❌ Enhance failed:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};