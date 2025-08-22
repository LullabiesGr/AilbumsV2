import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CreditsCatalog {
  [key: string]: {
    cost: number;
    description: string;
  };
}

interface LocalWallet {
  balance_decimal: number;
  plan_id: string;
  catalog_version: string;
  device_id: string;
  last_updated: string;
}

interface CreditsResponse {
  debited: number;
  balance: number;
  plan_id: string;
  catalog_version: string;
  sync?: {
    synced: boolean;
    pending: boolean;
  };
}

interface SyncResult {
  ok: boolean;
  result?: {
    accepted: number;
    rejected: number;
    delta_applied: number;
    sync_error?: string;
  };
  left_pending: number;
}

interface CreditsContextType {
  balance: number;
  planId: string;
  catalogVersion: string;
  pendingEvents: number;
  deviceId: string;
  isLoading: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  
  // Actions
  refreshCredits: () => Promise<void>;
  syncCredits: () => Promise<SyncResult | null>;
  updateCreditsFromResponse: (credits: CreditsResponse) => void;
  
  // Feature costs
  getCost: (feature: string) => number;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://71d2da8f7b58.ngrok-free.app");

export const CreditsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [balance, setBalance] = useState<number>(0);
  const [planId, setPlanId] = useState<string>('');
  const [catalogVersion, setCatalogVersion] = useState<string>('');
  const [pendingEvents, setPendingEvents] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [catalog, setCatalog] = useState<CreditsCatalog>({});

  // Bootstrap credits on app startup/login
  const bootstrapCredits = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('🚀 Bootstrapping credits for user:', user.id);
      
      const response = await fetch(`${API_BASE_URL}/debug/credits/bootstrap?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Bootstrap failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Credits bootstrapped:', data);

      // Update state from bootstrap response
      if (data.from_server) {
        setPlanId(data.from_server.plan_id || '');
        setCatalogVersion(data.from_server.catalog_version || '');
        setCatalog(data.from_server.catalog || {});
      }

      if (data.local_wallet) {
        setBalance(data.local_wallet.balance_decimal || 0);
      }

      setDeviceId(data.device_id || '');
      
      // Immediately get local state
      await refreshCreditsLocal();
      
    } catch (error: any) {
      console.error('❌ Credits bootstrap failed:', error);
      showToast('Failed to load credits information', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh local credits state
  const refreshCreditsLocal = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Refreshing local credits for user:', user.id);
      
      const response = await fetch(`${API_BASE_URL}/debug/credits/local?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Local credits refresh failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Local credits refreshed:', data);

      if (data.wallet) {
        setBalance(data.wallet.balance_decimal || 0);
        setPlanId(data.wallet.plan_id || '');
        setCatalogVersion(data.wallet.catalog_version || '');
      }

      setPendingEvents(data.pending_events || 0);
      setDeviceId(data.device_id || '');
      
    } catch (error: any) {
      console.error('❌ Local credits refresh failed:', error);
      // Don't show toast for periodic refreshes to avoid spam
    }
  }, [user?.id]);

  // Sync credits with Supabase
  const syncCredits = useCallback(async (): Promise<SyncResult | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔄 Syncing credits for user:', user.id);
      
      const formData = new FormData();
      formData.append('user_id', user.id);

      const response = await fetch(`${API_BASE_URL}/credits/sync/run`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      console.log('✅ Credits synced:', result);

      // Update pending events count
      setPendingEvents(result.left_pending || 0);
      setLastSyncTime(new Date());

      // Refresh local state after sync
      await refreshCreditsLocal();

      if (result.result?.sync_error) {
        showToast(`Sync warning: ${result.result.sync_error}`, 'warning');
      } else if (result.result?.accepted && result.result.accepted > 0) {
        showToast('Credits synced successfully', 'success');
      }

      return result;
      
    } catch (error: any) {
      console.error('❌ Credits sync failed:', error);
      showToast(`Sync failed: ${error.message}`, 'error');
      return null;
    }
  }, [user?.id, refreshCreditsLocal, showToast]);

  // Update credits from API response
  const updateCreditsFromResponse = useCallback((credits: CreditsResponse) => {
    console.log('💳 Updating credits from response:', credits);
    
    setBalance(credits.balance);
    setPlanId(credits.plan_id);
    setCatalogVersion(credits.catalog_version);
    
    if (credits.sync?.pending) {
      setPendingEvents(prev => prev + 1);
    }
    
    if (credits.debited > 0) {
      showToast(`−${credits.debited} credits used`, 'info');
    }
  }, [showToast]);

  // Get feature cost from catalog
  const getCost = useCallback((feature: string): number => {
    return catalog[feature]?.cost || 0;
  }, [catalog]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync when coming back online
      if (user?.id && pendingEvents > 0) {
        syncCredits();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, pendingEvents, syncCredits]);

  // Page visibility sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline && user?.id && pendingEvents > 0) {
        syncCredits();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOnline, user?.id, pendingEvents, syncCredits]);

  // Periodic sync (every 90 seconds)
  useEffect(() => {
    if (!user?.id || !isOnline) return;

    const interval = setInterval(() => {
      if (!document.hidden && isOnline && pendingEvents > 0) {
        syncCredits().then((result) => {
          // Silent sync - only show toast if something changed
          if (result?.result?.accepted && result.result.accepted > 0) {
            showToast('Credits synced', 'success');
          }
        });
      }
    }, 90000); // 90 seconds

    return () => clearInterval(interval);
  }, [user?.id, isOnline, pendingEvents, syncCredits, showToast]);

  // Bootstrap on user login
  useEffect(() => {
    if (user?.id) {
      bootstrapCredits();
    }
  }, [user?.id, bootstrapCredits]);

  const value: CreditsContextType = {
    balance,
    planId,
    catalogVersion,
    pendingEvents,
    deviceId,
    isLoading,
    isOnline,
    lastSyncTime,
    refreshCredits: refreshCreditsLocal,
    syncCredits,
    updateCreditsFromResponse,
    getCost
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};