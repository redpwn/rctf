import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from './jss'

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
  constructor (props) {
    super(props)
    this.state = {
      teamToken: '',
      errorMessage: '',
      displayError: false,
      disabledButton: false
    }
  }

  componentDidMount () {
    document.title = 'Login' + config.ctfTitle
  }

  render ({ classes }, { teamToken, errorMessage, displayError, disabledButton }) {
    return (
      <form onSubmit={this.handleSubmit}>
        <div class='row u-center'>
          <div class={classes.root + ' col-6'}>
            <div class='form-section'>
              <div class='input-control'>
                <input class='input-contains-icon' id='teamToken' name='teamToken' placeholder='Team Token' type='text' value={teamToken} onChange={this.linkState('teamToken')} />
                <span class='icon'>
                  <i class='fa fa-wrapper fa-id-card small' />
                </span>
              </div>
            </div>
            {displayError
              ? <div display={displayError} class='toast toast--error'><p>Error: {errorMessage}</p></div> : null}
            <button disabled={disabledButton} class={classes.submit + ' btn-info u-center'} name='btn' value='register' type='submit'>Login</button>
            <span class='fg-danger info' />
          </div>
        </div>
      </form>
    )
  }

  handleSubmit = async e => {
    e.preventDefault()

    const teamToken = this.state.teamToken

    this.setState({
      disabledButton: true
    })

    login({ teamToken })
      .then((resp) => {
        console.log(resp)
        if (resp.kind === 'goodLogin') {
          localStorage.setItem('token', resp.data.authToken)
          route('/challenges')
        } else if (resp.kind === 'badTokenVerification' || resp.kind === 'badUnknownUser') {
          this.setState({
            errorMessage: resp.message,
            displayError: true,
            disabledButton: false
          })
        } else {
          this.setState({
            errorMessage: 'Unknown response from server, please contact ctf administrator',
            displayError: true,
            disabledButton: false
          })
        }
      })
  }
})
