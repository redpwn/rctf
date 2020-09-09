# Local Upload Provider

The local upload provider stores files on the local file system. To use it, specify `uploads/local` for the upload provider name.

rCTF must have write access to the `uploadDirectory`.

## Configuration Options

| YAML/JSON name    | environment name | required | default value | type   | description                                   |
| ----------------- | ---------------- | -------- | ------------- | ------ | --------------------------------------------- |
| `uploadDirectory` | _(none)_         | yes      | `uploads`     | string | directory where uploaded files are stored     |
| `endpoint`        | _(none)_         | yes      | `/uploads`    | string | endpoint from which uploaded files are served |

## Configuration Example

```yaml
uploadProvider:
  name: 'uploads/local'
  options:
    uploadDirectory: 'uploads'
    endpoint: '/uploads'
```
