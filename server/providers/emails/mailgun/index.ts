import mg from 'mailgun-js'
import { Provider, Mail } from '../../../email/provider'

interface MailgunProviderOptions {
  apiKey: string;
  domain: string;
}

export default class MailgunProvider implements Provider {
  private mailer: mg.Messages
  constructor (_options: Partial<MailgunProviderOptions>) {
    const options: Required<MailgunProviderOptions> = {
      apiKey: _options.apiKey || process.env.RCTF_MAILGUN_API_KEY,
      domain: _options.domain || process.env.RCTF_MAILGUN_DOMAIN
    } as Required<MailgunProviderOptions>
    // TODO: validate that all options are indeed provided

    this.mailer = mg({
      apiKey: options.apiKey,
      domain: options.domain
    }).messages()
  }

  async send (mail: Mail): Promise<void> {
    await this.mailer.send(mail)
  }
}
