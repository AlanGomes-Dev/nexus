
import express from 'express'
import cors from 'cors'
import type { EventType, NexusEvent } from './types/events.js'
import { calculateMetrics } from './services/metricsService.js'
import { detectAnomalies } from './services/anomalyDetectionService.js'
import { detectCorrelations } from './services/correlationService.js'
import {
  addEvent,
  getEvents,
  getEventCount,
} from './store/eventStore.js'
import {
  recordMetricsSnapshot,
  getMetricsHistory,
  seedHistoricalMetrics,
} from './services/historicalMetricsService.js'
import { calculateBaseline } from './services/baselineService.js'
import { getHistoricalScenarios } from './simulator/historicalSimulator.js'

export const app = express()

app.use(cors())
app.use(express.json())

const validEventTypes: EventType[] = [
  'product_viewed',
  'checkout_started',
  'order_created',
  'payment_failed',
  'cart_abandoned',
]

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Nexus API',
    version: '0.1.0',
  })
})

app.get('/api/metrics', (_req, res) => {
  const metrics = calculateMetrics(getEvents())
  res.json({ success: true, metrics })
})

app.post('/api/events', (req, res) => {
  const body: unknown = req.body

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    return res.status(400).json({
      success: false,
      message: 'O corpo da requisição deve ser um objeto JSON.',
    })
  }

  const event = body as Record<string, unknown>

  if (
    typeof event.type !== 'string' ||
    !validEventTypes.includes(event.type as EventType)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de evento inválido.',
      validEventTypes,
    })
  }

  if (
    typeof event.customerId !== 'string' ||
    !event.customerId.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'customerId é obrigatório e deve ser uma string não vazia.',
    })
  }

  for (const field of ['productId', 'orderId'] as const) {
    if (
      event[field] !== undefined &&
      (typeof event[field] !== 'string' || !event[field].trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} deve ser uma string não vazia quando informado.`,
      })
    }
  }

  if (
    event.value !== undefined &&
    (
      typeof event.value !== 'number' ||
      !Number.isFinite(event.value) ||
      event.value < 0
    )
  ) {
    return res.status(400).json({
      success: false,
      message: 'value deve ser um número finito maior ou igual a zero.',
    })
  }

  if (event.timestamp !== undefined) {
    if (
      typeof event.timestamp !== 'string' ||
      !event.timestamp.trim() ||
      !Number.isFinite(Date.parse(event.timestamp))
    ) {
      return res.status(400).json({
        success: false,
        message: 'timestamp deve conter uma data válida.',
      })
    }
  }

  const requiredFields: Partial<Record<EventType, string[]>> = {
    product_viewed: ['productId'],
    order_created: ['orderId', 'value'],
    payment_failed: ['orderId'],
  }

  for (const field of requiredFields[event.type as EventType] ?? []) {
    const value = event[field]

    if (field === 'value') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'value é obrigatório e deve ser um número finito maior ou igual a zero.',
        })
      }
    } else if (typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({
        success: false,
        message: `${field} é obrigatório e deve ser uma string não vazia.`,
      })
    }
  }
  const storedEvent = addEvent(event as unknown as NexusEvent)

  return res.status(201).json({
    success: true,
    message: 'Evento recebido pelo Nexus',
    event: storedEvent,
  })
})

app.get('/api/events', (_req, res) => {
  res.json({
    success: true,
    total: getEventCount(),
    events: getEvents(),
  })
})

app.get('/api/metrics/history', (_req, res) => {
  const history = getMetricsHistory()
  res.json({ success: true, total: history.length, history })
})

app.get('/api/alerts', (_req, res) => {
  const alerts = detectAnomalies(calculateMetrics(getEvents()))
  res.json({ success: true, total: alerts.length, alerts })
})

app.get('/api/baseline', (_req, res) => {
  const baseline = calculateBaseline(
    getMetricsHistory(),
    calculateMetrics(getEvents()),
  )

  res.json({ success: true, total: baseline.length, baseline })
})

app.get('/api/correlations', (_req, res) => {
  const currentMetrics = calculateMetrics(getEvents())
  const baseline = calculateBaseline(getMetricsHistory(), currentMetrics)
  const correlations = detectCorrelations(currentMetrics, baseline)

  res.json({ success: true, total: correlations.length, correlations })
})

export function initializeHistoricalMetrics(): void {
  const scenarios = getHistoricalScenarios()
  seedHistoricalMetrics(scenarios.map((scenario) => scenario.metrics))
}

export function recordCurrentMetricsSnapshot(): void {
  const metrics = calculateMetrics(getEvents())
  recordMetricsSnapshot(metrics)
}
