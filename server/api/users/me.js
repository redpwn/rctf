const { responses } = require('../../responses')
const { getGenericUserData } = require('./util')
const auth = require('../../auth')

module.exports = {
  method: 'get',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ user }) => {
    const uuid = user.id
    const userData = await getGenericUserData({
      id: uuid
    })

    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)

    return [responses.goodUserData, {
      ...userData,
      teamToken,
      id: uuid
    }]
  }
}
