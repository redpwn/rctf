const { responses } = require('../responses')
const database = require('../database')

module.exports = {
  getRegisterConflict: async ({ name, email }) => {
    const dbResult = await database.auth.getUserByNameOrEmail({ name, email })
    if (dbResult === undefined) {
      return
    }
    if (dbResult.name === name) {
      return responses.badKnownName
    }
    return responses.badKnownEmail
  }
}
