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
    <Profile key='profile' path='/profile' name='Profile' />,
    <Challenges key='challs' path='/challs' name='Challenges' />
  ]

  const allPaths = [
    <Home key='home' path='/' name='Home' />,
    <Scoreboard key='scoreboard' path='/scores' name='Scoreboard' />,
    <Profile key='multiProfile' path='/profile/:uuid' />,
    <Recover key='recover' path='/recover' />,
    <Verify key='verify' path='/verify' />,
    <AdminChallenges key='adminChalls' path='/admin/challs' />,
    <CtftimeCallback key='ctftimeCallback' path='/integrations/ctftime/callback' />,
    <Error key='error' error='404' default />
  ]

  const currentPaths = loggedOut ? [...allPaths, ...loggedOutPaths] : [...allPaths, ...loggedInPaths]
  const headerPaths = currentPaths.filter(path => path.props.name !== undefined)

  return (
    <div class={classes.root}>
      <ToastProvider>
        <Header paths={headerPaths} />
        <div class={classes.contentWrapper}>
          <Router onChange={triggerRerender}>
            {[...allPaths, ...loggedOutPaths, ...loggedInPaths]}
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
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    background: '#111',
    color: '#fff',
    '& *': {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Noto Sans", "Oxygen", "Ubuntu", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important'
    }
  },
  '@global select': {
    background: 'url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20viewBox=\'0%200%204%205\'%3E%3Cpath%20fill=\'%23667189\'%20d=\'M2%200L0%202h4zm0%205L0%203h4z\'/%3E%3C/svg%3E") right .85rem center/.5rem .6rem no-repeat no-repeat #111 !important'
  },
  '@global :root': {
    '--cirrus-link': '#72b4e0',
    '--cirrus-link-dark': '#277edb',
    '--cirrus-select-bg': 'rgba(0, 161, 255, 0.4)'
  },
  contentWrapper: {
    flex: '1 0 auto'
  }
}, App)
