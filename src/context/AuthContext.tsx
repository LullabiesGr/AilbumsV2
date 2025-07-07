import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Open popup window for Google OAuth
      const popup = window.open(
        'https://ailbums.pro/auth?desktop=1',
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Failed to open popup window. Please allow popups for this site.'));
        return;
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== 'https://ailbums.pro') {
          return;
        }

        const { token, user: userData, error } = event.data;

        if (error) {
          window.removeEventListener('message', handleMessage);
          popup.close();
          reject(new Error(error));
          return;
        }

        if (token && userData) {
          // Store auth data
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setAccessToken(token);
          setUser(userData);

          // Clean up
          window.removeEventListener('message', handleMessage);
          popup.close();
          resolve();
        }
      };

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Login was cancelled'));
        }
      }, 1000);

      window.addEventListener('message', handleMessage);

      // Cleanup on timeout (5 minutes)
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
        reject(new Error('Login timeout'));
      }, 300000);
    });
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-user-' + Date.now(),
      email: 'guest@ailbums.pro',
      name: 'Guest User',
      picture: undefined
    };
    
    const guestToken = 'guest-token-' + Date.now();
    
    // Store guest credentials (they'll be cleared on logout)
    localStorage.setItem('access_token', guestToken);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('is_guest', 'true');
    
    setAccessToken(guestToken);
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_guest');
    setAccessToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    loginAsGuest,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};