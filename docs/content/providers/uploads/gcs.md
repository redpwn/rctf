# GCS Upload Provider

The GCS upload provider uploads challenge resources to Google Cloud Storage. To use it, specify `uploads/gcs` for the upload provider name.

The key specified must have the `storage.objects.create`, `storage.objects.get`, and `storage.objects.list` permissions.

## Configuration Options

Option|Description
-|-
`credentials.private_key`|The PEM-encoded private key for the service account with access to the GCS bucket.
`credentials.client_email`|The email of the service account with access to the GCS bucket.
`bucket`|The name of the GCS bucket.

## Configuration Example

```yaml
uploadProvider:
  name: 'uploads/gcs'
  options:
    credentials:
      private_key: |-
        -----BEGIN PRIVATE KEY-----
        ABCDABCD
        -----END PRIVATE KEY-----
      client_email: service-account-name@project-id.iam.gserviceaccount.com
```
