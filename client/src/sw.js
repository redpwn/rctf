import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

setupRouting()
setupPrecaching(getFiles())
clientsClaim()

registerRoute(
  ({ url }) => url.pathname === '/api/v1/challs',
  new NetworkFirst()
)
