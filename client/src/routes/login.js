import { Fragment, Component } from 'preact'
import { Link } from 'preact-router'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { login, setAuthToken } from '../api/auth'
import IdCard from '../icons/id-card.svg'
import CtftimeButton from '../components/ctftime-button'
import CtftimeAdditional from '../components/ctftime-additional'
import AuthOr from '../components/or'
import PendingToken from '../components/pending-token'

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
  link: {
    display: 'inline'
  }
}, class Login extends Component {
  state = {
    teamToken: '',
    errors: {},
    disabledButton: false,
    ctftimeToken: undefined,
    ctftimeName: undefined,
    pendingAuthToken: null,
    pendingUserName: null,
    pending: false
  }

  componentDidMount () {
    document.title = `Login | ${config.ctfName}`

    ;(async () => {
      const qs = new URLSearchParams(location.search)
      if (qs.has('token')) {
        this.setState({
          pending: true
        })

        const loginRes = await login({ teamToken: qs.get('token') })
        if (loginRes.authToken) {
          this.setState({
            pendingAuthToken: loginRes.authToken
          })
        }
        this.setState({
          pending: false
        })
      }
    })()
  }

  render ({ classes }, { teamToken, errors, disabledButton, ctftimeToken, ctftimeName, pendingAuthToken, pending }) {
    if (ctftimeToken) {
      return <CtftimeAdditional ctftimeToken={ctftimeToken} ctftimeName={ctftimeName} />
    }
    if (pending) {
      return null
    }
    if (pendingAuthToken) {
      return <PendingToken authToken={pendingAuthToken} />
    }
    return (
      <div class={`row u-center ${classes.root}`}>
        <h4 class={classes.title}>Log in to {config.ctfName}</h4>
        <Form class={`${classes.form} col-6`} onSubmit={this.handleSubmit} disabled={disabledButton} buttonText='Login' errors={errors}>
          <input
            autofocus
            required
            autocomplete='off'
            autocorrect='off'
            name='teamToken'
            icon={<IdCard />}
            placeholder='Team Token'
            type='text'
            value={teamToken}
            onChange={this.linkState('teamToken')}
          />
          {config.emailEnabled && (
            <Link href='/recover' class={classes.link}>Lost your team token?</Link>
          )}
        </Form>
        {config.ctftime && (
          <Fragment>
            <AuthOr />
            <CtftimeButton class='col-12' onCtftimeDone={this.handleCtftimeDone} />
          </Fragment>
        )}
      </div>
    )
  }

  handleCtftimeDone = async ({ ctftimeToken, ctftimeName }) => {
    this.setState({
      disabledButton: true
    })
    const loginRes = await login({ ctftimeToken })
    if (loginRes.authToken) {
      setAuthToken({ authToken: loginRes.authToken })
    }
    if (loginRes && loginRes.badUnknownUser) {
      this.setState({
        ctftimeToken,
        ctftimeName
      })
    }
  }

  handlePendingLoginClick = () => {
    setAuthToken({ authToken: this.state.pendingAuthToken })
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    this.setState({
      disabledButton: true
    })

    let teamToken = this.state.teamToken
    let url
    try {
      url = new URL(teamToken)
      if (url.searchParams.has('token')) {
        teamToken = url.searchParams.get('token')
      }
    } catch {}

    const result = await login({
      teamToken
    })
    if (result.authToken) {
      setAuthToken({ authToken: result.authToken })
      return
    }
    this.setState({
      errors: result,
      disabledButton: false
    })
  }
})
