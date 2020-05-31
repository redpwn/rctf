import { Component } from 'preact'
import Ctftime from '../icons/ctftime.svg'
import openPopup from '../util/ctftime'
import withStyles from '../components/jss'
import { ctftimeCallback } from '../api/auth'
import { withToast } from '../components/toast'

export default withStyles({
  ctftimeButton: {
    margin: 'auto',
    lineHeight: '0',
    padding: '10px',
    background: '#111',
    '&:hover': {
      background: '#222'
    },
    '& svg': {
      width: '150px'
    }
  }
}, withToast(class CtftimeButton extends Component {
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
      this.props.toast({
        body: message,
        type: 'error'
      })
      return
    }
    this.props.onCtftimeDone(data.ctftimeToken)
  }

  handleClick = () => {
    this.oauthState = openPopup()
  }

  render ({ classes, ...props }) {
    return (
      <div {...props} >
        <button class={classes.ctftimeButton} onClick={this.handleClick}>
          <Ctftime />
        </button>
      </div>
    )
  }
}))
