import mg from 'mailgun-js'
import { Provider, Mail } from '../../../email/provider'

interface MailgunProviderOptions {
  apiKey: string;
  domain: string;
}

export default class MailgunProvider implements Provider {
  private mailer: mg.Messages
  constructor (options: MailgunProviderOptions) {
    this.mailer = mg({
      apiKey: options.apiKey || process.env.RCTF_MAILGUN_API_KEY,
      domain: options.domain || process.env.RCTF_MAILGUN_DOMAIN
    }).messages()
  }

  async send (mail: Mail): Promise<void> {
    await this.mailer.send(mail)
  }
}
