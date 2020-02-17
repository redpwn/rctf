import { Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { route } from 'preact-router'
import { login } from '../api/auth'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    marginTop: '25px'
  }
}, class Login extends Component {
  state = {
    teamToken: '',
    errors: {},
    disabledButton: false
  }

  componentDidMount () {
    document.title = 'Login' + config.ctfTitle
  }

  render ({ classes }, { teamToken, errors, disabledButton }) {
    return (
      <div class='row u-center'>
        <Form class={classes.root + ' col-6'} onSubmit={this.handleSubmit} disabled={disabledButton} buttonText='Login' errors={errors}>
          <input autofocus name='teamToken' icon='id-card' placeholder='Team Token' type='text' value={teamToken} onChange={this.linkState('teamToken')} />
        </Form>
      </div>
    )
  }

  handleSubmit = e => {
    e.preventDefault()

    const teamToken = this.state.teamToken

    this.setState({
      disabledButton: true
    })

    login({ teamToken })
      .then((resp) => {
        if (resp.kind === 'goodLogin') {
          localStorage.setItem('token', resp.data.authToken)
          route('/challenges')
        } else if (resp.kind === 'badTokenVerification') {
          this.setState({
            errors: {
              teamToken: resp.message
            },
            disabledButton: false
          })
        } else {
          this.setState({
            errors: {
              teamToken: 'Unknown response from server, please contact ctf administrator'
            },
            disabledButton: false
          })
        }
      })
  }
})
