import withStyles from './jss'
import Clock from '../icons/clock.svg'
import config from '../config'

const NotStarted = withStyles({
  card: {
    background: '#222',
    padding: '30px !important',
    flexDirection: 'column'
  },
  icon: {
    width: '60px'
  }
}, ({ classes }) => (
  <div class='row'>
    <div class={`card u-center col-6 ${classes.card}`}>
      <div class={classes.icon}>
        <Clock />
      </div>
      <h4>{config.ctfName} has not started yet.</h4>
    </div>
  </div>
))

export default NotStarted
