const test = require('ava')

const RDeployBlobProvider = require('../../../../../dist/server/providers/challenges/rdeploy-blob').default

test('get all challenges', async t => {
  let provider
  const data = await Promise.race([new Promise((resolve, reject) => {
    provider = new RDeployBlobProvider() // use default options
    provider.on('update', resolve)
    provider.on('error', reject)
  }), new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('Timed out')), 1000)
  )])

  t.true(Array.isArray(data))

  provider.cleanup()
})
