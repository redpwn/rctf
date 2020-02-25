const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')
const config = require('../../config/server')
const util = require('../util')

const uuidv4 = require('uuid/v4')

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

    if (challenge) {
      if (submittedFlag === challenge.flag) {
        const solved = await db.solves.getSolvesByUserIdAndChallId({ userid: uuid, challengeid: challengeid })
        if (solved === undefined) {
          await db.solves.newSolve({ id: uuidv4(), challengeid: challengeid, userid: uuid, createdat: new Date() })
          return responses.goodFlag
        } else {
          return responses.badAlreadySolvedChallenge
        }
      } else {
        return responses.badFlag
      }
    } else {
      return responses.badChallenge
    }
  }
}
