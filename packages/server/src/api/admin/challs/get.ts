import { adminChallsIdGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { getChallenge } from '../../../challenges'

export default makeFastifyRoute(adminChallsIdGet, async ({ req, res }) => {
  const chall = getChallenge(req.params.id)

  if (!chall) {
    return res.badChallenge()
  }

  return res.goodAdminChallenge(chall)
})
