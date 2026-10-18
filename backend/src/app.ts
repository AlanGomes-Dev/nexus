
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
  const event = req.body as NexusEvent

  if (!event.type || !validEventTypes.includes(event.type)) {
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
      message: 'customerId é obrigatório.',
    })
  }

  const storedEvent = addEvent(event)

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
