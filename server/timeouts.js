module.exports = {
  /*
  * The method does two things, but is in one database call for performance reasons. Rate limiting
  * will be called frequently.
  *
  * First, the the method checks if the number of events meets the limit. If so, it resolves to false.
  * Otherwise, the method will add a event, and resolve to true.
  *
  */
  checkRateLimit: ({ type, userid, duration, limit }) => {
    return new Promise((resolve) => resolve(false))
  },
  getChallengeType: function (name) { return this.types.FLAG + '-' + name },
  types: {
    FLAG: 'FLAG',
    UPDATE_PROFILE: 'UPDATE_PROFILE'
  }
}
