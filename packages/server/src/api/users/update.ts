import { usersMePatch } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { updateUser } from '../../database/users'
import config from '../../config/server'
import { checkRateLimit, types as timeoutTypes } from '../../cache/timeouts'
import { normalizeName } from '../../util/normalize'
import { validateName } from '../../util/validate'
import { DivisionACLError } from '../../errors'

export default makeFastifyRoute(usersMePatch, async ({ user, req, res }) => {
  if (Date.now() > config.endTime) {
    return res.badEnded()
  }

  const uuid = user.id
  const division = req.body.division ?? user.division
  let name

  if (req.body.name !== undefined) {
    name = normalizeName(req.body.name)
    if (!validateName(name)) {
      return res.badName()
    }

    const passRateLimit = await checkRateLimit({
      type: timeoutTypes.UPDATE_PROFILE,
      userid: uuid,
      duration: 10 * 60 * 1000,
      limit: 1,
    })

    // Rate limit name changes only
    if (!passRateLimit.ok) {
      return res.badRateLimit({
        timeLeft: passRateLimit.timeLeft,
      })
    }
  }

  let newUser
  try {
    newUser = await updateUser({
      id: uuid,
      name,
      division,
      email: user.email,
    })
  } catch (e) {
    if (e instanceof DivisionACLError) {
      return res.badDivisionNotAllowed()
    }
    if (e instanceof Object) {
      const { constraint } = e as { constraint?: string }
      if (constraint === 'users_name_key') {
        return res.badKnownName()
      }
    }
    throw e
  }
  // Hack around TypeScript not understanding that control never returns from
  // the catch block to here
  if (newUser === undefined) {
    throw new Error('Assertion error: newUser === undefined')
  }

  return res.goodUserUpdate({
    user: {
      name: newUser.name,
      email: newUser.email,
      division: newUser.division,
    },
  })
})
