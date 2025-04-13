import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import CacheService from './CacheService';

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED !== 'false';
const DEFAULT_CACHE_TTL = 300; // 5 minutes in seconds

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
}

class ApiService {
  private static instance: ApiService;
  private cacheService: CacheService;
  private pendingRequests: Map<string, Promise<any>>;
  
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
          console.error('Network error. Please check your connection.');
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
   * Generate a cache key for a request
   * @param config Request configuration
   * @returns Cache key
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { url, method = 'GET', params, data } = config;
    const segments = [
      method.toUpperCase(),
      url
    ];
    
    if (params) {
      segments.push(JSON.stringify(params));
    }
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      segments.push(JSON.stringify(data));
    }
    
    return segments.join(':');
  }
  
  /**
   * Make an API request with caching support
   * @param config Request configuration
   * @returns Promise that resolves to the response data
   */
  public async request<T>(config: ApiRequestConfig): Promise<T> {
    const { cache, ...axiosConfig } = config;
    const cacheEnabled = cache?.enabled ?? CACHE_ENABLED;
    const cacheTTL = cache?.ttl ?? DEFAULT_CACHE_TTL;
    const method = (axiosConfig.method || 'GET').toUpperCase();
    
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
      
      // Make the request
      const requestPromise = axios(axiosConfig)
        .then((response: AxiosResponse<T>) => {
          // Cache successful response
          this.cacheService.set(cacheKey, response.data, cacheTTL);
          
          // Add cache tags if specified
          if (cache?.tags && cache.tags.length > 0) {
            const tagKey = `tags:${cacheKey}`;
            this.cacheService.set(tagKey, cache.tags);
          }
          
          // Invalidate cache tags if specified
          if (cache?.invalidateTags && cache.invalidateTags.length > 0) {
            this.invalidateByTags(cache.invalidateTags);
          }
          
          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);
          
          return response.data;
        })
        .catch((error) => {
          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);
          throw error;
        });
      
      // Store the pending request
      this.pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    }
    
    // Non-cached request
    const response = await axios(axiosConfig);
    
    // Invalidate cache tags if specified
    if (cache?.invalidateTags && cache.invalidateTags.length > 0) {
      this.invalidateByTags(cache.invalidateTags);
    }
    
    return response.data;
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
      cache: cacheOptions
    });
  }
  
  /**
   * POST request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options (for invalidation only)
   * @returns Promise that resolves to the response data
   */
  public async post<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      cache: { enabled: false, ...cacheOptions }
    });
  }
  
  /**
   * PUT request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options (for invalidation only)
   * @returns Promise that resolves to the response data
   */
  public async put<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      cache: { enabled: false, ...cacheOptions }
    });
  }
  
  /**
   * PATCH request
   * @param url URL to request
   * @param data Request body
   * @param cacheOptions Caching options (for invalidation only)
   * @returns Promise that resolves to the response data
   */
  public async patch<T>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      cache: { enabled: false, ...cacheOptions }
    });
  }
  
  /**
   * DELETE request
   * @param url URL to request
   * @param cacheOptions Caching options (for invalidation only)
   * @returns Promise that resolves to the response data
   */
  public async delete<T>(url: string, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      cache: { enabled: false, ...cacheOptions }
    });
  }
  
  /**
   * Invalidate cache entries by tags
   * @param tags Tags to invalidate
   */
  public invalidateByTags(tags: string[]): void {
    for (const tag of tags) {
      // Find all cache keys with this tag
      const pattern = `tags:*`;
      const tagKeys = this.cacheService.keys(pattern);
      
      for (const tagKey of tagKeys) {
        const cachedTags = this.cacheService.get<string[]>(tagKey);
        if (cachedTags && cachedTags.includes(tag)) {
          // Delete the cache entry
          const cacheKey = tagKey.replace('tags:', '');
          this.cacheService.delete(cacheKey);
          // Delete the tag entry
          this.cacheService.delete(tagKey);
        }
      }
    }
  }
  
  /**
   * Clear the entire cache
   */
  public clearCache(): void {
    this.cacheService.clear();
  }
  
  /**
   * Invalidate cache entries by URL pattern
   * @param urlPattern URL pattern to match
   */
  public invalidateByUrlPattern(urlPattern: string): void {
    const pattern = `GET:${API_URL}${urlPattern}*`;
    this.cacheService.deletePattern(pattern);
  }
}

export default ApiService;

// Export a pre-configured instance for easy use
export const api = ApiService.getInstance(); 