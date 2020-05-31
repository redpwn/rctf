import { responses } from '../../responses'
import perms from '../../util/perms'
import { get as getUploadProvider } from '../../uploads'
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
  handler: async ({ req }) => {
    const uploadProvider = getUploadProvider()

    try {
      const files = await Promise.all(
        req.body.files.map(async ({ name, data }) => {
          const url = await uploadProvider.upload(toBuffer(data), name)

          return {
            name,
            url
          }
        })
      )

      return [responses.goodFilesUpload, files]
    } catch (e) {
      return responses.badFilesUpload
    }
  }
}
