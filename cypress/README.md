# FinTrack — Cypress E2E specs

Specs em `cypress/e2e/*.cy.js`. Nesta entrega, cada teste é apenas o `describe`/`it` com o nome do caso — sem implementação (`it('...')` sem callback vira um teste "pending" no Cypress/Mocha). Servem de checklist para escrever os passos depois.

Cobertura atual:

- `auth.cy.js` — registro, login, sessão/logout
- `categories.cy.js` — listar, criar, editar, excluir (incluindo o bloqueio de exclusão quando há transações vinculadas)
- `transactions.cy.js` — listar, criar, editar, excluir, filtros por categoria/data
- `dashboard.cy.js` — cards de resumo, gráficos, navegação

## Rodando

```bash
npm install
npx cypress open   # interativo
npx cypress run    # headless
```

Pré-requisito: a stack (`docker compose up`) rodando, com o frontend em `http://localhost:5173` e a API em `http://localhost:3001/api` (configurado em `cypress.config.js`).

## Convenções para quando forem implementados

- Preparar estado via API (`cy.request`) em vez de logar pela UI, exceto nos testes que testam o próprio login.
- Selecionar elementos pelos `data-testid` já presentes na UI (ver `client/README.md`).
- Nunca usar `cy.wait(ms)` fixo — preferir `cy.intercept()` + `cy.wait('@alias')` ou asserções com retry.
