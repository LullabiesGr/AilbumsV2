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
  loginWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
      } else if (event === 'SIGNED_OUT') {
        setAccessToken(null);
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setAccessToken(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
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

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setAccessToken(data.session?.access_token || null);
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email || 'User',
        picture: data.user.user_metadata?.picture
      });
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw error;
    }

    // Note: User will need to verify email before they can sign in
    // The session will be null until email is verified
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  const logout = () => {
    // Sign out from Supabase
    supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    loginWithGoogle,
    signIn,
    signUp,
    resetPassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};