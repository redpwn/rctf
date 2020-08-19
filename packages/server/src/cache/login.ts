import config from '../config/server'
import client from './client'

export const makeLogin = async ({ id }: { id: string }): Promise<void> => {
  await client.set(`login:${id}`, '0', 'px', config.loginTimeout)
}

export const useLogin = async ({ id }: { id: string }): Promise<boolean> => {
  const result = await client.del(`login:${id}`)
  return result === 1
}
