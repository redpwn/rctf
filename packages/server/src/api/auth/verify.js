import { authVerifyPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import * as auth from '../../auth'
import * as cache from '../../cache'
import * as database from '../../database'
import { DivisionACLError } from '../../errors'

export default makeFastifyRoute(authVerifyPost, async ({ req, res }) => {
  const tokenData = await auth.token.getData(
    auth.token.tokenKinds.verify,
    req.body.verifyToken
  )
  if (tokenData === null) {
    return res.badTokenVerification()
  }
  const tokenUnused = await cache.login.useLogin({ id: tokenData.verifyId })
  if (!tokenUnused) {
    return res.badTokenVerification()
  }

  if (tokenData.kind === 'register') {
    return auth.register.register(
      {
        division: tokenData.division,
        email: tokenData.email,
        name: tokenData.name,
      },
      res
    )
  } else if (tokenData.kind === 'recover') {
    const user = await database.users.getUserByIdAndEmail({
      id: tokenData.userId,
      email: tokenData.email,
    })
    if (user === undefined) {
      return res.badUnknownUser()
    }
    const authToken = await auth.token.getToken(
      auth.token.tokenKinds.auth,
      user.id
    )
    return res.goodVerify({ authToken })
  } else if (tokenData.kind === 'update') {
    let result
    try {
      result = await database.users.updateUser({
        id: tokenData.userId,
        email: tokenData.email,
        division: tokenData.division,
      })
    } catch (e) {
      if (e instanceof DivisionACLError) {
        return res.badEmailChangeDivision()
      }
      if (e.constraint === 'users_email_key') {
        return res.badKnownEmail()
      }
      throw e
    }
    if (result === undefined) {
      return res.badUnknownUser()
    }
    return res.goodEmailSet()
  } else {
    throw new Error('invalid tokenData.kind')
  }
})
