import Router from 'preact-router'
import 'promise-polyfill/src/polyfill'
import 'unfetch/polyfill/index'
import 'regenerator-runtime/runtime'
import config from '../../config/client'

import 'cirrus-ui'
import withStyles from './components/jss'
import Header from './components/header'

import Home from './routes/home'
import Registration from './routes/registration'
import Login from './routes/login'
import Profile from './routes/profile'
import Challenges from './routes/challenges'
import Scoreboard from './routes/scoreboard'
import Error from './routes/error'
import Sponsors from './routes/sponsors'
import Verify from './routes/verify'

import { ToastProvider } from './components/toast'

function App () {
  const loggedOut = localStorage.getItem('token') === null

  let loggedOutPaths = [
    <Home key='home' path='/' name='Home' />
  ]
  if (config.sponsors.length !== 0) {
    loggedOutPaths.push(<Sponsors key='sponsors' path='/sponsors' name='Sponsors' />)
  }
  loggedOutPaths = loggedOutPaths.concat([
    <Registration key='register' path='/register' name='Register' />,
    <Login key='login' path='/login' name='Login' />
  ])

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
      <ToastProvider>
        <Header paths={currentPaths} />
        <Router>
          {allPaths}
        </Router>
      </ToastProvider>
    </div>
  )
}

export default withStyles({
  '@global body': {
    overflowX: 'hidden'
  }
}, App)
