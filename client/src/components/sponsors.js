import config from '../config'
import 'linkstate/polyfill'
import Markdown from './markdown'
import withStyles from './jss'

export default withStyles({
  icon: {
    padding: '10px',
    margin: '20px 0',
    background: '#fff',
    borderRadius: '10px',
    '& img': {
      height: '6.250em',
      width: 'auto'
    }
  },
  description: {
    '& a': {
      display: 'inline',
      padding: '0'
    }
  },
  row: {
    marginBottom: '1.5em'
  },
  card: {
    background: '#222'
  }
}, ({ classes }) => {
  const { sponsors } = config
  return (
    <div class='row u-center' style='align-items: initial !important'>
      <div class='col-6'>
        <div class='row'>
          {
            sponsors.map(sponsor => {
              let cl = `card ${classes.card}`
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
                      <small class={classes.description}>
                        <Markdown content={sponsor.description} />
                      </small>
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
})
