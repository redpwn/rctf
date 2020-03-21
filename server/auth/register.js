const { v4: uuidv4 } = require('uuid')
const database = require('../database')
const tokenUtils = require('./token')
const { responses } = require('../responses')

const register = async ({ division, email, name }) => {
  const userUuid = uuidv4()
  try {
    await database.auth.makeUser({
      division,
      email,
      name,
      id: userUuid,
      perms: 0
    })
  } catch (e) {
    if (e.constraint === 'users_name_key') {
      return responses.badKnownName
    }
    if (e.constraint === 'users_email_key') {
      return responses.badKnownEmail
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
