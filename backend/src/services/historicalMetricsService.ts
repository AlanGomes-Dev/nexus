import { NexusMetrics } from './metricsService.js'

export interface MetricsSnapshot extends NexusMetrics {
  timestamp: string
}

const metricsHistory: MetricsSnapshot[] = []

export function recordMetricsSnapshot(
  metrics: NexusMetrics,
): MetricsSnapshot {
  const snapshot: MetricsSnapshot = {
    ...metrics,
    timestamp: new Date().toISOString(),
  }

  metricsHistory.push(snapshot)

  return snapshot
}

export function getMetricsHistory(): MetricsSnapshot[] {
  return [...metricsHistory]
}

export function getLatestMetricsSnapshot(): MetricsSnapshot | null {
  if (metricsHistory.length === 0) {
    return null
  }

  return metricsHistory[metricsHistory.length - 1]
}