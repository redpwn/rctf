const test = require('ava')

const RDeployBlobProvider = require('../../../../../server/challenges/providers/rdeploy-blob')

test('get all challenges', async t => {
  let provider
  const data = await new Promise((resolve, reject) => {
    provider = new RDeployBlobProvider({
      onUpdate: resolve
      // use default options
    })
  })

  t.true(Array.isArray(data))

  provider.cleanup()
})
