import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

export default withStyles({
  icon: {
    backgroundColor: 'initial !important',
    '& img': {
      height: '6.250em',
      width: 'auto'
    }
  },
  row: {
    marginBottom: '1.5em'
  }
}, class Sponsors extends Component {
  state = {
    sponsors: config.sponsors
  }

  componentDidMount () {
    document.title = `Sponsors${config.ctfTitle}`
  }

  render ({ classes }, { sponsors }) {
    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-3'>
          <h3>Sponsors</h3>
          <p>Please take a look at our wonderful sponsors!</p>
          <mark>We are very thankful to each and every one of our sponsors for making this competition possible!</mark>
        </div>
        <div class='col-6'>
          <div class='row'>
            {
              sponsors.map(sponsor => {
                let cl = 'card'
                if (!sponsor.small) cl += ' u-flex u-flex-column h-100'

                return (
                  <div class={`col-6 ${classes.row}`} key={sponsor.name}>
                    <div class={cl}>
                      <div class='content'>
                        {sponsor.icon &&
                          <figure class={`u-center ${classes.icon}`}>
                            <img src={sponsor.icon} />
                          </figure>}
                        <p class='title level'>{sponsor.name}</p>
                        <small>{sponsor.description}</small>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
})
