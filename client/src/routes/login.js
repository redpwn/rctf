import { Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { login } from '../api/auth'
import IdCard from '../icons/id-card.svg'
import { route } from 'preact-router'
import CtftimeButton from '../components/ctftime-button'
import CtftimeAdditional from '../components/ctftime-additional'
import AuthOr from '../components/or'

export default withStyles({
  root: {
    padding: '1.5em',
    maxWidth: '500px',
    '& input': {
      background: '#111',
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
    ctftimeToken: undefined
  }

  componentDidMount () {
    document.title = `Login${config.ctfTitle}`

    const prefix = '#token='
    if (document.location.hash.startsWith(prefix)) {
      route('/login', true)

      const teamToken = decodeURIComponent(document.location.hash.substring(prefix.length))

      login({ teamToken })
        .then(errors => {
          this.setState({
            errors,
            disabledButton: false
          })
        })
    }
  }

  render ({ classes }, { teamToken, errors, disabledButton, ctftimeToken }) {
    if (ctftimeToken) {
      return <CtftimeAdditional ctftimeToken={ctftimeToken} />
    }
    return (
      <div class='row u-center'>
        <Form class={`${classes.root} col-6`} onSubmit={this.handleSubmit} disabled={disabledButton} buttonText='Login' errors={errors}>
          <input autofocus name='teamToken' icon={<IdCard />} placeholder='Team Token' type='text' value={teamToken} onChange={this.linkState('teamToken')} />
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
    const loginRes = await login({
      ctftimeToken
    })
    if (loginRes && loginRes.badUnknownUser) {
      this.setState({
        ctftimeToken
      })
    }
  }

  handleSubmit = e => {
    e.preventDefault()

    const teamToken = this.state.teamToken

    this.setState({
      disabledButton: true
    })

    login({ teamToken })
      .then(errors => {
        this.setState({
          errors,
          disabledButton: false
        })
      })
  }
})
