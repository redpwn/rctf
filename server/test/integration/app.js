import getPort from 'get-port'
import got from 'got'
import path from 'path'

jest.setTimeout(30000)

test('PORT env flag', async () => {
  jest.unmock('../../src/config/load')

  const PORT = await getPort()

  const old = process.env.PORT
  process.env.PORT = PORT

  require(path.join(__dirname, '/../../src/index'))

  const resp = await got(`http://localhost:${PORT}`)
  expect(resp.body !== undefined).toBe(true)

  process.env.PORT = old
})
