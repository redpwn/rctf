import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import * as database from '../../../database'
import { responses } from '../../../responses'
import * as util from '../../../util'
import config from '../../../config/server'

export default {
  method: 'POST',
  path: '/users/me/members',
  requireAuth: true,
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        }
      },
      required: ['email']
    }
  },
  handler: async ({ req, user }) => {
    if (!config.userMembers) {
      return responses.badEndpoint
    }

    const email = util.normalize.normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return responses.badEmail
    }

    const id = uuidv4()
    try {
      const data = await database.members.makeMember({
        id,
        userid: user.id,
        email
      })

      return [responses.goodMemberCreate, data]
    } catch (e) {
      if (e.constraint === 'user_members_email_key') {
        return responses.badKnownEmail
      }

      throw e
    }
  }
}
