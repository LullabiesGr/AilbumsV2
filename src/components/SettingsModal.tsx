import React, { useState } from 'react';
import { X, Globe, Monitor, Bell, Shield, Palette, Volume2 } from 'lucide-react';
import { useLanguage, LanguageInfo } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, t, availableLanguages } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'privacy'>('general');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = (language: LanguageInfo) => {
    setLanguage(language.code);
    setIsLanguageDropdownOpen(false);
  };

  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('settings.language')}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 
                     transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getCurrentLanguageInfo().flag}</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {getCurrentLanguageInfo().nativeName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getCurrentLanguageInfo().name}
                </div>
              </div>
            </div>
            <Globe className="h-5 w-5 text-gray-400" />
          </button>

          {isLanguageDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsLanguageDropdownOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 
                            border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl 
                            max-h-64 overflow-y-auto z-20">
                <div className="py-1">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                               transition-colors duration-200 flex items-center space-x-3 ${
                        currentLanguage === language.code 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span className="text-2xl">{language.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {language.name}
                        </div>
                      </div>
                      {currentLanguage === language.code && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Choose your preferred language for the interface
        </p>
      </div>

      {/* Notifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('settings.notifications')}
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Analysis completion notifications
              </span>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sound notifications
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Auto-save */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Auto-save Settings
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Automatically save progress during analysis
          </span>
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: '☀️' },
            { id: 'dark', label: 'Dark', icon: '🌙' },
            { id: 'auto', label: 'Auto', icon: '🔄' }
          ].map((theme) => (
            <button
              key={theme.id}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                       hover:border-blue-500 transition-colors duration-200 text-center"
            >
              <div className="text-2xl mb-2">{theme.icon}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* View Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Default View Mode
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
          <option value="compact">Compact View</option>
        </select>
      </div>

      {/* Animation */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable animations and transitions
            </span>
          </div>
        </label>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {/* Data Storage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Data Storage
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Save analysis results locally
            </span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Share anonymous usage statistics
            </span>
          </label>
        </div>
      </div>

      {/* Privacy Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Privacy Level
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option value="high">High - Minimal data collection</option>
          <option value="medium">Medium - Essential features only</option>
          <option value="low">Low - Full feature access</option>
        </select>
      </div>

      {/* Clear Data */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                         transition-colors duration-200 flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Clear All Local Data</span>
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This will remove all saved albums, settings, and cached data
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl 
                            flex items-center justify-center">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  {t('settings.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your Ailbums experience
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4 space-y-2">
              {[
                { id: 'general', label: 'General', icon: Globe },
                { id: 'appearance', label: t('settings.appearance'), icon: Palette },
                { id: 'privacy', label: t('settings.privacy'), icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                           transition-colors duration-200 text-left ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'privacy' && renderPrivacySettings()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Settings are automatically saved
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       transition-colors duration-200 font-medium"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;