import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'el' | 'ru' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'tr' | 'nl' | 'sv' | 'no' | 'da' | 'fi' | 'pl' | 'cs' | 'hu' | 'ro' | 'bg' | 'hr' | 'sk' | 'sl' | 'et' | 'lv' | 'lt';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' }
];

// Translation keys and default English translations
export const translations = {
  en: {
    // Navigation
    'nav.myAlbums': 'My Albums',
    'nav.tutorial': 'Tutorial',
    'nav.settings': 'Settings',
    
    // Upload
    'upload.title': 'Upload Photos',
    'upload.description': 'Start by uploading your photos. You\'ll set album details before analysis.',
    'upload.button': 'Upload Photos',
    'upload.addMore': 'Add More Photos',
    'upload.supportedFormats': 'Supported formats:',
    'upload.standard': 'Standard: JPEG, PNG, TIFF, WebP, BMP',
    'upload.raw': 'RAW: CR2, CR3, NEF, ARW, DNG, ORF, RAF, PEF, and more',
    
    // Album Configuration
    'album.configuration': 'Album Configuration',
    'album.name': 'Album Name',
    'album.namePlaceholder': 'e.g. Wedding of John & Mary 2024',
    'album.eventType': 'Event Type',
    'album.selectEventType': 'Select event type...',
    'album.preview': 'Album Preview:',
    'album.photos': 'Photos',
    'album.cullingMode': 'Culling Mode',
    'album.backendPath': 'Backend Path',
    
    // Event Types
    'eventType.wedding': 'Wedding',
    'eventType.baptism': 'Baptism',
    'eventType.portrait': 'Portrait',
    'eventType.family': 'Family',
    'eventType.corporate': 'Corporate',
    'eventType.event': 'General Event',
    'eventType.landscape': 'Landscape',
    
    // Culling Modes
    'culling.fast': 'Fast Culling',
    'culling.deep': 'Deep Analysis',
    'culling.manual': 'Manual Review',
    
    // Analysis
    'analysis.start': 'Start Analysis',
    'analysis.analyzing': 'Analyzing...',
    'analysis.complete': 'Analysis Complete!',
    'analysis.progress': 'Progress',
    
    // Gallery
    'gallery.selected': 'selected',
    'gallery.photos': 'photos',
    'gallery.photo': 'photo',
    'gallery.selectAll': 'Select All',
    'gallery.deselectAll': 'Deselect All',
    
    // Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.download': 'Download',
    'action.edit': 'Edit',
    'action.view': 'View',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.previous': 'Previous',
    'action.reset': 'Reset',
    'action.apply': 'Apply',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.selectLanguage': 'Select Language',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    
    // Messages
    'message.success': 'Success!',
    'message.error': 'Error',
    'message.warning': 'Warning',
    'message.info': 'Information',
    'message.loading': 'Loading...',
    'message.noPhotos': 'No photos found',
    'message.uploadSuccess': 'Photos uploaded successfully',
    'message.analysisComplete': 'Analysis completed successfully',
    
    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.none': 'None'
  },
  el: {
    // Navigation
    'nav.myAlbums': 'Τα Άλμπουμ μου',
    'nav.tutorial': 'Οδηγός',
    'nav.settings': 'Ρυθμίσεις',
    
    // Upload
    'upload.title': 'Ανέβασμα Φωτογραφιών',
    'upload.description': 'Ξεκινήστε ανεβάζοντας τις φωτογραφίες σας. Θα ορίσετε τις λεπτομέρειες του άλμπουμ πριν την ανάλυση.',
    'upload.button': 'Ανέβασμα Φωτογραφιών',
    'upload.addMore': 'Προσθήκη Περισσότερων',
    'upload.supportedFormats': 'Υποστηριζόμενες μορφές:',
    'upload.standard': 'Κανονικές: JPEG, PNG, TIFF, WebP, BMP',
    'upload.raw': 'RAW: CR2, CR3, NEF, ARW, DNG, ORF, RAF, PEF, και άλλες',
    
    // Album Configuration
    'album.configuration': 'Διαμόρφωση Άλμπουμ',
    'album.name': 'Όνομα Άλμπουμ',
    'album.namePlaceholder': 'π.χ. Γάμος Γιάννη & Μαρίας 2024',
    'album.eventType': 'Τύπος Εκδήλωσης',
    'album.selectEventType': 'Επιλέξτε τύπο εκδήλωσης...',
    'album.preview': 'Προεπισκόπηση Άλμπουμ:',
    'album.photos': 'Φωτογραφίες',
    'album.cullingMode': 'Τρόπος Επιλογής',
    'album.backendPath': 'Διαδρομή Backend',
    
    // Event Types
    'eventType.wedding': 'Γάμος',
    'eventType.baptism': 'Βάπτιση',
    'eventType.portrait': 'Πορτρέτο',
    'eventType.family': 'Οικογένεια',
    'eventType.corporate': 'Εταιρικό',
    'eventType.event': 'Γενική Εκδήλωση',
    'eventType.landscape': 'Τοπίο',
    
    // Culling Modes
    'culling.fast': 'Γρήγορη Επιλογή',
    'culling.deep': 'Βαθιά Ανάλυση',
    'culling.manual': 'Χειροκίνητη Επιθεώρηση',
    
    // Analysis
    'analysis.start': 'Έναρξη Ανάλυσης',
    'analysis.analyzing': 'Αναλύει...',
    'analysis.complete': 'Η Ανάλυση Ολοκληρώθηκε!',
    'analysis.progress': 'Πρόοδος',
    
    // Gallery
    'gallery.selected': 'επιλεγμένες',
    'gallery.photos': 'φωτογραφίες',
    'gallery.photo': 'φωτογραφία',
    'gallery.selectAll': 'Επιλογή Όλων',
    'gallery.deselectAll': 'Αποεπιλογή Όλων',
    
    // Actions
    'action.save': 'Αποθήκευση',
    'action.cancel': 'Ακύρωση',
    'action.delete': 'Διαγραφή',
    'action.download': 'Λήψη',
    'action.edit': 'Επεξεργασία',
    'action.view': 'Προβολή',
    'action.back': 'Πίσω',
    'action.next': 'Επόμενο',
    'action.previous': 'Προηγούμενο',
    'action.reset': 'Επαναφορά',
    'action.apply': 'Εφαρμογή',
    
    // Settings
    'settings.title': 'Ρυθμίσεις',
    'settings.language': 'Γλώσσα',
    'settings.selectLanguage': 'Επιλογή Γλώσσας',
    'settings.appearance': 'Εμφάνιση',
    'settings.notifications': 'Ειδοποιήσεις',
    'settings.privacy': 'Απόρρητο',
    
    // Messages
    'message.success': 'Επιτυχία!',
    'message.error': 'Σφάλμα',
    'message.warning': 'Προειδοποίηση',
    'message.info': 'Πληροφορία',
    'message.loading': 'Φορτώνει...',
    'message.noPhotos': 'Δεν βρέθηκαν φωτογραφίες',
    'message.uploadSuccess': 'Οι φωτογραφίες ανέβηκαν επιτυχώς',
    'message.analysisComplete': 'Η ανάλυση ολοκληρώθηκε επιτυχώς',
    
    // Common
    'common.yes': 'Ναι',
    'common.no': 'Όχι',
    'common.ok': 'Εντάξει',
    'common.close': 'Κλείσιμο',
    'common.search': 'Αναζήτηση',
    'common.filter': 'Φίλτρο',
    'common.sort': 'Ταξινόμηση',
    'common.all': 'Όλα',
    'common.none': 'Κανένα'
  }
  // Add more languages as needed
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  availableLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ailbums_language') as Language;
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (languages.find(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('ailbums_language', language);
  };

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[currentLanguage] || translations.en;
    return currentTranslations[key] || translations.en[key] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: languages
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};