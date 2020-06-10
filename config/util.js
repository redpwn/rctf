// Shallowly removes undefined values
const cleanConfig = config => {
  for (const key of Object.keys(config)) {
    if (config[key] === undefined) {
      delete config[key]
    }
  }
  return config
}

module.exports = {
  cleanConfig
}
