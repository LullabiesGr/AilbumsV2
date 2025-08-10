import React, { useState } from 'react';
import { LogIn, Camera, Sparkles, Zap, Brain, Shield, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Ripple, TechOrbitDisplay, BoxReveal, BottomGradient } from './ui/modern-animated-sign-in';

const LoginScreen: React.FC = () => {
  const { login, loginAsGuest } = useAuth();
  const { showToast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
      showToast('Successfully logged in!', 'success');
    } catch (error: any) {
      console.error('Login failed:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    try {
      loginAsGuest();
      showToast('Logged in as guest!', 'success');
    } catch (error: any) {
      console.error('Guest login failed:', error);
      showToast('Guest login failed. Please try again.', 'error');
    }
  };

  // AI/Tech icons for orbiting animation
  const iconsArray = [
    {
      component: () => <Brain className="h-8 w-8 text-blue-500" />,
      className: 'size-[40px] border-none bg-transparent',
      duration: 20,
      delay: 0,
      radius: 80,
      path: false,
      reverse: false,
    },
    {
      component: () => <Camera className="h-6 w-6 text-purple-500" />,
      className: 'size-[30px] border-none bg-transparent',
      duration: 15,
      delay: 5,
      radius: 120,
      path: false,
      reverse: true,
    },
    {
      component: () => <Sparkles className="h-7 w-7 text-pink-500" />,
      className: 'size-[35px] border-none bg-transparent',
      duration: 25,
      delay: 10,
      radius: 160,
      path: false,
      reverse: false,
    },
    {
      component: () => <Zap className="h-6 w-6 text-yellow-500" />,
      className: 'size-[30px] border-none bg-transparent',
      duration: 18,
      delay: 15,
      radius: 200,
      path: false,
      reverse: true,
    },
    {
      component: () => <Shield className="h-5 w-5 text-green-500" />,
      className: 'size-[25px] border-none bg-transparent',
      duration: 22,
      delay: 20,
      radius: 240,
      path: false,
      reverse: false,
    },
    {
      component: () => <Users className="h-5 w-5 text-indigo-500" />,
      className: 'size-[25px] border-none bg-transparent',
      duration: 30,
      delay: 25,
      radius: 280,
      path: false,
      reverse: true,
    },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your photos for quality, composition, and content'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process hundreds of photos in minutes with our optimized analysis pipeline'
    },
    {
      icon: Sparkles,
      title: 'Smart Culling',
      description: 'Automatically identify the best shots and flag potential issues like blur or closed eyes'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your photos are processed securely and never stored permanently on our servers'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Beta Lifetime Discount Banner */}
      <div className="relative overflow-hidden">
        {/* Beta Ribbon */}
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-2 
                        transform rotate-12 translate-x-4 -translate-y-2 shadow-lg">
            <span className="font-bold text-sm">BETA VERSION</span>
          </div>
        </div>
        
        {/* Main Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                      border-2 border-amber-200 dark:border-amber-800 p-8">
          <BoxReveal boxColor="#f59e0b" duration={0.5}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  🎉 Beta Launch Special - Lock in Lifetime Discounts!
                </h3>
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              </div>
              
              <p className="text-lg text-amber-700 dark:text-amber-300 mb-6 max-w-3xl mx-auto">
                We're in Beta! Early subscribers get <strong>permanent discounts</strong> that last as long as you keep your subscription active:
              </p>
              
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">Starter</span>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full font-bold text-lg">−10%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">Pro</span>
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold text-lg">−20%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">Studio</span>
                  <span className="px-4 py-2 bg-purple-500 text-white rounded-full font-bold text-lg">−30%</span>
                </div>
              </div>
              
              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  ⏰ <strong>Limited Time Offer</strong> - Your discount is locked in permanently as long as you maintain an active subscription on the same plan
                </p>
              </div>
            </div>
          </BoxReveal>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex min-h-[calc(100vh-200px)]">
            {/* Left side - Animated Background */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
              <Ripple mainCircleSize={100} numCircles={8} />
              <TechOrbitDisplay iconsArray={iconsArray} text="Ailbums" />
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                  <BoxReveal boxColor="#3b82f6" duration={0.5}>
                    <div className="flex items-center justify-center space-x-3 mb-6">
                      <img 
                        src="https://i.postimg.cc/c18qn8yp/Untitled-design-19.png" 
                        alt="Ailbums Logo"
                        className="h-16 w-16 object-contain"
                      />
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ailbums
                      </h1>
                    </div>
                  </BoxReveal>
                  
                  <BoxReveal boxColor="#8b5cf6" duration={0.5}>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                      Professional AI Photo Culling Platform
                    </p>
                  </BoxReveal>
                  
                  <BoxReveal boxColor="#ec4899" duration={0.5}>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Streamline your photography workflow with intelligent photo analysis
                    </p>
                  </BoxReveal>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                  <BoxReveal boxColor="#3b82f6" duration={0.5}>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Welcome Back
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sign in to access your AI photo culling workspace
                      </p>
                    </div>
                  </BoxReveal>

                  <BoxReveal boxColor="#10b981" duration={0.5} overflow="visible">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 
                               bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 
                               rounded-xl hover:border-blue-500 dark:hover:border-blue-400 
                               hover:shadow-lg transition-all duration-200 
                               disabled:opacity-50 disabled:cursor-not-allowed
                               focus:outline-none focus:ring-4 focus:ring-blue-500/20 group/btn relative"
                    >
                      {isLoggingIn ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                        {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
                      </span>
                      <BottomGradient />
                    </button>
                  </BoxReveal>

                  <BoxReveal boxColor="#6b7280" duration={0.5}>
                    <div className="mt-4 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
                            or
                          </span>
                        </div>
                      </div>
                    </div>
                  </BoxReveal>

                  <BoxReveal boxColor="#9ca3af" duration={0.5} overflow="visible">
                    <button
                      onClick={handleGuestLogin}
                      className="w-full mt-4 flex items-center justify-center space-x-3 px-6 py-3 
                               bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 
                               transition-all duration-200 
                               focus:outline-none focus:ring-4 focus:ring-gray-500/20 group/btn relative"
                    >
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                        Continue as Guest
                      </span>
                      <BottomGradient />
                    </button>
                  </BoxReveal>

                  <BoxReveal boxColor="#6b7280" duration={0.5}>
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          Privacy Policy
                        </a>
                      </p>
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <strong>Guest Mode:</strong> Try the app without signing up! Guest sessions are temporary and data won't be saved permanently.
                        </p>
                      </div>
                    </div>
                  </BoxReveal>
                </div>

                {/* Features Preview - Mobile Only */}
                <div className="lg:hidden mt-8">
                  <BoxReveal boxColor="#3b82f6" duration={0.5}>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                      Why Choose Ailbums?
                    </h3>
                  </BoxReveal>

                  <div className="grid gap-4">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <BoxReveal key={index} boxColor="#8b5cf6" duration={0.5}>
                          <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </BoxReveal>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section - Desktop */}
          <div className="hidden lg:block mt-16">
            <BoxReveal boxColor="#3b82f6" duration={0.5}>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Why Choose Ailbums?
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Professional photographers trust our AI to streamline their workflow and deliver exceptional results.
                </p>
              </div>
            </BoxReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <BoxReveal key={index} boxColor="#8b5cf6" duration={0.5}>
                    <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </BoxReveal>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <BoxReveal boxColor="#3b82f6" duration={0.5}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Photos Analyzed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
              </div>
            </BoxReveal>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <BoxReveal boxColor="#6b7280" duration={0.5}>
              <p className="text-gray-500 dark:text-gray-400">
                © 2025 Ailbums — AI Photo Culling. All rights reserved.
              </p>
            </BoxReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;