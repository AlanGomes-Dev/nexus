import { describe, expect, it } from 'vitest'
import type { NexusMetrics } from './metricsService.js'
import { detectAnomalies } from './anomalyDetectionService.js'

function createMetrics(
  overrides: Partial<NexusMetrics> = {},
): NexusMetrics {
  return {
    totalEvents: 0,
    productViews: 0,
    checkoutsStarted: 0,
    ordersCreated: 0,
    paymentsFailed: 0,
    cartsAbandoned: 0,
    totalRevenue: 0,
    ...overrides,
  }
}

describe('detectAnomalies', () => {
  it('não deve gerar alertas quando as taxas estão abaixo dos limites', () => {
    const metrics = createMetrics({
      checkoutsStarted: 10,
      cartsAbandoned: 4,
      ordersCreated: 10,
      paymentsFailed: 1,
    })

    expect(detectAnomalies(metrics)).toEqual([])
  })

  it('deve gerar alerta de abandono em nível warning a partir de 50%', () => {
    const metrics = createMetrics({
      checkoutsStarted: 10,
      cartsAbandoned: 5,
    })

    const alerts = detectAnomalies(metrics)

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'cart_abandonment',
      level: 'warning',
      value: 50,
      threshold: 50,
    })
  })

  it('deve gerar alerta crítico para abandono a partir de 70%', () => {
    const metrics = createMetrics({
      checkoutsStarted: 10,
      cartsAbandoned: 7,
    })

    const alerts = detectAnomalies(metrics)

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'cart_abandonment',
      level: 'critical',
      value: 70,
      threshold: 70,
    })
  })

  it('deve gerar alerta warning para falhas de pagamento a partir de 10%', () => {
    const metrics = createMetrics({
      ordersCreated: 9,
      paymentsFailed: 1,
    })

    const alerts = detectAnomalies(metrics)

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'payment_failure',
      level: 'warning',
      value: 10,
      threshold: 10,
    })
  })

  it('deve gerar alerta crítico para falhas de pagamento a partir de 20%', () => {
    const metrics = createMetrics({
      ordersCreated: 4,
      paymentsFailed: 1,
    })

    const alerts = detectAnomalies(metrics)

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      type: 'payment_failure',
      level: 'critical',
      value: 20,
      threshold: 20,
    })
  })

  it('deve detectar abandono e falhas de pagamento simultaneamente', () => {
    const metrics = createMetrics({
      checkoutsStarted: 10,
      cartsAbandoned: 8,
      ordersCreated: 4,
      paymentsFailed: 1,
    })

    const alerts = detectAnomalies(metrics)

    expect(alerts).toHaveLength(2)
    expect(alerts.map((alert) => alert.type)).toEqual([
      'cart_abandonment',
      'payment_failure',
    ])
  })
})