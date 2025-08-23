import React, { useState } from 'react';
import { LogIn, Camera, Sparkles, Zap, Brain, Shield, Users, Mail, Lock, Eye, EyeOff, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (mode === 'signup' && formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        showToast('Successfully signed in!', 'success');
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.name);
        showToast('Account created successfully! Please check your email to verify your account.', 'success');
        setMode('signin');
      }
    } catch (error: any) {
      console.error('Auth failed:', error);
      showToast(error.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(formData.email);
      showToast('Password reset email sent! Check your inbox.', 'success');
      setMode('signin');
    } catch (error: any) {
      console.error('Password reset failed:', error);
      showToast(error.message || 'Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            {/* Beta Lifetime Discount Banner */}
            <div className="order-1 lg:order-1 lg:col-span-2 mb-8">
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
                              border-2 border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
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
              </div>
            </div>

            {/* Left side - Auth Form */}
            <div className="order-2 lg:order-1 lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {mode === 'signin' ? 'Welcome Back' : 
                     mode === 'signup' ? 'Join Ailbums' : 
                     'Reset Password'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {mode === 'signin' ? 'Sign in to access your AI photo culling workspace' :
                     mode === 'signup' ? 'Create your account and lock in beta discounts' :
                     'Enter your email to receive a password reset link'}
                  </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleSubmit} className="space-y-4">
                  {/* Name field for signup */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                   rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  {mode !== 'forgot' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                   rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password field for signup */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                   rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 
                             bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                             disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                             text-white rounded-xl transition-all duration-200 font-medium text-lg
                             focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : mode === 'signin' ? (
                      <>
                        <LogIn className="w-6 h-6" />
                        <span>Sign In</span>
                      </>
                    ) : mode === 'signup' ? (
                      <>
                        <UserPlus className="w-6 h-6" />
                        <span>Create Account & Lock Discount</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-6 h-6" />
                        <span>Send Reset Email</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Mode Switching */}
                <div className="mt-6 text-center space-y-3">
                  {mode === 'signin' && (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setMode('signup')}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Sign up now
                        </button>
                      </div>
                      <div className="text-sm">
                        <button
                          onClick={() => setMode('forgot')}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'signup' && (
                    <>
                      {/* Beta Signup CTA */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                                    border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Sparkles className="h-5 w-5 text-amber-600" />
                          <h4 className="font-bold text-amber-800 dark:text-amber-200">
                            🚀 Beta Early Access Benefits
                          </h4>
                        </div>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <li>• Lock in permanent discounts (10-30% off)</li>
                          <li>• Priority access to new AI features</li>
                          <li>• Direct feedback channel to development team</li>
                          <li>• Grandfathered pricing for life</li>
                        </ul>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <button
                          onClick={() => setMode('signin')}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Sign in
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'forgot' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Remember your password?{' '}
                      <button
                        onClick={() => setMode('signin')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Back to sign in
                      </button>
                    </div>
                  )}
                </div>

                {/* Terms and Privacy */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By {mode === 'signup' ? 'creating an account' : 'signing in'}, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Privacy Policy
                    </a>
                  </p>
                  
                  {mode === 'signup' && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>🎯 Beta Special:</strong> Sign up now to secure lifetime discounts on all subscription plans. 
                        This offer is only available during our beta period!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="order-3 lg:order-2 lg:col-span-1">
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