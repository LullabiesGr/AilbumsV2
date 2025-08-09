import React from 'react';
import { useState } from 'react';
import { BookOpen, FolderOpen, CreditCard } from 'lucide-react';
import Tutorial from './Tutorial';
import MyAilbumsModal from './MyAilbumsModal';
import MyCreditsModal from './MyCreditsModal';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { usePhoto } from '../context/PhotoContext';
import { SavedAlbum } from './MyAilbumsModal';

const Header: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMyAilbums, setShowMyAilbums] = useState(false);
  const [showMyCredits, setShowMyCredits] = useState(false);
  const { isAuthenticated } = useAuth();
  const { loadAlbumForReview } = usePhoto();

  const handleOpenAlbumReview = (album: SavedAlbum) => {
    loadAlbumForReview(album);
  };

  return (
    <>
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.postimg.cc/c18qn8yp/Untitled-design-19.png" 
                alt="AftershootKiller Logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold">
                Ailbums <span className="text-blue-600">–</span> AI Photo Culling
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <button 
                  onClick={() => setShowMyCredits(true)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 
                           hover:from-green-700 hover:to-emerald-700 text-white rounded-md 
                           transition-all duration-200 flex items-center space-x-2 font-medium
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>My Credits</span>
                </button>
              )}
              
              {isAuthenticated && (
                <button 
                  onClick={() => setShowMyAilbums(true)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700 text-white rounded-md 
                           transition-all duration-200 flex items-center space-x-2 font-medium
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>My Ailbums</span>
                </button>
              )}
              
              <button 
                onClick={() => setShowTutorial(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white 
                         rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Tutorial</span>
              </button>
              
              {isAuthenticated && <UserMenu />}
            </div>
          </div>
        </div>
      </header>
      
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
      
      <MyAilbumsModal 
        isOpen={showMyAilbums} 
        onClose={() => setShowMyAilbums(false)} 
        onOpenAlbumReview={handleOpenAlbumReview}
      />
      
      <MyCreditsModal 
        isOpen={showMyCredits} 
        onClose={() => setShowMyCredits(false)} 
      />
    </>
  );
};

export default Header;