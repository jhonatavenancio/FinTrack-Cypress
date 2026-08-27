import categoriesPage from '../pages/CategoriesPage'
import { novaCategoria } from '../support/factories'

describe('Categorias - API', () => {
  let token
  const api = (method, path, body, failOnStatusCode = true) => cy.request({ method, url: `${Cypress.env('apiUrl')}${path}`, body, failOnStatusCode, headers: { Authorization: `Bearer ${token}` } })

  before(() => cy.garantirUsuarioTeste().then((usuario) => { token = usuario.token }))

  it('cria, atualiza, lista e exclui uma categoria', () => {
    const categoria = novaCategoria({ type: 'expense' })
    const atualizada = novaCategoria({ type: 'income' })
    api('POST', '/categories', categoria).then(({ body, status }) => {
      expect(status).to.eq(201)
      const { id } = body.category
      api('PUT', `/categories/${id}`, atualizada).then(({ body: resposta }) => {
        expect(resposta.category).to.include(atualizada)
        api('GET', '/categories').its('body.categories').should('deep.include', resposta.category)
        api('DELETE', `/categories/${id}`).its('status').should('eq', 204)
      })
    })
  })

  it('valida dados invalidos e categoria duplicada', () => {
    const categoria = novaCategoria()
    api('POST', '/categories', { ...categoria, name: '', type: 'invalid' }, false).its('status').should('eq', 400)
    api('POST', '/categories', categoria).then(() => {
      api('POST', '/categories', categoria, false).then(({ body, status }) => {
        expect(status).to.eq(409)
        expect(body.error).to.eq('You already have a category with this name')
      })
    })
  })
})

describe('Categorias - Interface', () => {
  beforeEach(() => cy.autenticarPorApi('/categorias'))

  it('cria uma categoria com dados do Faker', () => {
    const categoria = novaCategoria()
    categoriesPage.novaCategoria()
    categoriesPage.preencherFormulario(categoria)
    categoriesPage.salvar()
    categoriesPage.linhas().contains(categoria.name).should('be.visible')
  })

  it('valida nome obrigatorio', () => {
    categoriesPage.novaCategoria()
    categoriesPage.preencherFormulario(novaCategoria({ name: '' }))
    categoriesPage.salvar()
    categoriesPage.erro().should('contain', 'Informe um nome para a categoria.')
  })
})
