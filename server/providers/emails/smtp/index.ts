import nodemailer from 'nodemailer'
import Mailer from 'nodemailer/lib/mailer'
import { Provider, Mail } from '../../../email/provider'

interface SmtpProviderOptions {
  smtpUrl: string;
}

export default class SmtpProvider implements Provider {
  private mailer: Mailer
  constructor (options: SmtpProviderOptions) {
    this.mailer = nodemailer.createTransport(options.smtpUrl)
  }

  send (mail: Mail): Promise<void> {
    return this.mailer.sendMail(mail)
  }
}
