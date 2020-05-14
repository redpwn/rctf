import { Provider } from '../../../uploads/types'
import process from 'process'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import express from 'express'
import config from '../../../../config/server'

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
  private app: express.Application

  private uploadMap: Map<string, Upload>

  constructor (options: LocalProviderOptions, app: express.Application) {
    if (options.uploadDirectory === undefined) {
      options.uploadDirectory = path.join(process.cwd(), 'uploads')
    }

    if (!fs.existsSync(options.uploadDirectory)) {
      fs.mkdirSync(options.uploadDirectory)
    }

    this.uploadDirectory = options.uploadDirectory
    this.endpoint = options.endpoint
    this.app = app

    this.uploadMap = new Map()
    this.app.get(this.endpoint, this.handleRequest.bind(this))
  }

  handleRequest (req: express.Request, res: express.Response): void {
    const key = req.query.key.toString()

    if (this.uploadMap.has(key)) {
      const upload = this.uploadMap.get(key)

      res.download(upload.filePath, upload.name)
    } else {
      res.status(404)
      res.end()
    }
  }

  upload (data: Buffer, name: string): Promise<string> {
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

    return fs.promises.writeFile(filePath, data)
      .then(() => config.serverOrigin + urlPath)
  }
}
