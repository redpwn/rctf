import { Component } from 'preact'

export default class IonCallback extends Component {
  componentDidMount () {
    window.opener.postMessage({
      kind: 'ionCallback',
      state: this.props.state,
      ionCode: this.props.code,
      error: this.props.error
    }, location.origin)
    window.close()
  }

  render () {
    return null
  }
}
