import { authTestGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'

export default makeFastifyRoute(authTestGet, async ({ res }) => {
  return res.goodToken()
})
