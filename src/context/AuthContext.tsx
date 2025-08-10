import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

  // Check for existing auth on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || 'User',
          picture: session.user.user_metadata?.picture
        });
      } else {
        // Check for guest user in localStorage
        const isGuest = localStorage.getItem('is_guest');
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('access_token');
        
        if (isGuest && storedUser && storedToken) {
          try {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Failed to parse stored guest user data:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('is_guest');
          }
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || 'User',
          picture: session.user.user_metadata?.picture
        });
        // Clear any guest data
        localStorage.removeItem('is_guest');
      } else if (event === 'SIGNED_OUT') {
        setAccessToken(null);
        setUser(null);
        // Clear all auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('is_guest');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setAccessToken(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
          // Set the session in Supabase auth
          supabase.auth.setSession({
            access_token: token,
            refresh_token: token // Using the same token as refresh for external auth
          }).then(() => {
            setAccessToken(token);
            setUser(userData);
          });

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
    const isGuest = localStorage.getItem('is_guest');
    
    if (isGuest) {
      // For guest users, just clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('is_guest');
      setAccessToken(null);
      setUser(null);
    } else {
      // For real users, sign out from Supabase
      supabase.auth.signOut();
    }
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