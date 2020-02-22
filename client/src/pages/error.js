import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

export default withStyles({
}, class Error extends Component {
  componentDidMount () {
    document.title = '404 Not Found' + config.ctfTitle
  }

  render ({ error }) {
    return (
      <div class='row u-text-center u-center'>
        <div class='col-4'>
          <h1>{error}</h1>
          <p class='font-thin'>There was an error</p>
        </div>
      </div>
    )
  }
})
