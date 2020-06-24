import { promisify } from 'util'
import AWS from 'aws-sdk'
import { Provider, Mail } from '../../../email/provider'

interface SesProviderOptions {
  awsKeyId: string;
  awsKeySecret: string;
  awsRegion: string;
}

export default class SesProvider implements Provider {
  private sesSend: Function
  constructor (options: SesProviderOptions) {
    const credentials = new AWS.Credentials({
      accessKeyId: options.awsKeyId,
      secretAccessKey: options.awsKeySecret
    })
    const ses = new AWS.SES({
      credentials,
      region: options.awsRegion
    })
    this.sesSend = promisify(ses.sendEmail.bind(ses))
  }

  async send (mail: Mail): Promise<void> {
    await this.sesSend({
      Destination: {
        ToAddresses: [mail.to]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: mail.html
          },
          Text: {
            Charset: 'UTF-8',
            Data: mail.text
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: mail.subject
        }
      },
      Source: mail.from
    })
  }
}
