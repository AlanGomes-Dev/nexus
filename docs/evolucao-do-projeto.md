# Nexus — Evolução do Projeto

## 1. Visão do projeto

O **Nexus** é uma plataforma de inteligência para operações de e-commerce.

A proposta é monitorar eventos da operação, transformar esses eventos em métricas, identificar comportamentos anormais e, posteriormente, utilizar inteligência artificial para auxiliar na análise dos problemas e sugerir possíveis ações.

O projeto está sendo desenvolvido de forma incremental, priorizando uma arquitetura que permita evoluir de um protótipo para uma solução preparada para cenários maiores.

---

## 2. Objetivo

O objetivo do Nexus é funcionar como uma camada de inteligência sobre uma operação de e-commerce.

Em vez de apenas apresentar indicadores, o sistema deverá ser capaz de:

* receber eventos da operação;
* armazenar e organizar esses eventos;
* calcular métricas;
* identificar comportamentos fora do padrão;
* gerar alertas;
* investigar possíveis causas;
* apresentar recomendações;
* permitir acompanhamento através de um dashboard.

Fluxo conceitual:

```text
E-commerce
     ↓
Eventos
     ↓
Nexus API
     ↓
Armazenamento
     ↓
Métricas
     ↓
Detecção de anomalias
     ↓
Análise
     ↓
Recomendações
     ↓
Dashboard
```

---

# 3. Evolução do desenvolvimento

## Fase 1 — Estrutura inicial

Foi criado o repositório do projeto utilizando Git.

Estrutura inicial:

```text
Nexus/
├── frontend/
├── backend/
├── docs/
└── README.md
```

O projeto foi organizado desde o início separando frontend, backend e documentação.

---

## Fase 2 — Dashboard inicial

Foi criado o frontend utilizando:

* React
* TypeScript
* Vite

O dashboard inicial apresenta uma visão simulada da operação de um e-commerce.

Entre os indicadores apresentados estão:

* Faturamento;
* Pedidos;
* Conversão;
* Abandono de carrinho.

Também foi criada uma área de alertas e uma área de recomendações.

---

## Fase 3 — Separação dos dados da interface

Os dados simulados do dashboard foram separados da camada de apresentação.

Foi criado:

```text
frontend/
└── src/
    └── data/
        └── dashboardData.ts
```

O arquivo é responsável pelos dados utilizados inicialmente pelo dashboard, enquanto o `App.tsx` permanece responsável pela interface.

Essa separação prepara o frontend para futuramente substituir os dados simulados por informações provenientes da API.

---

## Fase 4 — Backend

Foi criado o backend utilizando:

* Node.js
* Express
* TypeScript

Estrutura inicial:

```text
backend/
└── src/
    ├── server.ts
    └── types/
        └── events.ts
```

Também foi configurado o TypeScript para gerar os arquivos compilados em:

```text
backend/dist/
```

O projeto possui comandos para desenvolvimento e build.

---

## Fase 5 — Health Check

Foi criado o endpoint:

```text
GET /api/health
```

Exemplo:

```json
{
  "status": "online",
  "service": "Nexus API",
  "version": "0.1.0"
}
```

Esse endpoint permite verificar rapidamente se a API está operacional.

---

## Fase 6 — Recebimento de eventos

Foi criado o endpoint:

```text
POST /api/events
```

O Nexus passou a receber eventos enviados por sistemas externos.

Exemplo de evento:

```json
{
  "type": "checkout_started",
  "customerId": "customer-001",
  "productId": "product-301",
  "value": 129.90
}
```

A API valida o evento e retorna uma confirmação de recebimento.

---

## Fase 7 — Tipagem dos eventos

Foi criada uma estrutura específica para representar os eventos do Nexus.

Os tipos permitem que o backend trabalhe com eventos conhecidos de maneira consistente.

Entre os eventos utilizados no desenvolvimento estão:

```text
product_viewed
checkout_started
order_created
payment_failed
cart_abandoned
```

Essa tipagem será importante para as próximas camadas de processamento.

---

## Fase 8 — Event Store

Foi criada uma primeira camada de armazenamento em memória:

```text
backend/
└── src/
    └── store/
        └── eventStore.ts
```

O Event Store permite:

* adicionar eventos;
* consultar eventos;
* contabilizar eventos recebidos.

Também foi criado:

```text
GET /api/events
```

Esse endpoint permite consultar os eventos armazenados pelo Nexus.

### Observação

Nesta fase o armazenamento é propositalmente realizado em memória.

Isso significa que os eventos são perdidos quando o processo da API é reiniciado.

A implementação foi escolhida para validar o fluxo de processamento antes da introdução de um banco de dados persistente.

---

## Fase 9 — Metrics Engine

Foi criada uma camada responsável por transformar eventos em métricas:

```text
backend/
└── src/
    └── services/
        └── metricsService.ts
```

O Metrics Engine calcula indicadores como:

* total de eventos;
* visualizações de produtos;
* checkouts iniciados;
* pedidos criados;
* pagamentos recusados;
* carrinhos abandonados;
* faturamento proveniente de pedidos registrados.

Foi criado o endpoint:

```text
GET /api/metrics
```

A partir dessa etapa, o Nexus deixa de apenas receber eventos e passa a processar informações da operação.

---

# 4. Arquitetura atual

A arquitetura atual pode ser representada da seguinte forma:

```text
┌─────────────────────┐
│      E-commerce     │
└──────────┬──────────┘
           │
           │ Eventos
           ▼
┌─────────────────────┐
│      Nexus API      │
│      Express        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Event Store      │
│    In-memory        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Metrics Engine    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Dashboard      │
│ React + TypeScript  │
└─────────────────────┘
```

---

# 5. Próximas etapas

A evolução planejada do Nexus inclui:

### Detecção de anomalias

Criar mecanismos capazes de identificar comportamentos fora do padrão esperado.

Exemplos:

* aumento incomum de abandono de carrinho;
* queda de conversão;
* aumento de pagamentos recusados;
* queda no volume de pedidos.

### Sistema de alertas

Transformar as anomalias identificadas em alertas classificados por nível de impacto.

### Análise de causa provável

Relacionar diferentes eventos para identificar possíveis relações entre problemas.

### Recomendações

Gerar sugestões de investigação e possíveis ações para o operador do e-commerce.

### Inteligência artificial

Adicionar uma camada de IA capaz de interpretar métricas, eventos e alertas e produzir análises mais contextualizadas.

### Persistência

Substituir o armazenamento em memória por uma solução persistente, permitindo trabalhar com grandes volumes históricos de eventos.

### Dashboard conectado à API

Substituir gradualmente os dados simulados do frontend por dados reais provenientes do backend.

---

# 6. Princípio de desenvolvimento

O Nexus está sendo desenvolvido de forma incremental.

Cada nova camada deve:

1. possuir uma responsabilidade clara;
2. ser testável de forma independente;
3. ser documentada;
4. ser integrada ao restante da arquitetura;
5. gerar um registro no histórico do projeto.

A intenção é manter o projeto tecnicamente evolutivo e permitir que cada etapa represente uma decisão de engenharia que possa ser demonstrada posteriormente.

---

## Status atual

**Frontend:** React + TypeScript + Vite

**Backend:** Node.js + Express + TypeScript

**Eventos:** Implementado

**Event Store:** Implementado em memória

**Metrics Engine:** Implementado

**Detecção de anomalias:** Próxima etapa

**IA:** Planejada

**Banco de dados persistente:** Planejado
