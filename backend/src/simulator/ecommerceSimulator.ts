import { NexusEvent } from '../types/events.js'

const API_URL = 'http://localhost:3000/api/events'

const products = [
  'product-101',
  'product-201',
  'product-301',
  'product-401',
  'product-501',
]

interface CustomerJourney {
  customerId: string
  productId: string
  value: number
}

function createJourney(index: number): CustomerJourney {
  return {
    customerId: `customer-${String(index).padStart(3, '0')}`,
    productId:
      products[Math.floor(Math.random() * products.length)],
    value: Number((Math.random() * 400 + 50).toFixed(2)),
  }
}

async function sendEvent(event: NexusEvent) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    throw new Error(
      `Erro ao enviar evento: ${response.status}`,
    )
  }

  const result = await response.json()

  console.log(
    `Evento: ${result.event.type} | Cliente: ${result.event.customerId}`,
  )
}

async function runSimulation() {
  console.log('Iniciando simulação de jornadas...\n')

  for (let i = 1; i <= 20; i++) {
    const journey = createJourney(i)

    /*
     * Etapa 1 — cliente visualiza o produto
     */
    await sendEvent({
      type: 'product_viewed',
      customerId: journey.customerId,
      productId: journey.productId,
      value: journey.value,
    })

    /*
     * Apenas parte dos visitantes inicia o checkout.
     */
    const startsCheckout = Math.random() < 0.6

    if (!startsCheckout) {
      continue
    }

    await sendEvent({
      type: 'checkout_started',
      customerId: journey.customerId,
      productId: journey.productId,
      value: journey.value,
    })

    /*
     * Depois do checkout, o cliente segue
     * para uma das possíveis situações.
     */
    const behavior = Math.random()

    if (behavior < 0.15) {
      /*
       * Pagamento recusado
       */
      await sendEvent({
        type: 'payment_failed',
        customerId: journey.customerId,
        productId: journey.productId,
        value: journey.value,
      })
    } else if (behavior < 0.30) {
      /*
       * Carrinho abandonado
       */
      await sendEvent({
        type: 'cart_abandoned',
        customerId: journey.customerId,
        productId: journey.productId,
        value: journey.value,
      })
    } else {
      /*
       * Pedido concluído
       */
      await sendEvent({
        type: 'order_created',
        customerId: journey.customerId,
        productId: journey.productId,
        value: journey.value,
      })
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 150),
    )
  }

  console.log('\nSimulação concluída.')
}

runSimulation().catch((error) => {
  console.error('Erro na simulação:', error)
})