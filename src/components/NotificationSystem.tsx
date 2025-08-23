import React, { useState, useEffect, useCallback } from 'react';
import { X, Crown, Star, Zap, TrendingUp, Users, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'upgrade' | 'feature' | 'milestone';
  timestamp: Date;
  plan?: string;
  userName?: string;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date>(new Date());

  // Fake user names for notifications
  const fakeUsers = [
    'Tony', 'Maria', 'Dimitris', 'Elena', 'Kostas', 'Sofia', 'Nikos', 'Anna',
    'Yannis', 'Christina', 'Petros', 'Katerina', 'Michalis', 'Despina',
    'Alexandros', 'Ioanna', 'Stavros', 'Eleni', 'Georgios', 'Vasiliki'
  ];

  const plans = ['Starter', 'Pro', 'Studio'];

  const notificationTemplates = [
    {
      type: 'upgrade' as const,
      titleTemplate: "Don't miss our Beta early access discount - {user} didn't miss it!",
      messageTemplate: "{user} just upgraded to {plan} plan and locked in lifetime discount",
      plans: ['Starter', 'Pro', 'Studio']
    },
    {
      type: 'upgrade' as const,
      titleTemplate: "🎉 Another photographer joined the Beta!",
      messageTemplate: "{user} just subscribed to {plan} and secured permanent pricing",
      plans: ['Pro', 'Studio']
    },
    {
      type: 'feature' as const,
      titleTemplate: "Beta users are loving our AI features!",
      messageTemplate: "{user} just processed 500+ photos with AI analysis",
      plans: []
    },
    {
      type: 'milestone' as const,
      titleTemplate: "🚀 Beta milestone reached!",
      messageTemplate: "Over 1,000 photographers have joined our Beta program",
      plans: []
    },
    {
      type: 'upgrade' as const,
      titleTemplate: "Smart photographers lock in Beta discounts",
      messageTemplate: "{user} secured {plan} plan with permanent {discount}% discount",
      plans: ['Starter', 'Pro', 'Studio']
    }
  ];

  const getRandomUser = () => fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const getRandomPlan = () => plans[Math.floor(Math.random() * plans.length)];
  
  const getDiscountForPlan = (plan: string) => {
    switch (plan) {
      case 'Starter': return '10';
      case 'Pro': return '20';
      case 'Studio': return '30';
      default: return '15';
    }
  };

  const generateNotification = useCallback((): Notification => {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const user = getRandomUser();
    const plan = template.plans.length > 0 ? getRandomPlan() : '';
    const discount = getDiscountForPlan(plan);

    const title = template.titleTemplate
      .replace('{user}', user)
      .replace('{plan}', plan)
      .replace('{discount}', discount);

    const message = template.messageTemplate
      .replace('{user}', user)
      .replace('{plan}', plan)
      .replace('{discount}', discount);

    return {
      id: Math.random().toString(36).substring(2, 11),
      title,
      message,
      type: template.type,
      timestamp: new Date(),
      plan,
      userName: user
    };
  }, []);

  // Generate notifications at intervals
  useEffect(() => {
    if (!isVisible) return;

    // Initial notification after 10 seconds
    const initialTimer = setTimeout(() => {
      const notification = generateNotification();
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
      setLastNotificationTime(new Date());
    }, 10000);

    // Subsequent notifications every 45-90 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime();
      
      // Only show if at least 45 seconds have passed and user is active
      if (timeSinceLastNotification >= 45000 && !document.hidden) {
        const notification = generateNotification();
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
        setLastNotificationTime(now);
      }
    }, Math.random() * 45000 + 45000); // Random between 45-90 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isVisible, lastNotificationTime, generateNotification]);

  // Auto-remove notifications after 8 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 8000);

      return () => clearTimeout(timer);
    });
  }, [notifications]);

  const handleHideNotifications = () => {
    setIsVisible(false);
    localStorage.setItem('notifications_hidden', 'true');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Starter': return <Zap className="h-4 w-4 text-green-500" />;
      case 'Pro': return <Star className="h-4 w-4 text-blue-500" />;
      case 'Studio': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upgrade': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'feature': return <Star className="h-5 w-5 text-blue-500" />;
      case 'milestone': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Check if notifications are hidden
  useEffect(() => {
    const hidden = localStorage.getItem('notifications_hidden');
    if (hidden === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={handleMinimize}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 
                   dark:border-gray-700 p-3 hover:shadow-xl transition-all duration-200
                   flex items-center space-x-2"
        >
          <Bell className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
          {notifications.length > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-30 max-w-sm w-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 
                      dark:border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Live Updates
            </span>
            {notifications.length > 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMinimize}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Minimize"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleHideNotifications}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Hide notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 
                     dark:border-gray-700 p-4 animate-fade-in transform transition-all duration-300
                     hover:shadow-xl"
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * 2}px)`
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    {notification.plan && (
                      <div className="flex items-center space-x-2 mt-2">
                        {getPlanIcon(notification.plan)}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {notification.plan} Plan
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors
                             flex-shrink-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.timestamp.toLocaleTimeString('el-GR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  
                  {notification.type === 'upgrade' && (
                    <button
                      onClick={() => {
                        window.history.pushState({}, '', '/pricing');
                        window.location.reload();
                      }}
                      className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 
                               hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1 
                               rounded-full font-medium transition-all duration-200 
                               transform hover:scale-105"
                    >
                      Lock Discount
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem;