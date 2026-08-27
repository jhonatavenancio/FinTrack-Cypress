class DashboardPage {
  visitar() {
    cy.visit('/')
  }

  visitarComToken(token) {
    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.setItem('fintrack_token', token)
      },
    })
  }

  cardSaldo() {
    return cy.get('[data-testid="balance-card"]')
  }

  cardReceitas() {
    return cy.get('[data-testid="income-card"]')
  }

  cardDespesas() {
    return cy.get('[data-testid="expense-card"]')
  }

  graficoPorCategoria() {
    return cy.get('[data-testid="chart-by-category"]')
  }

  graficoTendencia() {
    return cy.get('[data-testid="chart-trend"]')
  }

  navegarPara(item) {
    cy.get(`[data-testid="nav-${item}"]`).click()
  }
}

export default new DashboardPage()
