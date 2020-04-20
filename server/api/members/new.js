const { v4: uuidv4 } = require('uuid')
const database = require('../../database')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/user/members/new',
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
      await database.members.makeMember({
        id,
        userid: user.id,
        name,
        email,
        grade
      })
    } catch (e) {
      return responses.badKnownEmail
    }

    return responses.goodMemberCreate
  }
}
