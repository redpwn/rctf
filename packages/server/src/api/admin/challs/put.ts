import { adminChallsIdPut } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { updateChallenge } from '../../../challenges'
import { setChallsDirty } from '../../../cache/leaderboard'

export default makeFastifyRoute(adminChallsIdPut, async ({ req, res }) => {
  const chall = {
    ...req.body.data,
    // Ensure id is consistent
    id: req.params.id,
  }

  await updateChallenge(chall)
  if (chall.points !== undefined) {
    await setChallsDirty()
  }

  return res.goodChallengeUpdate(chall)
})
