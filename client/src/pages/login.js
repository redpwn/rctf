import { Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { login } from '../api/auth'
import IdCard from '../../assets/icons/id-card.svg'

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
          <input autofocus name='teamToken' icon={<IdCard />} placeholder='Team Token' type='text' value={teamToken} onChange={this.linkState('teamToken')} />
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
      .then(errors => {
        this.setState({
          errors,
          disabledButton: false
        })
      })
  }
})
