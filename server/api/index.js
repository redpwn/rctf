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

const routeValidators = routes.map((route) => {
  if (route.schema === undefined) {
    return {}
  }

  const ret = {}
  if (route.schema.body !== undefined) {
    ret.body = new Ajv().compile(route.schema.body)
  }
  if (route.schema.params !== undefined) {
    ret.params = new Ajv().compile(route.schema.params)
  }
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
      uuid = await auth.token.getUserId(authHeader.slice('Bearer '.length))
    }

    const validator = routeValidators[i]
    if (validator.body !== undefined && !validator.body(req.body)) {
      sendResponse(responses.badBody)
      return
    }
    if (validator.params !== undefined && !validator.params(req.params)) {
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
