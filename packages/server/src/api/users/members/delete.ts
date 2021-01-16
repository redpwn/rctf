import { usersMeMembersIdDelete } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { removeMember } from '../../../database/members'
import config from '../../../config/server'

export default makeFastifyRoute(
  usersMeMembersIdDelete,
  async ({ req, user, res }) => {
    if (Date.now() > config.endTime) {
      return res.badEnded()
    }

    if (!config.userMembers) {
      return res.badEndpoint()
    }

    await removeMember({
      id: req.params.id,
      userid: user.id,
    })

    return res.goodMemberDelete()
  }
)
