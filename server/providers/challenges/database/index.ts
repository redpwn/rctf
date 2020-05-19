import { Challenge } from '../../../challenges/types'
import { applyChallengeDefaults } from '../../../challenges/util'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

import * as db from '../../../database'
import { deepCopy } from '../../../util'

interface DatabaseProviderOptions {
  updateInterval: number;
}

interface DatabaseChallenge {
  id: string;
  data: Omit<Challenge, 'id'>;
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
    try {
      const dbchallenges: DatabaseChallenge[] = await db.challenges.getAllChallenges()

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
    chall = deepCopy(chall)

    const id = chall.id
    delete chall.id

    return {
      id,
      data: chall
    }
  }

  async updateChallenge (chall: Challenge): Promise<void> {
    const originalData = await db.challenges.getChallengeById({
      id: chall.id
    })

    // If we're inserting, have sane defaults
    if (originalData === undefined) {
      chall = applyChallengeDefaults(chall)
    } else {
      chall = {
        ...originalData,
        ...chall
      }
    }

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
