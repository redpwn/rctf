import { responses } from '../../../responses'
import * as challenges from '../../../challenges'
import perms from '../../../util/perms'
import * as cache from '../../../cache'

export default {
  method: 'PUT',
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
            author: {
              type: 'string'
            },
            category: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            flag: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            points: {
              type: 'object',
              properties: {
                max: {
                  type: 'integer'
                },
                min: {
                  type: 'integer'
                }
              },
              required: ['max', 'min']
            },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string'
                  }
                },
                required: ['name', 'url']
              }
            }
          }
        }
      }
    }
  },
  handler: async ({ req }) => {
    const chall = req.body.data

    // Ensure id is consistent
    chall.id = req.params.id

    await challenges.updateChallenge(chall)
    if (chall.points !== undefined) {
      await cache.leaderboard.setChallsDirty()
    }

    return [responses.goodChallengeUpdate, chall]
  }
}
