import { Component } from 'preact'

export default class IonCallback extends Component {
  componentDidMount () {
    window.opener.postMessage({
      kind: 'ionCallback',
      state: this.props.state,
      ionCode: this.props.code
    }, location.origin)
    window.close()
  }

  render () {
    return null
  }
}
