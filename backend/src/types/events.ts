export type EventType =
  | 'product_viewed'
  | 'checkout_started'
  | 'order_created'
  | 'payment_failed'
  | 'cart_abandoned'

export interface NexusEvent {
  type: EventType
  customerId: string
  productId?: string
  orderId?: string
  value?: number
  timestamp?: string
}