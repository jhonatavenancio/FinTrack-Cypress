const SENHA_PADRAO = 'Senha1234'

function credenciaisConfiguradas() {
  return {
    email: Cypress.env('testUserEmail'),
    password: Cypress.env('testUserPassword'),
  }
}

Cypress.Commands.add('criarUsuarioDeTeste', (dados = {}) => {
  const usuario = {
    name: 'Usuario Cypress',
    email: `cypress-${Date.now()}-${Cypress._.random(100000, 999999)}@teste.local`,
    password: SENHA_PADRAO,
    ...dados,
  }

  return cy
    .request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/register`,
      body: usuario,
    })
    .then(() => usuario)
})

Cypress.Commands.add('garantirUsuarioTeste', () => {
  const usuario = {
    name: 'QA Cypress',
    ...credenciaisConfiguradas(),
  }

  return cy
    .request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: credenciaisConfiguradas(),
      failOnStatusCode: false,
    })
    .then((resposta) => {
      if (resposta.status === 200) return { ...usuario, token: resposta.body.token }

      expect(resposta.status).to.eq(401)
      return cy
        .request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/auth/register`,
          body: usuario,
        })
        .then((cadastro) => ({ ...usuario, token: cadastro.body.token }))
    })
})

Cypress.Commands.add('autenticarPorApi', (rota = '/') => {
  cy.session('usuario-cypress', () => {
    cy.garantirUsuarioTeste().then(({ token }) => {
      cy.visit('/', {
        onBeforeLoad(window) {
          window.localStorage.setItem('fintrack_token', token)
        },
      })
    })
  })

  return cy.visit(rota)
})
