const getPort = require('get-port')
const got = require('got')
const test = require('ava')
const path = require('path')

test.serial('PORT env flag', async t => {
  const PORT = await getPort()

  const old = process.env.PORT
  process.env.PORT = PORT

  require(path.join(__dirname, '/../../dist/server/index'))

  const resp = await got(`http://localhost:${PORT}`)
  t.true(resp.body !== undefined)

  process.env.PORT = old
})
