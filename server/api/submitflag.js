const db = require('../database')
const challenges = require('../challenges')
const { responses } = require('../responses')

const uuidv4 = require('uuid/v4')

module.exports = {
  method: 'post',
  path: '/submitflag',
  requireAuth: true,
  schema: {
    type: 'object',
    properties: {
      challengeid: {
        type: 'string'
      },
      flag: {
        type: 'string'
      }
    },
    required: ['challengeid', 'flag']
  },
  handler: async ({ req, uuid }) => {
    const challengeid = req.body.challengeid
    const submittedFlag = req.body.flag

    const solved = await db.solves.getSolvesByUserIdAndChallId({ userid: uuid, challengeid: challengeid })

    if (solved === undefined) {
      // Challenge has not yet been solved, verify flag
      if (submittedFlag === challenges.getChallenge(challengeid).flag) {
        db.solves.newSolve({ id: uuidv4(), challengeid: challengeid, userid: uuid })
        return responses.goodFlag
      } else {
        return responses.badFlag
      }
    } else {
      return responses.alreadySolved
    }
  }
}
