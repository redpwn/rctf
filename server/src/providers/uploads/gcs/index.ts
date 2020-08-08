import { Storage, Bucket, File } from '@google-cloud/storage'
import crypto from 'crypto'
import { Provider } from '../../../uploads/provider'

interface GcsProviderOptions {
  credentials: Record<string, unknown>;
  bucketName: string;
}

export default class GcsProvider implements Provider {
  private bucket: Bucket
  private bucketName: string

  constructor (_options: Partial<GcsProviderOptions>) {
    const options: Required<GcsProviderOptions> = {
      credentials: _options.credentials || JSON.parse(process.env.RCTF_GCS_CREDENTIALS as string) as GcsProviderOptions['credentials'],
      bucketName: _options.bucketName || process.env.RCTF_GCS_BUCKET as string
    }
    // TODO: validate that all options are indeed provided

    const storage = new Storage({
      credentials: options.credentials
    })
    this.bucket = new Bucket(storage, options.bucketName)
    this.bucketName = options.bucketName
  }

  private getGcsFile = (sha256: string, name: string): File => {
    const key = `uploads/${sha256}/${name}`
    const file = this.bucket.file(key)
    return file
  }

  upload = async (data: Buffer, name: string): Promise<string> => {
    const hash = crypto.createHash('sha256').update(data).digest('hex')
    const file = this.getGcsFile(hash, name)
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
    return this.toUrl(hash, name)
  }

  private toUrl (sha256: string, name: string): string {
    return `https://${this.bucketName}.storage.googleapis.com/uploads/${sha256}/${encodeURIComponent(name)}`
  }

  async getUrl (sha256: string, name: string): Promise<string|null> {
    const file = this.getGcsFile(sha256, name)

    const exists = (await file.exists())[0]
    if (!exists) return null

    return this.toUrl(sha256, name)
  }
}
