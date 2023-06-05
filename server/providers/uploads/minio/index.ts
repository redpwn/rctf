import crypto from 'crypto'
import { Provider } from '../../../uploads/provider'
import { Client as MinioClient } from 'minio'
import { Stream } from 'stream'

interface MinioProviderOptions {
  accessKey: string;
  secretKey: string;
  endPoint: string;
  pathStyle: boolean;
  port: number;
  bucketName: string;
  useSSL: boolean;
}

class MinioFile {
  key: string
  name: string
  sha256: string
  bucket: string
  url: string

  constructor (sha256: string, name: string, bucket: string) {
    this.key = `uploads/${sha256}/${name}`
    this.name = name
    this.sha256 = sha256
    this.bucket = bucket
    this.url = `/proxy/file/${this.key}`
  }

  async exists (minioClient: MinioClient): Promise<boolean> {
    const stat = await new Promise((resolve, reject) => {
      return minioClient.statObject(
        this.bucket,
        this.key,
        (err, stat) => {
          if (err) {
            console.log(err)
            return reject(err)
          }
          return resolve(stat)
        }
      )
    })
    return !!stat
  }
}

export default class MinioProvider implements Provider {
  private bucketName: string
  private minioClient: MinioClient

  constructor (_options: Partial<MinioProviderOptions>) {
    const options: Required<MinioProviderOptions> = {
      accessKey: _options.accessKey || process.env.RCTF_MINIO_ACCESS_KEY as string,
      secretKey: _options.secretKey || process.env.RCTF_MINIO_SECRET_KEY as string,
      endPoint: _options.endPoint || process.env.RCTF_MINIO_ENDPOINT as string || 'minio',
      port: _options.port || (process.env.RCTF_MINIO_PORT as unknown) as number || 9000,
      bucketName: _options.bucketName || process.env.RCTF_MINIO_BUCKET_NAME as string || 'rctf',
      pathStyle: _options.pathStyle || true,
      useSSL: _options.useSSL || false
    }

    // TODO: validate that all options are indeed provided
    this.minioClient = new MinioClient({
      accessKey: options.accessKey,
      secretKey: options.secretKey,
      endPoint: options.endPoint,
      useSSL: options.useSSL,
      pathStyle: options.pathStyle,
      port: options.port
    })

    this.bucketName = options.bucketName
  }

  private getMinioFile = (sha256: string, name: string): MinioFile => {
    return new MinioFile(sha256, name, this.bucketName)
  }

  upload = async (data: Buffer, name: string): Promise<string> => {
    const hash = crypto.createHash('sha256').update(data).digest('hex')
    const file = this.getMinioFile(hash, name)
    const exists = await file.exists(this.minioClient)

    if (!exists) {
      await this.minioClient
        .putObject(this.bucketName, file.key, data)
        .catch((e) => {
          console.log('Error while creating object: ', e)
          throw e
        })
    }
    return file.url
  }

  async getUrl (sha256: string, name: string): Promise<string|null> {
    const file = new MinioFile(sha256, name, this.bucketName)
    const exists = await file.exists(this.minioClient)

    if (!exists) return null
    return file.url
  }

  async stream2buffer (stream: Stream): Promise<Buffer> {
    return new Promise <Buffer>((resolve, reject) => {
      const _buf: any[] = []
      stream.on('data', chunk => _buf.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(_buf)))
      stream.on('error', err => reject(err))
    })
  }

  private async streamFile (name: string): Promise<Buffer> {
    const fileStream = await this.minioClient.getObject(this.bucketName, name)
    return this.stream2buffer(fileStream)
  }
}
