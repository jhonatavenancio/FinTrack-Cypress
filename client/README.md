# FinTrack — client

React (Vite) + Tailwind + Recharts SPA consumindo a API do FinTrack.

## Rodando localmente

```bash
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Elementos com `data-testid`

Os principais elementos interativos têm `data-testid` estável para facilitar os testes E2E com Cypress: `login-email`, `login-password`, `login-submit`, `register-*`, `nav-dashboard`/`nav-transações`/`nav-categorias`, `logout-btn`, `add-transaction-btn`, `add-category-btn`, `transaction-row`, `category-row`, `edit-*-btn`, `delete-*-btn`, `filter-category`, `filter-from`, `filter-to`, `balance-card`, `income-card`, `expense-card`.
