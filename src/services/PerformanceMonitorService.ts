import { v4 as uuidv4 } from 'uuid';

// Performance targets as per requirements
const PERFORMANCE_TARGETS = {
  PAGE_LOAD_TIME_MS: 2000, // 2 seconds
  SEARCH_RESPONSE_TIME_MS: 1000, // 1 second
  BULK_OPERATION_BASE_TIME_MS: 500, // Base time for bulk operations
  BULK_OPERATION_PER_ITEM_TIME_MS: 10, // Additional time per item
};

interface PerformanceMetric {
  id: string;
  type: 'page_load' | 'api_response' | 'search' | 'bulk_operation' | 'render';
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  isAboveThreshold?: boolean;
}

interface PerformanceReport {
  sessionId: string;
  userId?: string;
  tenantId?: string;
  metrics: PerformanceMetric[];
  timestamp: string;
  userAgent: string;
  environment: string;
}

/**
 * Service for monitoring and tracking application performance
 */
class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private currentMetrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private sessionId: string;
  private reportingEndpoint: string;
  private isEnabled: boolean;
  private maxStoredMetrics: number = 100;
  private tenantId?: string;
  private userId?: string;
  private environment: string;

  private constructor() {
    this.sessionId = uuidv4();
    this.isEnabled = import.meta.env.VITE_PERFORMANCE_MONITORING !== 'false';
    this.reportingEndpoint =
      import.meta.env.VITE_PERFORMANCE_ENDPOINT || '/api/metrics/performance';
    this.environment = import.meta.env.MODE || 'development';

    // Set up listeners for page load events
    if (this.isEnabled && typeof window !== 'undefined') {
      window.addEventListener('load', () => this.recordPageLoad());

      // Record first contentful paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric(
              'render',
              'First Contentful Paint',
              {
                entryType: entry.entryType,
              },
              entry.startTime,
              performance.now()
            );
          }
        });

        observer.observe({ type: 'paint', buffered: true });
      }

      // Periodically send metrics
      setInterval(() => this.sendMetrics(), 60000); // Every minute
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * Set current user and tenant
   */
  public setContext(userId?: string, tenantId?: string): void {
    this.userId = userId;
    this.tenantId = tenantId;
  }

  /**
   * Start tracking a performance metric
   */
  public startMetric(
    type: PerformanceMetric['type'],
    name: string,
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) return '';

    const id = uuidv4();
    const metric: PerformanceMetric = {
      id,
      type,
      name,
      startTime: performance.now(),
      metadata,
    };

    this.currentMetrics.set(id, metric);
    return id;
  }

  /**
   * End tracking a performance metric and record its duration
   */
  public endMetric(id: string, additionalMetadata?: Record<string, any>): PerformanceMetric | null {
    if (!this.isEnabled || !id) return null;

    const metric = this.currentMetrics.get(id);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration,
      metadata: {
        ...metric.metadata,
        ...additionalMetadata,
      },
    };

    // Check if metric is above threshold
    completedMetric.isAboveThreshold = this.isAboveThreshold(completedMetric);

    this.currentMetrics.delete(id);
    this.completedMetrics.push(completedMetric);

    // Cap the size of completed metrics
    if (this.completedMetrics.length > this.maxStoredMetrics) {
      this.completedMetrics.shift();
    }

    // Report metrics immediately if significantly above threshold
    if (completedMetric.isAboveThreshold && this.isDramaticallyAboveThreshold(completedMetric)) {
      this.sendMetrics();
    }

    return completedMetric;
  }

  /**
   * Record a complete metric with start and end times
   */
  public recordMetric(
    type: PerformanceMetric['type'],
    name: string,
    metadata?: Record<string, any>,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric {
    if (!this.isEnabled) return {} as PerformanceMetric;

    const start = startTime || performance.now() - 1;
    const end = endTime || performance.now();
    const duration = end - start;

    const metric: PerformanceMetric = {
      id: uuidv4(),
      type,
      name,
      startTime: start,
      endTime: end,
      duration,
      metadata,
    };

    // Check if metric is above threshold
    metric.isAboveThreshold = this.isAboveThreshold(metric);

    this.completedMetrics.push(metric);

    // Cap the size of completed metrics
    if (this.completedMetrics.length > this.maxStoredMetrics) {
      this.completedMetrics.shift();
    }

    return metric;
  }

  /**
   * Record page load time
   */
  private recordPageLoad(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Use Navigation Timing API to get accurate load time
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    this.recordMetric(
      'page_load',
      window.location.pathname,
      {
        url: window.location.href,
        referrer: document.referrer,
        timing: {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domProcessing: perfData.domComplete - perfData.domLoading,
        },
      },
      perfData.navigationStart,
      perfData.loadEventEnd
    );
  }

  /**
   * Wrapper for measuring search query performance
   */
  public async measureSearch<T>(
    searchFn: () => Promise<T>,
    queryInfo: Record<string, any>
  ): Promise<T> {
    const metricId = this.startMetric('search', 'Search Query', queryInfo);
    try {
      const results = await searchFn();
      this.endMetric(metricId, { resultCount: Array.isArray(results) ? results.length : 0 });
      return results;
    } catch (error) {
      this.endMetric(metricId, { error: error.message });
      throw error;
    }
  }

  /**
   * Wrapper for measuring bulk operation performance
   */
  public async measureBulkOperation<T>(
    operationFn: () => Promise<T>,
    operationName: string,
    itemCount: number
  ): Promise<T> {
    const metricId = this.startMetric('bulk_operation', operationName, { itemCount });
    try {
      const result = await operationFn();
      this.endMetric(metricId);
      return result;
    } catch (error) {
      this.endMetric(metricId, { error: error.message });
      throw error;
    }
  }

  /**
   * Check if a metric is above the target threshold
   */
  private isAboveThreshold(metric: PerformanceMetric): boolean {
    if (!metric.duration) return false;

    switch (metric.type) {
      case 'page_load':
        return metric.duration > PERFORMANCE_TARGETS.PAGE_LOAD_TIME_MS;

      case 'search':
        return metric.duration > PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME_MS;

      case 'bulk_operation':
        const itemCount = metric.metadata?.itemCount || 1;
        const threshold =
          PERFORMANCE_TARGETS.BULK_OPERATION_BASE_TIME_MS +
          itemCount * PERFORMANCE_TARGETS.BULK_OPERATION_PER_ITEM_TIME_MS;
        return metric.duration > threshold;

      default:
        return false;
    }
  }

  /**
   * Check if a metric is dramatically above threshold (2x or more)
   */
  private isDramaticallyAboveThreshold(metric: PerformanceMetric): boolean {
    if (!metric.duration) return false;

    switch (metric.type) {
      case 'page_load':
        return metric.duration > PERFORMANCE_TARGETS.PAGE_LOAD_TIME_MS * 2;

      case 'search':
        return metric.duration > PERFORMANCE_TARGETS.SEARCH_RESPONSE_TIME_MS * 2;

      case 'bulk_operation':
        const itemCount = metric.metadata?.itemCount || 1;
        const threshold =
          PERFORMANCE_TARGETS.BULK_OPERATION_BASE_TIME_MS +
          itemCount * PERFORMANCE_TARGETS.BULK_OPERATION_PER_ITEM_TIME_MS;
        return metric.duration > threshold * 2;

      default:
        return false;
    }
  }

  /**
   * Send metrics to the reporting endpoint
   */
  private async sendMetrics(): Promise<void> {
    if (!this.isEnabled || this.completedMetrics.length === 0) return;

    const report: PerformanceReport = {
      sessionId: this.sessionId,
      userId: this.userId,
      tenantId: this.tenantId,
      metrics: [...this.completedMetrics],
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      environment: this.environment,
    };

    try {
      // In a real implementation, this would send to your performance monitoring service
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      // Clear sent metrics
      this.completedMetrics = [];
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Get all recorded metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  /**
   * Get metrics that exceeded performance targets
   */
  public getProblemMetrics(): PerformanceMetric[] {
    return this.completedMetrics.filter((metric) => metric.isAboveThreshold);
  }
}

export default PerformanceMonitorService;
