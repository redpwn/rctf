import { responses } from '../../responses'

export default {
  method: 'get',
  path: '/auth/test',
  requireAuth: true,
  handler: async () => {
    return responses.goodToken
  }
}
