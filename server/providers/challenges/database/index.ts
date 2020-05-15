import { Challenge } from '../../../challenges/types'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

import db from '../../../database'

interface DatabaseProviderOptions {
  updateInterval: number;
}

interface DatabaseChallenge {
  id: string;
  data: any;
}

class DatabaseProvider extends EventEmitter implements Provider {
  private _updateInterval: number
  private _interval: NodeJS.Timeout
  private challenges: Challenge[]

  constructor (options: DatabaseProviderOptions) {
    super()
    options = {
      updateInterval: 60 * 1000,
      ...options
    }

    this._updateInterval = options.updateInterval
    this._interval = setInterval(() => this._update(), this._updateInterval)
    this._update()
  }

  async _update (): Promise<void> {
    const dbchallenges: DatabaseChallenge[] = await db.challenges.getAllChallenges()

    try {
      this.challenges = dbchallenges.map(({ id, data }) => {
        return {
          ...data,
          id
        }
      })

      this.emit('update', this.challenges)
    } catch (e) {
      // TODO: wrap error?
      this.emit('error', e)
    }
  }

  forceUpdate (): void {
    this._update()
  }

  challengeToRow (chall: Challenge): DatabaseChallenge {
    const id = chall.id
    delete chall.id

    return {
      id,
      data: chall
    }
  }

  async updateChallenge (chall: Challenge): Promise<void> {
    const data = this.challengeToRow(chall)

    await db.challenges.upsertChallenge(data)

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
