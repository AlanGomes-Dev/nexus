import { NexusMetrics } from './metricsService.js'

export type AlertLevel = 'critical' | 'warning' | 'info'

export interface NexusAlert {
  type: string
  title: string
  description: string
  level: AlertLevel
  metric: string
  value: number
  threshold: number
}

export function detectAnomalies(
  metrics: NexusMetrics,
): NexusAlert[] {
  const alerts: NexusAlert[] = []

  if (metrics.checkoutsStarted > 0) {
    const abandonmentRate =
      (metrics.cartsAbandoned / metrics.checkoutsStarted) * 100

    if (abandonmentRate >= 70) {
      alerts.push({
        type: 'cart_abandonment',
        title: 'Abandono de carrinho elevado',
        description:
          'A taxa de abandono de carrinho ultrapassou o limite configurado.',
        level: 'critical',
        metric: 'cartAbandonmentRate',
        value: Number(abandonmentRate.toFixed(2)),
        threshold: 70,
      })
    } else if (abandonmentRate >= 50) {
      alerts.push({
        type: 'cart_abandonment',
        title: 'Aumento no abandono de carrinho',
        description:
          'A taxa de abandono de carrinho está acima do nível esperado.',
        level: 'warning',
        metric: 'cartAbandonmentRate',
        value: Number(abandonmentRate.toFixed(2)),
        threshold: 50,
      })
    }
  }

  if (metrics.ordersCreated > 0) {
    const paymentFailureRate =
      (metrics.paymentsFailed /
        (metrics.ordersCreated + metrics.paymentsFailed)) *
      100

    if (paymentFailureRate >= 20) {
      alerts.push({
        type: 'payment_failure',
        title: 'Falhas de pagamento elevadas',
        description:
          'A proporção de falhas de pagamento ultrapassou o limite configurado.',
        level: 'critical',
        metric: 'paymentFailureRate',
        value: Number(paymentFailureRate.toFixed(2)),
        threshold: 20,
      })
    } else if (paymentFailureRate >= 10) {
      alerts.push({
        type: 'payment_failure',
        title: 'Aumento nas falhas de pagamento',
        description:
          'A proporção de falhas de pagamento está acima do nível esperado.',
        level: 'warning',
        metric: 'paymentFailureRate',
        value: Number(paymentFailureRate.toFixed(2)),
        threshold: 10,
      })
    }
  }

  return alerts
}