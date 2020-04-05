const { responses } = require('../responses')
const database = require('../database')

module.exports = {
  getRegisterConflict: async ({ name, email, ctftimeId }) => {
    let dbResult
    if (ctftimeId === undefined) {
      dbResult = await database.auth.getUserByNameOrEmail({ name, email })
    } else {
      dbResult = await database.auth.getUserByNameOrCtftimeId({ name, ctftimeId })
    }
    if (dbResult === undefined) {
      return
    }
    if (ctftimeId !== undefined && dbResult.ctftime_id === ctftimeId) {
      return responses.badKnownCtftimeId
    }
    if (ctftimeId !== undefined && dbResult.email === email) {
      return responses.badKnownEmail
    }
    return responses.badKnownName
  }
}
