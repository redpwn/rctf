import Router from 'preact-router'
import Login from './login'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'

export default class App extends Component {
  render () {
    return (
      <Router>
        <Login path='/login' />
      </Router>
    )
  }
}
