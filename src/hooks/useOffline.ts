import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '@/lib/offline-storage';
import { toast } from '@/hooks/use-toast';

// Configuration from environment variables
const SYNC_RETRY_LIMIT = Number(import.meta.env.VITE_OFFLINE_SYNC_RETRY_LIMIT) || 3;

interface OfflineStatus {
  isOnline: boolean;
  isInitialized: boolean;
  syncInProgress: boolean;
  pendingItems: number;
}

export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isInitialized: false,
    syncInProgress: false,
    pendingItems: 0
  });

  // Initialize offline storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await offlineStorage.init();
        const storageInfo = await offlineStorage.getStorageInfo();
        setStatus(prev => ({
          ...prev,
          isInitialized: true,
          pendingItems: storageInfo.syncQueue
        }));
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
        toast({
          title: "Offline Storage Error",
          description: "Failed to initialize offline storage. Some features may not work offline.",
          variant: "destructive"
        });
      }
    };

    initStorage();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing offline changes...",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Offline Mode",
        description: "You're now offline. Changes will be saved locally and synced when connection is restored.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline data when coming back online
  const syncOfflineData = useCallback(async () => {
    if (!status.isOnline || status.syncInProgress) return;

    setStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      
      if (syncQueue.length === 0) {
        setStatus(prev => ({ ...prev, syncInProgress: false, pendingItems: 0 }));
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const item of syncQueue) {
        try {
          await syncItem(item);
          await offlineStorage.removeSyncQueueItem(item.id);
          successCount++;
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          failureCount++;
          
          // Increment retry count
          item.retries++;
          if (item.retries < SYNC_RETRY_LIMIT) {
            // Re-add to queue with updated retry count
            await offlineStorage.addToSyncQueue(item);
          }
        }
      }

      const updatedStorageInfo = await offlineStorage.getStorageInfo();
      setStatus(prev => ({
        ...prev,
        syncInProgress: false,
        pendingItems: updatedStorageInfo.syncQueue
      }));

      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${successCount} items${failureCount > 0 ? `. ${failureCount} items failed and will be retried.` : '.'}`,
        });
      }

      if (failureCount > 0 && successCount === 0) {
        toast({
          title: "Sync Failed",
          description: `Failed to sync ${failureCount} items. Will retry automatically.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setStatus(prev => ({ ...prev, syncInProgress: false }));
      toast({
        title: "Sync Error",
        description: "Failed to sync offline data. Will retry automatically.",
        variant: "destructive"
      });
    }
  }, [status.isOnline, status.syncInProgress]);

  // Sync individual item
  const syncItem = async (item: any) => {
    // This would contain the actual sync logic for different item types
    // For now, we'll just simulate the sync
    console.log('Syncing item:', item);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would make actual API calls to Supabase
    // based on the item type and action
  };

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (status.isOnline && !status.syncInProgress) {
      syncOfflineData();
    }
  }, [status.isOnline, status.syncInProgress, syncOfflineData]);

  // Save data offline
  const saveOffline = useCallback(async (type: 'payment' | 'suborganizer', data: any) => {
    try {
      if (type === 'payment') {
        const offlineId = await offlineStorage.savePaymentOffline(data);
        const updatedStorageInfo = await offlineStorage.getStorageInfo();
        setStatus(prev => ({ ...prev, pendingItems: updatedStorageInfo.syncQueue }));
        return offlineId;
      } else if (type === 'suborganizer') {
        const offlineId = await offlineStorage.saveSuborganizerOffline(data);
        const updatedStorageInfo = await offlineStorage.getStorageInfo();
        setStatus(prev => ({ ...prev, pendingItems: updatedStorageInfo.syncQueue }));
        return offlineId;
      }
    } catch (error) {
      console.error('Failed to save offline:', error);
      throw error;
    }
  }, []);

  // Get offline data
  const getOfflineData = useCallback(async (type: 'payments' | 'suborganizers') => {
    try {
      if (type === 'payments') {
        return await offlineStorage.getOfflinePayments();
      } else if (type === 'suborganizers') {
        return await offlineStorage.getOfflineSuborganizers();
      }
      return [];
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  }, []);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData();
      setStatus(prev => ({ ...prev, pendingItems: 0 }));
      toast({
        title: "Offline Data Cleared",
        description: "All offline data has been cleared.",
      });
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      toast({
        title: "Error",
        description: "Failed to clear offline data.",
        variant: "destructive"
      });
    }
  }, []);

  return {
    ...status,
    triggerSync,
    saveOffline,
    getOfflineData,
    clearOfflineData
  };
}