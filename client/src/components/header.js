import { Component } from 'preact'
import withStyles from './jss'

export default withStyles({

}, class Header extends Component {
  render ({ classes }) {
    return (
      <div class='tab-container tabs-center'>
        <ul>
          <li><a>Home</a></li>
          <li><a>About</a></li>
          <li><a>Register</a></li>
          <li><a>Login</a></li>
        </ul>
      </div>
    )
  }
})
