import React, { useState } from 'react';
import { CreditCard, Sync, Wifi, WifiOff, Clock, AlertCircle, Check } from 'lucide-react';
import { useCredits } from '../context/CreditsContext';
import { useToast } from '../context/ToastContext';

const CreditsWidget: React.FC = () => {
  const { 
    balance, 
    planId, 
    pendingEvents, 
    isLoading, 
    isOnline, 
    lastSyncTime,
    syncCredits,
    refreshCredits
  } = useCredits();
  
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

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
    try {
      await refreshCredits();
      showToast('Credits refreshed', 'success');
    } catch (error: any) {
      showToast('Failed to refresh credits', 'error');
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

  return (
    <div className="flex items-center space-x-3">
      {/* Credits Balance */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 
                    border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
        <CreditCard className="h-4 w-4 text-blue-500" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isLoading ? '...' : balance.toLocaleString()} credits
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getPlanDisplayName(planId)} plan
          </span>
        </div>
      </div>

      {/* Sync Status & Controls */}
      <div className="flex items-center space-x-2">
        {/* Online/Offline Indicator */}
        <div className={`p-2 rounded-lg ${
          isOnline 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`} title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </div>

        {/* Pending Events Badge */}
        {pendingEvents > 0 && (
          <div className="relative">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !isOnline}
              className="flex items-center space-x-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/20 
                       text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 
                       dark:hover:bg-amber-900/40 transition-colors duration-200 disabled:opacity-50
                       disabled:cursor-not-allowed"
              title={`${pendingEvents} pending events - Click to sync`}
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{pendingEvents}</span>
            </button>
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={handleSyncNow}
          disabled={isSyncing || !isOnline}
          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 
                   rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors 
                   duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Sync now - Last sync: ${formatLastSync()}`}
        >
          {isSyncing ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sync className="h-4 w-4" />
          )}
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                   rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors 
                   duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh credits"
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {/* Detailed Status Tooltip */}
      {(pendingEvents > 0 || !isOnline) && (
        <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {!isOnline && (
              <div className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3 text-red-500" />
                <span>Offline</span>
              </div>
            )}
            {pendingEvents > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span>{pendingEvents} pending</span>
              </div>
            )}
            {pendingEvents === 0 && isOnline && (
              <div className="flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Synced</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditsWidget;