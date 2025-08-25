import React, { useState, useEffect } from 'react';
import { X, Crown, Calendar, CreditCard, Check, AlertCircle, Star, Zap, Sparkles, Users, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserPlan, UserPlan, getPlanFeatures, getUserSubscription } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';
import SubscriptionPlans from './SubscriptionPlans';

interface MySubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MySubscriptionModal: React.FC<MySubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load user subscription plan when modal opens
  const loadUserPlan = async () => {
    if (!user?.email) {
      showToast('User not authenticated', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Loading subscription plan for user:', user.email);
      const plan = await getUserPlan(user.email);
      const subscriptionData = await getUserSubscription(user.email);
      
      if (plan) {
        setUserPlan(plan);
        setSubscription(subscriptionData);
        console.log('✅ Subscription plan loaded successfully:', plan);
      } else {
        // Set default free plan
        setUserPlan({
          plan_name: 'Free',
          price_id: '',
          status: 'inactive',
          monthly_credits: 50,
          current_period_end: '',
          is_active: false
        });
        setSubscription(null);
        console.log('ℹ️ No subscription found, using free plan');
      }
    } catch (error: any) {
      console.error('❌ Failed to load subscription plan:', error);
      showToast(error.message || 'Failed to load subscription plan', 'error');
      // Fallback to free plan
      setUserPlan({
        plan_name: 'Free',
        price_id: '',
        status: 'error',
        monthly_credits: 100,
        current_period_end: '',
        is_active: false
      });
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh plan when modal opens
  useEffect(() => {
    if (isOpen && user?.email) {
      loadUserPlan();
    }
  }, [isOpen, user?.email]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format timestamp to date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get product details from Stripe config
  const getProductDetails = (priceId: string) => {
    return getProductByPriceId(priceId);
  };

  // Calculate next renewal date based on created_at (same day next month)
  const calculateNextRenewal = (createdAt: string) => {
    if (!createdAt) return 'N/A';
    
    const createdDate = new Date(createdAt);
    const now = new Date();
    
    // Get the day of month from created_at
    const renewalDay = createdDate.getDate();
    
    // Start with current month
    let nextRenewal = new Date(now.getFullYear(), now.getMonth(), renewalDay);
    
    // If the renewal date for this month has already passed, move to next month
    if (nextRenewal <= now) {
      nextRenewal = new Date(now.getFullYear(), now.getMonth() + 1, renewalDay);
    }
    
    // Handle edge case where the day doesn't exist in the target month (e.g., Jan 31 -> Feb 31)
    if (nextRenewal.getDate() !== renewalDay) {
      // Set to last day of the month
      nextRenewal = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return nextRenewal.toISOString();
  };

  // Get plan icon
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="h-6 w-6 text-green-500" />;
      case 'pro':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'studio':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'extra credits':
        return <CreditCard className="h-6 w-6 text-orange-500" />;
      default:
        return <Users className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get plan color scheme
  const getPlanColors = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return {
          bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          accent: 'text-green-600 dark:text-green-400'
        };
      case 'pro':
        return {
          bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          accent: 'text-blue-600 dark:text-blue-400'
        };
      case 'studio':
        return {
          bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-800 dark:text-purple-200',
          accent: 'text-purple-600 dark:text-purple-400'
        };
      case 'extra credits':
        return {
          bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-200',
          accent: 'text-orange-600 dark:text-orange-400'
        };
      default:
        return {
          bg: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-800 dark:text-gray-200',
          accent: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'error') {
      return (
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 
                       text-sm rounded-full font-medium flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          Error Loading
        </span>
      );
    }
    
    if (isActive) {
      return (
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 
                       text-sm rounded-full font-medium flex items-center gap-1">
          <Check className="h-4 w-4" />
          Active
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 
                     text-sm rounded-full font-medium">
        {status === 'inactive' ? 'Free Plan' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen) return null;

  if (showUpgrade) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                              flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                               bg-clip-text text-transparent">
                    Upgrade Your Plan
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a new plan or purchase additional credits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgrade(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <SubscriptionPlans onSuccess={() => {
              setShowUpgrade(false);
              loadUserPlan();
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                            flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                             bg-clip-text text-transparent">
                  My Subscription
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Ailbums subscription and plan details
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
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Loading your subscription...</p>
              </div>
            </div>
          ) : userPlan ? (
            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className={`bg-gradient-to-br ${getPlanColors(userPlan.plan_name).bg} 
                            border ${getPlanColors(userPlan.plan_name).border} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getPlanIcon(userPlan.plan_name)}
                    <div>
                      <h3 className={`text-2xl font-bold ${getPlanColors(userPlan.plan_name).text}`}>
                        {userPlan.plan_name} Plan
                      </h3>
                      {userPlan.price_id && getProductDetails(userPlan.price_id) && (
                        <p className={`text-sm ${getPlanColors(userPlan.plan_name).accent}`}>
                          ${getProductDetails(userPlan.price_id)!.price.toFixed(2)}/month
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(userPlan.status, userPlan.is_active)}
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-sm ${getPlanColors(userPlan.plan_name).accent}`}>Monthly Credits:</span>
                      <span className={`font-medium ${getPlanColors(userPlan.plan_name).text}`}>
                        {userPlan.monthly_credits.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`text-sm ${getPlanColors(userPlan.plan_name).accent}`}>Status:</span>
                      <span className={`font-medium ${getPlanColors(userPlan.plan_name).text} capitalize`}>
                        {userPlan.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {subscription && subscription.current_period_end && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${getPlanColors(userPlan.plan_name).accent}`}>Next Billing:</span>
                        <span className={`font-medium ${getPlanColors(userPlan.plan_name).text}`}>
                          {formatTimestamp(subscription.current_period_end)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className={`text-sm ${getPlanColors(userPlan.plan_name).accent}`}>User:</span>
                      <span className={`font-medium ${getPlanColors(userPlan.plan_name).text}`}>
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {userPlan.price_id && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span>Plan Features</span>
                  </h4>
                  
                  <div className="grid gap-3">
                    {getPlanFeatures(userPlan.price_id).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription Details */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <span>Subscription Details</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Plan Name:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {userPlan.plan_name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium capitalize ${
                          userPlan.is_active 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {userPlan.status}
                        </span>
                      </div>

                      {subscription && subscription.subscription_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Subscription ID:</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {subscription.subscription_id.slice(0, 12)}...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Credits:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {userPlan.monthly_credits.toLocaleString()}
                        </span>
                      </div>
                      
                      {subscription && subscription.current_period_end && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Next Billing:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatTimestamp(subscription.current_period_end)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {user.email}
                        </span>
                      </div>

                      {subscription && subscription.payment_method_brand && subscription.payment_method_last4 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan Status Info */}
                  {userPlan.plan_name === 'Free' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <h5 className="font-medium text-blue-800 dark:text-blue-200">Free Plan</h5>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        You're currently on the free plan with {userPlan.monthly_credits} monthly credits. 
                        Upgrade to get more credits and advanced features!
                      </p>
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                                 flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Crown className="h-4 w-4" />
                        <span>Upgrade Now</span>
                      </button>
                    </div>
                  )}

                  {userPlan.is_active && subscription && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <h5 className="font-medium text-green-800 dark:text-green-200">Active Subscription</h5>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your subscription is active and will renew on {formatTimestamp(subscription.current_period_end)}.
                        You get {userPlan.monthly_credits.toLocaleString()} credits every month.
                      </p>
                      {subscription.cancel_at_period_end && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                            {getProductDetails(userPlan.price_id)!.currency === 'EUR' ? '€' : '$'}{getProductDetails(userPlan.price_id)!.price.toFixed(2)}/month
                            ${getProductDetails(userPlan.price_id)!.price.toFixed(2)}/month
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!userPlan.is_active && userPlan.status !== 'inactive' && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <h5 className="font-medium text-amber-800 dark:text-amber-200">Subscription Issue</h5>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your subscription status is "{userPlan.status}". Please check your payment method 
                        or contact support if you need assistance.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade/Manage Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <span>Manage Subscription</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        Upgrade or Purchase Credits
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get more features or additional credits for your account
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700 text-white rounded-lg 
                               flex items-center space-x-2 transition-all duration-200"
                    >
                      <Crown className="h-4 w-4" />
                      <span>View Plans</span>
                    </button>
                  </div>
                  
                  {userPlan.plan_name !== 'Free' && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To manage billing, cancel, or update payment methods, please contact our support team.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sync Info */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span>Sync Information</span>
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data Source:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Stripe via Supabase
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Synced:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date().toLocaleString('el-GR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tables Used:</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      stripe_customers, stripe_subscriptions
                    </span>
                  </div>
                  
                  {subscription && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Customer ID:</span>
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {subscription.customer_id.slice(0, 12)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <button
                  onClick={loadUserPlan}
                  disabled={isLoading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 
                           text-white rounded-lg flex items-center space-x-2 mx-auto
                           transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  <Clock className="h-5 w-5" />
                  <span>{isLoading ? 'Syncing...' : 'Refresh Subscription'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Subscription Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unable to load subscription information. Please try again.
              </p>
              <button
                onClick={loadUserPlan}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                         flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <Clock className="h-5 w-5" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubscriptionModal;