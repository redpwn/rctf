import { promisify } from 'util'
import AWS from 'aws-sdk'
import { Provider, Mail } from '../../../email/provider'

interface SesProviderOptions {
  awsKeyId: string;
  awsKeySecret: string;
  awsRegion: string;
}

export default class SesProvider implements Provider {
  private sesSend: (params: AWS.SES.Types.SendEmailRequest) => Promise<AWS.SES.Types.SendEmailResponse>

  constructor (options: SesProviderOptions) {
    const credentials = new AWS.Credentials({
      accessKeyId: options.awsKeyId || process.env.RCTF_SES_KEY_ID,
      secretAccessKey: options.awsKeySecret || process.env.RCTF_SES_KEY_SECRET
    })
    const ses = new AWS.SES({
      credentials,
      region: options.awsRegion || process.env.RCTF_SES_REGION
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
