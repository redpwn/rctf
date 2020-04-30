import { Challenge } from '../../../challenges/types'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

const db = require('../../../database') // eslint-disable-line @typescript-eslint/no-var-requires

interface DatabaseProviderOptions {
  updateInterval: number;
}

class DatabaseProvider extends EventEmitter implements Provider {
  private _updateInterval: number
  private _interval: NodeJS.Timeout
  private challenges: Challenge[]

  constructor (options: DatabaseProviderOptions) {
    super()
    options = {
      updateInterval: 60 * 1000,
      // rDeployDirectory: ''
      ...options
    }

    this._updateInterval = options.updateInterval
    this._interval = setInterval(() => this._update(), this._updateInterval)
    this._update()
  }

  async _update (): Promise<void> {
    const dbchallenges = await db.challenges.getAllChallenges()

    try {
      this.challenges = dbchallenges

      this.emit('update', this.challenges)
    } catch (e) {
      // TODO: wrap error?
      this.emit('error', e)
    }
  }

  forceUpdate (): void {
    this._update()
  }

  async updateChallenge (chall: Challenge): Promise<void> {
    const updateResponse = await db.challenges.updateChallenge({
      id: chall.id,
      name: chall.name,
      description: chall.description,
      files: chall.files,
      author: chall.author,
      category: chall.category,
      points: chall.points,
      flag: chall.flag
    })

    if (updateResponse.length === 0) {
      // Nothing was updated which means chall with id does not exist, create the challenge
      await db.challenges.createChallenge({
        id: chall.id,
        name: chall.name,
        description: chall.description,
        files: chall.files,
        author: chall.author,
        category: chall.category,
        points: chall.points,
        flag: chall.flag
      })
    }

    this._update()
  }

  async deleteChallenge (id: string): Promise<void> {
    await db.challenges.removeChallengeById({ id: id })

    this._update()
  }

  cleanup (): void {
    clearInterval(this._interval)
  }
}

export default DatabaseProvider
