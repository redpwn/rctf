import { adminChallsGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { getAllChallenges } from '../../../challenges'

export default makeFastifyRoute(adminChallsGet, async ({ res }) => {
  const challs = getAllChallenges()
  return res.goodAdminChallenges(challs)
})
