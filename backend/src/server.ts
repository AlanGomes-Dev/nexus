
import {
  app,
  initializeHistoricalMetrics,
  recordCurrentMetricsSnapshot,
} from './app.js'

const PORT = 3000

initializeHistoricalMetrics()

const SNAPSHOT_INTERVAL = 60 * 1000

const snapshotTimer = setInterval(() => {
  recordCurrentMetricsSnapshot()
}, SNAPSHOT_INTERVAL)

const server = app.listen(PORT, () => {
  console.log(`Nexus API rodando em http://localhost:${PORT}`)
})

function shutdown(): void {
  clearInterval(snapshotTimer)

  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
