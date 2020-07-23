# Mailgun Email Provider

The Mailgun email provider sends email via the Mailgun API. To use it, specify `emails/mailgun` for the email provider name.

## Configuration Options

Option|Description
-|-
`apiKey`|Your Mailgun API key. 
`domain`|One of your Mailgun domains. 

## Configuration Example

```yaml
emailProvider:
  name: 'emails/mailgun'
  options:
    api_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx'
    domain: 'sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org'
```
