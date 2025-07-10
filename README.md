# 🐔 BUNrinha 2025

Implementação do desafio da **Rinha de Backend 2025** utilizando **Bun (v1.2)**, com foco em desempenho, usando workers e Redis para processamento assíncrono.

> Repositório oficial da Rinha de Backend: [zanfranceschi/rinha-de-backend-2025](https://github.com/zanfranceschi/rinha-de-backend-2025)

## 🔥 Descrição

Esta solução implementa uma API HTTP com dois endpoints principais e um para facilitar os testes:

- `POST /payments`: recebe requisições de pagamento e as encaminha para o Payment Processor mais adequado (`default` ou `fallback`), priorizando menor taxa e maior disponibilidade de acordo com health-check e salvando no Redis para rastreio.
- `GET /payments-summary`: retorna o resumo dos pagamentos processados entre dois períodos (default vs fallback).
- `POST /admin/reset`: reseta Redis (queue e data)

## ⚙️ Tecnologias Utilizadas

* Linguagem: **Bun 1.2**
* Web server: **Elysia**
* Persistência: **Redis**
* Comunicação com Processadores: HTTP via `fetch`
* Orquestração: **Docker Compose**

## 🧪 Endpoints

### POST /payments

```json
{
  "correlationId": "uuid-1234",
  "amount": 19.90
}
```

Resposta:

```json
{
  "message": "Accepted",
  "processor": "default"
}
```

### GET /payments-summary

Query params:

* `from` (opcional)
* `to` (opcional)

Resposta:

```json
{
  "default": {
    "totalRequests": 10,
    "totalAmount": 199.0
  },
  "fallback": {
    "totalRequests": 2,
    "totalAmount": 39.8
  }
}
```

### POST /admin/reset

Resposta:

```json
{
	"message": "Reset done"
}
```
