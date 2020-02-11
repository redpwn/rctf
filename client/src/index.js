import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'
import withStyles from './jss'

export default withStyles({
  root: {
    color: 'red'
  }
}, class App extends Component {
  render ({ classes }) {
    return (
      <h1 class={classes.root}>test</h1>
    )
  }
})
