import { authRecoverPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import { makeLogin } from '../../cache/login'
import { normalizeEmail } from '../../util/normalize'
import { getToken, tokenKinds } from '../../auth/token'
import { getUserByEmail } from '../../database/users'
import config from '../../config/server'
import { sendVerification } from '../../email'

export default makeFastifyRoute(authRecoverPost, async ({ req, res }) => {
  if (!config.email) {
    return res.badEndpoint()
  }

  const email = normalizeEmail(req.body.email)
  if (!emailValidator.validate(email)) {
    return res.badEmail()
  }

  const user = await getUserByEmail({ email })
  if (user === undefined) {
    return res.badUnknownEmail()
  }

  const verifyUuid = uuidv4()
  await makeLogin({ id: verifyUuid })
  const verifyToken = await getToken(tokenKinds.verify, {
    verifyId: verifyUuid,
    kind: 'recover',
    userId: user.id,
    email,
  })

  await sendVerification({
    email,
    kind: 'recover',
    token: verifyToken,
  })

  return res.goodVerifySent()
})
