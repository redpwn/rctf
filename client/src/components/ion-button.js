import { Component } from 'preact'
import Ion from '../icons/ion.svg'
import openPopup from '../util/ion'
import withStyles from '../components/jss'
import { ionCallback } from '../api/auth'
import { withToast } from '../components/toast'

export default withStyles({
  ionButton: {
    margin: 'auto',
    lineHeight: '0',
    padding: '10px',
    background: '#222',
    '&:hover': {
      background: '#222'
    },
    '& svg': {
      width: '150px'
    }
  }
}, withToast(class IonButton extends Component {
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
    if (evt.data.kind !== 'ionCallback') {
      return
    }
    if (this.oauthState === null || evt.data.state !== this.oauthState) {
      return
    }
    const { kind, message, data } = await ionCallback({
      ionCode: evt.data.ionCode
    })
    if (kind !== 'goodIonToken') {
      this.props.toast({
        body: message,
        type: 'error'
      })
      return
    }
    this.props.onIonDone(data)
  }

  handleClick = () => {
    this.oauthState = openPopup()
  }

  render ({ classes, ...props }) {
    return (
      <div {...props} >
        <button class={classes.ionButton} onClick={this.handleClick}>
          <Ion />
        </button>
      </div>
    )
  }
}))
