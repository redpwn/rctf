const { responses } = require('../../responses')
const { getGenericUserData } = require('./util')
const auth = require('../../auth')

module.exports = {
  method: 'get',
  path: '/users/me',
  requireAuth: true,
  handler: async ({ uuid }) => {
    const userData = await getGenericUserData({
      id: uuid
    })

    if (userData === null) return responses.badUnknownUser

    const teamToken = await auth.token.getToken(auth.token.tokenKinds.team, uuid)

    return [responses.goodUserData, {
      ...userData,
      teamToken,
      id: uuid
    }]
  }
}
