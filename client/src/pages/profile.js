import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { privateProfile } from '../api/profile'
import util from '../util'
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
          placement: util.strings.placementString(data.score.place),
          score: data.score.score,
          teamToken: data.teamToken,
          solves: data.solves,
          dataLoading: false
        })
      })

    console.log(this.state)
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
                  {placement} with {score} points
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
                    <th>Category</th>
                    <th>Name</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {solves.map(solve => <tr key={solve[1]}><td>{solve[0]}</td><td>{solve[1]}</td><td>{solve[2]}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
