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

export function seedHistoricalMetrics(
  scenarios: NexusMetrics[],
): void {
  metricsHistory.length = 0

  scenarios.forEach((metrics, index) => {
    const snapshot: MetricsSnapshot = {
      ...metrics,
      timestamp: new Date(
        Date.now() - (scenarios.length - index) * 60_000,
      ).toISOString(),
    }

    metricsHistory.push(snapshot)
  })
}