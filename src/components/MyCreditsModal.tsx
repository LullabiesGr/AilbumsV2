import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Plus, Minus, TrendingUp, Gift, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface UserCredits {
  user_id: string;
  available_credits: number;
  monthly_credits: number;
  bonus_credits: number;
  total_used: number;
  last_reset: string;
  next_reset: string;
  subscription_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

interface MyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// API URL configuration
const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://3a202ff8dda3.ngrok-free.app";

const MyCreditsModal: React.FC<MyCreditsModalProps> = ({ isOpen, onClose }) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load user credits from backend
  const loadUserCredits = async () => {
    if (!user?.email) {
      setError('User email is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading credits for user:', user.email);
      
      const response = await fetch(`${API_URL}/user-credits?user_id=${encodeURIComponent(user.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      console.log('📥 Credits API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Credits API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });
        
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html>')) {
          throw new Error(`Credits endpoint returned HTML instead of JSON. Check if ${API_URL}/user-credits endpoint exists.`);
        }
        
        throw new Error(`Credits API Error: ${response.status} ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 Credits Response Text:', responseText.substring(0, 1000));
      
      let creditsData;
      try {
        creditsData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse credits JSON:', parseError);
        throw new Error('Credits endpoint returned invalid JSON');
      }
      
      console.log('✅ Successfully loaded credits:', creditsData);
      setCredits(creditsData);
      
    } catch (error: any) {
      console.error('❌ Load credits error:', error);
      setError(error.message || 'Failed to load credits');
      showToast(error.message || 'Failed to load credits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load credits when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      loadUserCredits();
    }
  }, [isOpen, user?.email]);

  const getSubscriptionTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free Plan',
          icon: <Gift className="h-5 w-5 text-gray-500" />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          description: 'Basic photo analysis'
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          icon: <Zap className="h-5 w-5 text-blue-500" />,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          description: 'Advanced AI features'
        };
      case 'premium':
        return {
          name: 'Premium Plan',
          icon: <Crown className="h-5 w-5 text-purple-500" />,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          description: 'Unlimited AI processing'
        };
      default:
        return {
          name: 'Unknown Plan',
          icon: <Star className="h-5 w-5 text-gray-500" />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          description: 'Plan information unavailable'
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('el-GR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDaysUntilReset = (nextResetDate: string) => {
    try {
      const nextReset = new Date(nextResetDate);
      const now = new Date();
      const diffTime = nextReset.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
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
                  Manage your AI processing credits
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Failed to Load Credits
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={loadUserCredits}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : credits ? (
            <div className="space-y-6">
              {/* Subscription Tier */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Current Plan
                  </h3>
                  {getSubscriptionTierInfo(credits.subscription_tier).icon}
                </div>
                
                <div className={`${getSubscriptionTierInfo(credits.subscription_tier).bgColor} rounded-lg p-4`}>
                  <div className="flex items-center space-x-3">
                    {getSubscriptionTierInfo(credits.subscription_tier).icon}
                    <div>
                      <h4 className={`font-semibold ${getSubscriptionTierInfo(credits.subscription_tier).color}`}>
                        {getSubscriptionTierInfo(credits.subscription_tier).name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getSubscriptionTierInfo(credits.subscription_tier).description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Available Credits */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                              rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        Available Credits
                      </h4>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {credits.available_credits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ready to use for AI processing
                  </p>
                </div>

                {/* Monthly Credits */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                              rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Monthly Credits
                      </h4>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {credits.monthly_credits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Resets in {getDaysUntilReset(credits.next_reset)} days
                  </p>
                </div>

                {/* Bonus Credits */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                              rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                        Bonus Credits
                      </h4>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {credits.bonus_credits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Extra credits from promotions
                  </p>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <span>Usage Statistics</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Used</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {credits.total_used.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {(credits.available_credits + credits.bonus_credits).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Usage Rate</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {credits.monthly_credits > 0 
                          ? `${((credits.total_used / credits.monthly_credits) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Reset</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(credits.last_reset)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next Reset</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(credits.next_reset)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Days Until Reset</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {getDaysUntilReset(credits.next_reset)} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Usage Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {credits.total_used} / {credits.monthly_credits}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ 
                        width: `${Math.min(100, (credits.total_used / Math.max(1, credits.monthly_credits)) * 100)}%`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0</span>
                    <span>{credits.monthly_credits.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Credit Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Credit Breakdown
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Monthly Allocation</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {credits.monthly_credits.toLocaleString()}
                    </span>
                  </div>
                  
                  {credits.bonus_credits > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Gift className="h-5 w-5 text-purple-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">Bonus Credits</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        +{credits.bonus_credits.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Minus className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Used This Month</span>
                    </div>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      -{credits.total_used.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Sparkles className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">Total Available</span>
                      </div>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {(credits.available_credits + credits.bonus_credits).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Usage Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                            rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  How Credits Work
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">
                      <strong>Photo Analysis:</strong> 1 credit per photo for AI scoring and face detection
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">
                      <strong>Face Retouch:</strong> 5 credits per face enhanced with AI
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">
                      <strong>AI Edit/Relight:</strong> 3 credits per photo for advanced editing
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">
                      <strong>Copy Look:</strong> 2 credits per photo for color transfer
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Account Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {credits.user_id}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(credits.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(credits.updated_at)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Next Reset:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(credits.next_reset)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Low Credits Warning */}
              {credits.available_credits + credits.bonus_credits < 10 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 
                              rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Low Credits Warning
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You have {credits.available_credits + credits.bonus_credits} credits remaining. 
                        Consider upgrading your plan for more AI processing power.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Credits Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unable to load your credits information.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Credits reset monthly on the {credits ? new Date(credits.next_reset).getDate() : '1st'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadUserCredits}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         transition-colors duration-200 text-sm"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg 
                         transition-colors duration-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCreditsModal;