import Router from 'preact-router'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'

import Header from './components/header'
import Registration from './pages/registration'
import Login from './pages/login'
import Home from './pages/home'

import 'cirrus-ui'
import 'font-awesome/css/font-awesome.css'

export default class App extends Component {
  state = {
    currentPath: '/'
  }

  render (props, { currentPath }) {
    const paths = [
      <Home key='home' path='/' name='Home' />,
      <Registration key='register' path='/register' name='Register' />,
      <Login key='login' path='/login' name='Login' />
    ]

    return (
      <div id='app'>
        <Header paths={paths} currentPath={currentPath} />
        <Router onChange={this.handleRoute}>
          {paths}
        </Router>
      </div>
    )
  }

  handleRoute = e => {
    this.setState({
      currentPath: e.url
    })
  }
}
