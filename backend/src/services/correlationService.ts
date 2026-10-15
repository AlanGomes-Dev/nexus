
import { NexusMetrics } from './metricsService.js'
import { AlertLevel } from './anomalyDetectionService.js'
import { BaselineResult } from './baselineService.js'

export interface NexusCorrelation {
  type: string
  title: string
  description: string
  level: AlertLevel
  signals: string[]
  recommendation: string
}

export function detectCorrelations(
  metrics: NexusMetrics,
  baseline: BaselineResult[],
): NexusCorrelation[] {
  const correlations: NexusCorrelation[] = []

  const getBaseline = (metric: keyof NexusMetrics) =>
    baseline.find((item) => item.metric === metric)

  const productViews = getBaseline('productViews')
  const checkoutsStarted = getBaseline('checkoutsStarted')
  const ordersCreated = getBaseline('ordersCreated')
  const paymentsFailed = getBaseline('paymentsFailed')
  const cartsAbandoned = getBaseline('cartsAbandoned')

  const hasSufficientData = baseline.every(
    (item) => item.status !== 'insufficient_data',
  )

  if (!hasSufficientData) {
    return correlations
  }

  const funnelDegraded =
    productViews?.status === 'critical' &&
    checkoutsStarted?.status === 'critical' &&
    ordersCreated?.status === 'critical'

  if (funnelDegraded) {
    correlations.push({
      type: 'funnel_degradation',
      title: 'Degradação no funil de vendas',
      description:
        'Visualizações, checkouts e pedidos apresentam desvios críticos simultaneamente.',
      level: 'critical',
      signals: [
        'Queda crítica nas visualizações de produtos',
        'Queda crítica nos checkouts iniciados',
        'Queda crítica nos pedidos criados',
      ],
      recommendation:
        'Investigue o tráfego, a navegação dos produtos e as etapas do checkout para localizar possíveis pontos de perda.',
    })
  }

  const paymentIssue =
    paymentsFailed?.status === 'critical' &&
    metrics.paymentsFailed > 0 &&
    (
      ordersCreated?.status === 'critical' ||
      metrics.paymentsFailed >= 2
    )

  if (paymentIssue) {
    correlations.push({
      type: 'payment_issue',
      title: 'Possível problema no fluxo de pagamento',
      description:
        'Foram detectadas falhas de pagamento críticas, acompanhadas de queda nos pedidos ou de falhas repetidas.',
      level: 'critical',
      signals: [
        `Falhas de pagamento: ${metrics.paymentsFailed}`,
        `Pedidos criados: ${metrics.ordersCreated}`,
        ...(ordersCreated?.status === 'critical'
          ? ['Queda crítica nos pedidos criados']
          : ['Falhas de pagamento repetidas exigem investigação']),
      ],
      recommendation:
        'Verifique os registros de erro, a integração com o provedor de pagamento e o processamento dos pedidos. Confirme a causa antes de concluir que há uma falha sistêmica.',
    })
  }

  const cartAbandonment =
    cartsAbandoned?.status === 'critical' &&
    ordersCreated?.status === 'critical' &&
    metrics.cartsAbandoned > 0

  if (cartAbandonment) {
    correlations.push({
      type: 'cart_abandonment',
      title: 'Possível gargalo na conversão do carrinho',
      description:
        'O abandono de carrinhos aumentou enquanto a criação de pedidos ficou abaixo da referência.',
      level: 'critical',
      signals: [
        `Carrinhos abandonados: ${metrics.cartsAbandoned}`,
        'Aumento crítico nos carrinhos abandonados',
        'Queda crítica nos pedidos criados',
      ],
      recommendation:
        'Analise as etapas finais da compra, os custos apresentados, a experiência de checkout e possíveis erros de navegação.',
    })
  }

  return correlations
}
