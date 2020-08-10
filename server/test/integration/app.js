import getPort from 'get-port'
import got from 'got'

jest.setTimeout(30000)

test('PORT env flag', async () => {
  const PORT = await getPort()

  const old = process.env.PORT
  process.env.PORT = PORT

  require('../../src/index')

  const resp = await got(`http://localhost:${PORT}`)
  expect(resp.body !== undefined).toBe(true)

  process.env.PORT = old
})
