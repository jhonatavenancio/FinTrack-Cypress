const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    apiUrl: 'http://localhost:3001/api',
    testUserEmail: process.env.CYPRESS_TEST_USER_EMAIL,
    testUserPassword: process.env.CYPRESS_TEST_USER_PASSWORD,
  },
})
