import React, { useState } from 'react';
import { Settings, Bell, BellOff, Crown, Star, TrendingUp, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, hideNotifications, showNotifications, isHidden } = useNotifications();

  const handleToggleNotifications = () => {
    if (isHidden) {
      showNotifications();
    } else {
      hideNotifications();
    }
  };

  const handleFrequencyChange = (frequency: 'low' | 'medium' | 'high') => {
    updateSettings({ frequency });
  };

  const handleTypeToggle = (type: 'showUpgrades' | 'showMilestones' | 'showFeatures') => {
    updateSettings({ [type]: !settings[type] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg 
                            flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  Notification Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your notification preferences
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isHidden ? (
                <BellOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Bell className="h-5 w-5 text-blue-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Live Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show real-time updates from other users
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isHidden ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHidden ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>

          {!isHidden && (
            <>
              {/* Frequency Settings */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Notification Frequency
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low (1-2 minutes)', description: 'Minimal interruptions' },
                    { value: 'medium', label: 'Medium (30-60 seconds)', description: 'Balanced updates' },
                    { value: 'high', label: 'High (15-30 seconds)', description: 'Frequent updates' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={settings.frequency === option.value}
                        onChange={() => handleFrequencyChange(option.value as any)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Notification Types
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Plan Upgrades
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          When users upgrade their plans
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showUpgrades}
                      onChange={() => handleTypeToggle('showUpgrades')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Milestones
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Platform milestones and achievements
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showMilestones}
                      onChange={() => handleTypeToggle('showMilestones')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4 text-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Feature Usage
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          When users try new features
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showFeatures}
                      onChange={() => handleTypeToggle('showFeatures')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Privacy Note:</strong> These are simulated notifications for social proof. 
                  No real user data is shared. You can disable them anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;