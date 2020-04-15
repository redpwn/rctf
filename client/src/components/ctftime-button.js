import { Component } from 'preact'
import Ctftime from '../icons/ctftime.svg'
import openPopup from '../util/ctftime'
import withStyles from '../components/jss'
import { ctftimeCallback } from '../api/auth'

export default withStyles({
  ctftimeButton: {
    margin: 'auto',
    '& svg': {
      width: '150px'
    }
  },
  error: {
    color: '#b71c1c'
  }
}, class CtftimeButton extends Component {
  componentDidMount () {
    window.addEventListener('message', this.handlePostMessage)
  }

  componentWillUnmount () {
    window.removeEventListener('message', this.handlePostMessage)
  }

  oauthState = null

  handlePostMessage = async (evt) => {
    if (evt.origin !== location.origin) {
      return
    }
    if (evt.data.kind !== 'ctftimeCallback') {
      return
    }
    if (this.oauthState === null || evt.data.state !== this.oauthState) {
      return
    }
    const { kind, message, data } = await ctftimeCallback({
      ctftimeCode: evt.data.ctftimeCode
    })
    if (kind !== 'goodCtftimeToken') {
      this.setState({
        error: message
      })
      return
    }
    this.props.onCtftimeDone(data.ctftimeToken)
  }

  handleClick = () => {
    this.oauthState = openPopup()
  }

  render ({ classes }, { error }) {
    return (
      <div>
        <button class={classes.ctftimeButton} onClick={this.handleClick}>
          <Ctftime />
        </button>
        {error && (
          <h6 class={classes.error}>{error}</h6>
        )}
      </div>
    )
  }
})
