import { Provider } from '../../../uploads/types'
import process from 'process'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import config from '../../../../config/server'
import fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import fastifyStatic from 'fastify-static'
import contentDisposition from 'content-disposition'

interface LocalProviderOptions {
  uploadDirectory?: string;
  endpoint: string;
}

interface Upload {
  filePath: string;
  name: string;
}

export default class LocalProvider implements Provider {
  private uploadDirectory: string
  private endpoint: string

  private uploadMap: Map<string, Upload>

  constructor (options: LocalProviderOptions, app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) {
    if (options.uploadDirectory === undefined) {
      options.uploadDirectory = path.join(process.cwd(), 'uploads')
    }

    fs.mkdirSync(options.uploadDirectory, { recursive: true })

    this.uploadDirectory = path.resolve(options.uploadDirectory)
    this.endpoint = options.endpoint

    this.uploadMap = new Map()

    app.register(async (fastify) => {
      fastify.register(fastifyStatic, {
        root: this.uploadDirectory,
        serve: false
      })
      fastify.get('/', this.handleRequest.bind(this))
      fastify.setNotFoundHandler(async (req, res) => {
        res.status(404)
        return 'Not found'
      })
    }, {
      prefix: this.endpoint
    })
  }

  async handleRequest (req: fastify.FastifyRequest, res: fastify.FastifyReply<ServerResponse>): Promise<void> {
    const key = req.query.key.toString()

    if (this.uploadMap.has(key)) {
      const upload = this.uploadMap.get(key)

      res.header('Cache-Control', 'public, max-age=31557600, immutable')
      res.header('Content-Disposition', contentDisposition(upload.name))
      res.sendFile(path.relative(this.uploadDirectory, upload.filePath))
    } else {
      res.callNotFound()
    }
  }

  async upload (data: Buffer, name: string): Promise<string> {
    const hash = crypto.createHash('sha256')
      .update(data)
      .digest()
      .toString('hex')

    const key = `${hash}/${name}`
    const urlPath = `${this.endpoint}?key=${encodeURIComponent(key)}`
    const filePath = path.join(this.uploadDirectory, hash)

    this.uploadMap.set(key, {
      filePath,
      name
    })

    await fs.promises.writeFile(filePath, data)

    return (config.origin || '') + urlPath
  }
}
