class CategoriesPage {
  visitar() {
    cy.visit('/categorias')
  }

  novaCategoria() {
    cy.get('[data-testid="add-category-btn"]').click()
  }

  linhas() {
    return cy.get('[data-testid="category-row"]')
  }

  estadoVazio() {
    return cy.contains('Nenhuma categoria cadastrada ainda.')
  }

  erro() {
    return cy.get('p.text-red-600')
  }

  editarPrimeira() {
    this.linhas().first().find('[data-testid="edit-category-btn"]').click()
  }

  excluirPrimeira() {
    this.linhas().first().find('[data-testid="delete-category-btn"]').click()
  }

  preencherFormulario({ name, type = 'expense', color = '#6366f1' }) {
    cy.contains('h3', /categoria/).closest('form').within(() => {
      cy.get('input').first().clear().type(name)
      cy.contains('button', type === 'income' ? 'Receita' : 'Despesa').click()
      cy.get('input[type="color"]').invoke('val', color).trigger('input').trigger('change')
    })
  }

  salvar() {
    cy.contains('h3', /categoria/).closest('form').contains('button', 'Salvar').click()
  }

  cancelar() {
    cy.contains('h3', /categoria/).closest('form').contains('button', 'Cancelar').click()
  }

  confirmarExclusao() {
    cy.contains('h3', 'Excluir categoria').parent().contains('button', 'Excluir').click()
  }

  cancelarExclusao() {
    cy.contains('h3', 'Excluir categoria').parent().contains('button', 'Cancelar').click()
  }
}

export default new CategoriesPage()
