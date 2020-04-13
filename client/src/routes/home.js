import { Component } from 'preact'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

export default withStyles({
  root: {
    padding: '3.375em'
  },
  row: {
    marginBottom: '3.125em'
  },
  logo: {
    height: '9.375em',
    width: '9.375em'
  }
}, class Home extends Component {
  componentDidMount () {
    document.title = `Home${config.ctfTitle}`
  }

  render ({ classes }) {
    return (
      <div class={classes.root}>
        <div class={`${classes.row} row u-center`}>
          <h2 class='level'>{config.ctfName}</h2>
        </div>
        <div class={`${classes.row} row u-center`}>
          <img src={config.logoUrl} class={`avatar ${classes.logo}`} />
        </div>
      </div>
    )
  }
})
