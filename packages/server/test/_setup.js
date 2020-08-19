import path from 'path'

// CONFIGURATION
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })
process.env.API_ENDPOINT = '/api/v1'
process.env.RCTF_STATIC_PATH = path.resolve(__dirname, 'data/static')

// MOCKS

// FIXME: deal with this better
jest.mock('../src/leaderboard')

// Patch config loading to load test config, but pick critical keys out of
// current environment
const mockTestConfigDir = path.resolve(__dirname, 'data/rctf.d')
jest.mock('../src/config/load', () => {
  const deepMerge = jest.requireActual('deepmerge')
  const realConfigLoad = jest.requireActual('../src/config/load')
  return {
    ...realConfigLoad,
    loadFullServerConfig: () => {
      const realCfg = realConfigLoad.loadFullServerConfig()
      const extractedHostCfg = {
        database: realCfg.database,
        tokenKey: realCfg.tokenKey,
      }
      const cfg = deepMerge.all([
        realConfigLoad.defaultConfig,
        extractedHostCfg,
        ...realConfigLoad.loadFileConfigs(mockTestConfigDir),
      ])
      return cfg
    },
  }
})

jest.mock('pino')
const pino = require('pino')
pino.mockImplementation(opts =>
  jest.requireActual('pino')({
    ...opts,
    level: 'silent',
  })
)
