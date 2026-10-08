# Nexus — Baseline Inteligente e Histórico de Métricas

## 1. Visão geral

O Nexus utiliza um histórico de métricas para estabelecer um comportamento de referência (baseline) e identificar desvios relevantes no comportamento atual da aplicação.

O objetivo é permitir que o sistema não apenas apresente métricas atuais, mas também consiga identificar quando determinados indicadores estão significativamente acima ou abaixo do comportamento histórico esperado.

---

## 2. Histórico de métricas

O Nexus registra snapshots periódicos das métricas atuais.

Cada snapshot contém:

* total de eventos;
* visualizações de produtos;
* checkouts iniciados;
* pedidos criados;
* falhas de pagamento;
* abandonos de carrinho;
* receita total;
* timestamp do registro.

Exemplo:

```json
{
  "productViews": 60,
  "checkoutsStarted": 24,
  "ordersCreated": 15,
  "paymentsFailed": 1,
  "cartsAbandoned": 5,
  "totalRevenue": 2249.85,
  "timestamp": "2026-10-06T15:30:31.188Z"
}
```

O histórico é utilizado como base para comparar o comportamento atual da aplicação.

---

## 3. Cálculo do baseline

O baseline representa o valor médio histórico de uma determinada métrica.

Para cada indicador, o Nexus calcula a média dos snapshots históricos disponíveis.

Exemplo:

```text
Snapshots históricos:

10
20
30
40

Baseline:

25
```

O valor atual é então comparado com esse baseline.

---

## 4. Desvio percentual

O sistema calcula a diferença percentual entre o valor atual e o baseline.

A comparação permite identificar o quanto o comportamento atual está distante do comportamento histórico.

Exemplo:

```text
Baseline: 100
Atual: 70

Desvio: -30%
```

Um desvio negativo representa uma queda em relação ao comportamento histórico.

Um desvio positivo representa um aumento.

---

## 5. Direção da métrica

Uma das decisões importantes na implementação foi considerar que nem toda métrica possui o mesmo significado quando aumenta ou diminui.

### Métricas em que um aumento geralmente representa melhora

* `productViews`
* `checkoutsStarted`
* `ordersCreated`
* `totalRevenue`

Para essas métricas, uma queda significativa pode representar deterioração do desempenho.

### Métricas em que uma redução representa melhora

* `paymentsFailed`
* `cartsAbandoned`

Para essas métricas, uma queda em relação ao baseline não deve ser interpretada como uma anomalia negativa.

Por exemplo:

```text
Baseline de falhas de pagamento: 1,55
Atual: 0

Variação: -100%
```

Apesar da queda de 100%, o resultado é positivo para o negócio.

Por isso, o Nexus classifica esse cenário como:

```text
normal
```

O mesmo princípio é aplicado aos abandonos de carrinho.

---

## 6. Estados do baseline

O Nexus utiliza diferentes estados para representar o comportamento observado.

### normal

A métrica está dentro de uma faixa considerada aceitável.

### warning

Existe uma variação relevante, mas que ainda não representa uma situação crítica.

### critical

A variação ultrapassou um nível considerado crítico.

### insufficient_data

Ainda não existem dados atuais suficientes para realizar uma avaliação confiável.

Esse estado evita que o sistema interprete a ausência de dados como uma anomalia real.

---

## 7. Importância do estado insufficient_data

Durante os testes foi identificado um cenário importante.

Quando a API é reiniciada, os eventos e o histórico mantidos em memória são reiniciados.

Nesse cenário, o Nexus pode possuir um baseline histórico disponível, mas não possuir dados atuais suficientes para realizar uma comparação válida.

Em vez de classificar automaticamente todas as métricas como críticas, o sistema retorna:

```text
status: insufficient_data
```

Essa abordagem evita falsos positivos.

---

## 8. Teste real

Após a implementação da lógica de direção das métricas, foi realizado um teste utilizando eventos reais enviados para a API.

As métricas atuais foram:

```text
totalEvents: 5
productViews: 2
checkoutsStarted: 1
ordersCreated: 2
paymentsFailed: 0
cartsAbandoned: 0
totalRevenue: 449.80
```

O baseline calculado foi:

```text
productViews: 33.36
checkoutsStarted: 14.00
ordersCreated: 7.09
paymentsFailed: 1.55
cartsAbandoned: 5.09
totalRevenue: 1122.56
```

Resultado:

```text
productViews      -94.01%  critical
checkoutsStarted  -92.86%  critical
ordersCreated     -71.79%  critical
paymentsFailed   -100.00%  normal
cartsAbandoned   -100.00%  normal
totalRevenue      -59.93%  critical
```

---

## 9. Resultado da correção

Antes da correção, métricas como `paymentsFailed` e `cartsAbandoned` podiam ser classificadas incorretamente como críticas quando seus valores estavam abaixo do baseline.

Isso gerava uma interpretação incorreta:

```text
paymentsFailed: 0
baseline: 1.55
desvio: -100%
status: critical
```

Após considerar a direção de cada métrica, o mesmo cenário passou a ser interpretado corretamente:

```text
paymentsFailed: 0
baseline: 1.55
desvio: -100%
status: normal
```

O mesmo comportamento foi validado para `cartsAbandoned`.

---

## 10. Benefício para o sistema

A utilização de baseline histórico permite que o Nexus evolua de uma simples apresentação de métricas para uma camada de análise de comportamento.

O sistema passa a responder não apenas:

> "Qual é o valor atual?"

mas também:

> "O valor atual está dentro do comportamento esperado?"

Essa abordagem cria a base para futuras funcionalidades de observabilidade, detecção de anomalias e análise de possíveis causas.

---

## 11. Próximos passos

A próxima evolução planejada é utilizar a relação entre diferentes métricas para identificar possíveis causas de uma anomalia.

Por exemplo:

```text
Queda de pedidos
       ↓
Queda de checkouts
       ↓
Queda de visualizações
       ↓
Queda de receita
```

A partir dessas relações, o Nexus poderá evoluir de uma simples detecção de anomalias para uma análise de possíveis causas e impactos no funil de negócio.
