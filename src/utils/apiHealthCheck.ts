/**
 * API Health Check Utility
 * Provides functions to check if the API is available and healthy
 */

import axios from 'axios';

// Default configuration
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEFAULT_HEALTH_ENDPOINT = '/health';
const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

/**
 * Interface for health check options
 */
interface HealthCheckOptions {
  apiUrl?: string;
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Interface for health check result
 */
interface HealthCheckResult {
  isHealthy: boolean;
  details?: any;
  error?: Error;
  retries?: number;
}

/**
 * Check if the API is available and healthy
 * @param options Health check options
 * @returns Promise that resolves to a health check result
 */
export async function checkApiHealth(options?: HealthCheckOptions): Promise<HealthCheckResult> {
  const {
    apiUrl = DEFAULT_API_URL,
    endpoint = DEFAULT_HEALTH_ENDPOINT,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  } = options || {};

  const url = `${apiUrl}${endpoint}`;
  let retries = 0;
  let lastError: Error | undefined;

  while (retries <= maxRetries) {
    try {
      const response = await axios.get(url, {
        timeout: timeoutMs,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      return {
        isHealthy: response.status >= 200 && response.status < 300,
        details: response.data,
        retries,
      };
    } catch (error) {
      lastError = error as Error;
      retries++;

      if (retries <= maxRetries) {
        console.log(`API health check failed (attempt ${retries}/${maxRetries}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  // All retries failed
  console.error(`API health check failed after ${maxRetries} retries:`, lastError);

  // Dispatch a connection error event
  window.dispatchEvent(
    new CustomEvent('api:connection-error', {
      detail: { message: lastError?.message, url: apiUrl },
    })
  );

  return {
    isHealthy: false,
    error: lastError,
    retries,
  };
}

/**
 * Setup periodic API health checks
 * @param options Health check options
 * @param intervalMs Interval between checks in milliseconds (default: 60000 - 1 minute)
 * @returns Function to stop the periodic checks
 */
export function setupPeriodicHealthCheck(
  options?: HealthCheckOptions,
  intervalMs: number = 60000,
  onStatusChange?: (isHealthy: boolean) => void
): () => void {
  let lastStatus: boolean | null = null;

  const intervalId = setInterval(async () => {
    const result = await checkApiHealth(options);

    // Only notify on status changes
    if (onStatusChange && (lastStatus === null || lastStatus !== result.isHealthy)) {
      onStatusChange(result.isHealthy);
      lastStatus = result.isHealthy;
    }
  }, intervalMs);

  // Run an initial check immediately
  checkApiHealth(options).then((result) => {
    if (onStatusChange) {
      onStatusChange(result.isHealthy);
      lastStatus = result.isHealthy;
    }
  });

  // Return a function to stop the periodic checks
  return () => clearInterval(intervalId);
}

export default {
  checkApiHealth,
  setupPeriodicHealthCheck,
};
