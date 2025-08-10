import React from 'react';
import { ArrowLeft, Shield, Zap, Users, Crown, Info, Calculator, Star, Check } from 'lucide-react';
import SubscriptionPlans from './SubscriptionPlans';

interface PricingPageProps {
  onBack?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const [megapixels, setMegapixels] = React.useState(24);
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  // Calculate relight credits based on megapixels
  const calculateRelightCredits = (mp: number) => {
    return Math.ceil(25 * mp / 24);
  };
  
  const relightCredits = calculateRelightCredits(megapixels);
  
  // Feature consumption table
  const features = [
    {
      name: 'FaceRetouch',
      consumption: [2, 1, 'FREE', 'FREE'],
      note: 'credits ανά εικόνα'
    },
    {
      name: 'Copy AI Look',
      consumption: [1, 'FREE', 'FREE', 'FREE'],
      note: 'credits ανά εικόνα'
    },
    {
      name: 'AI Edit',
      consumption: [2, 1, 1, 1],
      note: 'credits ανά εικόνα'
    },
    {
      name: 'AI Relight (24MP)',
      consumption: [25, 25, 25, 25],
      note: 'credits ανά εικόνα',
      hasTooltip: true
    },
    {
      name: 'Analyze / Deep Analyze',
      consumption: ['FREE', 'FREE', 'FREE', 'FREE']
    }
  ];
  
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

        {/* Credit Consumption Table */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Κατανάλωση Credits ανά Λειτουργία
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Δείτε πόσα credits καταναλώνει κάθε λειτουργία σε κάθε πλάνο
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Λειτουργία
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Beta Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Pro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Studio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {features.map((feature, index) => (
                    <tr key={feature.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {feature.name}
                          </span>
                          {feature.hasTooltip && (
                            <div className="relative">
                              <button
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                                         rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                              {showTooltip && (
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                                              bg-black text-white text-xs rounded-lg p-3 whitespace-nowrap z-10 
                                              shadow-xl border border-gray-600">
                                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                                                w-2 h-2 bg-black rotate-45 border-l border-b border-gray-600"></div>
                                  Χρέωση κλιμακούμενη ανά Megapixel. Δες τον calculator.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {feature.note && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {feature.note}
                          </div>
                        )}
                      </td>
                      {feature.consumption.map((consumption, planIndex) => (
                        <td key={planIndex} className="px-6 py-4 text-center">
                          {consumption === 'FREE' ? (
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 
                                           text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                              <Check className="h-3 w-3 mr-1" />
                              FREE
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {consumption} credits
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Relight Credits Calculator */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                        border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Calculator className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Relight Credits Calculator
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Υπολογίστε τα credits για AI Relight βάσει Megapixels
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Megapixels (MP)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={megapixels}
                  onChange={(e) => setMegapixels(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 
                           dark:border-gray-600 rounded-lg text-center text-lg font-semibold
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Τύπος: credits = ceil(25 × MP / 24)
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {relightCredits} credits
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  για {megapixels}MP εικόνα
                </div>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Παραδείγματα:
                </h4>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex justify-between">
                    <span>24MP →</span>
                    <span className="font-semibold">{calculateRelightCredits(24)} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12MP →</span>
                    <span className="font-semibold">{calculateRelightCredits(12)} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>48MP →</span>
                    <span className="font-semibold">{calculateRelightCredits(48)} credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* Features Comparison */}
        <div className="max-w-6xl mx-auto">
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
                Your photos are processed local & securely , Zero Cloud Storage!
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