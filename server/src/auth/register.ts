import { v4 as uuidv4 } from 'uuid'
import { makeUser, User } from '../database/users'
import { getToken, tokenKinds } from './token'
import { responses } from '../responses'
import { ValueOf } from 'type-fest'

export const register = async (
  { division, email, name, ctftimeId }: Pick<User, 'division' | 'email' | 'name' | 'ctftimeId'>
): Promise<[typeof responses.goodRegister, { authToken: string }] | ValueOf<typeof responses>> => {
  const userUuid = uuidv4()
  try {
    await makeUser({
      division,
      email,
      name,
      id: userUuid,
      ctftimeId,
      perms: 0
    })
  } catch (e) {
    if (e instanceof Object) {
      const { constraint } = e as { constraint?: string }
      if (constraint === 'users_ctftime_id_key') {
        return responses.badKnownCtftimeId
      }
      if (constraint === 'users_email_key') {
        return responses.badKnownEmail
      }
      if (constraint === 'users_name_key') {
        return responses.badKnownName
      }
    }
    throw e
  }
  const authToken = await getToken(tokenKinds.auth, userUuid)
  return [responses.goodRegister, { authToken }]
}
