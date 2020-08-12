# GCS Upload Provider

The GCS upload provider uploads challenge resources to Google Cloud Storage. To use it, specify `uploads/gcs` for the upload provider name.

The key specified must have the `storage.objects.create`, `storage.objects.get`, and `storage.objects.list` permissions.

## Configuration Options

YAML/JSON name|environment name|required|default value|type|description
-|-|-|-|-|-
`credentials.private_key`|`RCTF_GCS_CREDENTIALS`|yes|_(none)_|string|PEM-encoded private key for the service account with access to the GCS bucket
`credentials.client_email`|yes|_(none)_|string|email of the service account with access to the GCS bucket
`bucketName`|yes|_(none)_|string|name of the GCS bucket

If available, the `RCTF_GCS_CREDENTIALS` environment variable is parsed as JSON. It should contain the `private_key` and `client_email` properties

## Configuration Example

```yaml
uploadProvider:
  name: 'uploads/gcs'
  options:
    bucketName: example
    credentials:
      private_key: |-
        -----BEGIN PRIVATE KEY-----
        ABCDABCD
        -----END PRIVATE KEY-----
      client_email: service-account-name@project-id.iam.gserviceaccount.com
```
