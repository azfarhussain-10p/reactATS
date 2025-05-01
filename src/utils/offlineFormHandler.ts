/**
 * Utilities for handling form submissions when the app is offline
 */
import { api } from '../services/ApiService';

/**
 * Save a form submission to IndexedDB for later sync when app is back online
 */
export const saveFormForLater = async (
  url: string,
  method: string,
  headers: Record<string, string>,
  data: any
): Promise<boolean> => {
  try {
    const db = await openDatabase();
    await storeForm(db, { url, method, headers, data });
    db.close();

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-forms');
    }

    return true;
  } catch (error) {
    console.error('Failed to save form for later:', error);
    return false;
  }
};

/**
 * Wrapper for API calls that stores requests for later if offline
 * @param url API endpoint
 * @param method HTTP method
 * @param data Request body data
 * @param options Additional options
 * @returns Promise that resolves to the response or error if offline
 */
export const offlineAwareApiCall = async <T>(
  url: string,
  method: string = 'GET',
  data: any = null,
  options: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    retryOffline?: boolean;
  } = {}
): Promise<T> => {
  const { headers = {}, params = {}, retryOffline = true } = options;

  try {
    // Try to make the regular API call first
    if (method.toUpperCase() === 'GET') {
      return await api.get<T>(url, params);
    } else {
      return await api.request<T>({
        method,
        url,
        data,
        params,
        headers,
      });
    }
  } catch (error) {
    // If we're offline and this is a modifying request (not GET), save it for later
    if (!navigator.onLine && retryOffline && method.toUpperCase() !== 'GET') {
      const saved = await saveFormForLater(url, method, headers, data);

      if (saved) {
        return {
          success: true,
          offlineQueued: true,
          message: "Request saved for when you're back online",
        } as unknown as T;
      }
    }

    // Re-throw the error if we couldn't handle it
    throw error;
  }
};

/**
 * Check if there are any pending form submissions
 */
export const hasPendingForms = async (): Promise<boolean> => {
  try {
    const db = await openDatabase();
    const forms = await getAllStoredForms(db);
    db.close();

    return forms.length > 0;
  } catch (error) {
    console.error('Failed to check for pending forms:', error);
    return false;
  }
};

/**
 * Get count of pending form submissions
 */
export const getPendingFormsCount = async (): Promise<number> => {
  try {
    const db = await openDatabase();
    const forms = await getAllStoredForms(db);
    db.close();

    return forms.length;
  } catch (error) {
    console.error('Failed to get pending forms count:', error);
    return 0;
  }
};

/**
 * Process all pending form submissions when coming back online
 * @returns Promise with the results of the sync operation
 */
export const processPendingForms = async (): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{ id: number; success: boolean; error?: string }>;
}> => {
  if (!navigator.onLine) {
    return { success: false, processed: 0, failed: 0, results: [] };
  }

  try {
    const db = await openDatabase();
    const forms = await getAllStoredForms(db);

    if (forms.length === 0) {
      db.close();
      return { success: true, processed: 0, failed: 0, results: [] };
    }

    const results = await Promise.all(
      forms.map(async (form) => {
        try {
          await api.request({
            url: form.url,
            method: form.method,
            headers: form.headers,
            data: form.data,
          });

          await deleteForm(db, form.id);
          return { id: form.id, success: true };
        } catch (error) {
          console.error(`Failed to process offline form ${form.id}:`, error);
          return {
            id: form.id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    db.close();

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;

    return {
      success: failed === 0,
      processed: successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('Failed to process pending forms:', error);
    return { success: false, processed: 0, failed: 0, results: [] };
  }
};

/**
 * Set up an event listener to process forms when coming back online
 */
export const setupOfflineFormSync = (): void => {
  const handleOnline = async () => {
    console.log('Connection restored, checking for pending forms...');
    const result = await processPendingForms();

    if (result.processed > 0) {
      console.log(`Successfully processed ${result.processed} pending forms.`);
      // Notify any listeners that forms have been processed
      window.dispatchEvent(
        new CustomEvent('offline-forms-processed', {
          detail: result,
        })
      );
    }

    if (result.failed > 0) {
      console.warn(`Failed to process ${result.failed} forms.`);
    }
  };

  window.addEventListener('online', handleOnline);

  // If we're already online and have pending forms, process them immediately
  if (navigator.onLine) {
    setTimeout(async () => {
      const hasPending = await hasPendingForms();
      if (hasPending) {
        handleOnline();
      }
    }, 2000);
  }
};

// Helper Functions

/**
 * Open the IndexedDB database
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-forms', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target?.result as IDBDatabase;

      // Create an object store for offline forms
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Store a form in the database
 */
const storeForm = (db: IDBDatabase, formData: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('forms', 'readwrite');
    const store = transaction.objectStore('forms');
    const request = store.add({
      ...formData,
      timestamp: new Date().toISOString(),
    });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};

/**
 * Get all stored forms from the database
 */
const getAllStoredForms = (db: IDBDatabase): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('forms', 'readonly');
    const store = transaction.objectStore('forms');
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};

/**
 * Delete a form from the database
 */
const deleteForm = (db: IDBDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('forms', 'readwrite');
    const store = transaction.objectStore('forms');
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};
