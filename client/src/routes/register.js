import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { login, setAuthToken } from '../api/auth'
import IonButton from '../components/ion-button'
import IonAdditional from '../components/ion-additional'

import { loadRecaptcha, RecaptchaLegalNotice } from '../components/recaptcha'

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
    ionToken: undefined,
    ionName: undefined
  }

  componentDidMount () {
    document.title = `Registration | ${config.ctfName}`
    if (recaptchaEnabled) {
      loadRecaptcha()
    }
  }

  render ({ classes }, { ionToken, ionName }) {
    if (ionToken) {
      return <IonAdditional ionToken={ionToken} ionName={ionName} />
    }
    return (
      <div class={`row u-center ${classes.root}`}>
        <h4 class={classes.title}>Register for {config.ctfName}</h4>
        <p>Register with your Ion account.</p>
        <IonButton class='col-6' onIonDone={this.handleIonDone} />
        {recaptchaEnabled && (
          <div class={classes.recaptchaLegalNotice}>
            <RecaptchaLegalNotice />
          </div>
        )}
      </div>
    )
  }

  handleIonDone = async ({ ionToken, ionName }) => {
    const loginRes = await login({
      ionToken
    })
    if (loginRes.authToken) {
      setAuthToken({ authToken: loginRes.authToken })
    }
    if (loginRes.badUnknownUser) {
      this.setState({
        ionToken,
        ionName
      })
    }
  }
})
