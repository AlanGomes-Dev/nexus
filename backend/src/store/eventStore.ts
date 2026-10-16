
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NexusEvent } from '../types/events.js'

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

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    customerId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    data TEXT
  )
`)

const insertEvent = db.prepare(`
  INSERT INTO events (type, customerId, timestamp, data)
  VALUES (?, ?, ?, ?)
`)

const selectEvents = db.prepare(`
  SELECT data
  FROM events
  ORDER BY id ASC
`)

export function addEvent(event: NexusEvent): NexusEvent {
  const eventWithTimestamp: NexusEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  }

  insertEvent.run(
    eventWithTimestamp.type,
    eventWithTimestamp.customerId,
    eventWithTimestamp.timestamp,
    JSON.stringify(eventWithTimestamp),
  )

  return eventWithTimestamp
}

export function getEvents(): NexusEvent[] {
  const rows = selectEvents.all() as { data: string }[]

  return rows.map((row) => JSON.parse(row.data) as NexusEvent)
}

export function getEventCount(): number {
  const result = db.prepare(
    'SELECT COUNT(*) AS total FROM events',
  ).get() as { total: number }

  return result.total
}

// Permite encerrar a conexão em testes automatizados.
export function closeEventStore(): void {
  db.close()
}
