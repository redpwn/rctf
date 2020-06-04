import { responses } from '../../../responses'
import perms from '../../../util/perms'
import { get as getUploadProvider } from '../../../uploads'

export default {
  method: 'POST',
  path: '/admin/upload/exists',
  requireAuth: true,
  perms: perms.challsRead,
  schema: {
    body: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sha256: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            },
            required: ['sha256', 'name']
          }
        }
      },
      required: ['uploads']
    }
  },
  handler: async ({ req }) => {
    const uploadProvider = getUploadProvider()

    const data = await Promise.all(
      req.body.uploads.map(async ({ sha256, name }) => {
        const exists = await uploadProvider.exists(sha256, name)

        return {
          sha256,
          name,
          exists
        }
      })
    )

    return [responses.goodUploadsQuery, data]
  }
}
