import { challsIdSubmitPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import config from '../../config/server'
import crypto from 'crypto'
import { newSolve } from '../../database/solves'
import { getChallenge } from '../../challenges'
import {
  checkRateLimit,
  getChallengeType as timeoutsGetChallengeType,
} from '../../cache/timeouts'
import { v4 as uuidv4 } from 'uuid'

export default makeFastifyRoute(
  challsIdSubmitPost,
  async ({ req, user, res }) => {
    const uuid = user.id

    const timeNow = Date.now()
    if (timeNow < config.startTime) {
      return res.badNotStarted()
    }
    if (timeNow > config.endTime) {
      return res.badEnded()
    }

    const challengeid = req.params.id
    const submittedFlag = req.body.flag

    const challenge = getChallenge(challengeid)

    req.log.info(
      {
        chall: challengeid,
        flag: submittedFlag,
      },
      'flag submission attempt'
    )

    if (!challenge) {
      return res.badChallenge()
    }

    const passRateLimit = await checkRateLimit({
      type: timeoutsGetChallengeType(challengeid),
      userid: uuid,
      duration: 10 * 1000,
      limit: 3,
    })

    if (!passRateLimit.ok) {
      req.log.warn(
        {
          timeLeft: passRateLimit.timeLeft,
        },
        'flag submission rate limit exceeded'
      )
      return res.badRateLimit({
        timeLeft: passRateLimit.timeLeft,
      })
    }

    const bufSubmittedFlag = Buffer.from(submittedFlag)
    const bufCorrectFlag = Buffer.from(challenge.flag)

    if (bufSubmittedFlag.length !== bufCorrectFlag.length) {
      return res.badFlag()
    }

    if (!crypto.timingSafeEqual(bufSubmittedFlag, bufCorrectFlag)) {
      return res.badFlag()
    }

    try {
      await newSolve({
        id: uuidv4(),
        challengeid: challengeid,
        userid: uuid,
        createdat: new Date(),
      })
      return res.goodFlag()
    } catch (e) {
      if (e instanceof Object) {
        const { constraint } = e as { constraint?: string }
        if (constraint === 'uq') {
          // not a unique submission, so the user already solved
          return res.badAlreadySolvedChallenge()
        }
        if (constraint === 'uuid_fkey') {
          // the user referenced by the solve isnt in the users table
          return res.badUnknownUser()
        }
      }
      throw e
    }
  }
)
