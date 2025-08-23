import React, { useState, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MySubscriptionModal from './MySubscriptionModal';
import { getUserPlan } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  
  // Load user's current plan
  useEffect(() => {
    const loadCurrentPlan = async () => {
      if (!user?.email) return;
      
      try {
        const plan = await getUserPlan(user.email);
        if (plan && plan.is_active) {
          const product = getProductByPriceId(plan.price_id);
          setCurrentPlan(product?.name || plan.plan_name);
        } else {
          setCurrentPlan('Free');
        }
      } catch (error) {
        console.error('Failed to load current plan:', error);
        setCurrentPlan('Free');
      }
    };
    
    loadCurrentPlan();
  }, [user?.email]);
  
  const handleLogout = () => {
    logout();
    showToast('Successfully logged out', 'info');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 
                 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {`${currentPlan} Plan`}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 
                        rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {currentPlan} Plan
                  </div>
                </div>
              </div>
            </div>

            <div className="py-1">
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 
                         dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors duration-200"
                onClick={() => {
                  setShowSubscription(true);
                  setIsOpen(false);
                }}
              >
                <Crown className="h-4 w-4" />
                <span>My Subscription</span>
                <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {currentPlan}
                </span>
              </button>
              
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 
                         dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 
                         dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                         transition-colors duration-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
      </div>
      
      <MySubscriptionModal 
        isOpen={showSubscription} 
        onClose={() => setShowSubscription(false)} 
      />
    </>
  );
};

export default UserMenu;