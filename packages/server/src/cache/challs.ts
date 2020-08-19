import { EventEmitter } from 'events'
import client, { subClient } from './client'

const channel = `${client.options.db ?? 0}:chall-updates`
const clientId = client.client('id')

export const subscribeChallUpdate = async (): Promise<void> => {
  await subClient.subscribe(channel)
}

export const publishChallUpdate = async (): Promise<void> => {
  await client.publish(channel, await clientId)
}

export const challUpdateEmitter = new EventEmitter()

subClient.on('message', async (msgChannel, msg) => {
  if (msgChannel !== channel || await clientId === parseInt(msg)) {
    return
  }
  challUpdateEmitter.emit('update')
})
