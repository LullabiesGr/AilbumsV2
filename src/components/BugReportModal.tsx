import React, { useState } from 'react';
import { X, Bug, Send, AlertCircle, Zap, Eye, Settings, Upload, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  const categories = [
    { value: 'general', label: 'General Issue', icon: AlertCircle },
    { value: 'upload', label: 'Photo Upload', icon: Upload },
    { value: 'analysis', label: 'AI Analysis', icon: Brain },
    { value: 'ui', label: 'User Interface', icon: Eye },
    { value: 'performance', label: 'Performance', icon: Zap },
    { value: 'settings', label: 'Settings/Config', icon: Settings }
  ];

  const priorities = [
    { value: 'low', label: 'Low - Minor issue', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Affects workflow', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Blocks functionality', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please log in to report bugs', 'error');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bug_reports')
        .insert({
          user_id: user.id,
          user_email: user.email,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority
        });

      if (error) {
        console.error('Bug report submission error:', error);
        throw new Error(error.message);
      }

      showToast('Bug report submitted successfully! We\'ll investigate this issue.', 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      
      onClose();
    } catch (error: any) {
      console.error('Failed to submit bug report:', error);
      showToast(error.message || 'Failed to submit bug report', 'error');
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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl 
                            flex items-center justify-center">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 
                             bg-clip-text text-transparent">
                  Report a Bug
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Help us improve Ailbums by reporting issues you encounter
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
            {/* Bug Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bug Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue (e.g., 'Photos not uploading')"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
                maxLength={200}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
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
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${
                          isSelected ? 'text-red-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-red-900 dark:text-red-100' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {category.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
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
                      className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className={`text-sm font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please describe the bug in detail:&#10;- What were you trying to do?&#10;- What happened instead?&#10;- Steps to reproduce the issue&#10;- Any error messages you saw"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={6}
                required
                maxLength={2000}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.description.length}/2000 characters
              </div>
            </div>

            {/* User Info Display */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Report will be submitted as:
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.id?.slice(0, 8)}...</p>
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
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 
                         hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 
                         disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                         flex items-center space-x-2 transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Bug Report'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BugReportModal;