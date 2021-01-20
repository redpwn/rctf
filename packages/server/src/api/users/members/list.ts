import { usersMeMembersGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { getMembers } from '../../../database/members'
import config from '../../../config/server'

export default makeFastifyRoute(usersMeMembersGet, async ({ user, res }) => {
  if (!config.userMembers) {
    return res.badEndpoint()
  }

  const members = await getMembers({
    userid: user.id,
  })

  return res.goodMemberData(members)
})
