/**
 * Performance monitoring utilities
 * Helps track and optimize application performance
 */

export interface PerformanceMetrics {
  componentRenderTime: number;
  apiResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure component render time
   */
  measureRenderTime(componentName: string, renderFn: () => void): void {
    const start = performance.now();
    renderFn();
    const end = performance.now();

    const renderTime = end - start;
    this.metrics.push({
      componentRenderTime: renderTime,
      apiResponseTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
    });

    if (renderTime > 16) {
      // More than one frame at 60fps
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Measure API response time
   */
  measureApiCall<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();

    return apiCall().then(
      (result) => {
        const end = performance.now();
        const responseTime = end - start;

        this.metrics.push({
          componentRenderTime: 0,
          apiResponseTime: responseTime,
          bundleSize: 0,
          memoryUsage: 0,
        });

        if (responseTime > 1000) {
          // More than 1 second
          console.warn(
            `Slow API call detected: ${apiName} took ${responseTime.toFixed(
              2
            )}ms`
          );
        }

        return result;
      },
      (error) => {
        const end = performance.now();
        const responseTime = end - start;
        console.error(
          `API call failed: ${apiName} took ${responseTime.toFixed(2)}ms`,
          error
        );
        throw error;
      }
    );
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get average render time
   */
  getAverageRenderTime(): number {
    const renderTimes = this.metrics
      .map((m) => m.componentRenderTime)
      .filter((time) => time > 0);

    if (renderTimes.length === 0) return 0;

    return (
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    );
  }

  /**
   * Get average API response time
   */
  getAverageApiTime(): number {
    const apiTimes = this.metrics
      .map((m) => m.apiResponseTime)
      .filter((time) => time > 0);

    if (apiTimes.length === 0) return 0;

    return apiTimes.reduce((sum, time) => sum + time, 0) / apiTimes.length;
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  return {
    measureRender: (componentName: string, renderFn: () => void) =>
      monitor.measureRenderTime(componentName, renderFn),
    measureApi: <T>(apiName: string, apiCall: () => Promise<T>) =>
      monitor.measureApiCall(apiName, apiCall),
    getMetrics: () => monitor.getMetrics(),
    clearMetrics: () => monitor.clearMetrics(),
    getAverageRenderTime: () => monitor.getAverageRenderTime(),
    getAverageApiTime: () => monitor.getAverageApiTime(),
  };
}

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Check if component should re-render
   */
  shouldRender: (prevProps: any, nextProps: any, keys: string[]): boolean => {
    return keys.some((key) => prevProps[key] !== nextProps[key]);
  },

  /**
   * Lazy load component
   */
  lazyLoad: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return importFn;
  },
};

export default PerformanceMonitor;
