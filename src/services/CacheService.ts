/**
 * A cache service for storing and retrieving data with expiration support
 */
class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { data: any; expires: number | null; tags?: string[] }>;
  private tagToKeys: Map<string, Set<string>>;
  
  private constructor() {
    this.cache = new Map();
    this.tagToKeys = new Map();
  }
  
  /**
   * Get the singleton instance of CacheService
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  
  /**
   * Store a value in the cache
   * @param key The cache key
   * @param data The data to store
   * @param ttl Time to live in seconds (null for no expiry)
   * @param tags Optional tags for cache invalidation
   */
  public set<T>(key: string, data: T, ttl: number | null = null, tags?: string[]): void {
    const expires = ttl ? Date.now() + ttl * 1000 : null;
    
    this.cache.set(key, { 
      data, 
      expires,
      tags
    });
    
    // Store key-tag mappings
    if (tags && tags.length > 0) {
      this.addTagsToKey(key, tags);
    }
    
    // Store as session data if the key is appropriate
    if (key.startsWith('session:')) {
      try {
        sessionStorage.setItem(key, JSON.stringify({
          data,
          expires
        }));
      } catch (e) {
        console.warn('Failed to store in sessionStorage:', e);
      }
    }
  }
  
  /**
   * Add tags to a cached key
   * @param key The cache key
   * @param tags Tags to associate with the key
   */
  private addTagsToKey(key: string, tags: string[]): void {
    // Associate each tag with this key
    tags.forEach(tag => {
      if (!this.tagToKeys.has(tag)) {
        this.tagToKeys.set(tag, new Set());
      }
      this.tagToKeys.get(tag)!.add(key);
    });
    
    // Update the cached item's tags
    const item = this.cache.get(key);
    if (item) {
      item.tags = [...new Set([...(item.tags || []), ...tags])];
    }
  }
  
  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached data or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    // Try in-memory cache first
    const item = this.cache.get(key);
    
    if (item) {
      if (item.expires === null || item.expires > Date.now()) {
        return item.data as T;
      } else {
        // Expired, remove it
        this.delete(key);
      }
    }
    
    // Try session storage as fallback
    if (key.startsWith('session:')) {
      try {
        const sessionItem = sessionStorage.getItem(key);
        if (sessionItem) {
          const { data, expires } = JSON.parse(sessionItem);
          
          if (expires === null || expires > Date.now()) {
            // Restore to memory cache
            this.cache.set(key, { data, expires });
            return data as T;
          } else {
            // Expired, remove it
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Failed to read from sessionStorage:', e);
      }
    }
    
    return undefined;
  }
  
  /**
   * Delete a value from the cache
   * @param key The cache key
   */
  public delete(key: string): void {
    // Remove from tag maps first
    const item = this.cache.get(key);
    if (item && item.tags) {
      item.tags.forEach(tag => {
        const keys = this.tagToKeys.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) {
            this.tagToKeys.delete(tag);
          }
        }
      });
    }
    
    // Then remove from cache
    this.cache.delete(key);
    
    // Remove from session storage if applicable
    if (key.startsWith('session:')) {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove from sessionStorage:', e);
      }
    }
  }
  
  /**
   * Get all keys in the cache
   * @returns Array of cache keys
   */
  public getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get all keys associated with the given tags
   * @param tags The tags to match
   * @returns Array of matching cache keys
   */
  public getKeysByTags(tags: string[]): string[] {
    if (tags.length === 0) return [];
    
    // Get all keys for the first tag
    const firstTagKeys = this.tagToKeys.get(tags[0]) || new Set<string>();
    
    if (tags.length === 1) {
      return Array.from(firstTagKeys);
    }
    
    // For multiple tags, find the intersection
    const keySets = tags.map(tag => this.tagToKeys.get(tag) || new Set<string>());
    
    return Array.from(firstTagKeys).filter(key => 
      keySets.every(keySet => keySet.has(key))
    );
  }
  
  /**
   * Get all tenant-specific keys
   * @param tenantId The tenant ID
   * @returns Array of tenant-specific cache keys
   */
  public getTenantKeys(tenantId: string): string[] {
    const tenantTag = `tenant:${tenantId}`;
    return this.getKeysByTags([tenantTag]);
  }
  
  /**
   * Clear all values from the cache
   */
  public clear(): void {
    this.cache.clear();
    this.tagToKeys.clear();
    
    // Clear session storage entries related to our cache
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('session:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }
  }
  
  /**
   * Clear tenant-specific data from the cache
   * @param tenantId The tenant ID to clear data for
   */
  public clearTenantData(tenantId: string): void {
    const tenantKeys = this.getTenantKeys(tenantId);
    tenantKeys.forEach(key => this.delete(key));
  }
}

export default CacheService; 