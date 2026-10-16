
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
import type { NexusEvent } from '../types/events.js'

const originalDbPath = process.env.NEXUS_DB_PATH
const testDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'nexus-events-test-'),
)
const testDbPath = path.join(testDirectory, 'test.db')

let store: typeof import('./eventStore.js') | undefined

beforeAll(async () => {
  process.env.NEXUS_DB_PATH = testDbPath
  vi.resetModules()
  store = await import('./eventStore.js')
})

afterAll(() => {
  try {
    store?.closeEventStore()
  } catch {
    // A conexão pode já ter sido fechada pelo teste.
  }

  if (originalDbPath === undefined) {
    delete process.env.NEXUS_DB_PATH
  } else {
    process.env.NEXUS_DB_PATH = originalDbPath
  }

  fs.rmSync(testDirectory, { recursive: true, force: true })
})

describe('eventStore SQLite', () => {
  it('deve preservar os eventos após fechar e reabrir a conexão', async () => {
    const event = {
      type: 'product_viewed',
      customerId: 'cliente-persistencia-001',
    } as NexusEvent

    const savedEvent = store!.addEvent(event)

    expect(store!.getEventCount()).toBe(1)
    expect(store!.getEvents()).toEqual([savedEvent])

    // Simula o fechamento e a reabertura da conexão.
    store!.closeEventStore()
    vi.resetModules()
    store = await import('./eventStore.js')

    expect(store.getEventCount()).toBe(1)
    expect(store.getEvents()).toEqual([savedEvent])
  })
})
