import { responses } from '../../../responses'
import perms from '../../../util/perms'
import { upload } from '../../../uploads'
import toBuffer from 'data-uri-to-buffer'

const itemSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    data: {
      type: 'string'
    }
  },
  required: ['name', 'data']
}

export default {
  method: 'POST',
  path: '/admin/upload',
  requireAuth: true,
  perms: perms.challsWrite,
  schema: {
    body: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: itemSchema
        }
      },
      required: ['files']
    }
  },
  bodyLimit: 2 ** 30, // 1 GiB
  handler: async ({ req }) => {
    let convertedFiles
    try {
      convertedFiles = req.body.files.map(({ name, data }) => {
        return {
          name,
          data: toBuffer(data)
        }
      })
    } catch (e) {
      return responses.badDataUri
    }

    try {
      const files = await Promise.all(
        convertedFiles.map(async ({ name, data }) => {
          const url = await upload(data, name)

          return {
            name,
            url
          }
        })
      )

      return [responses.goodFilesUpload, files]
    } catch (e) {
      req.log.error(
        { err: e },
        e && e.message
      )
      return responses.badFilesUpload
    }
  }
}
