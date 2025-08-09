import React, { useState, useEffect } from 'react';
import { X, Coins, Calendar, Plus, CreditCard, Zap, Gift, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserCredits, UserCredits } from '../lib/credits';

interface MyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyCreditsModal: React.FC<MyCreditsModalProps> = ({ isOpen, onClose }) => {
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load user credits when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      loadUserCredits();
    }
  }, [isOpen, user]);

  const loadUserCredits = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const credits = await getUserCredits();
      setUserCredits(credits);
    } catch (error: any) {
      console.error('Failed to load user credits:', error);
      setError(error.message || 'Failed to load credits');
      showToast('Failed to load credits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCredits = () => {
    if (!userCredits) return 0;
    return userCredits.credits;
  };

  const getCreditsBreakdown = () => {
    if (!userCredits) return { monthly: 0, extra: 0, remaining: 0 };
    
    return {
      monthly: userCredits.monthly_credits,
      extra: userCredits.extra_credits,
      remaining: userCredits.credits
    };
  };

  const handleBuyCredits = () => {
    showToast('Credit purchase coming soon!', 'info');
    // TODO: Integrate with payment system
  };

  if (!isOpen) return null;

  const breakdown = getCreditsBreakdown();
  const totalCredits = getTotalCredits();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl 
                            flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  My Credits
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Ailbums credits and usage
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Loading your credits...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Failed to Load Credits
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={loadUserCredits}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : userCredits ? (
            <div className="space-y-6">
              {/* Credits Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                            border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {totalCredits.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    Διαθέσιμα Credits
                  </div>
                  
                  {totalCredits < 10 && (
                    <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 
                                  rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Χαμηλά credits! Σκεφτείτε να αγοράσετε περισσότερα.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Credits Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Μηνιαία Credits
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Από συνδρομή
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {breakdown.monthly.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Ανανεώνονται κάθε μήνα
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Extra Credits
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Αγορασμένα
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {breakdown.extra.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Δεν λήγουν ποτέ
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Συνολικά Διαθέσιμα
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Προς χρήση
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalCredits.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Έτοιμα για ανάλυση
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Πώς Χρησιμοποιούνται τα Credits
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Fast Analysis</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">1 credit/φωτό</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Deep Analysis</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">2 credits/φωτό</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Face Retouch</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">3 credits/φωτό</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">AI Edit & Relight</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">5 credits/φωτό</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Copy Look</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">2 credits/φωτό</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">Manual Review</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Δωρεάν</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Στοιχεία Λογαριασμού
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Λογαριασμός δημιουργήθηκε:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {userCredits?.created_at ? new Date(userCredits.created_at).toLocaleDateString('el-GR') : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Τελευταία ενημέρωση:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {userCredits?.updated_at ? new Date(userCredits.updated_at).toLocaleDateString('el-GR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buy More Credits */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                            border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
                <div className="mb-4">
                  <CreditCard className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Χρειάζεστε περισσότερα Credits;
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Αγοράστε επιπλέον credits για να συνεχίσετε την ανάλυση των φωτογραφιών σας
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">100 Credits</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">€9.99</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">Δημοφιλές</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">500 Credits</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">€39.99</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">20% έκπτωση</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">1000 Credits</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">€69.99</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">30% έκπτωση</div>
                  </div>
                </div>
                
                <button
                  onClick={handleBuyCredits}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                           hover:from-purple-700 hover:to-blue-700 text-white rounded-lg 
                           flex items-center space-x-2 mx-auto transition-all duration-200 font-medium
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Αγορά Credits</span>
                </button>
              </div>

              {/* Tips for Saving Credits */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  <span>Συμβουλές για Εξοικονόμηση Credits</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Χρησιμοποιήστε Fast Analysis</span>
                      <p className="text-gray-600 dark:text-gray-400">Για γρήγορη ανάλυση με λιγότερα credits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Manual Review Mode</span>
                      <p className="text-gray-600 dark:text-gray-400">Δωρεάν επιλογή για χειροκίνητη αξιολόγηση</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Προ-επιλογή φωτογραφιών</span>
                      <p className="text-gray-600 dark:text-gray-400">Επιλέξτε μόνο τις καλύτερες φωτογραφίες για ανάλυση</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Credits Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unable to load credits information
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Credits ενημερώνονται σε πραγματικό χρόνο
            </div>
            <button
              onClick={loadUserCredits}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg 
                       transition-colors duration-200 flex items-center space-x-1"
            >
              <Coins className="h-4 w-4" />
              <span>Ανανέωση</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCreditsModal;