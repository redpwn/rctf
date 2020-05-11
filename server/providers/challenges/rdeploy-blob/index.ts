import path from 'path'
import { promises as fs } from 'fs'
import util from '../../../util'
import { get as getUploadProvider } from '../../../uploads'
import { Challenge, Points, File } from '../../../challenges/types'
import { Provider } from '../../../challenges/Provider'
import { EventEmitter } from 'events'

const uploadProvider = getUploadProvider()

interface RDeployBlobProviderOptions {
  updateInterval?: number;
  rDeployDirectory: string;
  rDeployFiles: string;
}

interface RDeployChallenge {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  files: string[];
  points: Points;
  flag: string;
}

class RDeployBlobProvider extends EventEmitter implements Provider {
  private _updateInterval: number
  private _rDeployDirectory: string
  private _interval: NodeJS.Timeout
  private challenges: Challenge[]

  private ready = false
  private downloadMap: Map<string, string>

  constructor (options: RDeployBlobProviderOptions) {
    super()
    options = {
      updateInterval: 60 * 1000,
      ...options
    }

    this._updateInterval = options.updateInterval
    this._rDeployDirectory = path.join(__dirname, '../../../../', options.rDeployDirectory)
    this._interval = setInterval(() => this._update(), this._updateInterval)

    this.downloadMap = new Map()

    const fileDir = path.join(this._rDeployDirectory, options.rDeployFiles)
    fs.readdir(fileDir)
      .then(files => {
        return Promise.all(
          files.map(
            file => {
              const filePath = path.join(fileDir, file)

              return fs.stat(filePath)
                .then(stats => {
                  if (stats.isFile) {
                    return fs.readFile(filePath)
                  }
                  return null
                })
                .then(data => {
                  if (data === null) return null

                  return uploadProvider.upload(data, util.normalize.normalizeDownload(file))
                    .then(url => {
                      return {
                        file,
                        url
                      }
                    })
                })
            })
        )
      })
      .then(uploadInfo => {
        uploadInfo.forEach(data => {
          if (data !== null) {
            const { file, url } = data
            this.downloadMap.set(file, url)
          }
        })
      })
      // When done uploading files, allow updates
      .then(() => {
        this.ready = true
        this._update()
      })
  }

  _update (): void {
    // Prevent updates if downloads not initialized
    if (!this.ready) return

    fs.readFile(path.join(this._rDeployDirectory, 'config.json'), 'utf8')
      .then((data: string) => {
        try {
          const rawChallenges: RDeployChallenge[] = JSON.parse(data)

          this.challenges = rawChallenges.map((chall: RDeployChallenge): Challenge => {
            const downloadUrls: File[] = chall.files.map(file => {
              const basename = path.basename(file)
              return {
                name: util.normalize.normalizeDownload(basename),
                url: this.downloadMap.get(basename)
              }
            })

            return {
              ...chall,
              files: downloadUrls
            }
          })

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
