import React, { useState } from 'react';
import { usePhoto } from '../context/PhotoContext';
import { Album } from '../types';
import { FolderPlus, Folder, X, Edit2, Trash2 } from 'lucide-react';

const AlbumSelector: React.FC = () => {
  const { 
    albums, 
    currentAlbum, 
    setCurrentAlbum, 
    createAlbum, 
    deleteAlbum,
    updateAlbum 
  } = usePhoto();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      createAlbum(newAlbumName.trim(), newAlbumDescription.trim());
      setNewAlbumName('');
      setNewAlbumDescription('');
      setShowCreateModal(false);
    }
  };

  const handleUpdateAlbum = () => {
    if (editingAlbum && newAlbumName.trim()) {
      updateAlbum(editingAlbum.id, {
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim()
      });
      setEditingAlbum(null);
      setNewAlbumName('');
      setNewAlbumDescription('');
    }
  };

  const handleDeleteAlbum = (album: Album) => {
    if (window.confirm(`Are you sure you want to delete the album "${album.name}"?`)) {
      deleteAlbum(album.id);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setCurrentAlbum(null)}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${
            !currentAlbum
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}
        >
          <Folder className="h-4 w-4" />
          All Photos
        </button>

        {albums.map(album => (
          <button
            key={album.id}
            onClick={() => setCurrentAlbum(album)}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${
              currentAlbum?.id === album.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
          >
            <Folder className="h-4 w-4" />
            {album.name}
          </button>
        ))}

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md flex items-center gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          New Album
        </button>
      </div>

      {(showCreateModal || editingAlbum) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAlbum ? 'Edit Album' : 'Create New Album'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAlbum(null);
                  setNewAlbumName('');
                  setNewAlbumDescription('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Album Name</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Enter album name"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={newAlbumDescription}
                  onChange={(e) => setNewAlbumDescription(e.target.value)}
                  placeholder="Enter album description"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAlbum(null);
                    setNewAlbumName('');
                    setNewAlbumDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                           dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
                  disabled={!newAlbumName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAlbum ? 'Update Album' : 'Create Album'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentAlbum && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              setEditingAlbum(currentAlbum);
              setNewAlbumName(currentAlbum.name);
              setNewAlbumDescription(currentAlbum.description || '');
            }}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Album
          </button>
          <button
            onClick={() => handleDeleteAlbum(currentAlbum)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Album
          </button>
        </div>
      )}
    </div>
  );
};

export default AlbumSelector;