import { Challenge } from '../../../challenges/types'
import { applyChallengeDefaults } from '../../../challenges/util'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

import * as db from '../../../database'
import { DatabaseChallenge } from '../../../database/challenges'
import { deepCopy } from '../../../util'

class DatabaseProvider extends EventEmitter implements Provider {
  private challenges: Challenge[] = []

  constructor () {
    super()
    void this.update()
  }

  private async update (): Promise<void> {
    try {
      const dbchallenges = await db.challenges.getAllChallenges()

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
    })

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
    // do nothing
  }
}

export default DatabaseProvider
