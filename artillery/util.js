'use strict'

module.exports = {
  generateRandomData
}

// Make sure to "npm install faker" first.
const Faker = require('faker')

function generateRandomData (userContext, events, done) {
  const name = `${Faker.name.firstName()} ${Math.random()}`
  const email = `${Math.random()}${Faker.internet.exampleEmail()}`

  userContext.vars.name = name
  userContext.vars.email = email

  const pid = Math.floor(100 * Math.random())
  userContext.vars.pid = encodeURIComponent(`pwn/test-challenge-${pid}`)

  return done()
}
