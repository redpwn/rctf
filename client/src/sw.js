import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw'
import { clientsClaim } from 'workbox-core'

setupRouting()
setupPrecaching(getFiles())
clientsClaim()
