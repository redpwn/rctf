import { integrationsClientConfigGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import clientConfig from '../../../config/client'

export default makeFastifyRoute(
  integrationsClientConfigGet,
  async ({ res }) => {
    return res.goodClientConfig(clientConfig)
  }
)
