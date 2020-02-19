import Router from 'preact-router'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'

import Header from './components/header'
import { Home, Registration, Login, Profile } from './pages'
import 'cirrus-ui'

export default class App extends Component {
  state = {
    currentPath: '/'
  }

  render (props, { currentPath }) {
    const loggedOut = localStorage.getItem('token') === null
    const loggedOutPaths = [
      <Home key='home' path='/' name='Home' />,
      <Registration key='register' path='/register' name='Register' />,
      <Login key='login' path='/login' name='Login' />
    ]

    const loggedInPaths = [
      <Profile key='profile' path='/profile' name='Profile' />
    ]

    const allPaths = loggedInPaths.concat(loggedOutPaths)
    const currentPaths = loggedOut ? loggedOutPaths : loggedInPaths

    return (
      <div id='app'>
        <Header paths={currentPaths} currentPath={currentPath} />
        <Router onChange={this.handleRoute}>
          {allPaths}
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
