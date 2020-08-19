# Mailgun Email Provider

The Mailgun email provider sends email via the Mailgun API. To use it, specify `emails/mailgun` for the email provider name.

## Configuration Options

| YAML/JSON name | environment name       | required | default value | type   | description                 |
| -------------- | ---------------------- | -------- | ------------- | ------ | --------------------------- |
| `apiKey`       | `RCTF_MAILGUN_API_KEY` | yes      | _(none)_      | string | Mailgun API key             |
| `domain`       | `RCTF_MAILGUN_DOMAIN`  | yes      | _(none)_      | string | A registered Mailgun domain |

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
