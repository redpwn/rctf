import * as auth from '../../auth'
import * as cache from '../../cache'
import * as database from '../../database'
import { responses } from '../../responses'
import { DivisionACLError } from '../../errors'

export default {
  method: 'POST',
  path: '/auth/verify',
  requireAuth: false,
  schema: {
    body: {
      properties: {
        verifyToken: {
          type: 'string'
        }
      },
      required: ['verifyToken']
    }
  },
  handler: async ({ req }) => {
    const tokenData = await auth.token.getData(auth.token.tokenKinds.verify, req.body.verifyToken)
    if (tokenData === null) {
      return responses.badTokenVerification
    }
    const tokenUnused = await cache.login.useLogin({ id: tokenData.verifyId })
    if (!tokenUnused) {
      return responses.badTokenVerification
    }

    if (tokenData.kind === 'register') {
      return auth.register.register({
        division: tokenData.division,
        email: tokenData.email,
        name: tokenData.name
      })
    } else if (tokenData.kind === 'recover') {
      const user = await database.users.getUserByIdAndEmail({
        id: tokenData.userId,
        email: tokenData.email
      })
      if (user === undefined) {
        return responses.badUnknownUser
      }
      const authToken = await auth.token.getToken(auth.token.tokenKinds.auth, user.id)
      return [responses.goodVerify, { authToken }]
    } else if (tokenData.kind === 'update') {
      let result
      try {
        result = await database.users.updateUser({
          id: tokenData.userId,
          email: tokenData.email,
          division: tokenData.division
        })
      } catch (e) {
        if (e instanceof DivisionACLError) {
          return responses.badEmailChangeDivision
        }
        if (e.constraint === 'users_email_key') {
          return responses.badKnownEmail
        }
        throw e
      }
      if (result === undefined) {
        return responses.badUnknownUser
      }
      return responses.goodEmailSet
    } else {
      throw new Error('invalid tokenData.kind')
    }
  }
}
