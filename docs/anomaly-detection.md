# Nexus — Anomaly Detection Engine

## 1. Objetivo

O **Anomaly Detection Engine** é responsável por analisar as métricas geradas pelo Nexus e identificar comportamentos que ultrapassem limites previamente definidos.

Nesta primeira versão, a detecção utiliza regras determinísticas e thresholds configurados.

O objetivo desta etapa não é utilizar inteligência artificial, mas estabelecer uma camada confiável de detecção que posteriormente poderá fornecer contexto para o módulo de IA.

---

## 2. Fluxo

```text
Eventos
   ↓
Event Store
   ↓
Metrics Engine
   ↓
Anomaly Detection Engine
   ↓
Alertas
```

O detector recebe as métricas calculadas pelo `Metrics Engine` e verifica se determinados indicadores ultrapassaram os limites definidos.

---

## 3. Métricas analisadas

### Taxa de abandono de carrinho

A taxa é calculada utilizando:

```text
carrinhos abandonados
─────────────────────── × 100
checkouts iniciados
```

Limites atuais:

| Taxa  | Nível    |
| ----- | -------- |
| ≥ 50% | Warning  |
| ≥ 70% | Critical |

---

### Taxa de falha de pagamento

A primeira versão considera:

```text
pagamentos recusados
─────────────────────────────── × 100
pedidos + pagamentos recusados
```

Limites atuais:

| Taxa  | Nível    |
| ----- | -------- |
| ≥ 10% | Warning  |
| ≥ 20% | Critical |

---

## 4. Estrutura dos alertas

Cada alerta produzido pelo Nexus possui informações estruturadas:

```text
type
title
description
level
metric
value
threshold
```

Exemplo:

```json
{
  "type": "payment_failure",
  "title": "Aumento nas falhas de pagamento",
  "level": "warning",
  "metric": "paymentFailureRate",
  "value": 15.38,
  "threshold": 10
}
```

Isso permite que diferentes partes do sistema consumam os alertas de maneira consistente.

---

## 5. Endpoint

Foi criado o endpoint:

```text
GET /api/alerts
```

Exemplo:

```json
{
  "success": true,
  "total": 1,
  "alerts": [
    {
      "type": "payment_failure",
      "title": "Aumento nas falhas de pagamento",
      "description": "A proporção de falhas de pagamento está acima do nível esperado.",
      "level": "warning",
      "metric": "paymentFailureRate",
      "value": 15.38,
      "threshold": 10
    }
  ]
}
```

---

## 6. Teste realizado

Após a execução do simulador de e-commerce, o Nexus apresentou:

```text
Total de eventos: 48

Produtos visualizados: 20
Checkouts iniciados: 14
Pedidos criados: 11
Pagamentos recusados: 2
Carrinhos abandonados: 1

Faturamento: R$ 3.091,59
```

O sistema identificou:

```text
Tipo: payment_failure
Nível: warning
Taxa: 15,38%
Limite: 10%
```

A taxa foi calculada como:

```text
2 / (11 + 2) × 100 = 15,38%
```

Como o resultado ultrapassou o limite de 10%, o Nexus gerou automaticamente um alerta `warning`.

---

## 7. Problema encontrado durante o desenvolvimento

Na primeira versão do simulador, os eventos eram gerados de maneira completamente aleatória.

Isso permitiu uma situação inconsistente:

```text
Checkouts iniciados: 2
Carrinhos abandonados: 3
```

Consequentemente:

```text
3 / 2 × 100 = 150%
```

Embora o cálculo matemático estivesse correto, o resultado não representava adequadamente uma jornada de e-commerce.

### Correção

O simulador foi alterado para trabalhar com jornadas de clientes.

Agora o fluxo é:

```text
Produto visualizado
        ↓
Checkout iniciado
        ↓
   ┌────┼──────────┐
   ↓    ↓          ↓
Pedido Falha    Abandono
```

Um carrinho abandonado só pode ocorrer depois que o cliente iniciou o checkout.

Essa alteração tornou os dados simulados mais coerentes com o domínio do problema.

---

## 8. Limitações da primeira versão

A detecção atual utiliza thresholds fixos.

Por exemplo:

```text
paymentFailureRate >= 10%
```

gera um alerta `warning`.

Esse modelo apresenta algumas limitações.

Uma taxa de 10% pode ser normal em determinado período e anormal em outro.

Além disso, o sistema ainda não considera:

* histórico;
* sazonalidade;
* horário;
* dia da semana;
* comparação entre períodos;
* comportamento esperado de cada operação;
* correlação entre diferentes métricas.

Portanto, esta implementação representa a primeira camada de detecção do Nexus.

---

## 9. Próxima evolução

A próxima etapa será implementar análise baseada em histórico.

O Nexus deverá começar a comparar:

```text
Comportamento atual
        ↓
Comportamento histórico
        ↓
Diferença observada
        ↓
Identificação de anomalia
```

Exemplo conceitual:

```text
Taxa histórica de falha:
4%

Taxa atual:
15%

Variação:
+11 pontos percentuais
```

Nesse cenário, o Nexus poderá identificar que o problema não é apenas uma métrica acima de um threshold fixo, mas uma **mudança significativa no comportamento da operação**.

---

## 10. Evolução planejada

A arquitetura de inteligência deverá evoluir progressivamente:

```text
Thresholds
    ↓
Comparação histórica
    ↓
Detecção de anomalias
    ↓
Correlação de eventos
    ↓
Análise de causa provável
    ↓
Recomendação
    ↓
Nexus AI
```

A inteligência artificial será introduzida posteriormente, utilizando os dados e sinais produzidos pelas camadas anteriores.

---

## Status

**Event Store:** Implementado

**Metrics Engine:** Implementado

**Anomaly Detection Engine:** Implementado

**Simulador de jornadas:** Implementado

**Comparação histórica:** Próxima etapa

**Correlação de eventos:** Planejada

**Análise de causa:** Planejada

**IA generativa:** Planejada
