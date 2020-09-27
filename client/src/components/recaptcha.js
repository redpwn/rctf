import config from '../config'
import withStyles from './jss'
import { useEffect, useCallback } from 'preact/hooks'

const loadRecaptchaScript = () => new Promise((resolve, reject) => {
  const script = document.createElement('script')
  script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
  script.addEventListener('load', () => {
    window.grecaptcha.ready(() => resolve(window.grecaptcha))
  })
  script.addEventListener('error', reject)
  document.body.appendChild(script)
})

const recaptchaQueue = []
let recaptchaPromise
let recaptchaId
const handleRecaptchaDone = async (code) => {
  (await loadRecaptcha()).reset(recaptchaId)
  const { resolve } = recaptchaQueue.shift()
  resolve(code)
  handleRecaptchaNext()
}
const handleRecaptchaError = async (err) => {
  (await loadRecaptcha()).reset(recaptchaId)
  const { reject } = recaptchaQueue.shift()
  reject(err)
  handleRecaptchaNext()
}
const handleRecaptchaNext = async () => {
  if (recaptchaQueue.length === 0) {
    return
  }
  (await loadRecaptcha()).execute(recaptchaId)
}
const loadRecaptcha = async () => {
  if (!recaptchaPromise) {
    recaptchaPromise = loadRecaptchaScript()
  }
  if (!recaptchaId) {
    recaptchaId = (await recaptchaPromise).render({
      theme: 'dark',
      sitekey: config.recaptcha.siteKey,
      callback: handleRecaptchaDone,
      'error-callback': handleRecaptchaError
    })
  }
  return recaptchaPromise
}
const requestRecaptchaCode = () => new Promise((resolve, reject) => {
  recaptchaQueue.push({ resolve, reject })
  handleRecaptchaNext()
})

// exported for legacy class component usage
export { loadRecaptcha, requestRecaptchaCode }

export const RecaptchaLegalNotice = withStyles({
  root: {
    fontSize: '12px',
    textAlign: 'center'
  },
  link: {
    display: 'inline',
    padding: '0'
  }
}, ({ classes }) => (
  <div class={classes.root}>
    This site is protected by reCAPTCHA.
    <br />
    The Google{' '}
    <a class={classes.link} href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy</a>
    {' '}and{' '}
    <a class={classes.link} href='https://policies.google.com/terms' target='_blank' rel='noopener noreferrer'>Terms of Service</a>
    {' '}apply.
  </div>
))

export default (action) => {
  const recaptchaEnabled = config.recaptcha?.protectedActions.includes(action)
  useEffect(() => {
    if (recaptchaEnabled) {
      loadRecaptcha()
    }
  }, [recaptchaEnabled])
  const callback = useCallback(requestRecaptchaCode, [recaptchaEnabled])
  if (recaptchaEnabled) {
    return callback
  }
}
