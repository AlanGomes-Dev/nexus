import { describe, expect, it } from 'vitest'
import type { NexusEvent } from '../types/events.js'
import { calculateMetrics } from './metricsService.js'

function createEvent(
  type: NexusEvent['type'],
  customerId: string,
  value?: number,
): NexusEvent {
  return {
    type,
    customerId,
    timestamp: '2026-10-15T00:00:00.000Z',
    ...(value === undefined ? {} : { value }),
  }
}

describe('calculateMetrics', () => {
  it('deve retornar métricas zeradas sem eventos', () => {
    expect(calculateMetrics([])).toEqual({
      totalEvents: 0,
      productViews: 0,
      checkoutsStarted: 0,
      ordersCreated: 0,
      paymentsFailed: 0,
      cartsAbandoned: 0,
      totalRevenue: 0,
    })
  })

  it('deve contar os eventos e somar a receita corretamente', () => {
    const events: NexusEvent[] = [
      createEvent('product_viewed', 'cliente-001'),
      createEvent('product_viewed', 'cliente-002'),
      createEvent('checkout_started', 'cliente-001'),
      createEvent('order_created', 'cliente-001', 25),
      createEvent('order_created', 'cliente-002', 40),
      createEvent('payment_failed', 'cliente-003'),
      createEvent('cart_abandoned', 'cliente-004'),
    ]

    expect(calculateMetrics(events)).toEqual({
      totalEvents: 7,
      productViews: 2,
      checkoutsStarted: 1,
      ordersCreated: 2,
      paymentsFailed: 1,
      cartsAbandoned: 1,
      totalRevenue: 65,
    })
  })

  it('deve contar pedidos sem valor sem aumentar a receita', () => {
    const events = [
      createEvent('order_created', 'cliente-001'),
    ]

    const metrics = calculateMetrics(events)

    expect(metrics.ordersCreated).toBe(1)
    expect(metrics.totalRevenue).toBe(0)
  })
})