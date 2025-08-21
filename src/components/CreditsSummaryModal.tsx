import React, { useState, useEffect } from 'react';
import { X, CreditCard, Activity, Clock, Sync, AlertCircle, Check, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useCredits } from '../context/CreditsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CreditsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsSummaryModal: React.FC<CreditsSummaryModalProps> = ({ isOpen, onClose }) => {
  const { 
    balance, 
    planId, 
    catalogVersion, 
    pendingEvents, 
    deviceId, 
    isOnline, 
    lastSyncTime,
    refreshCredits,
    syncCredits
  } = useCredits();
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const result = await syncCredits();
      
      if (result?.result?.sync_error) {
        showToast(`Sync failed: ${result.result.sync_error}`, 'error');
      } else if (result?.result?.accepted && result.result.accepted > 0) {
        showToast(`Synced ${result.result.accepted} events`, 'success');
      } else {
        showToast('Credits synced', 'success');
      }
    } catch (error: any) {
      showToast('Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCredits();
      showToast('Credits refreshed', 'success');
    } catch (error: any) {
      showToast('Failed to refresh credits', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return lastSyncTime.toLocaleDateString();
  };

  const getPlanDisplayName = (planId: string) => {
    switch (planId) {
      case 'beta': return 'Beta';
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'studio': return 'Studio';
      default: return planId || 'Free';
    }
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
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                             bg-clip-text text-transparent">
                  Credits Summary
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Local wallet status and sync information
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
          <div className="space-y-6">
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                            border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {balance.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Available Credits
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                            border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {pendingEvents}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Pending Events
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                            border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  {isOnline ? <Wifi className="h-6 w-6 text-white" /> : <WifiOff className="h-6 w-6 text-white" />}
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Connection Status
                </div>
              </div>
            </div>

            {/* Plan Information */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Plan Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {getPlanDisplayName(planId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {user?.id?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {deviceId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Catalog Version:</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {catalogVersion || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Sync Status
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                             rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors 
                             duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh credits"
                  >
                    {isRefreshing ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing || !isOnline}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                             text-white rounded-lg flex items-center space-x-2 transition-colors 
                             duration-200 disabled:cursor-not-allowed"
                  >
                    {isSyncing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sync className="h-4 w-4" />
                    )}
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connection:</span>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">Offline</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending Events:</span>
                  <div className="flex items-center space-x-2">
                    {pendingEvents > 0 ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {pendingEvents} pending
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          All synced
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatLastSync()}
                  </span>
                </div>
              </div>

              {/* Sync Warning */}
              {pendingEvents > 0 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                      Pending Sync
                    </h4>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You have {pendingEvents} pending event{pendingEvents !== 1 ? 's' : ''} that need to be synced 
                    with the server. Click "Sync Now" to synchronize your credits.
                  </p>
                </div>
              )}

              {/* Offline Warning */}
              {!isOnline && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Offline Mode
                    </h4>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    You're currently offline. Credits will be tracked locally and synced when you're back online.
                  </p>
                </div>
              )}
            </div>

            {/* Feature Costs */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Feature Costs
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">LUT & Apply:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">2 credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Edit:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Variable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Relight:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Per Megapixel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Face Enhance:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Variable</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Costs are automatically deducted when you use features. Your local wallet tracks usage 
                  and syncs with the server periodically.
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Technical Details
              </h3>
              
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                  <span className="text-gray-900 dark:text-gray-100">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
                  <span className="text-gray-900 dark:text-gray-100">{deviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan ID:</span>
                  <span className="text-gray-900 dark:text-gray-100">{planId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Catalog Version:</span>
                  <span className="text-gray-900 dark:text-gray-100">{catalogVersion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsSummaryModal;