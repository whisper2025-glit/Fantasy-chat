/**
 * Simple performance monitoring utilities for chat interface
 */

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === "development";

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    if (!this.isEnabled) return;
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name)[0];
      const duration = measure.duration;

      // Store metrics
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      const measurements = this.metrics.get(name)!;
      measurements.push(duration);

      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }

      // Log slow operations
      if (duration > 16) {
        // Slower than 60fps
        console.warn(
          `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
        );
      }

      // Cleanup
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);

      return duration;
    } catch (error) {
      console.warn("Performance measurement failed:", error);
      return null;
    }
  }

  getAverageTime(name: string): number | null {
    if (!this.isEnabled) return null;

    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return null;

    return (
      measurements.reduce((sum, time) => sum + time, 0) / measurements.length
    );
  }

  getMetrics(): Record<
    string,
    { average: number; count: number; max: number }
  > {
    if (!this.isEnabled) return {};

    const result: Record<
      string,
      { average: number; count: number; max: number }
    > = {};

    for (const [name, measurements] of this.metrics.entries()) {
      if (measurements.length > 0) {
        result[name] = {
          average:
            measurements.reduce((sum, time) => sum + time, 0) /
            measurements.length,
          count: measurements.length,
          max: Math.max(...measurements),
        };
      }
    }

    return result;
  }

  logReport(): void {
    if (!this.isEnabled) return;

    const metrics = this.getMetrics();
    if (Object.keys(metrics).length === 0) {
      console.log("No performance metrics collected");
      return;
    }

    console.group("🚀 Performance Report");
    for (const [name, data] of Object.entries(metrics)) {
      const status = data.average > 16 ? "⚠️" : "✅";
      console.log(
        `${status} ${name}: avg ${data.average.toFixed(2)}ms, max ${data.max.toFixed(2)}ms (${data.count} samples)`,
      );
    }
    console.groupEnd();
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Convenient wrapper functions
export const perfMonitor = PerformanceMonitor.getInstance();

export function measurePerformance<T>(name: string, fn: () => T): T {
  perfMonitor.startMeasure(name);
  try {
    return fn();
  } finally {
    perfMonitor.endMeasure(name);
  }
}

export function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  perfMonitor.startMeasure(name);
  return fn().finally(() => {
    perfMonitor.endMeasure(name);
  });
}

// Hook for measuring React component performance
export function usePerfMeasure(name: string) {
  return {
    start: () => perfMonitor.startMeasure(name),
    end: () => perfMonitor.endMeasure(name),
    measure: <T>(fn: () => T): T => measurePerformance(name, fn),
  };
}
