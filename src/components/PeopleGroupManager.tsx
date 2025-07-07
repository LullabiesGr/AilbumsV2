import React, { useState } from 'react';
import { Users, Eye, Filter, User, X } from 'lucide-react';
import { usePhoto } from '../context/PhotoContext';
import { PersonGroup } from '../types';
import FaceOverlay from './FaceOverlay';

const PeopleGroupManager: React.FC = () => {
  const { 
    personGroups, 
    photos, 
    selectedPersonGroup, 
    setSelectedPersonGroup 
  } = usePhoto();
  
  const [selectedGroup, setSelectedGroup] = useState<PersonGroup | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (personGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No People Groups Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze photos with faces to automatically group people by similarity.
        </p>
      </div>
    );
  }

  const handleViewGroup = (group: PersonGroup) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleFilterByGroup = (groupId: string) => {
    // Toggle the filter - if same group is clicked, clear filter
    const newSelection = selectedPersonGroup === groupId ? null : groupId;
    setSelectedPersonGroup(newSelection);
    
    // Show feedback to user
    if (newSelection) {
      const group = personGroups.find(g => g.group_id === groupId);
      if (group) {
        // You could add a toast here if desired
        console.log(`Filtering by person group: ${groupId} (${group.photo_count} photos)`);
      }
    }
  };

  const getEmotionDistribution = (group: PersonGroup) => {
    const emotions: Record<string, number> = {};
    group.faces.forEach(face => {
      if (face.emotion) {
        emotions[face.emotion] = (emotions[face.emotion] || 0) + 1;
      }
    });
    return emotions;
  };

  const getAverageAge = (group: PersonGroup) => {
    const ages = group.faces.filter(face => face.age).map(face => face.age!);
    return ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : null;
  };

  const getGenderDistribution = (group: PersonGroup) => {
    const genders: Record<string, number> = {};
    group.faces.forEach(face => {
      if (face.gender) {
        genders[face.gender] = (genders[face.gender] || 0) + 1;
      }
    });
    return genders;
  };

  const renderGroupCard = (group: PersonGroup) => {
    const emotions = getEmotionDistribution(group);
    const averageAge = getAverageAge(group);
    const genders = getGenderDistribution(group);
    const isFiltered = selectedPersonGroup === group.group_id;

    return (
      <div 
        key={group.group_id}
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all duration-200 ${
          isFiltered 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Person {String(group.group_id || '').slice(-4)}
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handleFilterByGroup(group.group_id)}
              className={`p-1.5 rounded-md transition-colors duration-200 ${
                isFiltered
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={isFiltered ? 'Clear filter' : 'Filter by this person'}
            >
              {isFiltered ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleViewGroup(group)}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                       hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Representative face */}
        {group.representative_face && (
          <div className="mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto bg-gray-200 dark:bg-gray-700">
              {group.photos[0] && (
                <div className="relative w-full h-full">
                  <img
                    src={group.photos[0].url}
                    alt="Representative face"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${group.representative_face.x * 100 + group.representative_face.width * 50}% ${group.representative_face.y * 100 + group.representative_face.height * 50}%`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Photos:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{group.photo_count}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Faces:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{group.faces.length}</span>
          </div>

          {averageAge && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Age:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{averageAge}y</span>
            </div>
          )}

          {Object.keys(genders).length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Gender:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Object.entries(genders).map(([gender, count]) => 
                  `${gender} (${count})`
                ).join(', ')}
              </span>
            </div>
          )}

          {Object.keys(emotions).length > 0 && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Emotions:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(emotions).map(([emotion, count]) => (
                  <span 
                    key={emotion}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             text-xs rounded-full"
                  >
                    {emotion} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Show filter status */}
        {isFiltered && (
          <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
            <div className="text-xs text-blue-800 dark:text-blue-200 font-medium text-center">
              Gallery filtered to this person
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroupModal = () => {
    if (!selectedGroup) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Person {String(selectedGroup.group_id || '').slice(-4)} - {selectedGroup.photo_count} Photos
                    </h3>
                    <button
                      onClick={() => {
                        handleFilterByGroup(selectedGroup.group_id);
                        setShowModal(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md 
                               flex items-center space-x-1 transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter Gallery</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGroup.faces.length} face instances detected
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedGroup.photos.map((photo) => {
                const personFaces = photo.faces?.filter(face => 
                  face.same_person_group === selectedGroup.group_id
                ) || [];

                return (
                  <div key={photo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="aspect-square rounded overflow-hidden mb-2 relative">
                      <div className="relative w-full h-full">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Highlight person's faces using FaceOverlay */}
                        {personFaces.length > 0 && (
                          <div className="absolute inset-0">
                            {personFaces.map((face, index) => {
                              // Calculate position based on face.box coordinates
                              if (!face.box || face.box.length !== 4) return null;
                              
                              const [x1, y1, x2, y2] = face.box;
                              
                              // For modal display, we need to calculate relative positions
                              // Assuming the image container is the reference
                              return (
                                <div
                                  key={index}
                                  className="absolute border-2 border-blue-500 bg-blue-500/20 rounded"
                                  style={{
                                    left: `${(x1 / photo.file.width) * 100}%`,
                                    top: `${(y1 / photo.file.height) * 100}%`,
                                    width: `${((x2 - x1) / photo.file.width) * 100}%`,
                                    height: `${((y2 - y1) / photo.file.height) * 100}%`,
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate" 
                          title={photo.filename}>
                        {photo.filename}
                      </h4>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {personFaces.length} face{personFaces.length !== 1 ? 's' : ''}
                        {personFaces[0]?.confidence && (
                          <span className="ml-2">
                            ({(personFaces[0].confidence * 100).toFixed(0)}% confidence)
                          </span>
                        )}
                      </div>

                      {personFaces.length > 0 && personFaces[0].emotion && (
                        <div className="text-xs">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {personFaces[0].emotion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Group ID: {selectedGroup.group_id}</p>
                <p>
                  Average quality: {selectedGroup.faces.filter(f => f.face_quality).length > 0 
                    ? (selectedGroup.faces.reduce((sum, f) => sum + (f.face_quality || 0), 0) / selectedGroup.faces.filter(f => f.face_quality).length * 100).toFixed(1) + '%'
                    : 'N/A'}
                </p>
                <p>
                  Average confidence: {selectedGroup.faces.length > 0 
                    ? (selectedGroup.faces.reduce((sum, f) => sum + (f.confidence || 0), 0) / selectedGroup.faces.length * 100).toFixed(1) + '%'
                    : 'N/A'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    handleFilterByGroup(selectedGroup.group_id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                           flex items-center space-x-2 transition-colors duration-200"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter Gallery</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md 
                           transition-colors duration-200"
                >
                  Close
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
          People Groups ({personGroups.length})
        </h3>
        {selectedPersonGroup && (
          <button
            onClick={() => setSelectedPersonGroup(null)}
            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                     text-sm rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {personGroups.map(group => renderGroupCard(group))}
      </div>

      {showModal && renderGroupModal()}
    </div>
  );
};

export default PeopleGroupManager;