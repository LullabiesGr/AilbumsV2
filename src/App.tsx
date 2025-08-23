import React, { useState } from 'react';
import Home from './pages/Home';
import { ToastProvider } from './context/ToastContext';
import { PhotoProvider } from './context/PhotoContext';
import { CreditsProvider } from './context/CreditsContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import PricingPage from './components/PricingPage';
import SuccessPage from './components/SuccessPage';
import NotificationSystem from './components/NotificationSystem';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing' | 'success'>('home');

  // Check URL for routing
  React.useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    
    if (path === '/pricing') {
      setCurrentPage('pricing');
    } else if (path === '/success' || search.includes('session_id')) {
      setCurrentPage('success');
    } else {
      setCurrentPage('home');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Handle different pages
  switch (currentPage) {
    case 'pricing':
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <PricingPage onBack={() => {
            setCurrentPage('home');
            window.history.pushState({}, '', '/');
          }} />
        </div>
      );
    
    case 'success':
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <SuccessPage />
        </div>
      );
    
    default:
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Home />
    </div>
  );
  }
};

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AuthProvider>
          <CreditsProvider>
            <PhotoProvider>
              <AppContent />
              <NotificationSystem />
            </PhotoProvider>
          </CreditsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;