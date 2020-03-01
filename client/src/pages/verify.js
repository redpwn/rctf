import { Component } from 'preact'
import Error from './error'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { verify } from '../api/auth'
import { route } from 'preact-router'

export default withStyles({
}, class Verify extends Component {
  state = {
    errors: {}
  }

  componentDidMount () {
    document.title = 'Verify' + config.ctfTitle

    const prefix = '#token='
    if (document.location.hash.startsWith(prefix)) {
      route('/verify', true)

      const verifyToken = decodeURIComponent(document.location.hash.substring(prefix.length))

      verify({ verifyToken })
        .then(errors => {
          this.setState({
            errors
          })
        })
    }
  }

  render (props, { errors }) {
    if (errors.verifyToken === undefined) return <div />

    return <Error error='401' message={errors.verifyToken} />
  }
})
