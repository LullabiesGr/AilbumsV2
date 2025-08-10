import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Plus, Zap, Gift, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserCredits, UserCredits } from '../lib/supabase';

interface MyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyCreditsModal: React.FC<MyCreditsModalProps> = ({ isOpen, onClose }) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load user credits when modal opens
  const loadCredits = async () => {
    if (!user?.email) {
      showToast('User not authenticated', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Loading credits for user:', user.email);
      const userCredits = await getUserCredits(user.email);
      
      if (userCredits) {
        setCredits(userCredits);
        console.log('✅ Credits loaded successfully:', userCredits);
      } else {
        showToast('No credits data found for user', 'warning');
      }
    } catch (error: any) {
      console.error('❌ Failed to load credits:', error);
      showToast(error.message || 'Failed to load credits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh credits when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      loadCredits();
    }
  }, [isOpen, user?.email]);

  // Calculate days until next reset
  const getDaysUntilReset = (nextReset: string) => {
    const resetDate = new Date(nextReset);
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!credits) return 0;
    const totalMonthlyCredits = credits.monthly_credits + credits.extra_credits;
    const usedCredits = totalMonthlyCredits - credits.credits;
    return totalMonthlyCredits > 0 ? (usedCredits / totalMonthlyCredits) * 100 : 0;
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
                <CreditCard className="h-6 w-6 text-white" />
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
          ) : credits ? (
            <div className="space-y-6">
              {/* Credits Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Available Credits */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                              border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {credits.credits}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                    Διαθέσιμα Credits
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Έτοιμα για χρήση
                  </div>
                </div>

                {/* Monthly Credits */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                              border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {credits.monthly_credits}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Μηνιαία Credits
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Βάση συνδρομής
                  </div>
                </div>

                {/* Extra Credits */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                              border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {credits.extra_credits}
                  </div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Extra Credits
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Αγορασμένα
                  </div>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Χρήση Μήνα</span>
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(getUsagePercentage())}% χρησιμοποιημένα
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, getUsagePercentage())}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Συνολικά μηνιαία:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {credits.monthly_credits + credits.extra_credits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Απομένουν:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {credits.credits}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Reset Info */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                            border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Επόμενο Reset
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700 dark:text-amber-300">Ημερομηνία:</span>
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {formatDate(credits.next_reset)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700 dark:text-amber-300">Απομένουν:</span>
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {getDaysUntilReset(credits.next_reset)} ημέρες
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Τα μηνιαία credits θα ανανεωθούν αυτόματα
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-gray-500" />
                  <span>Στοιχεία Λογαριασμού</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {credits.user_id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Μέλος από:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(credits.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Τελευταία ενημέρωση:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(credits.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Credits Usage Guide */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  Πώς Χρησιμοποιούνται τα Credits
                </h3>
                
                <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span><strong>1 credit</strong> = Ανάλυση 1 φωτογραφίας (Fast Mode)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span><strong>2 credits</strong> = Ανάλυση 1 φωτογραφίας (Deep Mode)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span><strong>3 credits</strong> = Face Retouch ανά φωτογραφία</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span><strong>5 credits</strong> = AI Edit/Relight ανά φωτογραφία</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span><strong>2 credits</strong> = Copy Look ανά φωτογραφία</span>
                  </div>
                </div>
              </div>

              {/* Low Credits Warning */}
              {credits.credits < 10 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Χαμηλά Credits
                    </h3>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Έχετε μόνο {credits.credits} credits. Θα χρειαστείτε περισσότερα για να συνεχίσετε την ανάλυση φωτογραφιών.
                  </p>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                                   flex items-center space-x-2 transition-colors duration-200">
                    <Plus className="h-4 w-4" />
                    <span>Αγορά Credits</span>
                  </button>
                </div>
              )}

              {/* Refresh Button */}
              <div className="text-center">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={loadCredits}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                             text-white rounded-lg flex items-center space-x-2
                             transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>{isLoading ? 'Ανανέωση...' : 'Ανανέωση Credits'}</span>
                  </button>
                  
                  <button
                    onClick={handleSyncWithStripe}
                    disabled={isSyncing || isLoading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 
                             text-white rounded-lg flex items-center space-x-2
                             transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    <Star className="h-5 w-5" />
                    <span>{isSyncing ? 'Συγχρονισμός...' : 'Sync με Stripe'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Δεν Βρέθηκαν Credits
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Δεν μπορέσαμε να φορτώσουμε τα credits σας. Δοκιμάστε ξανά.
              </p>
              <button
                onClick={loadCredits}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Δοκιμή Ξανά</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCreditsModal;