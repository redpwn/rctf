import { FastifyInstance } from 'fastify'

export interface Provider {
  // Returns a string, the url of the uploaded file
  upload (data: Buffer, name: string): Promise<string>;

  // Returns a string, the url of the previously uploaded file. Returns null if the file was not previously uploaded.
  getUrl (sha256: string, name: string): Promise<string|null>;
}

export interface ProviderConstructor {
  new (options: unknown, app: FastifyInstance | null): Provider
}
