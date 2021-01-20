import { usersIdGet } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../helpers'
import { getGenericUserData } from './util'

export default makeFastifyRoute(usersIdGet, async ({ req, res }) => {
  const userData = await getGenericUserData({
    id: req.params.id,
  })

  if (userData === null) return res.badUnknownUser()

  return res.goodUserData(userData)
})
