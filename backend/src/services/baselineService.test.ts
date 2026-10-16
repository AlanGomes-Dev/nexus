
import { describe, expect, it } from 'vitest'
import type { NexusMetrics } from './metricsService.js'
import { calculateBaseline } from './baselineService.js'

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

describe('calculateBaseline', () => {
  it('deve indicar dados insuficientes quando há menos de 5 eventos', () => {
    const current = createMetrics({
      totalEvents: 4,
      productViews: 3,
    })

    const result = calculateBaseline([], current)

    expect(result).toHaveLength(6)
    expect(
      result.every((item) => item.status === 'insufficient_data'),
    ).toBe(true)
  })

  it('deve identificar desvios críticos em relação à média histórica', () => {
    const history = [
      createMetrics({
        totalEvents: 100,
        productViews: 50,
        checkoutsStarted: 20,
        ordersCreated: 10,
        paymentsFailed: 2,
        cartsAbandoned: 4,
        totalRevenue: 1000,
      }),
    ]

    const current = createMetrics({
      totalEvents: 10,
      productViews: 20,
      checkoutsStarted: 20,
      ordersCreated: 5,
      paymentsFailed: 4,
      cartsAbandoned: 6,
      totalRevenue: 500,
    })

    const result = calculateBaseline(history, current)

    expect(result.find((item) => item.metric === 'productViews'))
      .toMatchObject({
        baselineValue: 50,
        deviationPercent: -60,
        status: 'critical',
      })

    expect(result.find((item) => item.metric === 'paymentsFailed'))
      .toMatchObject({
        baselineValue: 2,
        deviationPercent: 100,
        status: 'critical',
      })

    expect(result.find((item) => item.metric === 'totalRevenue'))
      .toMatchObject({
        baselineValue: 1000,
        deviationPercent: -50,
        status: 'critical',
      })
  })

  it('deve evitar divisão por zero quando não há histórico', () => {
    const current = createMetrics({
      totalEvents: 5,
      productViews: 3,
    })

    const result = calculateBaseline([], current)

    expect(
      result.every(
        (item) =>
          item.status === 'normal' &&
          item.deviationPercent === 0,
      ),
    ).toBe(true)
  })
})
