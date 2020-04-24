const database = require('../../../database')
const { responses } = require('../../../responses')

module.exports = {
  method: 'get',
  path: '/users/me/members/',
  requireAuth: true,
  handler: async ({ user }) => {
    const members = await database.members.getMembers({
      userid: user.id
    })

    return [responses.goodMemberData, members]
  }
}
