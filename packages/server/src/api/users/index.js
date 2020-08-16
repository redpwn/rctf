// Note that the order of exports is important.
export default [
  /*
   /users/members/* routes must come before /users/:id
   or else it will be interpreted as an id
  */
  ...require('./members').default,
  require('./me').default,
  require('./id').default,
  require('./update').default,
  ...require('./me-auth/ctftime').default,
  ...require('./me-auth/email').default
]
