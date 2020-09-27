import { Fragment, Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { register, login, setAuthToken } from '../api/auth'
import UserCircle from '../icons/user-circle.svg'
import EnvelopeOpen from '../icons/envelope-open.svg'
import CtftimeButton from '../components/ctftime-button'
import CtftimeAdditional from '../components/ctftime-additional'
import AuthOr from '../components/or'

import { loadRecaptcha, requestRecaptchaCode, RecaptchaLegalNotice } from '../components/recaptcha'

// legacy check for class components
const recaptchaEnabled = config.recaptcha?.protectedActions.includes('register')

export default withStyles({
  root: {
    flexDirection: 'column'
  },
  title: {
    marginBottom: '20px'
  },
  form: {
    padding: '1.5em',
    maxWidth: '500px',
    '& input': {
      background: '#222',
      color: '#fff !important'
    }
  },
  submit: {
    marginTop: '1.5em'
  },
  or: {
    textAlign: 'center'
  },
  recaptchaLegalNotice: {
    marginTop: '50px'
  }
}, class Register extends Component {
  state = {
    name: '',
    email: '',
    ctftimeToken: undefined,
    ctftimeName: undefined,
    disabledButton: false,
    errors: {},
    verifySent: false
  }

  componentDidMount () {
    document.title = `Registration | ${config.ctfName}`
    if (recaptchaEnabled) {
      loadRecaptcha()
    }
  }

  render ({ classes }, { name, email, disabledButton, errors, ctftimeToken, ctftimeName, verifySent }) {
    if (ctftimeToken) {
      return <CtftimeAdditional ctftimeToken={ctftimeToken} ctftimeName={ctftimeName} />
    }
    if (verifySent) {
      return (
        <div class='row u-center'>
          <h3>Verification email sent!</h3>
        </div>
      )
    }
    return (
      <div class={`row u-center ${classes.root}`}>
        <h4 class={classes.title}>Register for {config.ctfName}</h4>
        <p>Please register one account per team.</p>
        <Form class={`${classes.form} col-6`} onSubmit={this.handleSubmit} disabled={disabledButton} errors={errors} buttonText='Register'>
          <input
            autofocus
            required
            autocomplete='username'
            autocorrect='off'
            icon={<UserCircle />}
            name='name'
            maxLength='64'
            minLength='2'
            placeholder='Team Name'
            type='text'
            value={name}
            onChange={this.linkState('name')}
          />
          <input
            required
            autocomplete='email'
            autocorrect='off'
            icon={<EnvelopeOpen />}
            name='email'
            placeholder='Email'
            type='email'
            value={email}
            onChange={this.linkState('email')}
          />
        </Form>
        {config.ctftime && (
          <Fragment>
            <AuthOr />
            <CtftimeButton class='col-6' onCtftimeDone={this.handleCtftimeDone} />
          </Fragment>
        )}
        {recaptchaEnabled && (
          <div class={classes.recaptchaLegalNotice}>
            <RecaptchaLegalNotice />
          </div>
        )}
      </div>
    )
  }

  handleCtftimeDone = async ({ ctftimeToken, ctftimeName }) => {
    this.setState({
      disabledButton: true
    })
    const loginRes = await login({
      ctftimeToken
    })
    if (loginRes.authToken) {
      setAuthToken({ authToken: loginRes.authToken })
    }
    if (loginRes.badUnknownUser) {
      this.setState({
        ctftimeToken,
        ctftimeName
      })
    }
  }

  handleSubmit = async e => {
    e.preventDefault()

    const recaptchaCode = recaptchaEnabled ? await requestRecaptchaCode() : undefined

    this.setState({
      disabledButton: true
    })

    const { errors, verifySent } = await register({
      ...this.state,
      recaptchaCode
    })
    if (verifySent) {
      this.setState({
        verifySent: true
      })
    }
    if (!errors) {
      return
    }

    this.setState({
      errors,
      disabledButton: false
    })
  }
})
