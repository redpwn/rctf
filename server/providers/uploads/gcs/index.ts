import { Storage, Bucket } from '@google-cloud/storage'
import crypto from 'crypto'
import { Provider } from '../../../uploads/types'

interface GcsProviderOptions {
  credentials: object;
  bucketName: string;
}

export default class GcsProvider implements Provider {
  private bucket: Bucket
  private bucketName: string

  constructor (options: GcsProviderOptions) {
    const storage = new Storage({
      credentials: options.credentials
    })
    this.bucket = new Bucket(storage, options.bucketName)
    this.bucketName = options.bucketName
  }

  upload = async (data: Buffer, name: string): Promise<string> => {
    const hash = crypto.createHash('sha256').update(data).digest('hex')
    const key = `uploads/${hash}/${encodeURIComponent(name)}`
    const file = this.bucket.file(key)
    const exists = (await file.exists())[0]
    if (!exists) {
      await file.save(data, {
        public: true,
        resumable: false,
        metadata: {
          contentDisposition: 'download'
        }
      })
    }
    return `https://${this.bucketName}.storage.googleapis.com/${key}`
  }
}
