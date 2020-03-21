const crypto = require('crypto')
const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')
const config = require('../../config/server')
const util = require('../util')

const { v4: uuidv4 } = require('uuid')

module.exports = {
  method: 'post',
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
  handler: async ({ req, uuid }) => {
    if (Date.now() < config.startTime) {
      return util.notStarted()
    }

    if (Date.now() >= config.endTime) {
      return responses.badEnded
    }

    const challengeid = req.params.id
    const submittedFlag = req.body.flag

    const challenge = challenges.getChallenge(challengeid)

    if (!challenge) {
      return responses.badChallenge
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
        return responses.badAlreadySolvedChallenge
      }
      throw e
    }
  }
}
