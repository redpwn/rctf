import { v4 as uuidv4 } from 'uuid'
import * as database from '../../../database'
import { responses } from '../../../responses'

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
        },
        name: {
          type: 'string'
        },
        grade: {
          type: 'string'
        }
      },
      required: ['email', 'name', 'grade']
    }
  },
  handler: async ({ req, user }) => {
    const { name, email, grade } = req.body

    const id = uuidv4()
    try {
      const data = await database.members.makeMember({
        id,
        userid: user.id,
        name,
        email,
        grade
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
