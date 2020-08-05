import { promisify } from 'util'
import crypto from 'crypto'
import config from '../config/server'
import { User } from '../database/users'

const randomBytes = promisify(crypto.randomBytes)
const tokenKey = Buffer.from(config.tokenKey, 'base64')

export enum tokenKinds {
  auth = 0,
  team = 1,
  verify = 2,
  ctftimeAuth = 4
}

export enum VerifyTokenKinds {
  update = 'update',
  register = 'register'
}

export type AuthTokenData = string
export type TeamTokenData = string
export interface VerifyTokenData {
  verifyId: string
  kind: VerifyTokenKinds
  userId: User['id']
  email: User['email']
  division: User['division']
}
export type CtftimeAuthTokenData = string

// Internal interface of type definitions for typing purposes only
// - this interface does not describe a real data-structure
interface TokenDataTypes {
  [tokenKinds.auth]: AuthTokenData;
  [tokenKinds.team]: TeamTokenData;
  [tokenKinds.verify]: VerifyTokenData;
  [tokenKinds.ctftimeAuth]: CtftimeAuthTokenData;
}

export type Token = string

interface InternalTokenData<Kind extends tokenKinds> {
  k: Kind
  t: number
  d: TokenDataTypes[Kind]
}

const tokenExpiries = {
  [tokenKinds.auth]: Infinity,
  [tokenKinds.team]: Infinity,
  [tokenKinds.verify]: config.loginTimeout,
  [tokenKinds.ctftimeAuth]: config.loginTimeout
}

const timeNow = () => Math.floor(Date.now() / 1000)

const encryptToken = async (content: unknown): Promise<string> => {
  const iv = await randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', tokenKey, iv)
  const cipherText = cipher.update(JSON.stringify(content))
  cipher.final()
  const tokenContent = Buffer.concat([iv, cipherText, cipher.getAuthTag()])
  return tokenContent.toString('base64')
}

const decryptToken = async (token: string): Promise<unknown | null> => {
  try {
    const tokenContent = Buffer.from(token, 'base64')
    const iv = tokenContent.slice(0, 12)
    const authTag = tokenContent.slice(tokenContent.length - 16)
    const cipher = crypto.createDecipheriv('aes-256-gcm', tokenKey, iv)
    cipher.setAuthTag(authTag)
    const plainText = cipher.update(tokenContent.slice(12, tokenContent.length - 16))
    cipher.final()
    return JSON.parse(plainText.toString())
  } catch (e) {
    return null
  }
}

export const getData = async <Kind extends tokenKinds>(expectedTokenKind: Kind, token: Token): Promise<TokenDataTypes[Kind] | null> => {
  const content = await decryptToken(token) as InternalTokenData<Kind> | null
  if (content === null) {
    return null
  }
  const { k: kind, t: createdAt, d: data } = content
  if (kind !== expectedTokenKind) {
    return null
  }
  if (createdAt + tokenExpiries[kind] < timeNow()) {
    return null
  }
  return data
}

export const getToken = async <Kind extends tokenKinds>(tokenKind: Kind, data: TokenDataTypes[Kind]): Promise<Token> => {
  const token = await encryptToken({
    k: tokenKind,
    t: timeNow(),
    d: data
  }) as Token
  return token
}
