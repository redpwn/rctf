import { v4 as uuidv4 } from 'uuid'
import { makeUser, User } from '../database/users'
import { getToken, tokenKinds } from './token'
import { HandlerResponseFactories } from '../api/helpers'
import { ValueOf } from 'type-fest'

type RegisterResponseKinds =
  | 'goodRegister'
  | 'badKnownCtftimeId'
  | 'badKnownEmail'
  | 'badKnownName'

export const register = async (
  {
    division,
    email,
    name,
    ctftimeId,
  }: Pick<User, 'division' | 'email' | 'name' | 'ctftimeId'>,
  res: HandlerResponseFactories<RegisterResponseKinds>
): Promise<
  ReturnType<ValueOf<HandlerResponseFactories<RegisterResponseKinds>>>
> => {
  const userUuid = uuidv4()
  try {
    await makeUser({
      division,
      email,
      name,
      id: userUuid,
      ctftimeId,
      perms: 0,
    })
  } catch (e) {
    if (e instanceof Object) {
      const { constraint } = e as { constraint?: string }
      if (constraint === 'users_ctftime_id_key') {
        return res.badKnownCtftimeId()
      }
      if (constraint === 'users_email_key') {
        return res.badKnownEmail()
      }
      if (constraint === 'users_name_key') {
        return res.badKnownName()
      }
    }
    throw e
  }
  const authToken = await getToken(tokenKinds.auth, userUuid)
  return res.goodRegister({ authToken })
}
