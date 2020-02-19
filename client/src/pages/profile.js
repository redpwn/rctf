import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import Trophy from '../../../static/assets/icons/trophy.svg'
import AddressBook from '../../../static/assets/icons/address-book.svg'

export default withStyles({
  quote: {
    fontSize: 'small',
    overflowWrap: 'break-word'
  },
  icon: {
    "& svg": {
      verticalAlign: "middle",
      height: "20px",
      fill: "#333"
    },
    marginRight: "25px"
  }
}, class Profile extends Component {
  state = {
    name: 'Generic_CTFTeam'
  }

  componentDidMount () {
    document.title = 'Profile' + config.ctfTitle
  }

  render ({ classes }, { name }) {
    const teamToken = localStorage.getItem('teamToken')

    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-4'>
          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <p>Team Code</p>
              <blockquote class={classes.quote}>
                {teamToken}
              </blockquote>
              <p class='font-thin'>Share this with your teammates to use at <a href='/login'>/login</a>!</p>
            </div>
          </div>
        </div>
        <div class='col-6'>
          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <h5 class='title'>{name}</h5>
              <div class='action-bar'>
                <p>
                  <span class={`icon ${classes.icon}`}>
                    <Trophy />
                  </span>
                  3rd place
                </p>
                <p>
                  <span class={`icon ${classes.icon}`}>
                    <AddressBook />
                  </span>
                  High School division
                </p>
              </div>
            </div>
          </div>

          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <h5 class='title u-text-center'>Solves</h5>
              <table class='table borderless'>
                <thead>
                  <tr>
                    <th><abbr title='category'>Category</abbr></th>
                    <th><abbr title='name'>Name</abbr></th>
                    <th><abbr title='points'>Points</abbr></th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Pwn</td><td>Pwn Challenge 1</td><td>123</td></tr>
                  <tr><td>Pwn</td><td>Pwn 1</td><td>432</td></tr>
                  <tr><td>Crypto</td><td>Cryptography</td><td>234</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
