# Mailgun Email Provider

The Mailgun email provider sends email via the Mailgun API. To use it, specify `emails/mailgun` for the email provider name.

## Configuration Options

Option|Description
-|-
`auth.api_key`|Your Mailgun API key. 
`auth.domain`|One of your Mailgun domains. 
`proxy`|(optional) Proxy to use, defaults to `false`.
`host`|(optional) The Mailgun API server host, defaults to `api.mailgun.net`.
`port`|(optional) The Mailgun API server port, defaults to `443`. 

## Configuration Example

```yaml
emailProvider:
  name: 'emails/mailgun'
  options:
    auth:
      api_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx'
      domain: 'sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org'
```
