export type AlertType = 'critical' | 'warning' | 'info'

export interface Metric {
  label: string
  value: string
  variation: string
}

export interface Alert {
  title: string
  description: string
  level: string
  type: AlertType
}

export interface Recommendation {
  title: string
  description: string
  actionLabel: string
  action: string
}

export interface DashboardData {
  metrics: {
    revenue: Metric
    orders: Metric
    conversion: Metric
    cartAbandonment: Metric
  }

  alerts: Alert[]

  recommendation: Recommendation
}

export const dashboardData: DashboardData = {
  metrics: {
    revenue: {
      label: 'Faturamento',
      value: 'R$ 128.450',
      variation: '+12,4% no período',
    },

    orders: {
      label: 'Pedidos',
      value: '1.284',
      variation: '+8,7% no período',
    },

    conversion: {
      label: 'Conversão',
      value: '3,82%',
      variation: '+0,6% no período',
    },

    cartAbandonment: {
      label: 'Abandono de carrinho',
      value: '68,4%',
      variation: 'Monitoramento ativo',
    },
  },

  alerts: [
    {
      title: 'Queda na conversão',
      description:
        'A taxa de conversão apresentou redução nas últimas horas.',
      level: 'Alta',
      type: 'critical',
    },

    {
      title: 'Aumento no abandono',
      description:
        'O abandono de carrinho está acima do comportamento esperado.',
      level: 'Média',
      type: 'warning',
    },

    {
      title: 'Volume de pedidos',
      description:
        'O volume de pedidos apresentou crescimento acima da média.',
      level: 'Info',
      type: 'info',
    },
  ],

  recommendation: {
    title: 'Investigar etapa de checkout',

    description:
      'Os dados simulados indicam aumento no abandono de carrinho acompanhado de queda na conversão.',

    actionLabel: 'Próxima ação sugerida',

    action: 'Verificar o fluxo de checkout',
  },
}