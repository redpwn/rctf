import config from '../config/server'
import client from './client'
import { VerifyTokenData } from '../auth/token'

export const makeLogin = async ({
  id,
}: {
  id: VerifyTokenData['verifyId']
}): Promise<void> => {
  await client.set(`login:${id}`, '0', 'px', config.loginTimeout)
}

export const useLogin = async ({
  id,
}: {
  id: VerifyTokenData['verifyId']
}): Promise<boolean> => {
  const result = await client.del(`login:${id}`)
  return result === 1
}
