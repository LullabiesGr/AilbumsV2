import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationSettings {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  showUpgrades: boolean;
  showMilestones: boolean;
  showFeatures: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  hideNotifications: () => void;
  showNotifications: () => void;
  isHidden: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  frequency: 'low', // low = 60-120s, medium = 30-60s, high = 15-30s
  showUpgrades: true,
  showMilestones: true,
  showFeatures: true
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isHidden, setIsHidden] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings');
    const hidden = localStorage.getItem('notifications_hidden');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.warn('Failed to parse notification settings:', error);
      }
    }
    
    setIsHidden(hidden === 'true');
  }, []);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
  };

  const hideNotifications = () => {
    setIsHidden(true);
    localStorage.setItem('notifications_hidden', 'true');
  };

  const showNotifications = () => {
    setIsHidden(false);
    localStorage.removeItem('notifications_hidden');
  };

  const value: NotificationContextType = {
    settings,
    updateSettings,
    hideNotifications,
    showNotifications,
    isHidden
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};