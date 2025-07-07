import React from 'react';
import ImageCard from './ImageCard';
import { usePhoto } from '../context/PhotoContext';

const Gallery: React.FC = () => {
  const { filteredPhotos, viewMode, isLoading } = usePhoto();
  
  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }
  
  // DEBUG MODE: Show images at original size in a simple vertical layout
  const getGalleryClassName = () => {
    return 'flex flex-col gap-8 items-start'; // Simple vertical layout for debug
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">🐛 DEBUG MODE ACTIVE</h3>
        <p className="text-red-700 dark:text-red-300 text-sm">
          Images are displayed at their original size with face boxes using direct backend coordinates.
          This will help us verify if face detection coordinates are correct before implementing scaling.
        </p>
      </div>
      
      <div className={getGalleryClassName()}>
      {filteredPhotos.map((photo) => (
        <ImageCard key={photo.id} photo={photo} viewMode={viewMode} />
      ))}
      </div>
    </div>
  );
};

export default Gallery;