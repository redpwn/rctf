import { Provider } from '../../../uploads/provider'
import process from 'process'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import config from '../../../config/server'
import { FastifyInstance } from 'fastify'
import fastifyStatic from 'fastify-static'
import { ServerResponse } from 'http'

interface LocalProviderOptions {
  uploadDirectory?: string;
  endpoint?: string;
}

interface Upload {
  filePath: string;
  name: string;
}

interface RequestQuerystring {
  key: string;
}

export default class LocalProvider implements Provider {
  private uploadDirectory: string
  private endpoint: string

  constructor (options: LocalProviderOptions, app: FastifyInstance) {
    if (options.uploadDirectory === undefined) {
      options.uploadDirectory = path.join(process.cwd(), 'uploads')
    }

    fs.mkdirSync(options.uploadDirectory, { recursive: true })

    this.uploadDirectory = path.resolve(options.uploadDirectory)
    this.endpoint = options.endpoint || '/uploads'

    void app.register(fastifyStatic, {
      root: this.uploadDirectory,
      prefix: this.endpoint,
      decorateReply: false,
      dotfiles: 'allow',
      index: false,
      setHeaders: (res: ServerResponse) => {
        res.setHeader('cache-control', 'public, max-age=31557600, immutable')
        res.setHeader('content-disposition', 'atttachment')
      }
    })
  }

  private getKey (hash: string, name: string): string {
    return `${hash}/${name}`
  }

  private getUrlPath (key: string): string {
    return `${this.endpoint}/${key}`
  }

  async upload (data: Buffer, name: string): Promise<string> {
    const hash = crypto.createHash('sha256')
      .update(data)
      .digest('hex')

    const key = this.getKey(hash, name)
    const urlPath = this.getUrlPath(key)
    const filePath = path.join(this.uploadDirectory, hash, name)

    await fs.promises.mkdir(path.join(this.uploadDirectory, hash))
    await fs.promises.writeFile(filePath, data)

    return (config.origin || '') + urlPath
  }

  async getUrl (sha256: string, name: string): Promise<string|null> {
    const key = this.getKey(sha256, name)
    try {
      await fs.promises.access(path.join(this.uploadDirectory, key))
    } catch {
      return null
    }

    return this.getUrlPath(key)
  }
}
