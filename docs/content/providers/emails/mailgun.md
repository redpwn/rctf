# Mailgun Email Provider

The Mailgun email provider sends email via the Mailgun API. To use it, specify `emails/mailgun` for the email provider name.

## Configuration Options

Option|Description
-|-
`apiKey`|Your Mailgun API key. 
`domain`|One of your Mailgun domains. 

## Configuration Example

```yaml
email:
  from: no-reply@sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org
  provider:
    name: 'emails/mailgun'
    options:
      apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx'
      domain: 'sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org'
```
