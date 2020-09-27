# reCAPTCHA

To protect specific actions from abuse, configure reCAPTCHA credentials. You can [register for credentials here](https://www.google.com/recaptcha/admin/create).

Copy the corresponding values from Google into `recaptcha.siteKey` and `recaptcha.secretKey` fields or `RCTF_RECAPTCHA_SITE_KEY` and `RCTF_RECAPTCHA_SECRET_KEY`.

You must also configure `recaptcha.protectedActions` as a list of strings specifying which actions require a reCAPTCHA.

Valid protected action values are:

* `register`
* `recover`
* `setEmail`

For example, to prevent automated registration and recovery, use:

```yaml
recaptcha:
  siteKey: AAA
  secretKey: BBB
  protectedActions:
    - register
    - recover
```
