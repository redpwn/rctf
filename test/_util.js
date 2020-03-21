require('ava')

const { v4: uuidv4 } = require('uuid')
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
