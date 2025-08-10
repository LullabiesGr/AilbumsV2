import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProductByPriceId } from '../stripe-config';

const SuccessPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    
    setIsLoading(false);
  }, []);

  const handleContinue = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your purchase. Your subscription has been activated and you can now enjoy all the features of Ailbums.
          </p>

          {/* Session Details */}
          {sessionId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Payment Details
                </h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {sessionId.slice(0, 20)}...
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Completed
                  </span>
                </div>
                
                {user && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              What's Next?
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Your subscription is now active and ready to use</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Start uploading photos to begin AI analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Access all premium features included in your plan</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Check your subscription details in "My Subscription"</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 text-white rounded-lg 
                       flex items-center justify-center space-x-2 transition-all duration-200 
                       font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Start Using Ailbums</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-6 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                       rounded-lg transition-colors duration-200 font-medium"
            >
              View All Plans
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  Secure
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  256-bit SSL encryption
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  Instant
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Immediate access
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  Support
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  24/7 customer support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;