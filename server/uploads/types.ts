export interface Provider {
  // Returns a string, the url of the uploaded file
  upload (data: Buffer, name: string): Promise<string>;
}
