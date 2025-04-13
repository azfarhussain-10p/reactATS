/**
 * A simple in-memory cache service that simulates Redis-like functionality.
 * In a production application, this would be implemented using a real Redis client.
 */
interface CacheEntry<T> {
  value: T;
  expiry: number | null; // null means no expiry
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private keyPrefix: string = 'ats_cache:';
  
  private constructor() {
    this.cache = new Map();
    // Start cleanup interval to remove expired items
    this.startCleanupInterval();
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
   * Set a value in the cache with an optional TTL (time to live) in seconds
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (null for no expiry)
   */
  public set<T>(key: string, value: T, ttl: number | null = 300): void {
    const fullKey = this.keyPrefix + key;
    const expiry = ttl ? Date.now() + (ttl * 1000) : null;
    
    this.cache.set(fullKey, {
      value,
      expiry
    });
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  public get<T>(key: string): T | null {
    const fullKey = this.keyPrefix + key;
    const entry = this.cache.get(fullKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(fullKey);
      return null;
    }
    
    return entry.value as T;
  }
  
  /**
   * Check if a key exists in the cache
   * @param key Cache key
   * @returns True if the key exists and has not expired
   */
  public has(key: string): boolean {
    const fullKey = this.keyPrefix + key;
    const entry = this.cache.get(fullKey);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(fullKey);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  public delete(key: string): boolean {
    const fullKey = this.keyPrefix + key;
    return this.cache.delete(fullKey);
  }
  
  /**
   * Clear all entries in the cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get all keys matching a pattern
   * This simulates Redis KEYS command
   * @param pattern Pattern to match
   * @returns Array of matching keys
   */
  public keys(pattern: string): string[] {
    const fullPattern = this.keyPrefix + pattern;
    const regex = new RegExp(
      '^' + 
      fullPattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.') + 
      '$'
    );
    
    const matchingKeys: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        // Check if key has expired
        const entry = this.cache.get(key);
        if (entry && (!entry.expiry || Date.now() <= entry.expiry)) {
          // Return the key without the prefix
          matchingKeys.push(key.substring(this.keyPrefix.length));
        }
      }
    }
    
    return matchingKeys;
  }
  
  /**
   * Delete all keys matching a pattern
   * @param pattern Pattern to match
   * @returns Number of keys deleted
   */
  public deletePattern(pattern: string): number {
    const keys = this.keys(pattern);
    let count = 0;
    
    for (const key of keys) {
      if (this.delete(key)) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Increment a numeric value in the cache
   * @param key Cache key
   * @param increment Amount to increment (default: 1)
   * @returns New value or null if key doesn't exist or value is not a number
   */
  public increment(key: string, increment: number = 1): number | null {
    const fullKey = this.keyPrefix + key;
    const entry = this.cache.get(fullKey);
    
    if (!entry) {
      this.set(key, increment);
      return increment;
    }
    
    // Check if entry has expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(fullKey);
      this.set(key, increment);
      return increment;
    }
    
    if (typeof entry.value !== 'number') {
      return null;
    }
    
    const newValue = entry.value + increment;
    this.set(key, newValue, entry.expiry ? Math.floor((entry.expiry - Date.now()) / 1000) : null);
    return newValue;
  }
  
  /**
   * Start interval to clean up expired cache entries
   */
  private startCleanupInterval(): void {
    // Clean up every 5 minutes
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry && now > entry.expiry) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export default CacheService; 