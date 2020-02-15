module.exports = {
  scores: require('./scores'),
  email: require('./email'),
  reloadModule: m => {
    delete require.cache[require.resolve(m)]
    return require(m)
  }
}
