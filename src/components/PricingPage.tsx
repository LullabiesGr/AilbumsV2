import React from 'react';
import { ArrowLeft, Shield, Zap, Users, Crown } from 'lucide-react';
import SubscriptionPlans from './SubscriptionPlans';

interface PricingPageProps {
  onBack?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 
                       text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/c18qn8yp/Untitled-design-19.png" 
              alt="Ailbums Logo"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ailbums Pricing
            </h1>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* Features Comparison */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose Ailbums?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Professional AI-powered photo culling trusted by photographers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Process hundreds of photos in minutes with our optimized AI pipeline
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your photos are processed securely and never stored permanently
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Trusted by Pros
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Used by professional photographers to streamline their workflow
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What's included in each plan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All plans include AI photo analysis, face detection, and quality Ai scoring Based On Event. Higher tiers add advanced features like deep Ai analysis,Edits,Retouch,Relighting and priority support.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What happens to my photos?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your photos are processed securely on your Machine and are never stored on our servers. All processing happens local in real-time and data is deleted after analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;