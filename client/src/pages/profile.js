import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { privateProfile, publicProfile } from '../api/profile'
import util from '../util'
import Trophy from '../../static/icons/trophy.svg'
import AddressBook from '../../static/icons/address-book.svg'

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
    loaded: false,
    name: '',
    division: '',
    placement: '',
    score: 0,
    teamToken: '',
    solves: [],
    uuid: '',
    error: undefined
  }

  processGeneric ({ name, division, score, solves }) {
    this.setState({
      name: name,
      division: division,
      placement: util.strings.placementString(score.divisionPlace),
      score: score.score,
      solves: solves,
      loaded: true
    })
  }

  componentDidMount () {
    document.title = 'Profile' + config.ctfTitle
  }

  isPrivate () {
    const { uuid } = this.props

    return uuid === undefined || uuid === 'me'
  }

  componentDidUpdate () {
    if (this.props.uuid !== this.state.uuid) {
      const { uuid } = this.props
      this.setState({
        uuid,
        error: undefined
      })

      if (this.isPrivate()) {
        privateProfile()
          .then(data => {
            this.processGeneric(data)
            this.setState({
              teamToken: data.teamToken
            })
          })
      } else {
        publicProfile(uuid)
          .then(data => {
            if (data === null) {
              this.setState({
                error: 'Profile not found',
                loaded: true
              })
            } else {
              this.processGeneric(data)
            }
          })
      }
    }
  }

  render ({ classes }, { name, division, placement, score, teamToken, solves, error, loaded }) {
    const priv = this.isPrivate()
    const hasError = error !== undefined

    if (!loaded) return null

    if (hasError) {
      return (
        <div class='row u-center' style='align-items: initial !important'>
          <div class='col-4'>
            <div class='card u-flex u-flex-column'>
              <div class='content'>
                <p>Error</p>
                <p class='font-thin'>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div class='row u-center' style='align-items: initial !important'>
        {
          priv &&
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
        }
        <div class='col-6'>
          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <h5 class='title'>{name}</h5>
              <div class='action-bar'>
                <p>
                  <span class={`icon ${classes.icon}`}>
                    <Trophy />
                  </span>
                  {
                    score === undefined
                      ? ('No solves yet')
                      : (placement + ' with ' + score + ' points')
                  }
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
                  {solves.map(solve => <tr key={solve.name}><td>{solve.category}</td><td>{solve.name}</td><td>{solve.points}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
