class AuthPage {
  visitarLogin() {
    cy.visit('/login')
  }

  visitarCadastro() {
    cy.visit('/registro')
  }

  preencherLogin({ email, password }) {
    cy.get('[data-testid="login-email"]').clear().type(email)
    cy.get('[data-testid="login-password"]').clear().type(password)
  }

  enviarLogin() {
    cy.get('[data-testid="login-submit"]').click()
  }

  fazerLogin(credenciais) {
    this.preencherLogin(credenciais)
    this.enviarLogin()
  }

  preencherCadastro({ name, email, password }) {
    cy.get('[data-testid="register-name"]').clear().type(name)
    cy.get('[data-testid="register-email"]').clear().type(email)
    cy.get('[data-testid="register-password"]').clear().type(password)
  }

  enviarCadastro() {
    cy.get('[data-testid="register-submit"]').click()
  }

  cadastrar(usuario) {
    this.preencherCadastro(usuario)
    this.enviarCadastro()
  }

  erroLogin() {
    return cy.get('[data-testid="login-error"]')
  }

  erroCadastro() {
    return cy.get('[data-testid="register-error"]')
  }

  sair() {
    cy.get('[data-testid="logout-btn"]').click()
  }
}

export default new AuthPage()
