# FinTrack — Controle de Gastos Pessoal

## Visão geral

Sistema web de controle financeiro pessoal: o usuário cria conta, faz login, cadastra categorias de receita/despesa e lança transações. O dashboard mostra saldo, resumo de entradas x saídas e histórico.

Projeto genérico, sem vínculo com empresa real — feito para portfólio e para servir de alvo de testes automatizados com Cypress.

## Stack

- **Backend**: Node.js + Express + PostgreSQL (driver `pg`), autenticação JWT + bcrypt
- **Frontend**: React (Vite) + Tailwind CSS, SPA consumindo a API via REST
- **Banco**: PostgreSQL 16
- **Infra**: Docker + docker-compose (3 serviços: `db`, `api`, `web`)
- **Testes**: Cypress (E2E)

## Modelo de dados

**users**
| campo | tipo | obs |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text unique | |
| password_hash | text | bcrypt |
| created_at | timestamptz | |

**categories**
| campo | tipo | obs |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK -> users | |
| name | text | |
| type | enum('income','expense') | |
| color | text | hex, pra UI |
| created_at | timestamptz | |

**transactions**
| campo | tipo | obs |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK -> users | |
| category_id | uuid FK -> categories | |
| amount | numeric(12,2) | sempre positivo, sinal vem de `type` da categoria |
| description | text | |
| occurred_at | date | data do lançamento |
| created_at | timestamptz | |

## Endpoints da API

**Auth**
- `POST /api/auth/register` — { name, email, password }
- `POST /api/auth/login` — { email, password } -> { token }
- `GET /api/auth/me` — dados do usuário logado (auth obrigatória)

**Categories** (auth obrigatória)
- `GET /api/categories`
- `POST /api/categories` — { name, type, color }
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

**Transactions** (auth obrigatória)
- `GET /api/transactions` — filtros: `?category_id=&from=&to=`
- `POST /api/transactions` — { category_id, amount, description, occurred_at }
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

**Dashboard** (auth obrigatória)
- `GET /api/dashboard/summary` — saldo total, total receitas, total despesas, período atual
- `GET /api/dashboard/by-category` — total por categoria (pro gráfico)

## Autenticação

JWT em `Authorization: Bearer <token>`, expiração 24h. Senha com bcrypt (custo 12). Middleware `authMiddleware` valida token em todas as rotas exceto `/auth/register` e `/auth/login`.

## Telas (frontend)

1. **Login** / **Registro** — formulário centralizado, validação inline
2. **Dashboard** — cards de saldo/receitas/despesas, gráfico de pizza por categoria, gráfico de linha por período
3. **Transações** — tabela com filtro por categoria/período, modal de criar/editar, confirmação de exclusão
4. **Categorias** — lista com cor e tipo, modal de criar/editar

Design: moderno, tons neutros + uma cor de destaque, cards com sombra suave, dark mode opcional.

## Docker

`docker-compose.yml` na raiz sobe:
- `db`: postgres:16, volume persistente, healthcheck
- `api`: build de `./server`, depende de `db` saudável, expõe 3001
- `web`: build de `./client`, expõe 5173, consome `api` via variável de ambiente

## Testes (Cypress)

Specs cobrindo os fluxos principais: autenticação, categorias, transações e dashboard. Nesta primeira entrega, os arquivos trazem apenas a estrutura `describe`/`it` com o nome de cada caso de teste (sem implementação), servindo de checklist para escrever os testes depois.
