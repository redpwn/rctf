# Postmark Email Provider

The Postmark email provider sends email via the Postmark API. To use it, specify `emails/postmark` for the email provider name.

## Configuration Options

| YAML/JSON name | environment name             | required | default value | type   | description               |
| -------------- | ---------------------------- | -------- | ------------- | ------ | ------------------------- |
| `serverToken`  | `RCTF_POSTMARK_SERVER_TOKEN` | yes      | _(none)_      | string | Postmark server API token |

## Configuration Example

```yaml
email:
  from: no-reply@example.com
  provider:
    name: 'emails/postmark'
    options:
      serverToken: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
