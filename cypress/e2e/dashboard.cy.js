import dashboardPage from '../pages/DashboardPage'

describe('Painel - API', () => {
  let token
  const api = (path) => cy.request({
    url: `${Cypress.env('apiUrl')}${path}`,
    headers: { Authorization: `Bearer ${token}` },
  })

  before(() => cy.garantirUsuarioTeste().then((usuario) => { token = usuario.token }))

  it('retorna resumo com receitas, despesas e saldo numericos', () => {
    api('/dashboard/summary').then(({ body }) => {
      expect(body.total_income).to.be.a('number')
      expect(body.total_expense).to.be.a('number')
      expect(body.balance).to.eq(body.total_income - body.total_expense)
    })
  })

  it('retorna categorias agrupadas por transacoes', () => {
    api('/dashboard/by-category').its('body.categories').should('be.an', 'array')
  })
})

describe('Painel - Interface', () => {
  beforeEach(() => cy.autenticarPorApi('/'))

  it('exibe os cards de saldo, receitas e despesas', () => {
    dashboardPage.cardSaldo().should('be.visible')
    dashboardPage.cardReceitas().should('be.visible')
    dashboardPage.cardDespesas().should('be.visible')
  })

  it('exibe os graficos do painel', () => {
    dashboardPage.graficoPorCategoria().should('be.visible')
    dashboardPage.graficoTendencia().should('be.visible')
  })

  it('navega para transacoes e categorias pela barra lateral', () => {
    dashboardPage.navegarPara('transações')
    cy.location('pathname').should('eq', '/transacoes')
    dashboardPage.navegarPara('categorias')
    cy.location('pathname').should('eq', '/categorias')
  })
})
