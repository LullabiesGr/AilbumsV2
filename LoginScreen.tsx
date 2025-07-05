import React, { useState } from 'react';
import { LogIn, Camera, Sparkles, Zap, Brain, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
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
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional AI Photo Culling Platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Streamline your photography workflow with intelligent photo analysis and culling
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Login */}
            <div className="order-2 lg:order-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign in to access your AI photo culling workspace
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 
                           bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 
                           rounded-xl hover:border-blue-500 dark:hover:border-blue-400 
                           hover:shadow-lg transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-4 focus:ring-blue-500/20"
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
                </button>

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
                </div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Why Choose Ailbums?
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Professional photographers trust our AI to streamline their workflow and deliver exceptional results.
                  </p>
                </div>

                <div className="grid gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
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
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10M+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Photos Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            © 2025 Ailbums — AI Photo Culling. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;