import React from 'react';
import { useState } from 'react';
import { BookOpen, Folder } from 'lucide-react';
import Tutorial from './Tutorial';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { usePhoto } from '../context/PhotoContext';
import MyAilbumsTab from './MyAilbumsTab';

const Header: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMyAilbums, setShowMyAilbums] = useState(false);
  const { isAuthenticated } = useAuth();
  const { setWorkflowStage } = usePhoto();

  const handleMyAilbumsClick = () => {
    setWorkflowStage('review');
    // Small delay to ensure stage is set before showing albums
    setTimeout(() => {
      setShowMyAilbums(true);
    }, 100);
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
              <button 
                onClick={() => setShowTutorial(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white 
                         rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Tutorial</span>
              </button>
              
              {isAuthenticated && (
                <button 
                  onClick={handleMyAilbumsClick}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700 text-white rounded-md 
                           transition-all duration-200 flex items-center space-x-2 shadow-md
                           hover:shadow-lg transform hover:scale-105"
                >
                  <Folder className="h-4 w-4" />
                  <span>My Ailbums</span>
                </button>
              )}
              
              {isAuthenticated && <UserMenu />}
            </div>
          </div>
        </div>
      </header>
      
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
      
      {showMyAilbums && (
        <MyAilbumsModal 
          isOpen={showMyAilbums} 
          onClose={() => setShowMyAilbums(false)} 
        />
      )}
    </>
  );
};

// My Ailbums Modal Component
interface MyAilbumsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyAilbumsModal: React.FC<MyAilbumsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Ailbums
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your saved photo albums and culling sessions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <MyAilbumsTab />
        </div>
      </div>
    </div>
  );
};

export default Header;