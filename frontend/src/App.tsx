import './App.css'
import { dashboardData } from './data/dashboardData'

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <span className="brand">NEXUS</span>
          <span className="subtitle">E-commerce Intelligence</span>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Sistema operacional
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

        <section className="metrics">
          <article className="metric-card">
            <span>{dashboardData.metrics.revenue.label}</span>
            <strong>{dashboardData.metrics.revenue.value}</strong>
            <small>{dashboardData.metrics.revenue.variation}</small>
          </article>

          <article className="metric-card">
            <span>{dashboardData.metrics.orders.label}</span>
            <strong>{dashboardData.metrics.orders.value}</strong>
            <small>{dashboardData.metrics.orders.variation}</small>
          </article>

          <article className="metric-card">
            <span>{dashboardData.metrics.conversion.label}</span>
            <strong>{dashboardData.metrics.conversion.value}</strong>
            <small>{dashboardData.metrics.conversion.variation}</small>
          </article>

          <article className="metric-card">
            <span>{dashboardData.metrics.cartAbandonment.label}</span>
            <strong>{dashboardData.metrics.cartAbandonment.value}</strong>
            <small>{dashboardData.metrics.cartAbandonment.variation}</small>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">NEXUS AI</p>
                <h2>Alertas inteligentes</h2>
              </div>

              <span className="alert-count">
                {dashboardData.alerts.length} alertas
              </span>
            </div>

            <div className="alert-list">
              {dashboardData.alerts.map((alert) => (
                <div
                  key={alert.title}
                  className={`alert ${alert.type}`}
                >
                  <div>
                    <strong>{alert.title}</strong>

                    <p>{alert.description}</p>
                  </div>

                  <span>{alert.level}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">ANÁLISE</p>
                <h2>Recomendação do Nexus</h2>
              </div>
            </div>

            <div className="recommendation">
              <h3>{dashboardData.recommendation.title}</h3>

              <p>
                {dashboardData.recommendation.description}
              </p>

              <div className="recommendation-action">
                <span>
                  {dashboardData.recommendation.actionLabel}
                </span>

                <strong>
                  {dashboardData.recommendation.action}
                </strong>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App