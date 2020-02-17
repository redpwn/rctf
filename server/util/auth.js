const { responses } = require('../responses')

module.exports = {
  nameEmailVerification: (register, userByEmail, userByName) => {
    if (register) {
      // User is trying to register
      if (userByEmail !== undefined) {
        // There already exists an account with this email
        return responses.badKnownEmail
      }
      if (userByName !== undefined) {
        // There already exists an account with this name
        return responses.badKnownName
      }
    } else {
      // User is trying to recover
      if (userByEmail === undefined) {
        // Could not find account with the provided email
        return responses.badUnknownEmail
      }
      if (userByName === undefined) {
        // Could not find account with the provided name
        return responses.badUnknownName
      }
      if (userByEmail.name !== userByName.name) {
        return responses.badEmailNameMatch
      }
    }
  }
}
