import crypto from 'crypto'
import * as db from '../../database'
import * as challenges from '../../challenges'
import { responses } from '../../responses'
import config from '../../config/server'
import * as timeouts from '../../cache/timeouts'
import { v4 as uuidv4 } from 'uuid'

export default {
  method: 'POST',
  path: '/challs/:id/submit',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        flag: {
          type: 'string'
        }
      },
      required: ['flag']
    },
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    }
  },
  handler: async ({ req, user }) => {
    const uuid = user.id

    const timeNow = Date.now()
    if (timeNow < config.startTime) {
      return responses.badNotStarted
    }
    if (timeNow > config.endTime) {
      return responses.badEnded
    }

    const challengeid = req.params.id
    const submittedFlag = req.body.flag

    const challenge = challenges.getChallenge(challengeid)

    req.log.info({
      chall: challengeid,
      flag: submittedFlag
    }, 'flag submission attempt')

    if (!challenge) {
      return responses.badChallenge
    }

    const passRateLimit = await timeouts.checkRateLimit({
      type: timeouts.getChallengeType(challengeid),
      userid: uuid,
      duration: 10 * 1000,
      limit: 3
    })

    if (!passRateLimit.ok) {
      req.log.warn({
        timeLeft: passRateLimit.timeLeft
      }, 'flag submission rate limit exceeded')
      return [responses.badRateLimit, {
        timeLeft: passRateLimit.timeLeft
      }]
    }

    const bufSubmittedFlag = Buffer.from(submittedFlag)
    const bufCorrectFlag = Buffer.from(challenge.flag)

    if (bufSubmittedFlag.length !== bufCorrectFlag.length) {
      return responses.badFlag
    }

    if (!crypto.timingSafeEqual(bufSubmittedFlag, bufCorrectFlag)) {
      return responses.badFlag
    }

    try {
      await db.solves.newSolve({ id: uuidv4(), challengeid: challengeid, userid: uuid, createdat: new Date() })
      return responses.goodFlag
    } catch (e) {
      if (e.constraint === 'uq') {
        // not a unique submission, so the user already solved
        return responses.badAlreadySolvedChallenge
      }
      if (e.constraint === 'uuid_fkey') {
        // the user referenced by the solve isnt in the users table
        return responses.badUnknownUser
      }
      throw e
    }
  }
}
