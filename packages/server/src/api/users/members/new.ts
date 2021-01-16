import { usersMeMembersPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { v4 as uuidv4 } from 'uuid'
import emailValidator from 'email-validator'
import { makeMember } from '../../../database/members'
import { normalizeEmail } from '../../../util/normalize'
import config from '../../../config/server'

export default makeFastifyRoute(
  usersMeMembersPost,
  async ({ req, user, res }) => {
    if (!config.userMembers) {
      return res.badEndpoint()
    }
    if (Date.now() > config.endTime) {
      return res.badEnded()
    }

    const email = normalizeEmail(req.body.email)
    if (!emailValidator.validate(email)) {
      return res.badEmail()
    }

    const id = uuidv4()
    try {
      const data = await makeMember({
        id,
        userid: user.id,
        email,
      })

      return res.goodMemberCreate(data)
    } catch (e) {
      if (e instanceof Object) {
        const { constraint } = e as { constraint?: string }
        if (constraint === 'user_members_email_key') {
          return res.badKnownEmail()
        }
      }

      throw e
    }
  }
)
