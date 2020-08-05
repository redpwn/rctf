# Local Upload Provider

The local upload provider stores files on the local file system. To use it, specify `uploads/local` for the upload provider name.

rCTF must have write access to the `uploadDirectory`.

## Configuration Options

Option|Description
-|-
`uploadDirectory`|The directory where uploaded files are stored. (default: `uploads`)
`endpoint`|The endpoint from which uploaded files are served. (default: `/uploads`)

## Configuration Example

```yaml
uploadProvider:
  name: 'uploads/local'
  options:
    uploadDirectory: 'uploads'
    endpoint: '/uploads'
```
