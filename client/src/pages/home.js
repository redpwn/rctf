import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

export default withStyles({
  root: {
    padding: '25px'
  },
  row: {
    marginBottom: '50px'
  },
  logo: {
    height: '150px',
    width: '150px'
  }
}, class Home extends Component {
  componentDidMount () {
    document.title = 'Home' + config.ctfTitle
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
