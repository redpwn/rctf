import path from 'path'
import deepMerge from 'deepmerge'

// CONFIGURATION
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
process.env.API_ENDPOINT = '/api/v1'
process.env.RCTF_STATIC_PATH = path.resolve(__dirname, 'data/static')

// MOCKS

// FIXME: deal with this better
jest.mock('../src/leaderboard')

jest.mock('../src/config/load')
const configLoad = require('../src/config/load')
const realConfigLoad = jest.requireActual('../src/config/load')
const testConfigDir = path.resolve(__dirname, 'data/conf.d')
Object.assign(configLoad, realConfigLoad, {
  loadFullServerConfig: () => {
    const realCfg = realConfigLoad.loadFullServerConfig()
    const extractedHostCfg = {
      database: realCfg.database,
      tokenKey: realCfg.tokenKey
    }
    const cfg = deepMerge.all([
      realConfigLoad.defaultConfig,
      extractedHostCfg,
      ...realConfigLoad.loadFileConfigs(testConfigDir)
    ])
    return cfg
  }
})

jest.mock('pino')
const pino = require('pino')
pino.mockImplementation(opts => jest.requireActual('pino')({
  ...opts,
  level: 'silent'
}))
