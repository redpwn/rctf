import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { privateProfile } from '../api/profile'
import Trophy from '../../../static/assets/icons/trophy.svg'
import AddressBook from '../../../static/assets/icons/address-book.svg'

export default withStyles({
  quote: {
    fontSize: 'small',
    overflowWrap: 'break-word'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      height: '20px',
      fill: '#333'
    },
    marginRight: '25px'
  }
}, class Profile extends Component {
  state = {
    dataLoading: true,
    name: '',
    division: '',
    placement: '',
    score: 0,
    teamToken: '',
    solves: []
  }

  componentDidMount () {
    document.title = 'Profile' + config.ctfTitle

    privateProfile()
      .then(data => {
        this.setState({
          name: data.name,
          division: data.division,
          score: data.score.score,
          teamToken: data.teamToken,
          solves: data.returnedSolves
        })
        let placementStr = String(data.score.place)
        if (data.score.place >= 11 && data.score.place <= 13) {
          placementStr += 'th place'
        } else {
          switch (data.score.place % 10) {
            case 1:
              placementStr += 'st place'
              break
            case 2:
              placementStr += 'nd place'
              break
            case 3:
              placementStr += 'rd place'
              break
            default:
              placementStr += 'th place'
          }
        }
        this.setState({
          placement: placementStr,
          dataLoading: false
        })
      })
  }

  render ({ classes }, { name, division, placement, score, teamToken, solves }) {
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
                  {placement}
                </p>
                <p>
                  <span class={`icon ${classes.icon}`}>
                    <AddressBook />
                  </span>
                  {division}
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
