
import { describe, expect, it } from 'vitest'
import type { NexusMetrics } from './metricsService.js'
import type {
  BaselineResult,
  BaselineStatus,
} from './baselineService.js'
import { detectCorrelations } from './correlationService.js'

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

function createBaseline(
  overrides: Partial<Record<keyof NexusMetrics, BaselineStatus>> = {},
): BaselineResult[] {
  const trackedMetrics: (keyof NexusMetrics)[] = [
    'productViews',
    'checkoutsStarted',
    'ordersCreated',
    'paymentsFailed',
    'cartsAbandoned',
    'totalRevenue',
  ]

  return trackedMetrics.map((metric) => ({
    metric,
    currentValue: 10,
    baselineValue: 10,
    deviationPercent: 0,
    status: overrides[metric] ?? 'normal',
  }))
}

describe('detectCorrelations', () => {
  it('não deve detectar correlações quando faltam dados suficientes', () => {
    const metrics = createMetrics({
      paymentsFailed: 3,
      cartsAbandoned: 5,
    })

    const baseline = createBaseline({
      paymentsFailed: 'critical',
      productViews: 'insufficient_data',
    })

    expect(detectCorrelations(metrics, baseline)).toEqual([])
  })

  it('deve detectar degradação simultânea no funil de vendas', () => {
    const metrics = createMetrics()

    const baseline = createBaseline({
      productViews: 'critical',
      checkoutsStarted: 'critical',
      ordersCreated: 'critical',
    })

    const correlations = detectCorrelations(metrics, baseline)

    expect(correlations).toHaveLength(1)
    expect(correlations[0]).toMatchObject({
      type: 'funnel_degradation',
      level: 'critical',
    })
  })

  it('deve detectar falhas repetidas de pagamento', () => {
    const metrics = createMetrics({
      paymentsFailed: 2,
    })

    const baseline = createBaseline({
      paymentsFailed: 'critical',
    })

    const correlations = detectCorrelations(metrics, baseline)

    expect(correlations).toHaveLength(1)
    expect(correlations[0]).toMatchObject({
      type: 'payment_issue',
      level: 'critical',
    })
  })

  it('deve detectar problema de pagamento com queda crítica nos pedidos', () => {
    const metrics = createMetrics({
      paymentsFailed: 1,
      ordersCreated: 0,
    })

    const baseline = createBaseline({
      paymentsFailed: 'critical',
      ordersCreated: 'critical',
    })

    const correlations = detectCorrelations(metrics, baseline)

    expect(
      correlations.some((item) => item.type === 'payment_issue'),
    ).toBe(true)
  })

  it('deve detectar gargalo de conversão do carrinho', () => {
    const metrics = createMetrics({
      cartsAbandoned: 5,
      ordersCreated: 0,
    })

    const baseline = createBaseline({
      cartsAbandoned: 'critical',
      ordersCreated: 'critical',
    })

    const correlations = detectCorrelations(metrics, baseline)

    expect(correlations).toHaveLength(1)
    expect(correlations[0]).toMatchObject({
      type: 'cart_abandonment',
      level: 'critical',
    })
  })

  it('não deve gerar correlações quando os indicadores estão normais', () => {
    const metrics = createMetrics({
      productViews: 20,
      checkoutsStarted: 10,
      ordersCreated: 5,
    })

    const baseline = createBaseline()

    expect(detectCorrelations(metrics, baseline)).toEqual([])
  })
})
