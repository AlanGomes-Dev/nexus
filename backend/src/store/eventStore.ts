
import Database from 'better-sqlite3'
import { NexusEvent } from '../types/events.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFile)

// Banco salvo em backend/data/nexus.db
const databaseDirectory = path.resolve(currentDirectory, '../../data')
import fs from 'node:fs'

fs.mkdirSync(databaseDirectory, { recursive: true })

const databasePath = path.join(databaseDirectory, 'nexus.db')
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
  SELECT type, customerId, timestamp, data
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
  const rows = selectEvents.all() as {
    data: string
  }[]

  return rows.map((row) => JSON.parse(row.data) as NexusEvent)
}

export function getEventCount(): number {
  const result = db.prepare(
    'SELECT COUNT(*) AS total FROM events',
  ).get() as { total: number }

  return result.total
}
