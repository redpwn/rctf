import { responses, responseList } from '../responses'
import * as auth from '../auth'
import * as db from '../database'

const routes = [
  ...require('./leaderboard').default,
  ...require('./challs').default,
  ...require('./integrations/ctftime').default,
  ...require('./integrations/client').default,
  ...require('./users').default,
  ...require('./auth').default,
  ...require('./admin').default
]

const makeSendResponse = (res) => (responseKind, data = null) => {
  const response = responseList[responseKind]
  if (response === undefined) {
    throw new Error(`unknown response ${responseKind}`)
  }
  res.code(response.status)
  if (response.rawContentType !== undefined) {
    res.type(response.rawContentType)
    res.send(data)
  } else {
    res.send({
      kind: responseKind,
      message: response.message,
      data
    })
  }
}

export default async (fastify) => {
  fastify.setErrorHandler((error, req, reply) => {
    const sendResponse = makeSendResponse(reply)
    if (error.validation) {
      sendResponse(responses.badBody)
      return
    }

    const res = reply.raw

    // based on https://github.com/fastify/fastify/blob/2.x/lib/context.js#L29
    if (res.statusCode >= 500) {
      reply.log.error(
        { req: reply.request.raw, res, err: error },
        error && error.message
      )
      sendResponse(responses.errorInternal)
      return
    } else if (res.statusCode >= 400) {
      reply.log.info(
        { res, err: error },
        error && error.message
      )
    }
    reply.send(error)
  })

  fastify.setNotFoundHandler((req, res) => {
    const { url, method } = req.raw
    req.log.info(`Route ${url}:${method} not found`)
    makeSendResponse(res)(responses.badEndpoint)
  })

  routes.forEach((route, i) => {
    const handler = async (req, res) => {
      const sendResponse = makeSendResponse(res)
      let user
      if (route.requireAuth) {
        const authHeader = req.headers.authorization
        if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
          sendResponse(responses.badToken)
          return
        }
        const uuid = await auth.token.getData(auth.token.tokenKinds.auth, authHeader.slice('Bearer '.length))
        if (uuid === null) {
          sendResponse(responses.badToken)
          return
        }

        user = await db.users.getUserById({
          id: uuid
        })
        if (!user) {
          sendResponse(responses.badToken)
          return
        }
        req.log = req.log.child({ user })
        req.log.info('user authenticated')
      }

      if (route.perms !== undefined) {
        if (user === undefined) {
          throw new Error('routes with perms must set requireAuth to true')
        }
        if ((user.perms & route.perms) !== route.perms) {
          sendResponse(responses.badPerms)
          return
        }
      }

      const response = await route.handler({ req, user })
      if (response instanceof Array) {
        sendResponse(...response)
      } else {
        sendResponse(response)
      }
    }

    const fastifyRoute = {
      ...route,
      url: route.path,
      handler
    }
    delete fastifyRoute.path
    delete fastifyRoute.requireAuth
    delete fastifyRoute.perms

    fastify.route(fastifyRoute)
  })

  fastify.route({
    method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
    url: '/*',
    handler: async (req, res) => {
      res.callNotFound()
    }
  })
}

export const logSerializers = {
  user: user => user.id
}
