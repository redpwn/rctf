import config from '../../../../config/server'
import path from 'path'
import { EventEmitter } from 'events'
import { promises as fs } from 'fs'

interface RDeployBlobProviderOptions {
  updateInterval: number,
  useGlobalRDeployDirectory: boolean,
  rDeployDirectory: string,
}

class RDeployBlobProvider extends EventEmitter {
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

  _update () {
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

  forceUpdate () {
    this._update()
  }

  cleanup () {
    clearInterval(this._interval)
  }
}

export default RDeployBlobProvider
