import Router from 'preact-router'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'

import Header from './components/header'
import Registration from './pages/registration'
import Login from './pages/login'

import 'cirrus-ui'
import 'font-awesome/css/font-awesome.css'

export default class App extends Component {
  render () {
    return (
      <div id='app'>
        <Header />
        <Router>
          <Registration path='/register' />
          <Login path='/login' />
        </Router>
      </div>
    )
  }
}
