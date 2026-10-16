
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { NexusMetrics } from './metricsService.js'

const originalDbPath = process.env.NEXUS_DB_PATH
const testDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'nexus-history-test-'),
)
const testDbPath = path.join(testDirectory, 'test.db')

let historyStore:
  | typeof import('./historicalMetricsService.js')
  | undefined

function createMetrics(): NexusMetrics {
  return {
    totalEvents: 5,
    productViews: 3,
    checkoutsStarted: 2,
    ordersCreated: 1,
    paymentsFailed: 0,
    cartsAbandoned: 1,
    totalRevenue: 49.9,
  }
}

beforeAll(async () => {
  process.env.NEXUS_DB_PATH = testDbPath
  vi.resetModules()
  historyStore = await import('./historicalMetricsService.js')
})

afterAll(() => {
  try {
    historyStore?.closeMetricsHistoryStore()
  } catch {
    // A conexão pode já estar fechada.
  }

  if (originalDbPath === undefined) {
    delete process.env.NEXUS_DB_PATH
  } else {
    process.env.NEXUS_DB_PATH = originalDbPath
  }

  fs.rmSync(testDirectory, { recursive: true, force: true })
})

describe('historicalMetricsService SQLite', () => {
  it('deve preservar snapshots após reabrir a conexão', async () => {
    const metrics = createMetrics()
    const snapshot = historyStore!.recordMetricsSnapshot(metrics)

    expect(historyStore!.getMetricsHistory()).toEqual([snapshot])

    historyStore!.closeMetricsHistoryStore()
    vi.resetModules()
    historyStore = await import('./historicalMetricsService.js')

    expect(historyStore.getMetricsHistory()).toEqual([snapshot])
    expect(historyStore.getLatestMetricsSnapshot()).toEqual(snapshot)

    // Inicializar cenários simulados não deve apagar o histórico real.
    historyStore.seedHistoricalMetrics([metrics])

    expect(historyStore.getMetricsHistory()).toEqual([snapshot])
  })
})
