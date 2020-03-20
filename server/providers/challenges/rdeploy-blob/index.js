const config = require('../../../../config/server')
const { reloadModule } = require('../../../util')
const path = require('path')

class RDeployBlobProvider {
  constructor ({ options, onUpdate }) {
    options = {
      updateInterval: 60 * 1000,
      useGlobalRDeployDirectory: true,
      // rDeployDirectory: ''
      ...options
    }

    this._onUpdate = onUpdate
    this._updateInterval = options.updateInterval
    this._rDeployDirectory = options.useGlobalRDeployDirectory
      ? config.rDeployDirectory
      : options.rDeployDirectory
    this._interval = setInterval(() => this._update(), this._updateInterval)
    this._update()
  }

  _update () {
    const module = path.join('../../', this._rDeployDirectory, 'config.json')

    const challenges = reloadModule(module)

    this._onUpdate(challenges)
  }

  forceUpdate () {
    this._update()
  }

  cleanup () {
    clearInterval(this._interval)
  }
}

module.exports = RDeployBlobProvider
