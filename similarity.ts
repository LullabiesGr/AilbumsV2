import { Photo } from '../types';

export const SIMILARITY_THRESHOLD = 0.98;

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find duplicate photos based on CLIP vector similarity
 * Returns a Set of photo IDs that are duplicates
 */
export function findDuplicates(photos: Photo[]): Set<string> {
  const duplicateIds = new Set<string>();
  
  // Only process photos that have CLIP vectors
  const photosWithVectors = photos.filter(p => p.clip_vector && p.clip_vector.length > 0);
  
  for (let i = 0; i < photosWithVectors.length; i++) {
    const photo1 = photosWithVectors[i];
    
    for (let j = i + 1; j < photosWithVectors.length; j++) {
      const photo2 = photosWithVectors[j];
      
      if (photo1.clip_vector && photo2.clip_vector) {
        const similarity = cosineSimilarity(photo1.clip_vector, photo2.clip_vector);
        
        if (similarity >= SIMILARITY_THRESHOLD) {
          duplicateIds.add(photo1.id);
          duplicateIds.add(photo2.id);
        }
      }
    }
  }
  
  return duplicateIds;
}