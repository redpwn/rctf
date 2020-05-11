export interface Provider {
  upload (data: Buffer, name: string): Promise<string>;
}
