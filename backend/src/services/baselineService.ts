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

/**
 * Métricas em que um aumento representa deterioração operacional.
 *
 * Exemplo:
 * paymentsFailed: 10 → pior
 * cartsAbandoned: 10 → pior
 */
const higherIsWorse: (keyof NexusMetrics)[] = [
  'paymentsFailed',
  'cartsAbandoned',
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
        baselineValue: 0,
        deviationPercent: 0,
        status: 'normal',
      }
    }

    const deviationPercent =
      ((currentValue - baselineValue) / baselineValue) * 100

    const status = determineStatus(
      metric,
      deviationPercent,
    )

    return {
      metric,
      currentValue,
      baselineValue: Number(baselineValue.toFixed(2)),
      deviationPercent: Number(deviationPercent.toFixed(2)),
      status,
    }
  })
}

function determineStatus(
  metric: keyof NexusMetrics,
  deviationPercent: number,
): BaselineStatus {
  const worsening =
    higherIsWorse.includes(metric)
      ? deviationPercent > 0
      : deviationPercent < 0

  if (!worsening) {
    return 'normal'
  }

  const absoluteDeviation = Math.abs(deviationPercent)

  if (absoluteDeviation >= 50) {
    return 'critical'
  }

  if (absoluteDeviation >= 25) {
    return 'warning'
  }

  return 'normal'
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