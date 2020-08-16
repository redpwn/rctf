import { responses } from '../../responses'

export default {
  method: 'GET',
  path: '/auth/test',
  requireAuth: true,
  handler: async () => {
    return responses.goodToken
  }
}
