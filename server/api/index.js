const express = require('express')
const Ajv = require('ajv')
const { responses, responseList } = require('../responses')
const auth = require('../auth')

const router = express.Router()

const routes = [
  require('./auth-login'),
  require('./leaderboard'),
  require('./submitflag')
]

const validationParams = ['body', 'params', 'query']
const routeValidators = routes.map((route) => {
  if (route.schema === undefined) {
    return {}
  }

  const ret = {}
  validationParams.forEach(param => {
    if (route.schema[param] !== undefined) {
      ret[param] = new Ajv().compile(route.schema[param])
    }
  })
  return ret
})

routes.forEach((route, i) => {
  router[route.method](route.path, async (req, res) => {
    const sendResponse = (responseKind, data = null) => {
      const response = responseList[responseKind]
      if (response === undefined) {
        throw new Error(`unknown response ${responseKind}`)
      }
      res.set('content-type', 'application/json')
      res.status(response.status)
      res.send(JSON.stringify({
        kind: responseKind,
        message: response.message,
        data
      }))
    }

    let uuid
    if (route.requireAuth) {
      const authHeader = req.get('authorization')
      if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
        sendResponse(responses.badToken)
        return
      }
      uuid = await auth.token.getUserId(authHeader.slice('Bearer '.length), auth.token.tokenKinds.auth)
    }

    const validator = routeValidators[i]
    const allValid = validationParams.every(param => {
      if (validator[param] !== undefined) {
        return validator[param](req[param])
      }
      return true
    })

    if (!allValid) {
      sendResponse(responses.badBody)
      return
    }

    let response
    try {
      response = await route.handler({
        req,
        uuid
      })
    } catch (e) {
      sendResponse(responses.errorInternal)
      console.error(e.stack)
    }

    if (response instanceof Array) {
      sendResponse(...response)
    } else {
      sendResponse(response)
    }
  })
})

module.exports = router
