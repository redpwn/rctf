import { ServerConfig } from './types'
import { loadFullServerConfig } from './load'

const config: ServerConfig = loadFullServerConfig()

export default config
