
import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import type { NexusMetrics } from './metricsService.js'

export interface MetricsSnapshot extends NexusMetrics {
  timestamp: string
}

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFile)

const defaultDatabaseDirectory = path.resolve(
  currentDirectory,
  '../../data',
)

const databasePath = process.env.NEXUS_DB_PATH
  ? path.resolve(process.env.NEXUS_DB_PATH)
  : path.join(defaultDatabaseDirectory, 'nexus.db')

fs.mkdirSync(path.dirname(databasePath), { recursive: true })

const db = new Database(databasePath)

db.exec(`
  CREATE TABLE IF NOT EXISTS metrics_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    totalEvents INTEGER NOT NULL,
    productViews INTEGER NOT NULL,
    checkoutsStarted INTEGER NOT NULL,
    ordersCreated INTEGER NOT NULL,
    paymentsFailed INTEGER NOT NULL,
    cartsAbandoned INTEGER NOT NULL,
    totalRevenue REAL NOT NULL
  )
`)

const insertSnapshot = db.prepare(`
  INSERT INTO metrics_history (
    timestamp,
    totalEvents,
    productViews,
    checkoutsStarted,
    ordersCreated,
    paymentsFailed,
    cartsAbandoned,
    totalRevenue
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const selectSnapshots = db.prepare(`
  SELECT timestamp, totalEvents, productViews,
         checkoutsStarted, ordersCreated, paymentsFailed,
         cartsAbandoned, totalRevenue
  FROM metrics_history
  ORDER BY id ASC
`)

export function recordMetricsSnapshot(
  metrics: NexusMetrics,
): MetricsSnapshot {
  const snapshot: MetricsSnapshot = {
    ...metrics,
    timestamp: new Date().toISOString(),
  }

  insertSnapshot.run(
    snapshot.timestamp,
    snapshot.totalEvents,
    snapshot.productViews,
    snapshot.checkoutsStarted,
    snapshot.ordersCreated,
    snapshot.paymentsFailed,
    snapshot.cartsAbandoned,
    snapshot.totalRevenue,
  )

  return snapshot
}

export function getMetricsHistory(): MetricsSnapshot[] {
  return selectSnapshots.all() as MetricsSnapshot[]
}

export function getLatestMetricsSnapshot(): MetricsSnapshot | null {
  const history = getMetricsHistory()
  return history.length > 0 ? history[history.length - 1] : null
}

export function seedHistoricalMetrics(
  _scenarios: NexusMetrics[],
): void {
  // Não inserir cenários fictícios no histórico real.
  // Os snapshots existentes nunca são apagados na inicialização.
}

export function closeMetricsHistoryStore(): void {
  db.close()
}
