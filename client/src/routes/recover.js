import { useState, useCallback } from 'preact/hooks'
import withStyles from '../components/jss'
import EnvelopeOpen from '../icons/envelope-open.svg'
import Form from '../components/form'
import config from '../config'
import { recover } from '../api/auth'
import useRecaptcha, { RecaptchaLegalNotice } from '../components/recaptcha'

const Recover = ({ classes }) => {
  const [disabled, setDisabled] = useState(false)
  const [errors, setErrors] = useState({})
  const [verifySent, setVerifySent] = useState(false)
  const [email, setEmail] = useState('')
  const requestRecaptchaCode = useRecaptcha('recover')

  const handleSubmit = useCallback(async (evt) => {
    evt.preventDefault()
    const recaptchaCode = await requestRecaptchaCode?.()
    setDisabled(true)
    const { errors, verifySent } = await recover({
      email,
      recaptchaCode
    })
    setErrors(errors)
    setVerifySent(verifySent)
    setDisabled(false)
  }, [setDisabled, email, setErrors, setVerifySent, requestRecaptchaCode])

  const handleEmailChange = useCallback(evt => setEmail(evt.target.value), [setEmail])

  if (verifySent) {
    return (
      <div class='row u-center'>
        <h3>Recovery email sent</h3>
      </div>
    )
  }

  return (
    <div class={`row u-center ${classes.root}`}>
      <h4 class={classes.title}>Recover your {config.ctfName} account</h4>
      <Form class={`${classes.form} col-6`} onSubmit={handleSubmit} disabled={disabled} errors={errors} buttonText='Recover'>
        <input
          class={classes.input}
          autofocus
          required
          autocomplete='email'
          autocorrect='off'
          icon={<EnvelopeOpen />}
          name='email'
          placeholder='Email'
          type='email'
          value={email}
          onChange={handleEmailChange}
        />
      </Form>
      {requestRecaptchaCode && (
        <div class={classes.recaptchaLegalNotice}>
          <RecaptchaLegalNotice />
        </div>
      )}
    </div>
  )
}

export default withStyles({
  form: {
    padding: '1.5em',
    maxWidth: '500px'
  },
  input: {
    background: '#222',
    color: '#fff !important'
  },
  root: {
    flexDirection: 'column'
  },
  title: {
    marginBottom: '20px'
  },
  recaptchaLegalNotice: {
    marginTop: '50px'
  }
}, Recover)
