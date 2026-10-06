import { NexusMetrics } from './metricsService.js'

export type BaselineStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'insufficient_data'

export interface BaselineResult {
  metric: keyof NexusMetrics
  currentValue: number
  baselineValue: number
  deviationPercent: number
  status: BaselineStatus
}

const MINIMUM_EVENTS_FOR_ANALYSIS = 5

const trackedMetrics: (keyof NexusMetrics)[] = [
  'productViews',
  'checkoutsStarted',
  'ordersCreated',
  'paymentsFailed',
  'cartsAbandoned',
  'totalRevenue',
]

export function calculateBaseline(
  history: NexusMetrics[],
  currentMetrics: NexusMetrics,
): BaselineResult[] {
  if (currentMetrics.totalEvents < MINIMUM_EVENTS_FOR_ANALYSIS) {
    return trackedMetrics.map((metric) => ({
      metric,
      currentValue: currentMetrics[metric],
      baselineValue: calculateAverage(history, metric),
      deviationPercent: 0,
      status: 'insufficient_data',
    }))
  }

  return trackedMetrics.map((metric) => {
    const currentValue = currentMetrics[metric]
    const baselineValue = calculateAverage(history, metric)

    if (baselineValue === 0) {
      return {
        metric,
        currentValue,
        baselineValue,
        deviationPercent: 0,
        status: 'normal',
      }
    }

    const deviationPercent =
      ((currentValue - baselineValue) / baselineValue) * 100

    const absoluteDeviation = Math.abs(deviationPercent)

    let status: BaselineStatus = 'normal'

    if (absoluteDeviation >= 50) {
      status = 'critical'
    } else if (absoluteDeviation >= 25) {
      status = 'warning'
    }

    return {
      metric,
      currentValue,
      baselineValue: Number(baselineValue.toFixed(2)),
      deviationPercent: Number(deviationPercent.toFixed(2)),
      status,
    }
  })
}

function calculateAverage(
  history: NexusMetrics[],
  metric: keyof NexusMetrics,
): number {
  if (history.length === 0) {
    return 0
  }

  const total = history.reduce(
    (sum, snapshot) => sum + snapshot[metric],
    0,
  )

  return total / history.length
}