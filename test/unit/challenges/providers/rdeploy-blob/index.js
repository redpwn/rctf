const test = require('ava')

const app = require('express')()
const { init } = require('../../../../../dist/server/uploads')
// RDeployBlob has a dependency on file upload, we should initalize just in case
init(app)

const RDeployBlobProvider = require('../../../../../dist/server/providers/challenges/rdeploy-blob').default

test('get all challenges', async t => {
  let provider
  const data = await Promise.race([new Promise((resolve, reject) => {
    provider = new RDeployBlobProvider({
      rDeployDirectory: '.rdeploy',
      rDeployFiles: 'files',
      updateInterval: 60 * 1000
    })
    provider.on('update', resolve)
    provider.on('error', reject)
  }), new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('Timed out')), 1000)
  )])

  t.true(Array.isArray(data))

  provider.cleanup()
})
