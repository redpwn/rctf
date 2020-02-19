const normalizeEmail = (email) => {
  return email.trim().toLowerCase()
}

const normalizeName = (name) => {
  return name.trim().toLowerCase()
}

module.exports = {
  normalizeEmail,
  normalizeName
}
