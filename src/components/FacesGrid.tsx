import React, { useState } from 'react';
import { User, Eye, Smile, Frown, Meh, Heart, AlertCircle, Glasses, Shield, EyeOff } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { Face } from '../types';

interface FaceWithPhoto {
  face: Face;
  photoId: string;
  photoUrl: string;
  filename: string;
}

const FacesGrid: React.FC = () => {
  const { photos } = usePhoto();
  const [selectedFace, setSelectedFace] = useState<FaceWithPhoto | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get all faces from all photos
  const allFaces: FaceWithPhoto[] = photos.flatMap(photo => 
    photo.faces?.map(face => ({
      face,
      photoId: photo.id,
      photoUrl: photo.url,
      filename: photo.filename
    })) || []
  ).filter(faceData => faceData.face.face_crop_b64); // Only faces with crop data

  // Sort by quality and confidence
  const sortedFaces = allFaces.sort((a, b) => {
    const qualityDiff = (b.face.face_quality || 0) - (a.face.face_quality || 0);
    if (Math.abs(qualityDiff) > 0.1) return qualityDiff;
    return (b.face.confidence || 0) - (a.face.confidence || 0);
  });

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad':
        return <Frown className="h-4 w-4 text-blue-500" />;
      case 'angry':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'surprise':
        return <Heart className="h-4 w-4 text-yellow-500" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-gray-500" />;
      default:
        return <Heart className="h-4 w-4 text-pink-500" />;
    }
  };

  const handleFaceClick = (faceData: FaceWithPhoto) => {
    setSelectedFace(faceData);
    setShowModal(true);
  };

  if (allFaces.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Faces Detected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze photos to detect and display faces with AI-powered attributes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          All Detected Faces ({allFaces.length})
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          From {photos.filter(p => p.faces && p.faces.length > 0).length} photos
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {sortedFaces.map((faceData, index) => (
          <div
            key={`${faceData.photoId}-${index}`}
            className="aspect-square rounded-lg overflow-hidden relative cursor-pointer bg-gray-100 dark:bg-gray-700
                     hover:ring-2 ring-blue-500 transition-all duration-200 group border border-gray-200 dark:border-gray-600"
            onClick={() => handleFaceClick(faceData)}
          >
            <img
              src={`data:image/png;base64,${faceData.face.face_crop_b64}`}
              alt={`Face from ${faceData.filename}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Quality indicator */}
            {faceData.face.face_quality && (
              <div className="absolute top-1 right-1 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(faceData.face.face_quality * 100)}%
              </div>
            )}
            
            {/* Emotion indicator */}
            {faceData.face.emotion && (
              <div className="absolute top-1 left-1 bg-black/75 rounded p-1
                           opacity-0 group-hover:opacity-100 transition-opacity">
                {getEmotionIcon(faceData.face.emotion)}
              </div>
            )}
            
            {/* Age and gender */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2
                         opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-xs">
                {faceData.face.age && (
                  <div>{Math.round(faceData.face.age)}y</div>
                )}
                {faceData.face.gender && (
                  <div className="capitalize">{faceData.face.gender}</div>
                )}
              </div>
            </div>
            
            {/* Special indicators */}
            <div className="absolute bottom-1 right-1 flex space-x-1">
              {faceData.face.eyes_closed && (
                <EyeOff className="h-3 w-3 text-red-400" />
              )}
              {faceData.face.glasses && (
                <Glasses className="h-3 w-3 text-blue-400" />
              )}
              {faceData.face.mask && (
                <Shield className="h-3 w-3 text-green-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Face Detail Modal */}
      {showModal && selectedFace && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Face Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Face Image */}
                <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${selectedFace.face.face_crop_b64}`}
                    alt="Face detail"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Face Attributes */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Source:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                      {selectedFace.filename}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(selectedFace.face.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  {selectedFace.face.face_quality && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {(selectedFace.face.face_quality * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {selectedFace.face.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Age:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {Math.round(selectedFace.face.age)} years
                      </span>
                    </div>
                  )}

                  {selectedFace.face.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {selectedFace.face.gender}
                      </span>
                    </div>
                  )}

                  {selectedFace.face.emotion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Emotion:</span>
                      <div className="flex items-center space-x-2">
                        {getEmotionIcon(selectedFace.face.emotion)}
                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {selectedFace.face.emotion}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedFace.face.smile !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Smile:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {(selectedFace.face.smile * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}

                  {/* Accessories */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accessories:</span>
                    <div className="flex space-x-2">
                      {selectedFace.face.glasses && (
                        <div className="flex items-center space-x-1">
                          <Glasses className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Glasses</span>
                        </div>
                      )}
                      {selectedFace.face.mask && (
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Mask</span>
                        </div>
                      )}
                      {selectedFace.face.eyes_closed && (
                        <div className="flex items-center space-x-1">
                          <EyeOff className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Eyes Closed</span>
                        </div>
                      )}
                      {!selectedFace.face.glasses && !selectedFace.face.mask && !selectedFace.face.eyes_closed && (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </div>
                  </div>

                  {selectedFace.face.same_person_group && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Person ID:</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                        {String(selectedFace.face.same_person_group).slice(-8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacesGrid;