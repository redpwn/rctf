const uuidv4 = require('uuid/v4')
const database = require('../database')
const config = require('../../config')
const { responses } = require('../responses')

module.exports = {
  method: 'post',
  path: '/auth/register',
  requireAuth: false,
  schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string'
      },
      name: {
        type: 'string'
      },
      eligible: {
        type: 'boolean'
      }
    },
    required: ['email', 'name', 'eligible']
  },
  handler: async ({ req, uuid }) => {
    let division
    if (req.body.eligible) {
      division = config.divisions.eligible
    } else {
      division = config.divisions.ineligible
    }
    try {
      database.auth.makeUser({
        id: uuidv4(),
        name: req.body.name,
        email: req.body.email,
        division,
        perms: 0
      })
    } catch (e) {
      return responses.badKnownEmail
    }
    return [responses.goodLogin, {
      uuid
    }]
  }
}
