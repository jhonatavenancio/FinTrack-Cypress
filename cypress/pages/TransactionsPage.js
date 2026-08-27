class TransactionsPage {
  visitar() {
    cy.visit('/transacoes')
  }

  novaTransacao() {
    cy.get('[data-testid="add-transaction-btn"]').click()
  }

  linhas() {
    return cy.get('[data-testid="transaction-row"]')
  }

  estadoVazio() {
    return cy.contains('Nenhuma transação encontrada.')
  }

  filtros() {
    return cy.get('[data-testid="transaction-filters"]')
  }

  filtroCategoria() {
    return cy.get('[data-testid="filter-category"]')
  }

  filtroInicial() {
    return cy.get('[data-testid="filter-from"]')
  }

  filtroFinal() {
    return cy.get('[data-testid="filter-to"]')
  }

  erro() {
    return cy.get('p.text-red-600')
  }

  editarPrimeira() {
    this.linhas().first().find('[data-testid="edit-transaction-btn"]').click()
  }

  excluirPrimeira() {
    this.linhas().first().find('[data-testid="delete-transaction-btn"]').click()
  }

  preencherFormulario({ categoryId, amount, description, occurredAt }) {
    cy.contains('h3', /transação/).closest('form').within(() => {
      if (categoryId) cy.get('select').select(categoryId)
      if (amount !== undefined) cy.get('input[type="number"]').clear().type(String(amount))
      if (description !== undefined) cy.get('input').eq(1).clear().type(description)
      if (occurredAt) cy.get('input[type="date"]').clear().type(occurredAt)
    })
  }

  salvar() {
    cy.contains('h3', /transação/).closest('form').contains('button', 'Salvar').click()
  }

  cancelar() {
    cy.contains('h3', /transação/).closest('form').contains('button', 'Cancelar').click()
  }

  filtrarPorCategoria(categoryId) {
    cy.get('[data-testid="filter-category"]').select(categoryId)
  }

  filtrarPorPeriodo(de, ate) {
    cy.get('[data-testid="filter-from"]').clear().type(de)
    cy.get('[data-testid="filter-to"]').clear().type(ate)
  }

  confirmarExclusao() {
    cy.contains('h3', 'Excluir transação').parent().contains('button', 'Excluir').click()
  }

  cancelarExclusao() {
    cy.contains('h3', 'Excluir transação').parent().contains('button', 'Cancelar').click()
  }
}

export default new TransactionsPage()
