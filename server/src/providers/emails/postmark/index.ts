import got from 'got'
import { Provider, Mail } from '../../../email/provider'

interface PostmarkProviderOptions {
  serverToken: string
}

type PostmarkResponse = {
  Message: string
}

export default class PostmarkProvider implements Provider {
  private serverToken: string

  constructor (_options: Partial<PostmarkProviderOptions>) {
    const options: Required<PostmarkProviderOptions> = {
      serverToken: _options.serverToken || process.env.RCTF_POSTMARK_SERVER_TOKEN
    } as Required<PostmarkProviderOptions>
    // TODO: validate that all options are indeed provided

    this.serverToken = options.serverToken
  }

  async send (mail: Mail): Promise<void> {
    await got({
      url: 'https://api.postmarkapp.com/email',
      method: 'POST',
      headers: {
        'x-postmark-server-token': this.serverToken
      },
      json: {
        From: mail.from,
        To: mail.to,
        Subject: mail.subject,
        HtmlBody: mail.html,
        TextBody: mail.text
      }
    })
  }
}
