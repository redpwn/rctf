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

export default class LocalProvider implements Provider {
  private uploadDirectory: string
  private endpoint: string
  private app: express.Application

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

    this.app.use(this.endpoint, express.static(this.uploadDirectory))
  }

  upload (data: Buffer, name: string): Promise<URL> {
    const hash = crypto.createHash('sha256')
      .update(data)
      .digest()
      .toString('hex')

    const urlPath = `${this.endpoint}/${hash}/${name}`
    const filePath = path.join(this.uploadDirectory, hash)

    this.app.get(urlPath, (req, res) => {
      res.download(filePath, name)
    })

    return fs.promises.writeFile(filePath, data)
      .then(() => new URL(`${config.origin}/${urlPath}`))
  }
}
