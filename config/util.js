// Recursively removes undefined values from keys
const cleanConfig = config => {
  for (const key of Object.keys(config)) {
    if (config[key] === undefined) {
      delete config[key]
    } else if (typeof config[key] === 'object') {
      cleanConfig(config[key])
    }
  }
  return config
}

module.exports = {
  cleanConfig
}
