
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'

describe('Nexus API', () => {
  const originalDbPath = process.env.NEXUS_DB_PATH
  const tempDir = mkdtempSync(path.join(tmpdir(), 'nexus-api-test-'))

  let server: Awaited<ReturnType<typeof import('node:http').createServer>>
  let baseUrl: string
  let appModule: typeof import('./app.js')

  beforeAll(async () => {
    process.env.NEXUS_DB_PATH = path.join(tempDir, 'nexus-test.db')
    vi.resetModules()

    appModule = await import('./app.js')

    server = appModule.app.listen(0)
    await new Promise<void>((resolve) => server.once('listening', resolve))

    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error)
          else resolve()
        })
      })
    }

    const { closeEventStore } = await import('./store/eventStore.js')
    const { closeMetricsHistoryStore } = await import(
      './services/historicalMetricsService.js'
    )

    closeEventStore()
    closeMetricsHistoryStore()

    if (originalDbPath === undefined) {
      delete process.env.NEXUS_DB_PATH
    } else {
      process.env.NEXUS_DB_PATH = originalDbPath
    }

    vi.resetModules()
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('deve responder ao health check', async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: 'online',
      service: 'Nexus API',
      version: '0.1.0',
    })
  })

  it('deve registrar e listar um evento', async () => {
    const event = {
      type: 'product_viewed',
      customerId: 'cliente-teste',
      productId: 'produto-teste',
    }

    const createResponse = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    expect(createResponse.status).toBe(201)

    const listResponse = await fetch(`${baseUrl}/api/events`)
    const events = await listResponse.json()

   expect(listResponse.status).toBe(200)
expect(events.success).toBe(true)
expect(events.total).toBe(1)
expect(events.events).toHaveLength(1)
expect(events.events[0]).toMatchObject(event)
  })

  it('deve rejeitar evento sem cliente', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'product_viewed',
        customerId: '   ',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('deve rejeitar tipo de evento inválido', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'evento_invalido',
        customerId: 'cliente-teste',
      }),
    })

    expect(response.status).toBe(400)
  })

  
  it('deve rejeitar valor negativo', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_created',
        customerId: 'cliente-teste',
        value: -10,
      }),
    })

    expect(response.status).toBe(400)
  })

  it('deve rejeitar valor não numérico', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_created',
        customerId: 'cliente-teste',
        value: '100',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('deve rejeitar data inválida', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'product_viewed',
        customerId: 'cliente-teste',
        timestamp: 'data-invalida',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('deve rejeitar identificador de produto vazio', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'product_viewed',
        customerId: 'cliente-teste',
        productId: '   ',
      }),
    })

    expect(response.status).toBe(400)
  })
  it('deve rejeitar produto visualizado sem productId', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'product_viewed',
        customerId: 'cliente-teste',
      }),
    })
    expect(response.status).toBe(400)
  })

  it('deve rejeitar pedido criado sem orderId', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_created',
        customerId: 'cliente-teste',
        value: 100,
      }),
    })
    expect(response.status).toBe(400)
  })

  it('deve rejeitar pedido criado sem value', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_created',
        customerId: 'cliente-teste',
        orderId: 'pedido-teste',
      }),
    })
    expect(response.status).toBe(400)
  })

  it('deve rejeitar pagamento com falha sem orderId', async () => {
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment_failed',
        customerId: 'cliente-teste',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('deve responder às rotas de métricas, histórico, alertas, baseline e correlações', async () => {
    const routes = [
      '/api/metrics',
      '/api/metrics/history',
      '/api/alerts',
      '/api/baseline',
      '/api/correlations',
    ]

    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route}`)

      expect(response.status, route).toBe(200)
      await response.json()
    }
  })
})
