import nodemailer from 'nodemailer'
import Mailer from 'nodemailer/lib/mailer'
import mg from 'nodemailer-mailgun-transport'
import { Provider, Mail } from '../../../email/provider'

export default class MailgunProvider implements Provider {
  private mailer: Mailer
  constructor (options: mg.Options) {
    this.mailer = nodemailer.createTransport(mg(options))
  }

  send (mail: Mail): Promise<void> {
    return this.mailer.sendMail(mail)
  }
}
