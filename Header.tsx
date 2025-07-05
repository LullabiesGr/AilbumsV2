import React from 'react';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Tutorial from './Tutorial';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const { isAuthenticated } = useAuth();

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
              
              {isAuthenticated && <UserMenu />}
            </div>
          </div>
        </div>
      </header>
      
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </>
  );
};

export default Header;