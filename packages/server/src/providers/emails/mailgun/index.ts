import got from 'got'
import { Provider, Mail } from '../../../email/provider'

interface MailgunProviderOptions {
  apiKey: string
  domain: string
}

export default class MailgunProvider implements Provider {
  private readonly apiKey: string
  private readonly domain: string
  constructor(_options: Partial<MailgunProviderOptions>) {
    const options = {
      apiKey: process.env.RCTF_MAILGUN_API_KEY ?? _options.apiKey,
      domain: process.env.RCTF_MAILGUN_DOMAIN ?? _options.domain,
    } as MailgunProviderOptions
    // TODO: validate that all options are indeed provided

    this.apiKey = options.apiKey
    this.domain = options.domain
  }

  async send(mail: Mail): Promise<void> {
    await got({
      url: `https://api.mailgun.net/v3/${this.domain}/messages`,
      method: 'POST',
      username: 'api',
      password: this.apiKey,
      form: mail,
    })
  }
}
