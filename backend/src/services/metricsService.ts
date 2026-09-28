import { NexusEvent } from '../types/events.js'

export interface NexusMetrics {
  totalEvents: number
  productViews: number
  checkoutsStarted: number
  ordersCreated: number
  paymentsFailed: number
  cartsAbandoned: number
  totalRevenue: number
}

export function calculateMetrics(events: NexusEvent[]): NexusMetrics {
  return {
    totalEvents: events.length,

    productViews: events.filter(
      (event) => event.type === 'product_viewed',
    ).length,

    checkoutsStarted: events.filter(
      (event) => event.type === 'checkout_started',
    ).length,

    ordersCreated: events.filter(
      (event) => event.type === 'order_created',
    ).length,

    paymentsFailed: events.filter(
      (event) => event.type === 'payment_failed',
    ).length,

    cartsAbandoned: events.filter(
      (event) => event.type === 'cart_abandoned',
    ).length,

    totalRevenue: events
      .filter((event) => event.type === 'order_created')
      .reduce((total, event) => total + (event.value ?? 0), 0),
  }
}