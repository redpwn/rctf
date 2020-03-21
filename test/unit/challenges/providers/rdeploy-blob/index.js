const test = require('ava')

const RDeployBlobProvider = require('../../../../../dist/server/providers/challenges/rdeploy-blob')

test('get all challenges', async t => {
  let provider
  const data = await Promise.race([new Promise((resolve, reject) => {
    provider = new RDeployBlobProvider({
      onUpdate: resolve
      // use default options
    })
  }), new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('Timed out')), 1000)
  )])

  t.true(Array.isArray(data))

  provider.cleanup()
})
