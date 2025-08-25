import React, { useState } from 'react';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { products, Product } from '../stripe-config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();

  const subscriptionProducts = products.filter(p => p.mode === 'subscription');
  const creditProducts = products.filter(p => p.mode === 'payment');

  // Beta discount percentages
  const betaDiscounts = {
    'Starter': 10,
    'Pro': 20,
    'Studio': 30
  };

  // Calculate discounted price
  const getDiscountedPrice = (product: Product) => {
    const discount = betaDiscounts[product.name as keyof typeof betaDiscounts] || 0;
    return product.price * (1 - discount / 100);
  };
  const handleCheckout = async (product: Product) => {
    if (!user || !accessToken) {
      showToast('Please log in to continue', 'error');
      return;
    }

    // Check if user is a guest - guests cannot make purchases
    const isGuest = localStorage.getItem('is_guest');
    if (isGuest) {
      showToast('Please log in with a full account to make purchases', 'error');
      return;
    }

    setIsLoading(product.priceId);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          priceId: product.priceId,
          mode: product.mode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stripe checkout response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
          priceId: product.priceId,
          mode: product.mode
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Failed to start checkout', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'studio':
        return <Crown className="h-8 w-8 text-purple-600" />;
      case 'pro':
        return <Star className="h-8 w-8 text-blue-600" />;
      case 'starter':
        return <Zap className="h-8 w-8 text-green-600" />;
      default:
        return <Star className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPlanColors = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'studio':
        return {
          border: 'border-purple-200 dark:border-purple-800',
          bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          accent: 'text-purple-600 dark:text-purple-400'
        };
      case 'pro':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
          accent: 'text-blue-600 dark:text-blue-400'
        };
      case 'starter':
        return {
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
          accent: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-800',
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          button: 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700',
          accent: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Beta Banner */}
      <div className="relative overflow-hidden">
        {/* Beta Ribbon */}
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-2 
                        transform rotate-12 translate-x-4 -translate-y-2 shadow-lg">
            <span className="font-bold text-sm">BETA VERSION</span>
          </div>
        </div>
        
        {/* Beta Info Bar */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                      border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                🎉 Beta Launch Special
              </h3>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            </div>
            <p className="text-lg text-amber-700 dark:text-amber-300 mb-4">
              Είμαστε σε Beta. Όσοι εγγραφούν τώρα κλειδώνουν <strong>Lifetime έκπτωση</strong>:
            </p>
            <div className="flex items-center justify-center space-x-6 text-amber-800 dark:text-amber-200">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Starter</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full font-bold">−10%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Pro</span>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full font-bold">−20%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Studio</span>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full font-bold">−30%</span>
              </div>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
              ⏰ Περιορισμένη προσφορά - Η έκπτωση ισχύει για όσο διατηρείς ενεργή τη συνδρομή στο ίδιο πλάνο
            </p>
          </div>
        </div>
      </div>
      {/* Subscription Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your photography workflow. All plans include AI-powered photo analysis and culling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionProducts.map((product) => {
            const colors = getPlanColors(product.name);
            const isPopular = product.name === 'Pro';
            const isBestValue = product.name === 'Studio';
            const discount = betaDiscounts[product.name as keyof typeof betaDiscounts] || 0;
            const discountedPrice = getDiscountedPrice(product);
            
            return (
              <div
                key={product.id}
                className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-8 shadow-lg 
                          hover:shadow-xl transition-all duration-200 ${
                  isPopular ? 'scale-105 ring-2 ring-blue-500/20' : 
                  isBestValue ? 'scale-105 ring-2 ring-purple-500/20' : 'hover:scale-105'
                }`}
              >
                {/* Lifetime Discount Badge */}
                {discount > 0 && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 
                                   rounded-full text-xs font-bold shadow-lg transform rotate-12">
                      Lifetime Discount
                    </div>
                  </div>
                )}

                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 
                                   rounded-full text-sm font-medium shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                {isBestValue && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 
                                   rounded-full text-sm font-medium shadow-lg">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(product.name)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>
                  <div className="flex flex-col items-center justify-center">
                    {discount > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-center space-x-2">
                          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                            -{discount}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full font-bold">
                            Lifetime
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            έκπτωση
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                          €{product.price.toFixed(2)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(product)}
                  disabled={isLoading === product.priceId}
                  title={discount > 0 ? "Η έκπτωση ισχύει για όσο διατηρείς ενεργή τη συνδρομή στο ίδιο πλάνο." : undefined}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2
                            ${colors.button} shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none`}
                >
                  {isLoading === product.priceId ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{discount > 0 ? 'Κλείδωσε Lifetime Έκπτωση' : 'Get Started'}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Packages */}
      {creditProducts.length > 0 && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Additional Credits
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Need more credits? Purchase additional credits that never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {creditProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                         p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full 
                                flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">one-time</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(product)}
                  disabled={isLoading === product.priceId}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-600 
                           hover:from-orange-700 hover:to-amber-700 disabled:from-gray-400 
                           disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                           font-medium transition-all duration-200 flex items-center justify-center space-x-2
                           shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading === product.priceId ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Purchase Credits</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;