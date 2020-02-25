require('ava')

const uuidv4 = require('uuid/v4')
const config = require('../config/server')

module.exports = {
  generateTestUser: () => {
    return {
      email: uuidv4() + '@test.com',
      name: uuidv4(),
      division: Object.values(config.divisions)[0]
    }
  }
}
