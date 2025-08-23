import React from 'react';
import { useState } from 'react';
import { BookOpen, FolderOpen, CreditCard, Home, Crown } from 'lucide-react';
import { Bell, BellOff } from 'lucide-react';
import Tutorial from './Tutorial';
import MyAilbumsModal from './MyAilbumsModal';
import MyCreditsModal from './MyCreditsModal';
import UserMenu from './UserMenu';
import CreditsWidget from './CreditsWidget';
import CreditsSummaryModal from './CreditsSummaryModal';
import NotificationSettings from './NotificationSettings';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { usePhoto } from '../context/PhotoContext';
import { SavedAlbum } from './MyAilbumsModal';

const Header: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMyAilbums, setShowMyAilbums] = useState(false);
  const [showMyCredits, setShowMyCredits] = useState(false);
  const [showCreditsSummary, setShowCreditsSummary] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isHidden: notificationsHidden, showNotifications, hideNotifications } = useNotifications();
  const { loadAlbumForReview, setWorkflowStage, resetWorkflow } = usePhoto();

  const handleOpenAlbumReview = (album: SavedAlbum) => {
    loadAlbumForReview(album);
  };

  const handleGoHome = () => {
    // Reset workflow and go to upload step
    resetWorkflow();
    setWorkflowStage('upload');
    window.history.pushState({}, '', '/');
  };

  const handleGoPricing = () => {
    window.history.pushState({}, '', '/pricing');
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleGoHome}>
              <img 
                src="https://i.postimg.cc/c18qn8yp/Untitled-design-19.png" 
                alt="AftershootKiller Logo"
                className="h-10 w-10 object-contain hover:scale-110 transition-transform duration-200"
                title="Go to Home"
              />
              <h1 className="text-xl md:text-2xl font-bold hover:text-blue-600 transition-colors duration-200" 
                  title="Go to Home">
                Ailbums <span className="text-blue-600">–</span> AI Photo Culling
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <div onClick={() => setShowCreditsSummary(true)} className="cursor-pointer">
                  <CreditsWidget />
                </div>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    notificationsHidden 
                      ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                      : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  }`}
                  title={notificationsHidden ? 'Notifications disabled' : 'Notification settings'}
                >
                  {notificationsHidden ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </button>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    notificationsHidden 
                      ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                      : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  }`}
                  title={notificationsHidden ? 'Notifications disabled' : 'Notification settings'}
                >
                  {notificationsHidden ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </button>
              )}
              
              <button 
                onClick={handleGoHome}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                         transition-all duration-200 flex items-center space-x-2 font-medium
                         shadow-md hover:shadow-lg transform hover:scale-105"
                title="Go to Home - Upload Photos"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              {isAuthenticated && (
                <button 
                  onClick={handleGoPricing}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700 text-white rounded-md 
                           transition-all duration-200 flex items-center space-x-2 font-medium
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Crown className="h-4 w-4" />
                  <span>Pricing</span>
                </button>
              )}
              
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
      
      <CreditsSummaryModal 
        isOpen={showCreditsSummary} 
        onClose={() => setShowCreditsSummary(false)} 
      />
      
      <NotificationSettings 
        isOpen={showNotificationSettings} 
        onClose={() => setShowNotificationSettings(false)} 
      />
    </>
  );
};

export default Header;