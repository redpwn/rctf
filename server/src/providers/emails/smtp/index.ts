import nodemailer from 'nodemailer'
import Mailer from 'nodemailer/lib/mailer'
import { Provider, Mail } from '../../../email/provider'

interface SmtpProviderOptions {
  smtpUrl: string;
}

export default class SmtpProvider implements Provider {
  private mailer: Mailer
  constructor (_options: Partial<SmtpProviderOptions>) {
    const options: Required<SmtpProviderOptions> = {
      smtpUrl: _options.smtpUrl || process.env.RCTF_SMTP_URL
    } as Required<SmtpProviderOptions>
    // TODO: validate that all options are indeed provided

    this.mailer = nodemailer.createTransport(options.smtpUrl)
  }

  async send (mail: Mail): Promise<void> {
    await this.mailer.sendMail(mail)
  }
}
