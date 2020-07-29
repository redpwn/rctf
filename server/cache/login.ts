import { promisify } from 'util'
import config from '../../config/server'
import client from './client'
import { User } from '../database/users'

const redisSet = promisify(client.set.bind(client))
const redisDel = promisify(client.del.bind(client))

export const makeLogin = async ({ id }: Pick<User, 'id'>): Promise<void> => {
  await redisSet(`login:${id}`, '0', 'px', config.loginTimeout)
}

export const useLogin = async ({ id }: Pick<User, 'id'>): Promise<boolean> => {
  const result = await redisDel(`login:${id}`)
  return result === 1
}
