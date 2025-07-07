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
  
  const getGalleryClassName = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
      case 'list':
        return 'flex flex-col gap-3';
      case 'compact':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
    }
  };
  
  return (
    <div className={getGalleryClassName()}>
      {filteredPhotos.map((photo) => (
        <ImageCard key={photo.id} photo={photo} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default Gallery;