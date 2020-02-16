import Router from 'preact-router'
import Registration from './components/registration'
import Header from './components/header'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'

import 'cirrus-ui'
import 'font-awesome/css/font-awesome.css'

export default class App extends Component {
  render () {
    return (
      <div id='app'>
        <Header />
        <Router>
          <Registration path='/register' />
        </Router>
      </div>
    )
  }
}
