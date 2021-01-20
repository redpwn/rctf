import { usersMeGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getUserData } from './util'
import { allowedDivisions as getAllowedDivisions } from '../../util/restrict'
import { getToken, tokenKinds } from '../../auth/token'

export default makeFastifyRoute(usersMeGet, async ({ user, res }) => {
  const uuid = user.id
  const userData = await getUserData({ user })

  const teamToken = await getToken(tokenKinds.team, uuid)

  const allowedDivisions = getAllowedDivisions(user.email)

  return res.goodUserSelfData({
    ...userData,
    teamToken,
    allowedDivisions,
    id: uuid,
    email: user.email,
  })
})
