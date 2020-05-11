const { v4: uuidv4 } = require('uuid')
const database = require('../database')
const tokenUtils = require('./token')
const { responses } = require('../responses')

const register = async ({ division, email, name, ctftimeId }) => {
  const userUuid = uuidv4()
  try {
    await database.auth.makeUser({
      division,
      email,
      name,
      id: userUuid,
      ctftimeId,
      perms: 0
    })
  } catch (e) {
    if (e.constraint === 'users_ctftime_id_key') {
      return responses.badKnownCtftimeId
    }
    if (e.constraint === 'users_email_key') {
      return responses.badKnownEmail
    }
    if (e.constraint === 'users_name_key') {
      return [responses.badKnownName, name]
    }
    throw e
  }
  const authToken = await tokenUtils.getToken(tokenUtils.tokenKinds.auth, userUuid)
  const teamToken = await tokenUtils.getToken(tokenUtils.tokenKinds.team, userUuid)
  return [responses.goodRegister, {
    authToken,
    teamToken
  }]
}

module.exports = {
  register
}
