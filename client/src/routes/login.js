import { Component } from 'preact'
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
    padding: '1.5em',
    maxWidth: '500px',
    '& input': {
      background: '#222',
      color: '#fff !important'
    }
  },
  submit: {
    marginTop: '1.5em'
  }
}, class Login extends Component {
  state = {
    teamToken: '',
    errors: {},
    disabledButton: false,
    ctftimeToken: undefined,
    pendingAuthToken: null,
    pendingUserName: null,
    pending: false
  }

  componentDidMount () {
    document.title = `Login${config.ctfTitle}`

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

  render ({ classes }, { teamToken, errors, disabledButton, ctftimeToken, pendingAuthToken, pending }) {
    if (ctftimeToken) {
      return <CtftimeAdditional ctftimeToken={ctftimeToken} />
    }
    if (pending) {
      return null
    }
    if (pendingAuthToken) {
      return <PendingToken authToken={pendingAuthToken} />
    }
    return (
      <div class='row u-center'>
        <Form class={`${classes.root} col-6`} onSubmit={this.handleSubmit} disabled={disabledButton} buttonText='Login' errors={errors}>
          <input autofocus name='teamToken' icon={<IdCard />} placeholder='Team Token' type='text' value={teamToken} onChange={this.linkState('teamToken')} />
          <Link href='/recover'>Lost your team token?</Link>
        </Form>
        <AuthOr />
        <CtftimeButton class='col-12' onCtftimeDone={this.handleCtftimeDone} />
      </div>
    )
  }

  handleCtftimeDone = async (ctftimeToken) => {
    this.setState({
      disabledButton: true
    })
    const loginRes = await login({ ctftimeToken })
    if (loginRes.authToken) {
      setAuthToken({ authToken: loginRes.authToken })
    }
    if (loginRes && loginRes.badUnknownUser) {
      this.setState({
        ctftimeToken
      })
    }
  }

  handlePendingLoginClick = () => {
    setAuthToken({ authToken: this.state.pendingAuthToken })
  }

  handleSubmit = e => {
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

    login({ teamToken })
      .then(result => {
        if (result.authToken) {
          setAuthToken({ authToken: result.authToken })
          return
        }
        this.setState({
          errors: result,
          disabledButton: false
        })
      })
  }
})
