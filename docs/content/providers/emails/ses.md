# SES Email Provider

The SES email provider sends email via the Amazon Simple Email Service. To use it, specify `emails/ses` for the email provider name.

The key specified in `awsKeyId` and `awsKeySecret` must have the `ses:SendEmail` IAM permission.

## Configuration Options

Option|Description
-|-
`awsKeyId`|The AWS IAM key ID used to send emails.
`awsKeySecret`|The AWS IAM key secret used to send emails.
`awsRegion`|The AWS region used to send emails.

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
