import transactionsPage from '../pages/TransactionsPage'
import { novaCategoria, novaTransacao } from '../support/factories'

describe('Transacoes - API', () => {
  let token
  const api = (method, path, body, failOnStatusCode = true) => cy.request({ method, url: `${Cypress.env('apiUrl')}${path}`, body, failOnStatusCode, headers: { Authorization: `Bearer ${token}` } })

  before(() => cy.garantirUsuarioTeste().then((usuario) => { token = usuario.token }))

  it('cria, atualiza, filtra e exclui uma transacao', () => {
    api('POST', '/categories', novaCategoria()).then(({ body: categoria }) => {
      const transacao = novaTransacao({ category_id: categoria.category.id })
      api('POST', '/transactions', { ...transacao, occurred_at: transacao.occurredAt }).then(({ body, status }) => {
        expect(status).to.eq(201)
        const { id } = body.transaction
        const descricao = novaTransacao().description
        api('PUT', `/transactions/${id}`, { description: descricao }).its('body.transaction.description').should('eq', descricao)
        api('GET', `/transactions?category_id=${categoria.category.id}`).its('body.transactions').should('have.length.greaterThan', 0)
        api('DELETE', `/transactions/${id}`).its('status').should('eq', 204)
      })
    })
  })

  it('valida categoria e valor obrigatorios', () => {
    api('POST', '/transactions', { amount: 0 }, false).then(({ body, status }) => {
      expect(status).to.eq(400)
      expect(body.details).to.have.all.keys('category_id', 'amount')
    })
  })
})

describe('Transacoes - Interface', () => {
  beforeEach(() => cy.autenticarPorApi('/transacoes'))

  it('exibe filtros de categoria e periodo', () => {
    transactionsPage.filtros().should('be.visible')
    transactionsPage.filtroCategoria().should('be.visible')
    transactionsPage.filtroInicial().should('be.visible')
    transactionsPage.filtroFinal().should('be.visible')
  })

  it('exibe estado vazio quando nao ha transacoes para o filtro', () => {
    transactionsPage.filtrarPorPeriodo('2000-01-01', '2000-01-02')
    transactionsPage.estadoVazio().should('be.visible')
  })
})
