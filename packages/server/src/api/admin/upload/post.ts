import { adminUploadPost } from '@rctf/api-types/routes'
import { makeFastifyRoute } from '../../helpers'
import { upload } from '../../../uploads'
import toBuffer from 'data-uri-to-buffer'

export default makeFastifyRoute(
  adminUploadPost,
  async ({ req, res }) => {
    let convertedFiles
    try {
      convertedFiles = req.body.files.map(({ name, data }) => {
        return {
          name,
          data: toBuffer(data),
        }
      })
    } catch (e) {
      return res.badDataUri()
    }

    const files = await Promise.all(
      convertedFiles.map(async ({ name, data }) => {
        const url = await upload(data, name)
        return { name, url }
      })
    )

    return res.goodFilesUpload(files)
  },
  {
    bodyLimit: 2 ** 30, // 1 GiB
  }
)
