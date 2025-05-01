/**
 * ServiceWorkerManager
 * Manages registration and updates for the service worker that enables
 * PWA functionality and offline access.
 */
class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private isRegistered = false;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private updateCallbacks: (() => void)[] = [];

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Register the service worker for PWA functionality
   * @returns Promise that resolves when registration is complete
   */
  public async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return false;
    }

    if (this.isRegistered) {
      return true;
    }

    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      this.registration = registration;
      this.isRegistered = true;

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Check if an update is already available
      if (registration.waiting && navigator.serviceWorker.controller) {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }

      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Unregister the service worker
   * @returns Promise that resolves when unregistration is complete
   */
  public async unregister(): Promise<boolean> {
    if (!this.isRegistered || !this.registration) {
      return true;
    }

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.isRegistered = false;
        this.registration = null;
      }
      return success;
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update the service worker
   * @returns Promise that resolves when update is complete
   */
  public async update(): Promise<boolean> {
    if (!this.isRegistered || !this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Service worker update failed:', error);
      return false;
    }
  }

  /**
   * Apply a pending update
   */
  public applyUpdate(): void {
    if (!this.updateAvailable || !this.registration || !this.registration.waiting) {
      return;
    }

    // Send a message to the waiting service worker to activate it
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to load the new version
    window.location.reload();
  }

  /**
   * Check if a service worker update is available
   * @returns True if an update is available
   */
  public isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Register a callback to be called when an update is available
   * @param callback Function to call when an update is available
   */
  public onUpdateAvailable(callback: () => void): void {
    this.updateCallbacks.push(callback);

    // Trigger the callback immediately if an update is already available
    if (this.updateAvailable) {
      callback();
    }
  }

  /**
   * Notify all registered callbacks that an update is available
   */
  private notifyUpdateAvailable(): void {
    this.updateCallbacks.forEach((callback) => callback());
  }

  /**
   * Check if the application is running in standalone/installed mode
   * @returns True if running as an installed PWA
   */
  public isInStandaloneMode(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Check if the application is online
   * @returns True if online, false if offline
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for online/offline status changes
   * @param onOnline Callback for when the application goes online
   * @param onOffline Callback for when the application goes offline
   */
  public listenForNetworkChanges(onOnline: () => void, onOffline: () => void): () => void {
    const handleOnline = () => onOnline();
    const handleOffline = () => onOffline();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return a function to remove the event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Get information about the cache storage usage
   * @returns Promise that resolves to cache usage information
   */
  public async getCacheInfo(): Promise<{ size: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const { usage, quota } = await navigator.storage.estimate();
        return {
          size: usage || 0,
          quota: quota || 0,
        };
      } catch (error) {
        console.error('Failed to get cache info:', error);
      }
    }
    return null;
  }

  /**
   * Clear the cache storage
   * @returns Promise that resolves when the cache is cleared
   */
  public async clearCache(): Promise<boolean> {
    if ('caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        return true;
      } catch (error) {
        console.error('Failed to clear cache:', error);
        return false;
      }
    }
    return false;
  }
}

export default ServiceWorkerManager.getInstance();
