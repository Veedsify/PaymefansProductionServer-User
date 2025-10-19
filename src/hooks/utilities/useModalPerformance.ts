import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  openTime: number;
  renderTime: number;
  mediaLoadTime?: number;
}

/**
 * Hook to monitor performance metrics of the media preview modal
 * Useful for identifying bottlenecks and optimization opportunities
 */
export const useModalPerformance = (isOpen: boolean, mediaItems?: any[]) => {
  const metricsRef = useRef<PerformanceMetrics>({
    openTime: 0,
    renderTime: 0,
  });
  const openTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && !openTimeRef.current) {
      // Record when modal starts opening
      openTimeRef.current = performance.now();
      metricsRef.current.openTime = openTimeRef.current;
    } else if (!isOpen && openTimeRef.current) {
      // Reset when modal closes
      openTimeRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && openTimeRef.current) {
      // Record render time
      metricsRef.current.renderTime = performance.now() - openTimeRef.current;

      // Log performance metrics in development
      if (process.env.NODE_ENV === "development") {
        console.log("Modal Performance Metrics:", {
          renderTime: `${metricsRef.current.renderTime.toFixed(2)}ms`,
          mediaCount: mediaItems?.length || 0,
        });
      }
    }
  }, [isOpen, mediaItems]);

  return metricsRef.current;
};
