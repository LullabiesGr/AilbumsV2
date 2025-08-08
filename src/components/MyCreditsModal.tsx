import React, { useState, useEffect } from 'react';
import { X, Coins, Calendar, Plus, TrendingUp, CreditCard, Gift, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qyukljrlqmimbwodefpc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dWtsanJscW1pbWJ3b2RlZnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDUwOTIsImV4cCI6MjA1OTc4MTA5Mn0.71sinmqqnXxAzazjzWLkAYcCMaEXkLA4RWO5WAXHr9w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserCredits {
  id: string;
  user_id: string;
  credits: number; // Διαθέσιμα credits
  monthly_credits: number; // Μηνιαία βάση συνδρομής
  extra_credits: number; // Extra credits που πλήρωσε
  created_at: string;
  updated_at: string;
}

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

  // Load user credits from Supabase
  const loadUserCredits = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading credits for user:', user.email);
      
      const { data, error: supabaseError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.email)
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          // No record found - create default credits entry
          console.log('📝 Creating default credits entry for new user');
          
          const { data: newData, error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: user.email,
              credits: 100, // Default starting credits
              monthly_credits: 0,
              extra_credits: 0
            })
            .select()
            .single();

          if (insertError) {
            throw new Error(`Failed to create credits entry: ${insertError.message}`);
          }

          setUserCredits(newData);
          showToast('Welcome! You received 100 free credits to get started!', 'success');
        } else {
          throw new Error(`Database error: ${supabaseError.message}`);
        }
      } else {
        console.log('✅ Credits loaded successfully:', data);
        setUserCredits(data);
      }
    } catch (error: any) {
      console.error('❌ Failed to load user credits:', error);
      setError(error.message || 'Failed to load credits');
      showToast('Failed to load credits information', 'error');
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

  // Calculate total available credits
  const getTotalCredits = () => {
    if (!userCredits) return 0;
    return userCredits.credits + userCredits.monthly_credits + userCredits.extra_credits;
  };

  // Get credit type breakdown
  const getCreditBreakdown = () => {
    if (!userCredits) return [];
    
    const breakdown = [];
    
    if (userCredits.credits > 0) {
      breakdown.push({
        type: 'Base Credits',
        amount: userCredits.credits,
        icon: Coins,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        description: 'Διαθέσιμα credits'
      });
    }
    
    if (userCredits.monthly_credits > 0) {
      breakdown.push({
        type: 'Monthly Credits',
        amount: userCredits.monthly_credits,
        icon: Calendar,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        description: 'Μηνιαία βάση συνδρομής'
      });
    }
    
    if (userCredits.extra_credits > 0) {
      breakdown.push({
        type: 'Extra Credits',
        amount: userCredits.extra_credits,
        icon: Plus,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        description: 'Extra credits που πληρώσατε'
      });
    }
    
    return breakdown;
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
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
          ) : userCredits ? (
            <div className="space-y-6">
              {/* Total Credits Overview */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Coins className="h-8 w-8" />
                    <h3 className="text-3xl font-bold">
                      {getTotalCredits().toLocaleString()}
                    </h3>
                  </div>
                  <p className="text-blue-100">Total Available Credits</p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{userCredits.credits}</div>
                      <div className="text-xs text-blue-100">Base</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{userCredits.monthly_credits}</div>
                      <div className="text-xs text-blue-100">Monthly</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-xl font-bold">{userCredits.extra_credits}</div>
                      <div className="text-xs text-blue-100">Extra</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Breakdown */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Credit Breakdown
                </h4>
                
                {getCreditBreakdown().map((credit, index) => {
                  const Icon = credit.icon;
                  return (
                    <div key={index} className={`${credit.bgColor} border border-gray-200 dark:border-gray-700 rounded-lg p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${credit.bgColor} rounded-lg`}>
                            <Icon className={`h-5 w-5 ${credit.color}`} />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {credit.type}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {credit.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${credit.color}`}>
                            {credit.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            credits
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Usage Information */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  <span>Credit Usage Guide</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fast Analysis (per photo)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">1 credit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deep Analysis (per photo)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">2 credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Face Retouch (per face)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">3 credits</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">AI Edit (per photo)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">5 credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">AI Relight (per photo)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">4 credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Copy Look (per photo)</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">2 credits</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">
                      {user.name}
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Member since:</span>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {new Date(userCredits.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Last updated:</span>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {new Date(userCredits.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Credits Warning */}
              {getTotalCredits() < 10 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-200">
                        Low Credits Warning
                      </h5>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You have {getTotalCredits()} credits remaining. Consider purchasing more credits to continue using AI features.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase More Credits */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                            border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Need More Credits?
                  </h4>
                </div>
                <p className="text-purple-700 dark:text-purple-300 mb-6">
                  Purchase additional credits to continue using premium AI features
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 mb-1">100</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Credits</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">€9.99</div>
                    <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors">
                      Purchase
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-purple-500 relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">500</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Credits</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">€39.99</div>
                    <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors">
                      Purchase
                    </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 mb-1">1000</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Credits</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">€69.99</div>
                    <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Credits Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unable to load your credits information
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Credits are used for AI-powered features and analysis
            </div>
            <button
              onClick={loadUserCredits}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCreditsModal;