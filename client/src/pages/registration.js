import { Component } from 'preact'
import Form from '../components/form'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { register } from '../api/auth'
import UserCircle from '../../static/icons/user-circle.svg'
import EnvelopeOpen from '../../static/icons/envelope-open.svg'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    marginTop: '25px'
  }
}, class Register extends Component {
  state = {
    name: '',
    email: '',
    division: '',
    disabledButton: false,
    errors: {}
  }

  componentDidMount () {
    document.title = 'Registration' + config.ctfTitle
  }

  render ({ classes }, { name, email, division, disabledButton, errors }) {
    return (
      <div class='row u-center'>
        <Form class={classes.root + ' col-6'} onSubmit={this.handleSubmit} disabled={disabledButton} errors={errors} buttonText='Register'>
          <input autofocus required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={name} onChange={this.linkState('name')} />
          <input required icon={<EnvelopeOpen />} name='email' placeholder='Email' type='text' value={email} onChange={this.linkState('email')} />
          <select required class='select' name='division' value={division} onChange={this.linkState('division')}>
            <option value='' disabled selected>Division</option>
            {
              Object.entries(config.divisions).map(([name, code]) => {
                return <option key={code} value={code}>{name}</option>
              })
            }
          </select>
        </Form>
      </div>
    )
  }

  handleSubmit = e => {
    e.preventDefault()

    this.setState({
      disabledButton: true
    })

    register(this.state)
      .then(errors => {
        this.setState({
          errors,
          disabledButton: false
        })
      })
  }
})
