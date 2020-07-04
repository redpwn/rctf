import { Challenge } from '../../../challenges/types'
import { applyChallengeDefaults } from '../../../challenges/util'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

import * as db from '../../../database'
import { deepCopy } from '../../../util'

interface DatabaseProviderOptions {
  updateInterval?: number;
}

interface DatabaseChallenge {
  id: string;
  data: Omit<Challenge, 'id'>;
}

class DatabaseProvider extends EventEmitter implements Provider {
  private updateInterval: number
  private interval: NodeJS.Timeout
  private challenges: Challenge[] = []

  constructor (_options: DatabaseProviderOptions) {
    super()
    const options: Required<DatabaseProviderOptions> = {
      updateInterval: 60 * 1000,
      ..._options
    }

    this.updateInterval = options.updateInterval
    this.interval = setInterval(() => { void this.update() }, this.updateInterval)
    void this.update()
  }

  private async update (): Promise<void> {
    try {
      const dbchallenges = await db.challenges.getAllChallenges() as DatabaseChallenge[]

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
    void this.update()
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
    }) as DatabaseChallenge

    // If we're inserting, have sane defaults
    if (originalData === undefined) {
      chall = applyChallengeDefaults(chall)
    } else {
      chall = {
        ...originalData.data,
        ...chall
      }
    }

    const data = this.challengeToRow(chall)

    await db.challenges.upsertChallenge(data)

    void this.update()
  }

  async deleteChallenge (id: string): Promise<void> {
    await db.challenges.removeChallengeById({ id: id })

    void this.update()
  }

  cleanup (): void {
    clearInterval(this.interval)
  }
}

export default DatabaseProvider
