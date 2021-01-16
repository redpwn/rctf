import { challsIdSolvesGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getSolvesByChallId } from '../../database/solves'
import { getCleanedChallenge } from '../../challenges'
import config from '../../config/server'

export default makeFastifyRoute(challsIdSolvesGet, async ({ req, res }) => {
  if (Date.now() < config.startTime) {
    return res.badNotStarted()
  }
  const chall = getCleanedChallenge(req.params.id)
  if (!chall) {
    return res.badChallenge()
  }
  const solves = await getSolvesByChallId({
    challengeid: req.params.id,
    limit: req.query.limit,
    offset: req.query.offset,
  })
  return res.goodChallengeSolves({
    solves: solves.map(solve => ({
      id: solve.id,
      createdAt: solve.createdat.getTime(),
      userId: solve.userid,
      userName: solve.name,
    })),
  })
})
