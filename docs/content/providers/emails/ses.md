# SES Email Provider

The SES email provider sends email via the Amazon Simple Email Service. To use it, specify `emails/ses` for the email provider name.

The key specified in `awsKeyId` and `awsKeySecret` must have the `ses:SendEmail` IAM permission.

## Configuration Options

| YAML/JSON name | environment name      | required | default value | type   | description        |
| -------------- | --------------------- | -------- | ------------- | ------ | ------------------ |
| `awsKeyId`     | `RCTF_SES_KEY_ID`     | yes      | _(none)_      | string | AWS IAM key ID     |
| `awsKeySecret` | `RCTF_SES_KEY_SECRET` | yes      | _(none)_      | string | AWS IAM key secret |
| `awsRegion`    | `RCTF_SES_REGION`     | yes      | _(none)_      | string | AWS region ID      |

## Configuration Example

```yaml
email:
  from: no-reply@example.com
  provider:
    name: emails/ses
    options:
      awsKeyId: ABCDABCD
      awsKeySecret: abcdabcd
      awsRegion: us-east-1
```
