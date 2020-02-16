import { Component } from 'preact'
import withStyles from './jss'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    'margin-top': '25px'
  }
}, class Register extends Component {
  componentDidMount () {
    document.title = 'Registration'
  }

  render ({ classes }) {
    return (
      <div class='row u-center'>
        <div class={classes.root + ' col-6'}>
          <div class='form-section'>
            <div class='input-control'>
              <input class='input-contains-icon' id='name' name='name' placeholder='Team Name' type='text' value='' />
              <span class='icon'>
                <i class='fa fa-wrapper fa-user-circle small' />
              </span>
            </div>
            <div class='input-control'>
              <input class='input-contains-icon' id='email' name='email' placeholder='Email' type='text' value='' />
              <span class='icon'>
                <i class='fa fa-wrapper fa-envelope-open small' />
              </span>
            </div>
            <div class='input-control'>
              <select class='select'>
                <option value='' disabled selected>Division</option>
                <option value='0'>High School</option>
                <option value='1'>College</option>
                <option value='2'>Other</option>
              </select>
            </div>
          </div>
          <button class={classes.submit + ' btn-info u-center'} name='btn' value='register' type='submit'>Sign Up</button>
          <span class='fg-danger info' />
        </div>
      </div>
    )
  }
})
