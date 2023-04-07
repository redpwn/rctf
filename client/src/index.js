import { useState, useCallback, useEffect } from 'preact/hooks'
import Router, { route } from 'preact-router'

import 'cirrus-ui'
import withStyles from './components/jss'
import Header from './components/header'
import Footer from './components/footer'

import ErrorRoute from './routes/error'
import Home from './routes/home'
import Register from './routes/register'
import Login from './routes/login'
import Profile from './routes/profile'
import Challenges from './routes/challs'
import Scoreboard from './routes/scoreboard'
import Recover from './routes/recover'
import Verify from './routes/verify'
import CtftimeCallback from './routes/ctftime-callback'

import AdminChallenges from './routes/admin/challs'

import { ToastProvider } from './components/toast'

import BackgroundImage from './images/bg.png'
import AmoogusCursor from './images/amoogus-cursor.cur'

function useTriggerRerender () {
  const setToggle = useState(false)[1]
  return useCallback(() => setToggle(t => !t), [setToggle])
}

const makeRedir = to => () => {
  useEffect(() => route(to, true), [])
  return null
}
const LoggedOutRedir = makeRedir('/')
const LoggedInRedir = makeRedir('/profile')

function App ({ classes }) {
  const triggerRerender = useTriggerRerender()

  const loggedOut = !localStorage.token

  const loggedOutPaths = [
    <Register key='register' path='/register' name='Register' />,
    <Login key='login' path='/login' name='Login' />,
    <Recover key='recover' path='/recover' />
  ]

  const loggedInPaths = [
    <Profile key='profile' path='/profile' name='Profile' />,
    <Challenges key='challs' path='/challs' name='Challenges' />,
    <AdminChallenges key='adminChalls' path='/admin/challs' />
  ]

  const allPaths = [
    <ErrorRoute key='error' default error='404' />,
    <Home key='home' path='/' name='Home' />,
    <Scoreboard key='scoreboard' path='/scores' name='Scoreboard' />,
    <Profile key='multiProfile' path='/profile/:uuid' />,
    <Verify key='verify' path='/verify' />,
    <CtftimeCallback key='ctftimeCallback' path='/integrations/ctftime/callback' />
  ]

  loggedInPaths.forEach(route => loggedOutPaths.push(
    <LoggedOutRedir
      key={`loggedOutRedir-${route.props.path}`}
      path={route.props.path}
    />
  ))
  loggedOutPaths.forEach(route => loggedInPaths.push(
    <LoggedInRedir
      key={`loggedInRedir-${route.props.path}`}
      path={route.props.path}
    />
  ))
  const currentPaths = [...allPaths, ...(loggedOut ? loggedOutPaths : loggedInPaths)]
  const headerPaths = currentPaths.filter(route => route.props.name !== undefined)

  return (
    <div class={classes.root}>
      <ToastProvider>
        <Header paths={headerPaths} />
        <StylishMemes />

        <div class={classes.contentWrapper}>
          <Router onChange={triggerRerender}>
            {currentPaths}
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
  // we show the google legal notice on each protected form
  '@global .grecaptcha-badge': {
    visibility: 'hidden'
  },
  // cirrus makes recaptcha position the modal incorrectly, so we reset it here
  '@global body > div[style*="position: absolute"]': {
    top: '10px !important'
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    backgroundImage: `url(${BackgroundImage})`,
    textRendering: 'optimizeLegibility',
    imageRendering: 'pixelated',
    cursor: `url(${AmoogusCursor}), default !important`,
    color: '#fff',
    '& *:not(code):not(pre)': {
      fontFamily: '"Comic Sans MS", "Comic Sans", cursive; !important'
    },
    '& pre.code': {
      padding: '10px',
      background: 'var(--cirrus-code-bg)',
      borderRadius: '5px',
      margin: '10px 0',
      color: '#ccc',
      border: '1px solid #ffffff1a'
    },
    '& code': {
      padding: '.2em .4em',
      background: 'var(--cirrus-code-bg)',
      borderRadius: '3px',
      color: '#ccc',
      border: '1px solid #ffffff1a'
    }
  },
  '@global select': {
    background: 'url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20viewBox=\'0%200%204%205\'%3E%3Cpath%20fill=\'%23667189\'%20d=\'M2%200L0%202h4zm0%205L0%203h4z\'/%3E%3C/svg%3E") right .85rem center/.5rem .6rem no-repeat no-repeat #111 !important'
  },
  '@global :root': {
    '--cirrus-link': '#72b4e0',
    '--cirrus-link-dark': '#277edb',
    '--cirrus-select-bg': 'rgba(0, 161, 255, 0.4)',
    '--cirrus-code-bg': '#333'
  },
  contentWrapper: {
    flex: '1 0 auto'
  }
}, App)

const Memes = ({ classes }) => (
  <div style='z-index: 0'>
    <div class={classes.wolfOne} />
    <div class={classes.wolfTwo}> <span style='padding-left: 50px; color: #fe11a0; font-size: 39px; font-family: Times,"Times New Roman",serif'> URSED</span></div>
    <div class={classes.moon} />

    <div class={classes.underConstructionRibbon} />
  </div>
)

const StylishMemes = withStyles({
  wolfOne: {
    backgroundImage: 'url(https://www.cameronsworld.net/img/content/6/11.gif)',
    position: 'absolute',
    width: '152px',
    height: '192px',
    top: '10px',
    right: '5%'
  },
  wolfTwo: {
    backgroundImage: 'url(https://www.cameronsworld.net/img/content/5/5.gif)',
    position: 'absolute',
    width: '72px',
    height: '60px',
    top: '20px',
    left: '5%'
  },
  moon: {
    backgroundImage: 'url(https://www.cameronsworld.net/img/content/1/7.gif)',
    position: 'absolute',
    width: '72px',
    height: '72px',
    bottom: '20px',
    left: '5%'
  },

  underConstructionRibbon: {
    backgroundImage: 'url(https://www.cameronsworld.net/img/content/22/left-side/31.png)',
    backgroundRepeat: 'repeat-x',
    height: '11px',
    width: '100%',
    position: 'absolute',
    top: '50px',
    zIndex: '-1'
  }
}, Memes)
