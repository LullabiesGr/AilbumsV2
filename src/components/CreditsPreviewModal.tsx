import React, { useState, useEffect } from 'react';
import { X, CreditCard, Zap, Sun, Sparkles, Calculator, Settings, AlertCircle, Info } from 'lucide-react';

interface CreditsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  operationType: 'ai-edit' | 'ai-relight' | 'face-retouch';
  imageCount: number;
  imageSizeMB?: number;
  exifMegapixels?: number;
}

interface PricingSettings {
  usdToEur: number;
  costPerCredit: number;
  profitMargin: number;
  faceRetouchCost: number;
  aiEditCost: number;
  relightCost: number;
  defaultMegapixels: number;
}

const CreditsPreviewModal: React.FC<CreditsPreviewModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  operationType,
  imageCount,
  imageSizeMB,
  exifMegapixels
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [customMegapixels, setCustomMegapixels] = useState<number>(exifMegapixels || 24);
  
  // Pricing settings (stored in localStorage)
  const [settings, setSettings] = useState<PricingSettings>(() => {
    const stored = localStorage.getItem('ailbums_pricing_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse stored pricing settings:', error);
      }
    }
    
    return {
      usdToEur: 0.91,
      costPerCredit: 0.00245, // Studio tier default
      profitMargin: 0.20, // 20%
      faceRetouchCost: 0.05, // $0.05 per image
      aiEditCost: 0.04, // $0.04 per image
      relightCost: 0.035, // $0.035 per MP
      defaultMegapixels: 24
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ailbums_pricing_settings', JSON.stringify(settings));
  }, [settings]);

  // Update custom megapixels when EXIF data changes
  useEffect(() => {
    if (exifMegapixels) {
      setCustomMegapixels(exifMegapixels);
    }
  }, [exifMegapixels]);

  const calculateCredits = () => {
    let costInUSD = 0;
    let chargeType = '';
    let details = '';

    switch (operationType) {
      case 'face-retouch':
        costInUSD = settings.faceRetouchCost * imageCount;
        chargeType = 'per image';
        details = `${imageCount} εικόνα${imageCount !== 1 ? 'ες' : ''} × $${settings.faceRetouchCost}`;
        break;
        
      case 'ai-edit':
        costInUSD = settings.aiEditCost * imageCount;
        chargeType = 'per image';
        details = `${imageCount} εικόνα${imageCount !== 1 ? 'ες' : ''} × $${settings.aiEditCost}`;
        break;
        
      case 'ai-relight':
        const megapixels = customMegapixels || settings.defaultMegapixels;
        costInUSD = settings.relightCost * megapixels * imageCount;
        chargeType = 'per MP';
        details = `${imageCount} εικόνα${imageCount !== 1 ? 'ες' : ''} × ${megapixels} MP × $${settings.relightCost}`;
        break;
    }

    // Convert to EUR
    const costInEUR = costInUSD * settings.usdToEur;
    
    // Calculate credits needed
    const creditsBeforeMargin = costInEUR / settings.costPerCredit;
    const creditsWithMargin = creditsBeforeMargin * (1 + settings.profitMargin);
    const finalCredits = Math.max(1, Math.ceil(creditsWithMargin));

    return {
      costInUSD,
      costInEUR,
      creditsBeforeMargin,
      creditsWithMargin,
      finalCredits,
      chargeType,
      details,
      megapixels: operationType === 'ai-relight' ? customMegapixels : undefined
    };
  };

  const calculation = calculateCredits();

  const getOperationInfo = () => {
    switch (operationType) {
      case 'face-retouch':
        return {
          title: 'Face Retouch',
          icon: <Sparkles className="h-6 w-6 text-purple-500" />,
          model: 'CodeFormer',
          description: 'Βελτίωση προσώπων με AI'
        };
      case 'ai-edit':
        return {
          title: 'AI Edit',
          icon: <Zap className="h-6 w-6 text-blue-500" />,
          model: 'Flux Pro',
          description: 'Δημιουργική επεξεργασία με AI'
        };
      case 'ai-relight':
        return {
          title: 'AI Relight',
          icon: <Sun className="h-6 w-6 text-orange-500" />,
          model: 'Flux LoRA',
          description: 'Αλλαγή φωτισμού με AI'
        };
    }
  };

  const operationInfo = getOperationInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl 
                            flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  Προεπισκόπηση Χρέωσης
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Πριν συνεχίσεις, δες την εκτίμηση credits για αυτή τη λειτουργία
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Ρυθμίσεις τιμολόγησης"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Operation Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 
                        border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {operationInfo.icon}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {operationInfo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {operationInfo.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Μοντέλο:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                  {operationInfo.model}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Τύπος χρέωσης:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                  {calculation.chargeType === 'per image' ? 'Ανά εικόνα' : 'Ανά Megapixel'}
                </span>
              </div>
            </div>
          </div>

          {/* Megapixels Input for Relight */}
          {operationType === 'ai-relight' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 
                          rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  Μέγεθος Εικόνας
                </h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                    Megapixels (MP)
                  </label>
                  <input
                    type="number"
                    value={customMegapixels}
                    onChange={(e) => setCustomMegapixels(Math.max(1, parseFloat(e.target.value) || 24))}
                    min="1"
                    max="200"
                    step="0.1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-orange-300 
                             dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 
                             focus:border-transparent"
                  />
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {exifMegapixels 
                      ? `Αυτόματα από EXIF: ${exifMegapixels} MP` 
                      : `Default: ${settings.defaultMegapixels} MP (δεν βρέθηκε EXIF)`
                    }
                  </p>
                </div>
                
                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Υπολογισμός:</strong> {imageCount} εικόνα{imageCount !== 1 ? 'ες' : ''} × {customMegapixels} MP = {(imageCount * customMegapixels).toFixed(1)} συνολικά MP
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credits Estimation */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                        border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {calculation.finalCredits}
              </div>
              <div className="text-lg font-medium text-green-700 dark:text-green-300">
                Estimated Credits
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                για {imageCount} εικόνα{imageCount !== 1 ? 'ες' : ''}
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Λεπτομέρειες Υπολογισμού</span>
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Κόστος μοντέλου:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${calculation.costInUSD.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Σε EUR (×{settings.usdToEur}):</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    €{calculation.costInEUR.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Credits πριν margin:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {calculation.creditsBeforeMargin.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Με margin (+{(settings.profitMargin * 100).toFixed(0)}%):</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {calculation.creditsWithMargin.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Τελικά credits:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {calculation.finalCredits}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {calculation.details}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                          rounded-xl p-6 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Ρυθμίσεις Τιμολόγησης</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    USD → EUR
                  </label>
                  <input
                    type="number"
                    value={settings.usdToEur}
                    onChange={(e) => setSettings(prev => ({ ...prev, usdToEur: parseFloat(e.target.value) || 0.91 }))}
                    step="0.01"
                    min="0.1"
                    max="2"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    €/Credit
                  </label>
                  <input
                    type="number"
                    value={settings.costPerCredit}
                    onChange={(e) => setSettings(prev => ({ ...prev, costPerCredit: parseFloat(e.target.value) || 0.00245 }))}
                    step="0.00001"
                    min="0.001"
                    max="0.01"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Margin (%)
                  </label>
                  <input
                    type="number"
                    value={settings.profitMargin * 100}
                    onChange={(e) => setSettings(prev => ({ ...prev, profitMargin: (parseFloat(e.target.value) || 20) / 100 }))}
                    step="1"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default MP
                  </label>
                  <input
                    type="number"
                    value={settings.defaultMegapixels}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultMegapixels: parseFloat(e.target.value) || 24 }))}
                    step="1"
                    min="1"
                    max="200"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Face Retouch ($/img)
                  </label>
                  <input
                    type="number"
                    value={settings.faceRetouchCost}
                    onChange={(e) => setSettings(prev => ({ ...prev, faceRetouchCost: parseFloat(e.target.value) || 0.05 }))}
                    step="0.001"
                    min="0.001"
                    max="1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Edit ($/img)
                  </label>
                  <input
                    type="number"
                    value={settings.aiEditCost}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiEditCost: parseFloat(e.target.value) || 0.04 }))}
                    step="0.001"
                    min="0.001"
                    max="1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relight ($/MP)
                  </label>
                  <input
                    type="number"
                    value={settings.relightCost}
                    onChange={(e) => setSettings(prev => ({ ...prev, relightCost: parseFloat(e.target.value) || 0.035 }))}
                    step="0.001"
                    min="0.001"
                    max="1"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                        rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Σημαντικό
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Αυτή είναι μόνο εκτίμηση. Η πραγματική χρέωση θα γίνει όταν ολοκληρωθεί η επεξεργασία. 
                  Τα credits θα αφαιρεθούν μόνο για επιτυχημένες λειτουργίες.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                        rounded-xl p-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              Ανάλυση Κόστους
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {operationInfo.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {calculation.details}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {calculation.finalCredits} credits
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ≈ €{calculation.costInEUR.toFixed(4)}
                  </div>
                </div>
              </div>
              
              {operationType === 'ai-relight' && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 
                              rounded-lg p-3">
                  <p className="font-medium mb-1">Σημείωση για Relight:</p>
                  <p>Το κόστος εξαρτάται από το μέγεθος της εικόνας σε Megapixels. Μεγαλύτερες εικόνες 
                     απαιτούν περισσότερη επεξεργαστική ισχύ για την αλλαγή φωτισμού.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Εκτιμώμενο κόστος: <strong>{calculation.finalCredits} credits</strong></p>
              <p className="text-xs mt-1">
                Τα credits θα αφαιρεθούν μόνο μετά την επιτυχή επεξεργασία
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 
                         dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Ακύρωση
              </button>
              
              <button
                onClick={onContinue}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700 text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium
                         shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CreditCard className="h-5 w-5" />
                <span>Συνέχεια ({calculation.finalCredits} credits)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPreviewModal;