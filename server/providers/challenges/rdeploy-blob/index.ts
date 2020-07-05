import path from 'path'
import { promises as fs } from 'fs'
import { normalize } from '../../../util'
import { get as getUploadProvider } from '../../../uploads'
import { Challenge, Points, File } from '../../../challenges/types'
import { applyChallengeDefaults } from '../../../challenges/util'
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
  tiebreakEligible: boolean;
  sortWeight?: number;
}

class RDeployBlobProvider extends EventEmitter implements Provider {
  private updateInterval: number
  private rDeployDirectory: string
  private interval: NodeJS.Timeout
  private challenges: Challenge[] = []

  private ready = false
  private downloadMap: Map<string, string>

  constructor (_options: RDeployBlobProviderOptions) {
    super()
    const options: Required<RDeployBlobProviderOptions> = {
      updateInterval: 60 * 1000,
      ..._options
    }

    this.updateInterval = options.updateInterval
    this.rDeployDirectory = path.join(__dirname, '../../../../../', options.rDeployDirectory)
    this.interval = setInterval(() => this.update(), this.updateInterval)

    this.downloadMap = new Map<string, string>()

    const fileDir = path.join(this.rDeployDirectory, options.rDeployFiles)
    void fs.readdir(fileDir)
      .then(async files => {
        await Promise.all(files.map(async file => {
          const filePath = path.join(fileDir, file)

          const stats = await fs.stat(filePath)
          if (stats.isFile()) {
            const data = await fs.readFile(filePath)

            const url = await uploadProvider.upload(data, normalize.normalizeDownload(file))

            this.downloadMap.set(file, url)
          }
        }))

        // When done uploading files, allow updates
        this.ready = true
        this.update()
      })
  }

  private update (): void {
    // Prevent updates if downloads not initialized
    if (!this.ready) return

    fs.readFile(path.join(this.rDeployDirectory, 'config.json'), 'utf8')
      .then((data: string) => {
        try {
          const rawChallenges = JSON.parse(data) as RDeployChallenge[]

          this.challenges = rawChallenges.map((chall: RDeployChallenge): Challenge => {
            const downloadUrls: File[] = chall.files.map(file => {
              const basename = path.basename(file)
              const fileUrl = this.downloadMap.get(basename)
              if (fileUrl === undefined) {
                throw new Error(`File not found: ${basename}`)
              }
              return {
                name: normalize.normalizeDownload(basename),
                url: fileUrl
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
    this.update()
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
      this.challenges.push(applyChallengeDefaults(chall))
    }

    this.emit('update', this.challenges)
  }

  deleteChallenge (id: string): void {
    this.challenges = this.challenges.filter(chall => chall.id !== id)

    this.emit('update', this.challenges)
  }

  cleanup (): void {
    clearInterval(this.interval)
  }
}

export default RDeployBlobProvider
