const database = require('../../database')
const { responses } = require('../../responses')

module.exports = {
  method: 'post',
  path: '/user/members/delete',
  requireAuth: true,
  schema: {
    body: {
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
    const { id } = req.body

    await database.members.removeMember({
      id,
      userid: user.id
    })

    return responses.goodMemberCreate
  }
}
