import { NexusMetrics } from './metricsService.js'
import { MetricsSnapshot } from './historicalMetricsService.js'

export interface BaselineResult {
  metric: string
  currentValue: number
  baselineValue: number
  deviationPercent: number
  status: 'normal' | 'warning' | 'critical'
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  )
}

export function calculateBaseline(
  history: MetricsSnapshot[],
  currentMetrics: NexusMetrics,
): BaselineResult[] {
  if (history.length === 0) {
    return []
  }

  const metrics = [
    'productViews',
    'checkoutsStarted',
    'ordersCreated',
    'paymentsFailed',
    'cartsAbandoned',
    'totalRevenue',
  ] as const

  return metrics.map((metric) => {
    const historicalValues = history.map(
      (snapshot) => snapshot[metric],
    )

    const baselineValue = calculateAverage(historicalValues)
    const currentValue = currentMetrics[metric]

    const deviationPercent =
      baselineValue === 0
        ? 0
        : ((currentValue - baselineValue) /
            baselineValue) *
          100

    let status: BaselineResult['status'] = 'normal'

    if (Math.abs(deviationPercent) >= 50) {
      status = 'critical'
    } else if (Math.abs(deviationPercent) >= 25) {
      status = 'warning'
    }

    return {
      metric,
      currentValue,
      baselineValue: Number(baselineValue.toFixed(2)),
      deviationPercent: Number(
        deviationPercent.toFixed(2),
      ),
      status,
    }
  })
}