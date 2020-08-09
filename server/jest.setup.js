require('dotenv').config()
process.env.API_ENDPOINT = '/api/v1'
process.env.RCTF_STATIC_PATH = require('path').join(__dirname, '../dist/client')

/* global jest */
// FIXME: deal with this better
jest.mock('./src/leaderboard')

jest.mock('pino')
const pino = require('pino')
pino.mockImplementation(opts => jest.requireActual('pino')({
  ...opts,
  level: 'silent'
}))
