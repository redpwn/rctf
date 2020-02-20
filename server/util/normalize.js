const path = require('path')
const config = require('../../config')

const normalizeEmail = (email) => {
  return email.trim().toLowerCase()
}

const normalizeName = (name) => {
  return name.trim().toLowerCase()
}

const normalizeDownload = name => {
  const filename = path.basename(name)

  const parts = filename.split('.')
  const nameParts = parts[0].split('-')

  if (config.removeDownloadHashes && nameParts.length !== 1) {
    // Remove the hash
    nameParts.splice(nameParts.length - 1, 1)
  }
  parts[0] = nameParts.join('-')

  const cleanName = parts.join('.')

  return cleanName
}

module.exports = {
  normalizeEmail,
  normalizeName,
  normalizeDownload
}
