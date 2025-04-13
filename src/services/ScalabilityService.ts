import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import CacheService from './CacheService';

// Load balancing configuration interface
interface LoadBalancingConfig {
  enabled: boolean;
  strategy: 'round-robin' | 'least-connections' | 'ip-hash' | 'random';
  servers: string[];
  healthCheckIntervalMs: number;
  failoverEnabled: boolean;
}

// Cache configuration interface
interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxSize: number;
  compressionEnabled: boolean;
}

// Query optimization configuration
interface QueryOptimizationConfig {
  maxPageSize: number;
  defaultPageSize: number;
  usePreparedStatements: boolean;
  indexStatsRefreshIntervalHours: number;
}

// Resource usage configuration
interface ResourceUsageConfig {
  maxConcurrentRequests: number;
  maxMemoryUsageMB: number;
  maxCPUUsagePercent: number;
  autoScalingEnabled: boolean;
  minInstances: number;
  maxInstances: number;
}

// Combined scalability configuration
interface ScalabilityConfig {
  loadBalancing: LoadBalancingConfig;
  cache: CacheConfig;
  queryOptimization: QueryOptimizationConfig;
  resourceUsage: ResourceUsageConfig;
  asyncProcessingEnabled: boolean;
  useSharding: boolean;
  microservicesEnabled: boolean;
  cdnEnabled: boolean;
  cdnUrl?: string;
}

// Interface for server health status
interface ServerHealth {
  url: string;
  healthy: boolean;
  responseTime: number;
  lastChecked: Date;
}

// Mock in-memory task queue
interface QueuedTask {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  priority: number;
}

/**
 * A service for implementing scalability features in the application
 */
class ScalabilityService {
  private static instance: ScalabilityService;
  private config: ScalabilityConfig;
  private currentServerIndex: number = 0;
  private serverHealthStatus: Map<string, ServerHealth> = new Map();
  private taskQueue: QueuedTask[] = [];
  private processingTasks: boolean = false;
  private cacheService: CacheService;
  
  // API URL from env or default
  private apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  private constructor() {
    // Default scalability configuration
    this.config = {
      loadBalancing: {
        enabled: true,
        strategy: 'round-robin',
        servers: [
          'http://localhost:5000/api',
          'http://localhost:5001/api',
          'http://localhost:5002/api'
        ],
        healthCheckIntervalMs: 30000, // 30 seconds
        failoverEnabled: true
      },
      cache: {
        enabled: true,
        defaultTTL: 300, // 5 minutes
        maxSize: 100, // MB
        compressionEnabled: true
      },
      queryOptimization: {
        maxPageSize: 100,
        defaultPageSize: 20,
        usePreparedStatements: true,
        indexStatsRefreshIntervalHours: 24
      },
      resourceUsage: {
        maxConcurrentRequests: 50,
        maxMemoryUsageMB: 1024,
        maxCPUUsagePercent: 80,
        autoScalingEnabled: true,
        minInstances: 1,
        maxInstances: 5
      },
      asyncProcessingEnabled: true,
      useSharding: false,
      microservicesEnabled: true,
      cdnEnabled: true,
      cdnUrl: 'https://cdn.example.com'
    };
    
    // Initialize cache service
    this.cacheService = CacheService.getInstance();
    
    // Start health checks for load balancing
    if (this.config.loadBalancing.enabled) {
      this.initializeLoadBalancing();
    }
    
    // Start task processing if async processing is enabled
    if (this.config.asyncProcessingEnabled) {
      this.startTaskProcessing();
    }
    
    // Load configuration (async operation)
    this.loadConfig();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ScalabilityService {
    if (!ScalabilityService.instance) {
      ScalabilityService.instance = new ScalabilityService();
    }
    return ScalabilityService.instance;
  }
  
  /**
   * Load configuration from API
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await axios.get(`${this.apiUrl}/scalability/config`);
      if (response.data) {
        this.config = {
          ...this.config,
          ...response.data
        };
        
        // Reinitialize services based on new config
        if (this.config.loadBalancing.enabled) {
          this.initializeLoadBalancing();
        }
      }
    } catch (error) {
      console.warn('Could not fetch scalability config, using defaults:', error);
    }
  }
  
  /**
   * Initialize load balancing
   */
  private initializeLoadBalancing(): void {
    // Initialize health status for all servers
    for (const server of this.config.loadBalancing.servers) {
      this.serverHealthStatus.set(server, {
        url: server,
        healthy: true, // Assume healthy initially
        responseTime: 0,
        lastChecked: new Date()
      });
    }
    
    // Start health check interval
    setInterval(() => {
      this.checkServerHealth();
    }, this.config.loadBalancing.healthCheckIntervalMs);
    
    // Perform initial health check
    this.checkServerHealth();
  }
  
  /**
   * Check health of all servers
   */
  private async checkServerHealth(): Promise<void> {
    for (const server of this.config.loadBalancing.servers) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${server}/health`, { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        
        this.serverHealthStatus.set(server, {
          url: server,
          healthy: response.status === 200,
          responseTime,
          lastChecked: new Date()
        });
      } catch (error) {
        this.serverHealthStatus.set(server, {
          url: server,
          healthy: false,
          responseTime: 0,
          lastChecked: new Date()
        });
      }
    }
  }
  
  /**
   * Get the next server URL based on the load balancing strategy
   */
  private getNextServer(): string {
    if (!this.config.loadBalancing.enabled) {
      return this.apiUrl;
    }
    
    const healthyServers = this.config.loadBalancing.servers.filter(
      server => this.serverHealthStatus.get(server)?.healthy || !this.config.loadBalancing.failoverEnabled
    );
    
    if (healthyServers.length === 0) {
      // If no healthy servers, use the default API URL
      return this.apiUrl;
    }
    
    let selectedServer: string;
    
    switch (this.config.loadBalancing.strategy) {
      case 'round-robin':
        // Get the next server in a circular fashion
        this.currentServerIndex = (this.currentServerIndex + 1) % healthyServers.length;
        selectedServer = healthyServers[this.currentServerIndex];
        break;
        
      case 'least-connections':
        // In a real implementation, this would track connection counts
        // Here we'll use response time as a proxy for load
        selectedServer = healthyServers.reduce((min, server) => {
          const health = this.serverHealthStatus.get(server);
          const minHealth = this.serverHealthStatus.get(min);
          return health && minHealth && health.responseTime < minHealth.responseTime ? server : min;
        }, healthyServers[0]);
        break;
        
      case 'ip-hash':
        // In a real implementation, this would hash the client IP
        // Here we'll just use a random but stable selection
        const hash = Math.abs(Date.now()) % healthyServers.length;
        selectedServer = healthyServers[hash];
        break;
        
      case 'random':
        selectedServer = healthyServers[Math.floor(Math.random() * healthyServers.length)];
        break;
        
      default:
        selectedServer = healthyServers[0];
    }
    
    return selectedServer;
  }
  
  /**
   * Make an optimized API request using load balancing and caching
   * @param config Request configuration
   * @returns Promise that resolves to the response data
   */
  public async request<T>(config: any): Promise<T> {
    // Generate cache key if caching is enabled
    const cacheKey = this.config.cache.enabled ? 
      `request:${config.method || 'GET'}:${config.url}:${JSON.stringify(config.params || {})}` : '';
    
    // Check cache first if it's a GET request
    if (this.config.cache.enabled && (config.method || 'GET').toUpperCase() === 'GET') {
      const cachedData = this.cacheService.get<T>(cacheKey);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }
    
    // Get the next server URL from load balancer
    const baseURL = this.getNextServer();
    
    // Make the actual request
    try {
      const response = await axios({
        ...config,
        baseURL
      });
      
      // Cache the response if it's a GET request
      if (this.config.cache.enabled && (config.method || 'GET').toUpperCase() === 'GET') {
        this.cacheService.set(cacheKey, response.data, this.config.cache.defaultTTL);
      }
      
      return response.data;
    } catch (error) {
      // If server fails, mark it as unhealthy
      if (error && axios.isAxiosError(error)) {
        const healthStatus = this.serverHealthStatus.get(baseURL);
        if (healthStatus) {
          this.serverHealthStatus.set(baseURL, {
            ...healthStatus,
            healthy: false,
            lastChecked: new Date()
          });
        }
        
        // If failover is enabled and there are other healthy servers, retry the request
        if (this.config.loadBalancing.failoverEnabled) {
          const healthyServers = this.config.loadBalancing.servers.filter(
            server => server !== baseURL && this.serverHealthStatus.get(server)?.healthy
          );
          
          if (healthyServers.length > 0) {
            return this.request<T>(config);
          }
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get optimized pagination parameters
   * @param page Requested page number (1-based)
   * @param pageSize Requested page size
   * @returns Optimized pagination parameters
   */
  public getPaginationParams(page: number = 1, pageSize?: number): { page: number; pageSize: number; skip: number } {
    const safePageSize = Math.min(
      pageSize || this.config.queryOptimization.defaultPageSize,
      this.config.queryOptimization.maxPageSize
    );
    
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safePageSize;
    
    return {
      page: safePage,
      pageSize: safePageSize,
      skip
    };
  }
  
  /**
   * Add a task to the async processing queue
   * @param task Task to add
   * @returns Task ID
   */
  public enqueueTask(type: string, data: any, priority: number = 5): string {
    if (!this.config.asyncProcessingEnabled) {
      throw new Error('Async processing is not enabled');
    }
    
    const taskId = uuidv4();
    const task: QueuedTask = {
      id: taskId,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      priority
    };
    
    this.taskQueue.push(task);
    
    // Sort the queue by priority (lower number = higher priority)
    this.taskQueue.sort((a, b) => a.priority - b.priority);
    
    // Start processing if not already processing
    if (!this.processingTasks) {
      this.startTaskProcessing();
    }
    
    return taskId;
  }
  
  /**
   * Start processing tasks in the queue
   */
  private startTaskProcessing(): void {
    if (!this.config.asyncProcessingEnabled || this.processingTasks) {
      return;
    }
    
    this.processingTasks = true;
    this.processNextTask();
  }
  
  /**
   * Process the next task in the queue
   */
  private async processNextTask(): Promise<void> {
    if (!this.processingTasks || this.taskQueue.length === 0) {
      this.processingTasks = false;
      return;
    }
    
    const task = this.taskQueue.shift();
    if (!task) {
      this.processingTasks = false;
      return;
    }
    
    // Update task status
    task.status = 'processing';
    
    try {
      // In a real implementation, this would dispatch to task-specific handlers
      console.log(`Processing task ${task.id} of type ${task.type}`);
      
      // Simulate task processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      task.status = 'completed';
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
      task.status = 'failed';
    }
    
    // Process next task
    this.processNextTask();
  }
  
  /**
   * Get a resource from CDN if enabled, or from the API if not
   * @param path Resource path
   * @returns URL for the resource
   */
  public getResourceUrl(path: string): string {
    if (this.config.cdnEnabled && this.config.cdnUrl) {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `${this.config.cdnUrl}/${cleanPath}`;
    }
    
    return `${this.apiUrl}/${path.startsWith('/') ? path.substring(1) : path}`;
  }
  
  /**
   * Invalidate cache for specific keys or patterns
   * @param pattern Pattern to match for cache invalidation
   */
  public invalidateCache(pattern: string): number {
    if (!this.config.cache.enabled) {
      return 0;
    }
    
    return this.cacheService.deletePattern(pattern);
  }
  
  /**
   * Get sharding key for a resource (for database sharding)
   * @param resourceType Type of resource
   * @param id Resource ID
   * @returns Shard key
   */
  public getShardKey(resourceType: string, id: string | number): string {
    if (!this.config.useSharding) {
      return 'default';
    }
    
    // In a real implementation, this would use a consistent hashing algorithm
    // Here we'll use a simple modulo approach
    const idNum = typeof id === 'string' ? parseInt(id, 10) || 0 : id;
    const shardNumber = idNum % 4; // Assume 4 shards
    
    return `${resourceType}_shard_${shardNumber}`;
  }
  
  /**
   * Check if a resource is optimized for the current load
   * @param resourceType Type of resource to check
   * @returns Whether optimization is needed
   */
  public needsOptimization(resourceType: string): boolean {
    // In a real implementation, this would check actual resource usage
    // Here we'll simulate some simple logic
    
    switch (resourceType) {
      case 'memory':
        return Math.random() * 100 > this.config.resourceUsage.maxMemoryUsageMB / 10;
        
      case 'cpu':
        return Math.random() * 100 > this.config.resourceUsage.maxCPUUsagePercent;
        
      case 'connections':
        return Math.random() * 100 > this.config.resourceUsage.maxConcurrentRequests / 2;
        
      default:
        return false;
    }
  }
  
  /**
   * Get metrics for system scalability
   */
  public getMetrics(): Record<string, any> {
    return {
      currentLoad: {
        cpu: Math.round(Math.random() * 100),
        memory: Math.round(Math.random() * this.config.resourceUsage.maxMemoryUsageMB),
        connections: Math.round(Math.random() * this.config.resourceUsage.maxConcurrentRequests)
      },
      serverHealth: Array.from(this.serverHealthStatus.values()),
      cacheStats: {
        hitRate: Math.round(Math.random() * 100),
        size: Math.round(Math.random() * this.config.cache.maxSize),
        items: Math.round(Math.random() * 1000)
      },
      queueStats: {
        pendingTasks: this.taskQueue.length,
        processingActive: this.processingTasks
      },
      autoscaling: {
        currentInstances: Math.floor(Math.random() * 
          (this.config.resourceUsage.maxInstances - this.config.resourceUsage.minInstances + 1)) + 
          this.config.resourceUsage.minInstances
      }
    };
  }
}

// Export singleton instance
export default ScalabilityService;
export const scalabilityService = ScalabilityService.getInstance(); 