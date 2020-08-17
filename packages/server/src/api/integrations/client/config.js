import clientConfig from '../../../config/client'
import { responses } from '../../../responses'

export default {
  method: 'GET',
  path: '/integrations/client/config',
  requireAuth: false,
  handler: async () => {
    return [responses.goodClientConfig, clientConfig]
  }
}
