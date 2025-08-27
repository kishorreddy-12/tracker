// IndexedDB wrapper for offline storage
const DB_NAME = 'SeedOrganizerDB';
const DB_VERSION = 1;

// Configuration from environment variables
const SYNC_RETRY_LIMIT = Number(import.meta.env.VITE_OFFLINE_SYNC_RETRY_LIMIT) || 3;
const CACHE_DURATION_DAYS = Number(import.meta.env.VITE_OFFLINE_CACHE_DURATION_DAYS) || 30;

// Store names
const STORES = {
  PAYMENTS: 'payments',
  SUBORGANIZERS: 'suborganizers',
  SYNC_QUEUE: 'syncQueue',
  IMAGES: 'images'
};

interface OfflinePayment {
  id: string;
  suborganizer_id: string;
  date: string;
  amount: number;
  purpose: string;
  payment_mode: string;
  bill_receipt_url?: string;
  payment_screenshot_url?: string;
  notes?: string;
  created_at: string;
  synced: boolean;
  offline_id: string;
}

interface OfflineSuborganizer {
  id: string;
  name: string;
  phone: string;
  village: string;
  crop_type: string;
  created_at: string;
  synced: boolean;
  offline_id: string;
}

interface SyncQueueItem {
  id: string;
  type: 'payment' | 'suborganizer' | 'image';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create payments store
        if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
          const paymentsStore = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'offline_id' });
          paymentsStore.createIndex('synced', 'synced', { unique: false });
          paymentsStore.createIndex('date', 'date', { unique: false });
        }

        // Create suborganizers store
        if (!db.objectStoreNames.contains(STORES.SUBORGANIZERS)) {
          const suborganizersStore = db.createObjectStore(STORES.SUBORGANIZERS, { keyPath: 'offline_id' });
          suborganizersStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create images store
        if (!db.objectStoreNames.contains(STORES.IMAGES)) {
          const imagesStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'url' });
          imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Payment operations
  async savePaymentOffline(payment: Omit<OfflinePayment, 'offline_id' | 'synced'>): Promise<string> {
    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlinePayment: OfflinePayment = {
      ...payment,
      offline_id: offlineId,
      synced: false
    };

    const store = await this.getStore(STORES.PAYMENTS, 'readwrite');
    await new Promise((resolve, reject) => {
      const request = store.add(offlinePayment);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await this.addToSyncQueue({
      id: offlineId,
      type: 'payment',
      action: 'create',
      data: offlinePayment,
      timestamp: Date.now(),
      retries: 0
    });

    return offlineId;
  }

  async getOfflinePayments(): Promise<OfflinePayment[]> {
    const store = await this.getStore(STORES.PAYMENTS);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedPayments(): Promise<OfflinePayment[]> {
    const store = await this.getStore(STORES.PAYMENTS);
    const index = store.index('synced');
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markPaymentSynced(offlineId: string): Promise<void> {
    const store = await this.getStore(STORES.PAYMENTS, 'readwrite');
    const payment = await new Promise<OfflinePayment>((resolve, reject) => {
      const request = store.get(offlineId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (payment) {
      payment.synced = true;
      await new Promise((resolve, reject) => {
        const request = store.put(payment);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Suborganizer operations
  async saveSuborganizerOffline(suborganizer: Omit<OfflineSuborganizer, 'offline_id' | 'synced'>): Promise<string> {
    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineSuborganizer: OfflineSuborganizer = {
      ...suborganizer,
      offline_id: offlineId,
      synced: false
    };

    const store = await this.getStore(STORES.SUBORGANIZERS, 'readwrite');
    await new Promise((resolve, reject) => {
      const request = store.add(offlineSuborganizer);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await this.addToSyncQueue({
      id: offlineId,
      type: 'suborganizer',
      action: 'create',
      data: offlineSuborganizer,
      timestamp: Date.now(),
      retries: 0
    });

    return offlineId;
  }

  async getOfflineSuborganizers(): Promise<OfflineSuborganizer[]> {
    const store = await this.getStore(STORES.SUBORGANIZERS);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedSuborganizers(): Promise<OfflineSuborganizer[]> {
    const store = await this.getStore(STORES.SUBORGANIZERS);
    const index = store.index('synced');
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue operations
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, 'readwrite');
    await new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const store = await this.getStore(STORES.SYNC_QUEUE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    const store = await this.getStore(STORES.SYNC_QUEUE, 'readwrite');
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Image caching
  async cacheImage(url: string, blob: Blob): Promise<void> {
    const store = await this.getStore(STORES.IMAGES, 'readwrite');
    const imageData = {
      url,
      blob,
      timestamp: Date.now()
    };

    await new Promise((resolve, reject) => {
      const request = store.put(imageData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedImage(url: string): Promise<Blob | null> {
    const store = await this.getStore(STORES.IMAGES);
    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const storeNames = [STORES.PAYMENTS, STORES.SUBORGANIZERS, STORES.SYNC_QUEUE, STORES.IMAGES];
    
    for (const storeName of storeNames) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getStorageInfo(): Promise<{
    payments: number;
    suborganizers: number;
    syncQueue: number;
    images: number;
  }> {
    const [payments, suborganizers, syncQueue, images] = await Promise.all([
      this.getOfflinePayments(),
      this.getOfflineSuborganizers(),
      this.getSyncQueue(),
      new Promise<any[]>((resolve, reject) => {
        this.getStore(STORES.IMAGES).then(store => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      })
    ]);

    return {
      payments: payments.length,
      suborganizers: suborganizers.length,
      syncQueue: syncQueue.length,
      images: images.length
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();