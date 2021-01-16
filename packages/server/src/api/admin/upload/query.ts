import { adminUploadQueryPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { getUrl } from '../../../uploads'

export default makeFastifyRoute(adminUploadQueryPost, async ({ req, res }) => {
  const data = await Promise.all(
    req.body.uploads.map(async ({ sha256, name }) => {
      const url = await getUrl(sha256, name)

      return {
        sha256,
        name,
        url,
      }
    })
  )

  return res.goodUploadsQuery(data)
})
