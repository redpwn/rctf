import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'

export default {
  method: 'get',
  path: '/admin/challs',
  requireAuth: true,
  perms: perms.challsRead,
  handler: async () => {
    const challs = challenges.getAllChallenges()
    return [responses.goodChallenges, challs]
  }
}
