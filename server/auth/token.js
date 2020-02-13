const { promisify } = require('util')
const crypto = require('crypto')

const randomBytes = promisify(crypto.randomBytes)
const tokenKey = Buffer.from(process.env.APP_TOKEN_KEY, 'base64')

const tokenKinds = {
  auth: 0,
  team: 1,
  login: 2
}

const encryptToken = async (content) => {
  const iv = await randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', tokenKey, iv)
  const cipherText = cipher.update(JSON.stringify(content))
  cipher.final()
  const tokenContent = Buffer.concat([iv, cipherText, cipher.getAuthTag()])
  return tokenContent.toString('base64')
}

const decryptToken = async (token) => {
  try {
    const tokenContent = Buffer.from(token, 'base64')
    const iv = tokenContent.slice(0, 12)
    const authTag = tokenContent.slice(tokenContent.length - 16)
    const cipher = crypto.createDecipheriv('aes-256-gcm', tokenKey, iv)
    cipher.setAuthTag(authTag)
    const plainText = cipher.update(tokenContent.slice(12, tokenContent.length - 16))
    return JSON.parse(plainText)
  } catch (e) {
    return null
  }
}

const getUserId = async (token, expectedTokenKind) => {
  const content = await decryptToken(token)
  if (content === null) {
    return null
  }
  const { k: kind, id: userId } = content
  if (kind !== expectedTokenKind) {
    return null
  }
  return userId
}

const getToken = async (userId, tokenKind) => {
  const token = await encryptToken({
    k: tokenKind,
    id: userId
  })
  return token
}

module.exports = {
  getUserId,
  getToken,
  tokenKinds
}
