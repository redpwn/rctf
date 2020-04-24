import config from '../../../../config/server'
import path from 'path'
import { promises as fs } from 'fs'
import { Challenge } from '../../../challenges/types'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

interface RDeployBlobProviderOptions {
  updateInterval: number;
  useGlobalRDeployDirectory: boolean;
  rDeployDirectory?: string;
}

class RDeployBlobProvider extends EventEmitter implements Provider {
  private _updateInterval: number
  private _rDeployDirectory: string
  private _interval: NodeJS.Timeout
  private challenges: Challenge[]

  constructor (options: RDeployBlobProviderOptions) {
    super()
    options = {
      updateInterval: 60 * 1000,
      useGlobalRDeployDirectory: true,
      // rDeployDirectory: ''
      ...options
    }

    this._updateInterval = options.updateInterval
    this._rDeployDirectory = options.useGlobalRDeployDirectory
      ? config.rDeployDirectory
      : options.rDeployDirectory
    this._interval = setInterval(() => this._update(), this._updateInterval)
    this._update()
  }

  _update (): void {
    const configPath = path.join(__dirname, '../../../../', this._rDeployDirectory, 'config.json')

    fs.readFile(configPath, 'utf8')
      .then((data: string) => {
        try {
          this.challenges = JSON.parse(data)

          this.emit('update', this.challenges)
        } catch (e) {
          // TODO: wrap error?
          this.emit('error', e)
        }
      })
      .catch((err: Error) => {
        // TODO: wrap error?
        this.emit('error', err)
      })
  }

  forceUpdate (): void {
    this._update()
  }

  updateChallenge (chall: Challenge): void {
    let challengeExists = false
    for (let i = 0; i < this.challenges.length; i++) {
      if (this.challenges[i].id === chall.id) {
        this.challenges[i] = { ...this.challenges[i], ...chall }
        challengeExists = true
      }
    }

    if (!challengeExists) {
      this.challenges.push(chall)
    }

    this.emit('update', this.challenges)
  }

  deleteChallenge (id: string): void {
    this.challenges = this.challenges.filter(chall => chall.id !== id)

    this.emit('update', this.challenges)
  }

  cleanup (): void {
    clearInterval(this._interval)
  }
}

export default RDeployBlobProvider
