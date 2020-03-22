import config from '../../../../config/server'
import path from 'path'
import { promises as fs } from 'fs'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

interface RDeployBlobProviderOptions {
  updateInterval: number;
  useGlobalRDeployDirectory: boolean;
  rDeployDirectory?: string;
}

class RDeployBlobProvider extends EventEmitter implements Provider {
  _updateInterval: number
  _rDeployDirectory: string
  _interval: NodeJS.Timeout

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
          const challenges = JSON.parse(data)

          this.emit('update', challenges)
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

  cleanup (): void {
    clearInterval(this._interval)
  }
}

export default RDeployBlobProvider
