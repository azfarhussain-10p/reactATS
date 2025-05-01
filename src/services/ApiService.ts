import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import CacheService from './CacheService';
import { saveFormForLater } from '../utils/offlineFormHandler';

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED !== 'false';
const DEFAULT_CACHE_TTL = 300; // 5 minutes in seconds
const OFFLINE_ENABLED = import.meta.env.VITE_OFFLINE_ENABLED !== 'false';

// Configurable cache options
interface CacheOptions {
  enabled?: boolean;
  ttl?: number | null; // Time to live in seconds, null means no expiry
  key?: string; // Custom cache key, defaults to URL+params
  invalidateTags?: string[]; // Tags to invalidate when this request succeeds
  tags?: string[]; // Tags to associate with this cache entry
}

// Request configuration with cache options
interface ApiRequestConfig extends AxiosRequestConfig {
  cache?: CacheOptions;
  enableOfflineSupport?: boolean;
}

// Response wrapper for offline-queued requests
interface OfflineQueuedResponse {
  success: boolean;
  offlineQueued: boolean;
  message: string;
}

class ApiService {
  private static instance: ApiService;
  private cacheService: CacheService;
  private pendingRequests: Map<string, Promise<any>>;
  private customHeaders: Record<string, string> = {};
  private tenantId: string | null = null;
  private connectionRetryAttempts: number = 3;
  private connectionRetryDelay: number = 1000; // ms

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.pendingRequests = new Map();

    // Set up request interceptor for adding auth headers etc.
    axios.interceptors.request.use(
      (config) => {
        // Add API URL if not absolute
        if (config.url && !config.url.startsWith('http')) {
          config.url = `${API_URL}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        }

        // Apply custom headers, including tenant header if available
        config.headers = {
          ...config.headers,
          ...this.customHeaders,
        };

        // Add tenant header if available
        if (this.tenantId && !config.headers['X-Tenant-ID']) {
          config.headers['X-Tenant-ID'] = this.tenantId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Set up response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle specific error codes
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Handle unauthorized (could trigger auth refresh or logout)
              console.warn('Unauthorized access, please login again.');
              // window.dispatchEvent(new Event('auth:unauthorized'));
              break;
            case 403:
              console.warn('Access forbidden.');
              break;
            case 429:
              console.warn('Rate limit exceeded. Please try again later.');
              break;
            case 500:
              console.error('Server error. Please try again later.');
              break;
          }
        } else if (error.request) {
          // Network error
          if (error.message === 'Network Error') {
            console.error('Network error. API server may not be running at ' + API_URL);
            // Could trigger an event for connection status monitoring
            window.dispatchEvent(
              new CustomEvent('api:connection-error', {
                detail: { message: error.message, url: API_URL },
              })
            );
          } else {
            console.error('Network error. Please check your connection.');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the singleton instance of ApiService
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Set custom headers for all API requests
   * @param headers Key-value pairs of headers
   */
  public setHeaders(headers: Record<string, string>): void {
    this.customHeaders = {
      ...this.customHeaders,
      ...headers,
    };
  }

  /**
   * Set the current tenant ID for API requests
   * @param tenantId The tenant ID
   */
  public setTenantId(tenantId: string | null): void {
    this.tenantId = tenantId;

    if (tenantId) {
      this.setHeaders({ 'X-Tenant-ID': tenantId });
    } else {
      // Remove tenant header
      const { 'X-Tenant-ID': _, ...restHeaders } = this.customHeaders;
      this.customHeaders = restHeaders;
    }
  }

  /**
   * Get the current tenant ID
   * @returns The current tenant ID
   */
  public getTenantId(): string | null {
    return this.tenantId;
  }

  /**
   * Clear tenant-specific cached data
   */
  public clearTenantCache(): void {
    if (this.tenantId) {
      this.invalidateByUrlPattern(`/tenants/${this.tenantId}`);
    }
  }

  /**
   * Generate a cache key for a request
   * @param config Request configuration
   * @returns Cache key
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { url, method = 'GET', params, data } = config;
    const segments = [method.toUpperCase(), url];

    // Add tenant ID to cache key if available
    if (this.tenantId) {
      segments.push(`tenant:${this.tenantId}`);
    }

    if (params) {
      segments.push(JSON.stringify(params));
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      segments.push(JSON.stringify(data));
    }

    return segments.join(':');
  }

  /**
   * Make an API request with caching support and retry mechanism
   * @param config Request configuration
   * @returns Promise that resolves to the response data
   */
  public async request<T>(config: ApiRequestConfig): Promise<T> {
    const { cache, enableOfflineSupport = OFFLINE_ENABLED, ...axiosConfig } = config;
    const cacheEnabled = cache?.enabled ?? CACHE_ENABLED;
    const cacheTTL = cache?.ttl ?? DEFAULT_CACHE_TTL;
    const method = (axiosConfig.method || 'GET').toUpperCase();
    let retryAttempt = 0;

    // Function to make the actual request with retry
    const executeRequest = async (): Promise<T> => {
      try {
        const response = await axios(axiosConfig);

        // Invalidate cache tags if specified
        if (cache?.invalidateTags && cache.invalidateTags.length > 0) {
          this.invalidateByTags(cache.invalidateTags);
        }

        return response.data;
      } catch (error) {
        // Connection refused or network error with retry
        if (
          error.message === 'Network Error' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ECONNABORTED'
        ) {
          if (retryAttempt < this.connectionRetryAttempts) {
            retryAttempt++;
            console.log(
              `Connection error. Retrying (${retryAttempt}/${this.connectionRetryAttempts})...`
            );
            await new Promise((resolve) => setTimeout(resolve, this.connectionRetryDelay));
            return executeRequest();
          }
        }

        // If we're offline and this is a modifying request, save it for later
        if (
          enableOfflineSupport &&
          !navigator.onLine &&
          method !== 'GET' &&
          (!error.response || error.message === 'Network Error')
        ) {
          console.log(
            `Offline mode: Queueing ${method} request to ${axiosConfig.url} for later submission`
          );

          // Save the request for later processing
          const headers = {
            ...((axiosConfig.headers as Record<string, string>) || {}),
            // Make sure tenant ID is included when offline
            ...(this.tenantId ? { 'X-Tenant-ID': this.tenantId } : {}),
          };
          await saveFormForLater(axiosConfig.url || '', method, headers, axiosConfig.data);

          // Return a specially formatted response that indicates this was queued
          return {
            success: true,
            offlineQueued: true,
            message: 'Your request has been saved and will be submitted when you are back online',
          } as unknown as T;
        }

        // For other errors, just rethrow
        throw error;
      }
    };

    // Only cache GET requests by default
    if (cacheEnabled && method === 'GET') {
      const cacheKey = cache?.key || this.generateCacheKey(axiosConfig);

      // Check if we have a cached response
      const cachedData = this.cacheService.get<T>(cacheKey);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }

      // Check if we have a pending request for this key
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }

      // Make the request with caching
      const requestPromise = executeRequest()
        .then((data: T) => {
          // Cache successful response
          this.cacheService.set(cacheKey, data, cacheTTL);

          // Add cache tags if specified
          if (cache?.tags && cache.tags.length > 0) {
            const tagKey = `tags:${cacheKey}`;
            this.cacheService.set(tagKey, cache.tags);
          }

          // Add tenant tag automatically
          if (this.tenantId) {
            const tagKey = `tags:${cacheKey}`;
            const existingTags = this.cacheService.get<string[]>(tagKey) || [];

            if (!existingTags.includes(`tenant:${this.tenantId}`)) {
              this.cacheService.set(tagKey, [...existingTags, `tenant:${this.tenantId}`]);
            }
          }

          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);

          return data;
        })
        .catch((error) => {
          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);

          // If it's a network error and we're offline, we might be able to serve from cache even for non-GET
          if (!navigator.onLine && error.message === 'Network Error' && cachedData) {
            console.warn('Offline mode: Serving cached data even though it might be stale');
            return cachedData;
          }

          throw error;
        });

      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);

      return requestPromise;
    }

    // For non-GET requests, just execute the request with retry
    return executeRequest();
  }

  /**
   * GET request with caching
   * @param url URL to request
   * @param params Query parameters
   * @param cacheOptions Caching options
   * @returns Promise that resolves to the response data
   */
  public async get<T>(url: string, params?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      cache: cacheOptions,
    });
  }

  /**
   * POST request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options
   * @returns Promise that resolves to the response data
   */
  public async post<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      cache: cacheOptions,
    });
  }

  /**
   * PUT request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options
   * @returns Promise that resolves to the response data
   */
  public async put<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      cache: cacheOptions,
    });
  }

  /**
   * PATCH request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options
   * @returns Promise that resolves to the response data
   */
  public async patch<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      cache: cacheOptions,
    });
  }

  /**
   * DELETE request
   * @param url URL to request
   * @param cacheOptions Caching options
   * @returns Promise that resolves to the response data
   */
  public async delete<T>(url: string, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      cache: cacheOptions,
    });
  }

  /**
   * Invalidate cached data by tags
   * @param tags Tags to invalidate
   */
  public invalidateByTags(tags: string[]): void {
    // Find all cache keys with the given tags
    const keys = this.cacheService.getKeysByTags(tags);

    // Invalidate the cache entries
    keys.forEach((key) => {
      this.cacheService.delete(key);
    });
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cacheService.clear();
  }

  /**
   * Invalidate cached data by URL pattern
   * @param urlPattern URL pattern to match
   */
  public invalidateByUrlPattern(urlPattern: string): void {
    const cacheKeys = this.cacheService.getAllKeys();

    cacheKeys.forEach((key) => {
      if (key.includes(urlPattern)) {
        this.cacheService.delete(key);
      }
    });
  }
}

// Export a pre-configured instance for easy use
export const api = ApiService.getInstance();
