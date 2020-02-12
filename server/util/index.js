module.exports = {
  scores: require('./scores'),
  reloadModule: m => {
    delete require.cache[require.resolve(m)]
    return require(m)
  }
}
