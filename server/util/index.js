module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  auth: require('./auth'),
  normalize: require('./normalize'),
  reloadModule: m => {
    delete require.cache[require.resolve(m)]
    return require(m)
  }
}
