import { adminChallsIdDelete } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { deleteChallenge } from '../../../challenges'
import { setChallsDirty } from '../../../cache/leaderboard'

export default makeFastifyRoute(adminChallsIdDelete, async ({ req, res }) => {
  await deleteChallenge(req.params.id)

  await setChallsDirty()

  return res.goodChallengeDelete()
})
