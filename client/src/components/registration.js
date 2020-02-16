import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from './jss'

import { register } from '../api/auth'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    marginTop: '25px'
  }
}, class Register extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      division: ''
    }
  }

  componentDidMount () {
    document.title = 'Registration' + config.ctfTitle
  }

  render ({ classes }, { name, email, division }) {
    console.log(this.state)
    return (
      <div class='row u-center'>
        <div class={classes.root + ' col-6'}>
          <div class='form-section'>
            <div class='input-control'>
              <input class='input-contains-icon' id='name' name='name' placeholder='Team Name' type='text' value={name} onChange={this.linkState('name')} />
              <span class='icon'>
                <i class='fa fa-wrapper fa-user-circle small' />
              </span>
            </div>
            <div class='input-control'>
              <input class='input-contains-icon' id='email' name='email' placeholder='Email' type='text' value={email} onChange={this.linkState('email')} />
              <span class='icon'>
                <i class='fa fa-wrapper fa-envelope-open small' />
              </span>
            </div>
            <div class='input-control'>
              <select class='select' value={division} onChange={this.linkState('division')}>
                <option value='' disabled selected>Division</option>
                <option value='0'>High School</option>
                <option value='1'>College</option>
                <option value='2'>Other</option>
              </select>
            </div>
          </div>
          <button class={classes.submit + ' btn-info u-center'} name='btn' type='submit' onClick={e => this.register()}>Register</button>
          <span class='fg-danger info' />
        </div>
      </div>
    )
  }

  handleChange (name, e) {
    this.setState(state => {
      return {
        ...state,
        [name]: e.target.value
      }
    })
  }

  register () {
    register(this.state)
      .then(console.log)
  }
})
