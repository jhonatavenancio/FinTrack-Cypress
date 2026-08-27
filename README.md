# FinTrack

Aplicacao de controle financeiro pessoal criada para portfólio, com foco em testes automatizados end-to-end e de API.

O projeto permite criar conta, autenticar, organizar categorias, registrar transações e acompanhar o resumo financeiro em um painel com gráficos.

## Destaque: testes automatizados

O projeto usa **Cypress** para validar os principais fluxos da aplicação, combinando testes de API e interface.

- Autenticação: cadastro, login, sessão, logout e rotas protegidas.
- Categorias: criação, atualização, exclusão, validações e duplicidade.
- Transações: criação, atualização, filtros, validações e exclusão.
- Dashboard: cards de resumo, gráficos e navegação.
- Page Object Model: seletores e ações de interface centralizados em `cypress/pages`.
- Faker: geração de dados aleatórios para manter os testes independentes.
- Interceptações Cypress: sincronização de requisições sem `cy.wait()` fixo.

```text
cypress/
├── e2e/          # Specs de API e interface
├── pages/         # Page Objects
└── support/       # Comandos, factories e configuração global
```

## Tecnologias

- React, Vite e Tailwind CSS
- Node.js e Express
- PostgreSQL
- JWT e bcrypt
- Docker Compose
- Cypress e Faker

## Execução com Docker

```bash
cp .env.example .env
docker compose up --build
```

Defina um valor seguro para `JWT_SECRET` no `.env` antes de iniciar a aplicação.

| Serviço | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| API | `http://localhost:3001/api` |
| PostgreSQL | `localhost:5433` |

## Testes Cypress

Com a aplicação em execução, instale as dependências da raiz e execute:

```bash
npm install
npm run cypress:open
```

Para execução headless:

```bash
npm run cypress:run
```

As credenciais usadas pelos testes ficam no `.env`:

```env
CYPRESS_TEST_USER_EMAIL=qa.cypress@teste.com
CYPRESS_TEST_USER_PASSWORD=Cypress@123
```

Os testes criam a conta configurada caso ela ainda não exista. Os demais dados de teste são gerados com Faker.

## Execução sem Docker

Em terminais separados:

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Configure as variáveis de ambiente conforme os arquivos `.env.example` de cada serviço.

## Estrutura

```text
client/     # Interface React
server/     # API REST e regras de negócio
cypress/    # Automação de testes
```

## API

| Recurso | Endpoints |
| --- | --- |
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Categorias | `GET`, `POST`, `PUT`, `DELETE /api/categories` |
| Transações | `GET`, `POST`, `PUT`, `DELETE /api/transactions` |
| Dashboard | `GET /api/dashboard/summary`, `GET /api/dashboard/by-category` |
