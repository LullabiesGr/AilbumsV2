import React, { useState } from 'react';
import { Copy, Check, X, Trash2, Eye, Star } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { DuplicateCluster } from '../types';

const DuplicateManager: React.FC = () => {
  const { 
    duplicateClusters, 
    photos, 
    markDuplicateAsKeep, 
    deleteDuplicateGroup 
  } = usePhoto();
  
  const [selectedCluster, setSelectedCluster] = useState<DuplicateCluster | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (duplicateClusters.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <Copy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Duplicates Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click "Find Duplicates" to scan your photos for similar images.
        </p>
      </div>
    );
  }

  const handleViewCluster = (cluster: DuplicateCluster) => {
    setSelectedCluster(cluster);
    setShowModal(true);
  };

  const handleKeepPhoto = (filename: string, duplicateGroup: string[]) => {
    markDuplicateAsKeep(filename, duplicateGroup);
    setShowModal(false);
  };

  const handleDeleteGroup = (duplicateGroup: string[]) => {
    if (window.confirm(`Delete all ${duplicateGroup.length} duplicate photos?`)) {
      deleteDuplicateGroup(duplicateGroup);
      setShowModal(false);
    }
  };

  const getPhotoByFilename = (filename: string) => {
    return photos.find(p => p.filename === filename);
  };

  const renderClusterPreview = (cluster: DuplicateCluster) => {
    const allDuplicates = [
      cluster.filename,
      ...cluster.clip_duplicates,
      ...cluster.phash_duplicates
    ].filter((filename, index, arr) => arr.indexOf(filename) === index);

    const previewPhotos = allDuplicates
      .map(filename => getPhotoByFilename(filename))
      .filter(Boolean)
      .slice(0, 4);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Copy className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {allDuplicates.length} Similar Photos
            </span>
          </div>
          <button
            onClick={() => handleViewCluster(cluster)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                     transition-colors duration-200"
          >
            Review
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {previewPhotos.map((photo, index) => (
            <div key={photo!.id} className="aspect-square rounded overflow-hidden relative">
              <img
                src={photo!.url}
                alt={photo!.filename}
                className="w-full h-full object-cover"
              />
              {photo!.ai_score > 0 && (
                <div className="absolute top-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                  {(photo!.ai_score / 2).toFixed(1)}★
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>CLIP Duplicates: {cluster.clip_duplicates.length}</span>
            <span>Hash Duplicates: {cluster.phash_duplicates.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderClusterModal = () => {
    if (!selectedCluster) return null;

    const allDuplicates = [
      selectedCluster.filename,
      ...selectedCluster.clip_duplicates,
      ...selectedCluster.phash_duplicates
    ].filter((filename, index, arr) => arr.indexOf(filename) === index);

    const duplicatePhotos = allDuplicates
      .map(filename => getPhotoByFilename(filename))
      .filter(Boolean);

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Copy className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Duplicate Photos ({allDuplicates.length})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select the best photo to keep, others will be marked for deletion
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {duplicatePhotos.map((photo) => (
                <div key={photo!.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square rounded overflow-hidden mb-3 relative">
                    <img
                      src={photo!.url}
                      alt={photo!.filename}
                      className="w-full h-full object-cover"
                    />
                    {photo!.faces && photo!.faces.length > 0 && (
                      <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {photo!.faces.length} faces
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" 
                        title={photo!.filename}>
                      {photo!.filename}
                    </h4>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{photo!.ai_score > 0 ? (photo!.ai_score / 2).toFixed(1) : 'N/A'}</span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {photo!.face_summary?.total_faces || 0} faces
                      </div>
                    </div>

                    {photo!.caption && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {photo!.caption}
                      </p>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleKeepPhoto(photo!.filename, allDuplicates)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white 
                                 text-sm rounded-md flex items-center justify-center space-x-1 
                                 transition-colors duration-200"
                      >
                        <Check className="h-4 w-4" />
                        <span>Keep This</span>
                      </button>
                      <button
                        onClick={() => window.open(photo!.url, '_blank')}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                                 text-sm rounded-md transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>CLIP similarity: {selectedCluster.clip_duplicates.length} matches</p>
                <p>Perceptual hash: {selectedCluster.phash_duplicates.length} matches</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 
                           dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteGroup(allDuplicates)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md 
                           flex items-center space-x-2 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Duplicate Groups ({duplicateClusters.length})
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Found {duplicateClusters.reduce((total, cluster) => 
            total + cluster.clip_duplicates.length + cluster.phash_duplicates.length + 1, 0
          )} total duplicates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {duplicateClusters.map((cluster, index) => (
          <div key={index}>
            {renderClusterPreview(cluster)}
          </div>
        ))}
      </div>

      {showModal && renderClusterModal()}
    </div>
  );
};

export default DuplicateManager;