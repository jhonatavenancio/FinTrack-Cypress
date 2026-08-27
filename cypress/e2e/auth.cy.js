import { faker } from '@faker-js/faker'
import authPage from '../pages/AuthPage'
import categoriesPage from '../pages/CategoriesPage'
import dashboardPage from '../pages/DashboardPage'

const usuarioConfigurado = () => ({
  email: Cypress.env('testUserEmail'),
  password: Cypress.env('testUserPassword'),
})

const novoUsuario = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: 'teste.local' }).toLowerCase(),
  password: `Aa1${faker.string.alphanumeric({ length: 12, casing: 'mixed' })}`,
})

describe('Autenticacao - API', () => {
  let usuarioAutenticado

  before(() => {
    cy.garantirUsuarioTeste().then((usuario) => {
      usuarioAutenticado = usuario
    })
  })

  describe('POST /api/auth/register', () => {
    it('cadastra usuario com dados validos', () => {
      const usuario = novoUsuario()

      cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, usuario).then((resposta) => {
        expect(resposta.status).to.eq(201)
        expect(resposta.body.token).to.be.a('string').and.not.be.empty
        expect(resposta.body.user).to.include({ name: usuario.name, email: usuario.email })
      })
    })

    it('recusa e-mail ja cadastrado', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/register`,
        body: { name: 'QA Cypress', ...usuarioConfigurado() },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.eq(409)
        expect(resposta.body.error).to.eq('An account with this email already exists')
      })
    })

    it('valida senha sem numero', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/register`,
        body: { ...novoUsuario(), password: 'senhasemnumero' },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.eq(400)
        expect(resposta.body.details.password).to.eq('password must contain at least one letter and one number')
      })
    })

    it('valida formato de e-mail invalido', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/register`,
        body: { ...novoUsuario(), email: 'e-mail-invalido' },
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.eq(400)
        expect(resposta.body.details.email).to.eq('a valid email is required')
      })
    })
  })

  describe('POST /api/auth/login', () => {
    it('autentica com as credenciais do .env', () => {
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, usuarioConfigurado()).then((resposta) => {
        expect(resposta.status).to.eq(200)
        expect(resposta.body.token).to.be.a('string').and.not.be.empty
        expect(resposta.body.user.email).to.eq(usuarioConfigurado().email)
      })
    })

    it('recusa senha incorreta', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        body: { ...usuarioConfigurado(), password: 'SenhaIncorreta123' },
        failOnStatusCode: false,
      }).its('status').should('eq', 401)
    })

    it('recusa conta inexistente', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        body: { email: 'inexistente@teste.local', password: 'Senha1234' },
        failOnStatusCode: false,
      }).its('status').should('eq', 401)
    })

    it('valida campos obrigatorios', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        body: {},
        failOnStatusCode: false,
      }).then((resposta) => {
        expect(resposta.status).to.eq(400)
        expect(resposta.body.error).to.eq('email and password are required')
      })
    })
  })

  describe('GET /api/auth/me', () => {
    it('retorna o usuario do token valido', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/auth/me`,
        headers: { Authorization: `Bearer ${usuarioAutenticado.token}` },
      }).then((resposta) => {
        expect(resposta.status).to.eq(200)
        expect(resposta.body.user.email).to.eq(usuarioConfigurado().email)
      })
    })

    it('recusa requisicao sem token', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/auth/me`,
        failOnStatusCode: false,
      }).its('status').should('eq', 401)
    })
  })
})

describe('Autenticacao - Interface', () => {
  const usuario = { id: 'usuario-cypress', name: 'QA Cypress', ...usuarioConfigurado() }

  function simularSessaoValida() {
    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { user: usuario } }).as('buscarUsuario')
  }

  function simularDadosPainel() {
    cy.intercept('GET', '**/api/dashboard/summary', {
      statusCode: 200,
      body: { total_income: 0, total_expense: 0, balance: 0 },
    }).as('resumoPainel')
    cy.intercept('GET', '**/api/dashboard/by-category', { statusCode: 200, body: { categories: [] } }).as('categoriasPainel')
    cy.intercept('GET', '**/api/transactions', { statusCode: 200, body: { transactions: [] } }).as('transacoesPainel')
  }

  function simularLoginValido() {
    cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: { token: 'token-cypress', user: usuario } }).as('login')
    simularSessaoValida()
    simularDadosPainel()
  }

  beforeEach(() => {
    authPage.visitarLogin()
  })

  it('faz login com e-mail e senha do .env', () => {
    simularLoginValido()
    cy.reload()

    authPage.fazerLogin(usuario)

    cy.wait('@login')
    cy.wait('@buscarUsuario')
    cy.location('pathname').should('eq', '/')
  })

  it('exibe erro para senha incorreta', () => {
    cy.intercept('POST', '**/api/auth/login', { statusCode: 401, body: { error: 'Invalid email or password' } }).as('loginInvalido')

    authPage.fazerLogin({ ...usuario, password: 'SenhaIncorreta123' })

    cy.wait('@loginInvalido')
    authPage.erroLogin().should('contain', 'E-mail ou senha inválidos.')
    cy.location('pathname').should('eq', '/login')
  })

  it('nao envia login com campos vazios', () => {
    cy.intercept('POST', '**/api/auth/login').as('login')

    authPage.enviarLogin()

    cy.get('@login.all').should('have.length', 0)
  })

  it('cadastra um usuario pela interface', () => {
    const novo = novoUsuario()
    cy.intercept('POST', '**/api/auth/register', { statusCode: 201, body: { token: 'token-cypress', user: novo } }).as('cadastro')
    cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: { token: 'token-cypress', user: novo } }).as('login')
    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { user: novo } }).as('buscarUsuario')
    simularDadosPainel()

    authPage.visitarCadastro()
    authPage.cadastrar(novo)

    cy.wait('@cadastro')
    cy.wait('@login')
    cy.location('pathname').should('eq', '/')
  })

  it('redireciona rota protegida sem sessao para login', () => {
    categoriesPage.visitar()
    cy.location('pathname').should('eq', '/login')
  })

  it('encerra a sessao ao clicar em Sair', () => {
    simularSessaoValida()
    simularDadosPainel()
    dashboardPage.visitarComToken('token-cypress')
    cy.wait('@buscarUsuario')
    cy.wait('@resumoPainel')
    cy.wait('@categoriasPainel')
    cy.wait('@transacoesPainel')

    authPage.sair()

    cy.location('pathname').should('eq', '/login')
  })
})
