import React, { useState, useEffect } from 'react';
import { X, Coins, Calendar, Plus, CreditCard, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserCredits, getOrCreateUserCredits, UserCredits } from '../lib/supabase';

interface MyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyCreditsModal: React.FC<MyCreditsModalProps> = ({ isOpen, onClose }) => {
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load user credits when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      loadUserCredits();
    }
  }, [isOpen, user?.email]);

  const loadUserCredits = async () => {
    if (!user?.email || !user?.id) return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading credits for user:', user.email);
      const credits = await getOrCreateUserCredits(user.email, user.id);
      setUserCredits(credits);
      console.log('✅ Credits loaded successfully:', credits);
    } catch (error: any) {
      console.error('❌ Failed to load user credits:', error);
      showToast(error.message || 'Failed to load credits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCredits = () => {
    if (!userCredits) return 0;
    return userCredits.credits + userCredits.monthly_credits + userCredits.extra_credits;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          ) : userCredits ? (
            <div className="space-y-6">
              {/* Credits Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Credits */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-6 w-6" />
                      <h3 className="text-lg font-semibold">Συνολικά Credits</h3>
                    </div>
                    <Sparkles className="h-6 w-6 opacity-80" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {getTotalCredits().toLocaleString()}
                  </div>
                  <p className="text-blue-100 text-sm">
                    Διαθέσιμα για χρήση
                  </p>
                </div>

                {/* Account Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Λογαριασμός
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {userCredits.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                      <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                        {userCredits.user_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Μέλος από:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(userCredits.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Ανάλυση Credits</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Available Credits */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Διαθέσιμα
                        </span>
                      </div>
                      <Coins className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {userCredits.credits.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Βασικά credits για χρήση
                    </p>
                  </div>

                  {/* Monthly Credits */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Μηνιαία
                        </span>
                      </div>
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {userCredits.monthly_credits.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Από συνδρομή
                    </p>
                  </div>

                  {/* Extra Credits */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Extra
                        </span>
                      </div>
                      <Plus className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {userCredits.extra_credits.toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Επιπλέον αγορές
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 
                            dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 
                            rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Πώς χρησιμοποιούνται τα Credits
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Ανάλυση φωτογραφίας (Fast):</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">1 credit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Ανάλυση φωτογραφίας (Deep):</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">2 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Face Retouch:</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">3 credits</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">AI Edit:</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">5 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">AI Relight:</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">5 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Copy Look:</span>
                      <span className="font-medium text-amber-900 dark:text-amber-100">2 credits</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Τελευταία ενημέρωση: {userCredits.updated_at ? formatDate(userCredits.updated_at) : 'Άγνωστο'}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Δεν βρέθηκαν Credits
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Δεν μπορέσαμε να φορτώσουμε τα credits σας. Παρακαλώ δοκιμάστε ξανά.
              </p>
              <button
                onClick={loadUserCredits}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <Coins className="h-5 w-5" />
                <span>Επαναφόρτωση Credits</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {userCredits && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Χρειάζεστε περισσότερα credits;</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={loadUserCredits}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                           flex items-center space-x-2 transition-colors duration-200 text-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Ανανέωση</span>
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-700 hover:to-purple-700 text-white rounded-lg 
                           flex items-center space-x-2 transition-all duration-200 font-medium text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Αγορά Credits</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCreditsModal;