import { RouteOptions, FastifyInstance } from 'fastify'
import {
  makeResponseFactories,
  processResponseFactoryReturn,
  implicitResponseKinds,
} from './helpers'
import { User } from '../database/users'
import * as http from 'http'
import { SetRequired } from 'type-fest'

/* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
const routes = [
  ...require('./leaderboard').default,
  ...require('./challs').default,
  ...require('./integrations/ctftime').default,
  ...require('./integrations/client').default,
  ...require('./users').default,
  ...require('./auth').default,
  ...require('./admin').default,
] as RouteOptions[]
/* eslint-enable */

// TODO: move to a util module
function widenConcat<A, B>(a: readonly A[], b: readonly B[]): (A | B)[] {
  return (a as readonly (A | B)[]).concat(b)
}

export default async (
  fastify: FastifyInstance<
    http.Server,
    // fix the IncomingMessage type for http.Server
    http.IncomingMessage & SetRequired<http.IncomingMessage, 'method' | 'url'>
  >
): Promise<void> => {
  const responseFactories = makeResponseFactories(
    widenConcat(implicitResponseKinds, ['badEndpoint'])
  )
  fastify.setErrorHandler(async (error, req, reply) => {
    try {
      if (error.validation) {
        return processResponseFactoryReturn(responseFactories.badBody(), reply)
      }

      // based on https://github.com/fastify/fastify/blob/v3.10.1/fastify.js#L62-L75
      if (reply.statusCode < 500) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        reply.log.info({ res: reply, err: error }, error?.message)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        reply.log.error({ req, res: reply, err: error }, error?.message)
        return processResponseFactoryReturn(
          responseFactories.errorInternal(),
          reply
        )
      }
      return error
    } catch (e) {
      reply.log.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { res: reply, err: e, cause: error },
        'Exception occurred in error handler'
      )
      if (!reply.sent) {
        try {
          void reply.send(
            processResponseFactoryReturn(
              responseFactories.errorInternal(),
              reply
            )
          )
        } catch (e) {
          reply.log.error(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            { err: e },
            'Exception occurred when sending 500 in response to unhandled error ' +
              'handler exception, attempting to close response!'
          )
          try {
            void reply.send()
          } catch (e) {
            // Something really bad happened
            reply.log.error(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              { err: e },
              'Exception occurred when closing response in response to exception ' +
                'sending 500 response for unhandled error handler exception, bailing'
            )
          }
        }
      }
    }
  })

  fastify.setNotFoundHandler((req, res) => {
    const { url, method } = req.raw
    req.log.info(`Route ${url}:${method} not found`)
    return processResponseFactoryReturn(responseFactories.badEndpoint(), res)
  })

  routes.forEach(route => {
    fastify.route(route)
  })

  fastify.route({
    method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
    url: '/*',
    handler: async (req, res) => {
      res.callNotFound()
    },
  })
}

export const logSerializers = {
  user: (user: User): string => user.id,
}
