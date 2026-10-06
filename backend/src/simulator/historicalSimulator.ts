import { NexusMetrics } from '../services/metricsService.js'

export interface HistoricalScenario {
  name: string
  metrics: NexusMetrics
}

const scenarios: HistoricalScenario[] = [
  {
    name: 'Operação normal',
    metrics: {
      totalEvents: 100,
      productViews: 50,
      checkoutsStarted: 20,
      ordersCreated: 12,
      paymentsFailed: 1,
      cartsAbandoned: 4,
      totalRevenue: 1799.8,
    },
  },

  {
    name: 'Crescimento saudável',
    metrics: {
      totalEvents: 120,
      productViews: 60,
      checkoutsStarted: 24,
      ordersCreated: 15,
      paymentsFailed: 1,
      cartsAbandoned: 5,
      totalRevenue: 2249.85,
    },
  },

  {
    name: 'Aumento de tráfego',
    metrics: {
      totalEvents: 150,
      productViews: 80,
      checkoutsStarted: 30,
      ordersCreated: 18,
      paymentsFailed: 2,
      cartsAbandoned: 7,
      totalRevenue: 2699.7,
    },
  },

  {
    name: 'Pressão no checkout',
    metrics: {
      totalEvents: 160,
      productViews: 82,
      checkoutsStarted: 35,
      ordersCreated: 14,
      paymentsFailed: 4,
      cartsAbandoned: 15,
      totalRevenue: 2099.86,
    },
  },

  {
    name: 'Comportamento anômalo',
    metrics: {
      totalEvents: 170,
      productViews: 85,
      checkoutsStarted: 40,
      ordersCreated: 10,
      paymentsFailed: 9,
      cartsAbandoned: 25,
      totalRevenue: 1499.9,
    },
  },
]

export function getHistoricalScenarios(): HistoricalScenario[] {
  return scenarios
}

export function getScenarioMetrics(
  scenarioIndex: number,
): NexusMetrics | null {
  const scenario = scenarios[scenarioIndex]

  if (!scenario) {
    return null
  }

  return scenario.metrics
}