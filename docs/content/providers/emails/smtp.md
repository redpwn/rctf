# SMTP Email Provider

The SMTP email provider sends email via a SMTP server. To use it, specify `emails/smtp` for the email provider name.

## Configuration Options

Option|Description
-|-
`smtpUrl`|The URL of the SMTP server. See the [nodemailer docs](https://nodemailer.com/smtp/pooled/) if you want to use connection pooling.

## Configuration Example

```yaml
email:
  from: no-reply@example.com
  provider:
    name: 'emails/smtp'
    options:
      smtpUrl: 'smtp://a:b@example.com'
```
