/**
 * Performance Monitor for Autoscale Deployment
 * Tracks database query performance and connection pool usage
 */

import { pool } from '../db';

interface PerformanceMetrics {
  queryCount: number;
  averageQueryTime: number;
  connectionPoolUsage: number;
  memoryUsage: number;
  responseTime: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private startTime = Date.now();

  // Track query execution time
  async trackQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      this.recordMetric(queryName, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(`${queryName}_error`, duration);
      throw error;
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements to prevent memory growth
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    const queryTimes = this.getAllQueryTimes();
    const memUsage = process.memoryUsage();
    
    return {
      queryCount: this.getTotalQueryCount(),
      averageQueryTime: this.getAverageQueryTime(),
      connectionPoolUsage: this.getConnectionPoolUsage(),
      memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      responseTime: this.getAverageResponseTime()
    };
  }

  private getAllQueryTimes(): number[] {
    const allTimes: number[] = [];
    for (const [name, times] of this.metrics.entries()) {
      if (!name.endsWith('_error')) {
        allTimes.push(...times);
      }
    }
    return allTimes;
  }

  private getTotalQueryCount(): number {
    let total = 0;
    for (const times of this.metrics.values()) {
      total += times.length;
    }
    return total;
  }

  private getAverageQueryTime(): number {
    const allTimes = this.getAllQueryTimes();
    if (allTimes.length === 0) return 0;
    return Math.round(allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length);
  }

  private getConnectionPoolUsage(): number {
    // Calculate connection pool usage percentage
    const poolStats = (pool as any).totalCount || 0;
    const maxConnections = 20; // From our pool configuration
    return Math.round((poolStats / maxConnections) * 100);
  }

  private getAverageResponseTime(): number {
    const responseTimes = this.metrics.get('response_time') || [];
    if (responseTimes.length === 0) return 0;
    return Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
  }

  // Track API response times
  trackResponseTime(duration: number): void {
    this.recordMetric('response_time', duration);
  }

  // Get detailed performance report
  getDetailedReport(): any {
    const report: any = {
      uptime: Date.now() - this.startTime,
      metrics: this.getMetrics(),
      queryBreakdown: {}
    };

    // Add breakdown by query type
    for (const [name, times] of this.metrics.entries()) {
      if (times.length > 0) {
        report.queryBreakdown[name] = {
          count: times.length,
          averageTime: Math.round(times.reduce((sum, time) => sum + time, 0) / times.length),
          minTime: Math.min(...times),
          maxTime: Math.max(...times)
        };
      }
    }

    return report;
  }

  // Reset metrics (useful for testing)
  reset(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Middleware to track API response times
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceMonitor.trackResponseTime(duration);
  });
  
  next();
};