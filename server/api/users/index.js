// Note that the order of exports is important.
module.exports = [
  /*
   /users/members/* routes must come before /users/:id
   or else it will be interpreted as an id
  */
  ...require('./members'),
  require('./me'),
  require('./id'),
  require('./delete'),
  require('./update'),
  ...require('./me-auth/ctftime'),
  ...require('./me-auth/email')
]
