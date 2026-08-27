import { faker } from '@faker-js/faker'

export const novaCategoria = (dados = {}) => ({
  name: `${faker.commerce.department()} ${faker.number.int({ min: 1000, max: 9999 })}`,
  type: faker.helpers.arrayElement(['income', 'expense']),
  color: faker.color.rgb({ casing: 'lower', prefix: '#' }),
  ...dados,
})

export const novaTransacao = (dados = {}) => ({
  amount: faker.finance.amount({ min: 10, max: 1000, dec: 2 }),
  description: faker.commerce.productName(),
  occurredAt: faker.date.recent({ days: 30 }).toISOString().slice(0, 10),
  ...dados,
})
