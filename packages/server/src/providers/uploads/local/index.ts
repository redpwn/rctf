import { Provider } from '../../../uploads/provider'
import process from 'process'
import path from 'path'
import fs from 'fs'
import { ServerResponse } from 'http'
import crypto from 'crypto'
import { FastifyInstance } from 'fastify'
import fastifyStatic, { FastifyStaticOptions } from 'fastify-static'

interface LocalProviderOptions {
  uploadDirectory?: string
}

export default class LocalProvider implements Provider {
  private readonly uploadDirectory: string

  constructor (options: LocalProviderOptions, app: FastifyInstance) {
    this.uploadDirectory = path.resolve(options.uploadDirectory ?? path.join(process.cwd(), 'uploads'))

    void app.register(fastifyStatic, {
      root: this.uploadDirectory,
      prefix: '/uploads/',
      decorateReply: false,
      dotfiles: 'allow',
      index: false,
      setHeaders: (res: ServerResponse) => {
        res.setHeader('cache-control', 'public, max-age=31557600, immutable')
        res.setHeader('content-disposition', 'atttachment')
      }
      // fastify-static types are incorrect
      // https://github.com/fastify/fastify-static/blob/master/index.d.ts#L48
      // https://github.com/pillarjs/send#dotfiles
    } as unknown as FastifyStaticOptions)
  }

  private getKey (hash: string, name: string): string {
    return `${hash}/${name}`
  }

  async upload (data: Buffer, name: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(data).digest('hex')
    const key = this.getKey(hash, name)
    const filePath = path.join(this.uploadDirectory, key)

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.writeFile(filePath, data)

    return `/uploads/${key}`
  }

  async getUrl (sha256: string, name: string): Promise<string|null> {
    const key = this.getKey(sha256, name)
    try {
      await fs.promises.access(path.join(this.uploadDirectory, key))
    } catch {
      return null
    }
    return `/uploads/${key}`
  }
}
