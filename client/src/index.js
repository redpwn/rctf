import { useState, useCallback } from 'preact/hooks'
import Router from 'preact-router'

import 'cirrus-ui'
import withStyles from './components/jss'
import Header from './components/header'
import Footer from './components/footer'

import Home from './routes/home'
import Register from './routes/register'
import Login from './routes/login'
import Profile from './routes/profile'
import Challenges from './routes/challs'
import Scoreboard from './routes/scoreboard'
import Error from './routes/error'
import Recover from './routes/recover'
import Verify from './routes/verify'
import CtftimeCallback from './routes/ctftime-callback'

import AdminChallenges from './routes/admin/challs'

import { ToastProvider } from './components/toast'

function useTriggerRerender () {
  const setToggle = useState(false)[1]
  return useCallback(() => setToggle(t => !t), [setToggle])
}

function App ({ classes }) {
  const triggerRerender = useTriggerRerender()

  const loggedOut = localStorage.getItem('token') === null

  const loggedOutPaths = [
    <Register key='register' path='/register' name='Register' />,
    <Login key='login' path='/login' name='Login' />
  ]

  const loggedInPaths = [
    <Profile key='profile' path='/profile/' name='Profile' />,
    <Challenges key='challs' path='/challs' name='Challenges' />,
    <Scoreboard key='scoreboard' path='/scores' name='Scoreboard' />
  ]

  const allPaths = [
    <Home key='home' path='/' name='Home' />,
    <Profile key='multiProfile' path='/profile/:uuid' />,
    <Recover key='recover' path='/recover' />,
    <Verify key='verify' path='/verify' />,
    <AdminChallenges key='adminchalls' path='/admin/challs' />,
    <CtftimeCallback key='ctftimeCallback' path='/integrations/ctftime/callback' />,
    <Error key='error' error='404' default />,
    ...loggedInPaths,
    ...loggedOutPaths
  ]

  const home = <Home key='home' path='/' name='Home' />
  loggedOutPaths.unshift(home)
  loggedInPaths.unshift(home)

  const currentPaths = loggedOut ? loggedOutPaths : loggedInPaths

  return (
    <div id='app'>
      <ToastProvider>
        <Header paths={currentPaths} />
        <div class={classes.contentWrapper}>
          <Router onChange={triggerRerender}>
            {allPaths}
          </Router>
        </div>
        <Footer />
      </ToastProvider>
    </div>
  )
}

export default withStyles({
  '@global body': {
    overflowX: 'hidden'
  },
  '@global #app': {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%'
  },
  contentWrapper: {
    flex: '1 0 auto'
  }
}, App)
