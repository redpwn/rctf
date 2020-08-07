import { Provider } from '../../../uploads/provider'
import process from 'process'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import config from '../../../config/server'
import { FastifyInstance } from 'fastify'
import fastifyStatic from 'fastify-static'
import contentDisposition from 'content-disposition'

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

  private uploadMap: Map<string, Upload>

  constructor (options: LocalProviderOptions, app: FastifyInstance) {
    if (options.uploadDirectory === undefined) {
      options.uploadDirectory = path.join(process.cwd(), 'uploads')
    }

    fs.mkdirSync(options.uploadDirectory, { recursive: true })

    this.uploadDirectory = path.resolve(options.uploadDirectory)
    this.endpoint = options.endpoint || '/uploads'

    this.uploadMap = new Map<string, Upload>()

    void app.register(async (fastify) => {
      void fastify.register(fastifyStatic, {
        root: this.uploadDirectory,
        serve: false
      })

      // Fastify bug #2466
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      fastify.setNotFoundHandler(async (req, res) => {
        void res.status(404)
        return 'Not found'
      })

      fastify.get<{
        Querystring: RequestQuerystring
      }>('/', {
        schema: {
          querystring: {
            type: 'object',
            properties: {
              key: {
                type: 'string'
              }
            },
            required: ['key']
          }
        }
      }, async (request, reply) => {
        const key = request.query.key.toString()

        const upload = this.uploadMap.get(key)
        if (upload != null) {
          void reply.header('Cache-Control', 'public, max-age=31557600, immutable')
          void reply.header('Content-Disposition', contentDisposition(upload.name))
          void reply.sendFile(path.relative(this.uploadDirectory, upload.filePath))
        } else {
          reply.callNotFound()
        }
      })
    }, {
      prefix: this.endpoint
    })
  }

  private getKey (hash: string, name: string): string {
    return `${hash}/${name}`
  }

  private getUrlPath (key: string): string {
    return `${this.endpoint}?key=${encodeURIComponent(key)}`
  }

  async upload (data: Buffer, name: string): Promise<string> {
    const hash = crypto.createHash('sha256')
      .update(data)
      .digest('hex')

    const key = this.getKey(hash, name)
    const urlPath = this.getUrlPath(key)
    const filePath = path.join(this.uploadDirectory, hash)

    this.uploadMap.set(key, {
      filePath,
      name
    })

    await fs.promises.writeFile(filePath, data)

    return (config.origin || '') + urlPath
  }

  async getUrl (sha256: string, name: string): Promise<string|null> {
    const key = this.getKey(sha256, name)
    if (!this.uploadMap.has(key)) return null

    return this.getUrlPath(key)
  }
}
