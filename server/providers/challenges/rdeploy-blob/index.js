const config = require('../../../../config/server')
const path = require('path')
const fs = require('fs')

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
    const configPath = path.join(__dirname, '../../../../', this._rDeployDirectory, 'config.json')

    fs.readFile(configPath, (err, data) => {
      if (err) {
        // FIXME: log error properly
        console.error(err)
      }

      try {
        const challenges = JSON.parse(data)

        this._onUpdate(challenges)
      } catch (e) {
        // FIXME: log error properly
        console.error(e)
      }
    })
  }

  forceUpdate () {
    this._update()
  }

  cleanup () {
    clearInterval(this._interval)
  }
}

module.exports = RDeployBlobProvider
