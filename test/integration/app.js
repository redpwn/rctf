const getPort = require('get-port')
const got = require('got')
const test = require('ava')
const path = require('path')
const request = require('supertest')
const { reloadModule } = require('../../dist/server/util')

test.serial('PORT env flag', async t => {
  const PORT = await getPort()

  const old = process.env.PORT
  process.env.PORT = PORT

  require(path.join(__dirname, '/../../dist/server/index'))

  const resp = await got(`http://localhost:${PORT}`)
  t.true(resp.body !== undefined)

  process.env.PORT = old
})

test.serial('TEST_COMPRESSION env flag', async t => {
  const old = process.env.TEST_COMPRESSION
  process.env.TEST_COMPRESSION = '1'

  const resp = await request(reloadModule(path.join(__dirname, '/../../dist/server/app')))
    .get('/favicon.ico')
    .expect('Content-Encoding', /gzip/)

  t.true(resp.body !== undefined)

  process.env.TEST_COMPRESSION = old
  reloadModule(path.join(__dirname, '/../../dist/server/app'))
})
