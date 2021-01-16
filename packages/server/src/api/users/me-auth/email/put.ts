import { usersMeAuthEmailPut } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../../helpers'
import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import config from '../../../../config/server'
import { makeLogin } from '../../../../cache/login'
import { normalizeEmail } from '../../../../util/normalize'
import { divisionAllowed } from '../../../../util/restrict'
import { getToken, tokenKinds } from '../../../../auth/token'
import { getUserByEmail, updateUser } from '../../../../database/users'
import { sendVerification } from '../../../../email'

export default makeFastifyRoute(
  usersMeAuthEmailPut,
  async ({ req, user, res }) => {
    const email = normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return res.badEmail()
    }

    if (config.email) {
      const checkUser = await getUserByEmail({
        email,
      })
      if (checkUser !== undefined) {
        return res.badKnownEmail()
      }
      if (config.divisionACLs && !divisionAllowed(email, user.division)) {
        return res.badEmailChangeDivision()
      }
    } else {
      let result
      try {
        result = await updateUser({
          id: user.id,
          email,
        })
      } catch (e) {
        if (e instanceof Object) {
          const { constraint } = e as { constraint?: string }
          if (constraint === 'users_email_key') {
            return res.badKnownEmail()
          }
        }
        throw e
      }
      if (result === undefined) {
        return res.badUnknownUser()
      }
      return res.goodEmailSet()
    }

    const verifyUuid = uuidv4()
    await makeLogin({ id: verifyUuid })
    const verifyToken = await getToken(tokenKinds.verify, {
      verifyId: verifyUuid,
      kind: 'update',
      userId: user.id,
      email,
      division: user.division,
    })

    await sendVerification({
      email,
      kind: 'update',
      token: verifyToken,
    })

    return res.goodVerifySent()
  }
)
