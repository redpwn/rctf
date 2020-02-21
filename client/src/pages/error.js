import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

// Small easter egg
function makeid (length) {
  var result = ''
  var characters = 'abcdef0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

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
          <p class='font-thin'>Here's the flag</p>
          <mark>{makeid(32)}</mark>
        </div>
      </div>
    )
  }
})
