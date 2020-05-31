import { useState, useCallback } from 'preact/hooks'
import withStyles from '../components/jss'
import EnvelopeOpen from '../icons/envelope-open.svg'
import Form from '../components/form'
import { recover } from '../api/auth'

const Recover = ({ classes }) => {
  const [disabled, setDisabled] = useState(false)
  const [errors, setErrors] = useState({})
  const [verifySent, setVerifySent] = useState(false)
  const [email, setEmail] = useState('')
  const handleSubmit = useCallback(async (evt) => {
    evt.preventDefault()

    setDisabled(true)
    const { errors, verifySent } = await recover({ email })
    setErrors(errors)
    setVerifySent(verifySent)
    setDisabled(false)
  }, [setDisabled, email, setErrors, setVerifySent])

  const handleEmailChange = useCallback(evt => setEmail(evt.target.value), [setEmail])

  if (verifySent) {
    return (
      <div class='row u-center'>
        <h3>Recovery email sent</h3>
      </div>
    )
  }

  return (
    <div class='row u-center'>
      <Form class={`${classes.form} col-6`} onSubmit={handleSubmit} disabled={disabled} errors={errors} buttonText='Recover'>
        <input
          autofocus
          required
          icon={<EnvelopeOpen />}
          name='email'
          placeholder='Email'
          type='text'
          value={email}
          onChange={handleEmailChange}
        />
      </Form>
    </div>
  )
}

export default withStyles({
  form: {
    padding: '1.5em',
    maxWidth: '500px'
  }
}, Recover)
