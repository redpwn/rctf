import Router from 'preact-router'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import { Component } from 'preact'
import config from '../../config/client'

import Header from './components/header'
import { Home, Registration, Login, Profile, Challenges, Scoreboard, Error, Sponsors, Verify } from './pages'
import 'cirrus-ui'

import util from './util'

class App extends Component {
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

    if (config.sponsors.length !== 0) {
      loggedOutPaths.push(<Sponsors key='sponsors' path='/sponsors' name='Sponsors' />)
    }

    const loggedInPaths = [
      <Profile key='profile' path='/profile/' name='Profile' />,
      <Challenges key='challs' path='/challs' name='Challenges' />,
      <Scoreboard key='scoreboard' path='/scores' name='Scoreboard' />
    ]

    let allPaths = [
      <Profile key='multiProfile' path='/profile/:uuid' />,
      <Verify key='verify' path='/verify' />,
      <Error key='error' error='404' default />
    ]
    allPaths = allPaths.concat(loggedInPaths).concat(loggedOutPaths)

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

export default util.toasts.withToastProvider(App)
