
import { useEffect, useState } from 'react'
import './App.css'

type Metrics = {
  totalEvents: number
  productViews: number
  checkoutsStarted: number
  ordersCreated: number
  paymentsFailed: number
  cartsAbandoned: number
  totalRevenue: number
}

type ApiAlert = {
  type: string
  title: string
  description: string
  level: 'critical' | 'warning' | 'info'
  metric: string
  value: number
  threshold: number
}

type ApiResponse<T> = {
  success: boolean
  metrics?: T
  alerts?: ApiAlert[]
  message?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [metricsResponse, alertsResponse] = await Promise.all([
          fetch(`${API_URL}/api/metrics`, { signal: controller.signal }),
          fetch(`${API_URL}/api/alerts`, { signal: controller.signal }),
        ])

        if (!metricsResponse.ok || !alertsResponse.ok) {
          throw new Error('A API retornou uma resposta inválida.')
        }

        const metricsData: ApiResponse<Metrics> = await metricsResponse.json()
        const alertsData: ApiResponse<never> = await alertsResponse.json()

        if (!metricsData.success || !metricsData.metrics || !alertsData.success) {
          throw new Error('Não foi possível interpretar os dados da API.')
        }

        setMetrics(metricsData.metrics)
        setAlerts(alertsData.alerts ?? [])
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return

        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível conectar à API do Nexus.',
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadDashboard()

    return () => controller.abort()
  }, [])

  const metricCards = metrics
    ? [
        {
          label: 'Faturamento',
          value: currencyFormatter.format(metrics.totalRevenue),
          detail: `${numberFormatter.format(metrics.ordersCreated)} pedidos registrados`,
        },
        {
          label: 'Pedidos',
          value: numberFormatter.format(metrics.ordersCreated),
          detail: `${numberFormatter.format(metrics.totalEvents)} eventos registrados`,
        },
        {
          label: 'Visualizações de produtos',
          value: numberFormatter.format(metrics.productViews),
          detail: `${numberFormatter.format(metrics.checkoutsStarted)} checkouts iniciados`,
        },
        {
          label: 'Carrinhos abandonados',
          value: numberFormatter.format(metrics.cartsAbandoned),
          detail: `${numberFormatter.format(metrics.paymentsFailed)} falhas de pagamento`,
        },
      ]
    : []

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <span className="brand">NEXUS</span>
          <span className="subtitle">E-commerce Intelligence</span>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          {loading ? 'Conectando à API...' : error ? 'API indisponível' : 'API conectada'}
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <div>
            <p className="eyebrow">MONITORAMENTO</p>
            <h1>Visão geral da operação</h1>
            <p>
              Acompanhe os principais indicadores e identifique possíveis
              problemas na operação do e-commerce.
            </p>
          </div>
        </section>

        {error && (
          <div className="connection-error" role="alert">
            <strong>Não foi possível carregar o dashboard.</strong>
            <p>{error}</p>
            <p>
              Confirme se o backend está em execução na porta 3000 e se a
              configuração de CORS permite a origem do frontend.
            </p>
          </div>
        )}

        {loading && !metrics ? (
          <p role="status">Carregando indicadores do Nexus...</p>
        ) : (
          <>
            <section className="metrics">
              {metricCards.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </article>
              ))}
            </section>

            <section className="content-grid">
              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">NEXUS AI</p>
                    <h2>Alertas inteligentes</h2>
                  </div>

                  <span className="alert-count">
                    {alerts.length} alertas
                  </span>
                </div>

                <div className="alert-list">
                  {alerts.length === 0 ? (
                    <p>Nenhuma anomalia detectada pelos critérios atuais.</p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={`${alert.type}-${alert.metric}`}
                        className={`alert ${alert.level}`}
                      >
                        <div>
                          <strong>{alert.title}</strong>
                          <p>{alert.description}</p>
                          <p>
                            Valor detectado: {numberFormatter.format(alert.value)}%
                            {' · '}Limite: {numberFormatter.format(alert.threshold)}%
                          </p>
                        </div>
                        <span>
                          {alert.level === 'critical'
                            ? 'Crítico'
                            : alert.level === 'warning'
                              ? 'Atenção'
                              : 'Informativo'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">ANÁLISE</p>
                    <h2>Resumo operacional</h2>
                  </div>
                </div>

                <div className="recommendation">
  <h3>Indicadores registrados</h3>
  <p>
    O Nexus recebeu{' '}
    {numberFormatter.format(metrics?.totalEvents ?? 0)}{' '}
    {metrics?.totalEvents === 1 ? 'evento' : 'eventos'}. O faturamento
    considera os eventos de pedido registrados na API. Os indicadores
    dependem dos dados enviados ao backend.
  </p>

                  <div className="recommendation-action">
                    <span>Próxima ação</span>
                    <strong>
                      {alerts.length > 0
                        ? 'Investigar os alertas detectados'
                        : 'Continuar monitorando a operação'}
                    </strong>
                  </div>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
