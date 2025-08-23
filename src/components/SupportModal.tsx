import React, { useState } from 'react';
import { X, HelpCircle, Send, MessageSquare, Settings, CreditCard, Camera, Lightbulb, Book } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  const categories = [
    { value: 'general', label: 'General Help', icon: HelpCircle },
    { value: 'account', label: 'Account & Billing', icon: CreditCard },
    { value: 'features', label: 'How to Use Features', icon: Camera },
    { value: 'technical', label: 'Technical Issues', icon: Settings },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: Lightbulb },
    { value: 'tutorial', label: 'Tutorial Request', icon: Book }
  ];

  const priorities = [
    { value: 'low', label: 'Low - General question', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Need help soon', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Urgent assistance needed', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please log in to request support', 'error');
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user.id,
          user_email: user.email,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category,
          priority: formData.priority
        });

      if (error) {
        console.error('Support request submission error:', error);
        throw new Error(error.message);
      }

      showToast('Support request submitted! We\'ll get back to you soon.', 'success');
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
      });
      
      onClose();
    } catch (error: any) {
      console.error('Failed to submit support request:', error);
      showToast(error.message || 'Failed to submit support request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl 
                            flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  Get Support
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Need help? We're here to assist you with Ailbums
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Support Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What do you need help with?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleInputChange('category', category.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {category.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="What's your question or issue?"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
                maxLength={200}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How urgent is this?
              </label>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <label key={priority.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className={`text-sm font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please describe your question or issue in detail. Include any relevant information that might help us assist you better."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={6}
                required
                maxLength={2000}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.message.length}/2000 characters
              </div>
            </div>

            {/* User Info Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Support request will be submitted as:
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.id?.slice(0, 8)}...</p>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                We'll respond to your email address within 24 hours
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                         dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                         hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{isSubmitting ? 'Sending...' : 'Send Support Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;