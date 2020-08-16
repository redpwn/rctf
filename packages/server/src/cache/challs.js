import EventEmitter from 'events'
import { promisify } from 'util'
import client, { subClient } from './client'

const redisSubscribe = promisify(subClient.subscribe.bind(subClient))
const redisPublish = promisify(client.publish.bind(client))
const redisClient = promisify(client.client.bind(client))

const channel = `${client.selected_db || 0}:chall-updates`
const clientId = redisClient('id')

export const subscribeChallUpdate = async () => {
  await redisSubscribe(channel)
}

export const publishChallUpdate = async () => {
  await redisPublish(channel, await clientId)
}

export const challUpdateEmitter = new EventEmitter()

subClient.on('message', async (msgChannel, msg) => {
  if (msgChannel !== channel || await clientId === parseInt(msg)) {
    return
  }
  challUpdateEmitter.emit('update')
})
