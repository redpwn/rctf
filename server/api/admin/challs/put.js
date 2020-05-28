import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'
import { get as getUploadProvider } from '../../../uploads'
import toBuffer from 'data-uri-to-buffer'

export default {
  method: 'put',
  path: '/admin/challs/:id',
  requireAuth: true,
  perms: perms.challsWrite,
  schema: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            files: {
              type: 'array'
            }
          }
        }
      }
    }
  },
  handler: async ({ req }) => {
    const uploadProvider = getUploadProvider()
    const chall = req.body.data

    // Ensure id is consistent
    chall.id = req.params.id

    const files = await Promise.all(
      chall.files.map(async ({ name, data }) => {
        const url = await uploadProvider.upload(toBuffer(data))

        return {
          name,
          url
        }
      })
    )

    chall.files = files

    challenges.updateChallenge(chall)

    return [responses.goodChallengeUpdate, chall]
  }
}
